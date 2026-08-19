/**
 * @module MissionLedger
 * @version 1.0.0
 * @status SINGLE_PROCESS_SYNC_MVP
 * @description Single write authority for mission state and feature lists in EOS.
 *
 * @guarantees
 *   - Append-only event log (run_log.jsonl via fs.appendFileSync).
 *   - Atomic JSON state updates (feature_list.json via tmp write + fs.renameSync).
 *   - Sequential crash recovery from event log via recover(missionId).
 *   - Automatic read-only projection to legacy EOS-MISSION-CONTROL/CURRENT_MISSION.json.
 *
 * @limitations
 *   - No explicit fs.fsyncSync on open file descriptors.
 *   - No cross-process file locks (.lock).
 *   - Suitable for local single-process execution; multi-agent concurrent writes require P1 upgrade.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

class MissionLedger {
  constructor(options = {}) {
    this.baseDir = options.baseDir || path.resolve('.eos/ledger');
    this.legacyDir = options.legacyDir || path.resolve('EOS-MISSION-CONTROL');
    this._ensureDirectories();
  }

  _ensureDirectories() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
    if (!fs.existsSync(this.legacyDir)) {
      fs.mkdirSync(this.legacyDir, { recursive: true });
    }
  }

  _getLogPath(missionId) {
    return path.join(this.baseDir, `run_log_${missionId}.jsonl`);
  }

  _getFeatureListPath(missionId) {
    return path.join(this.baseDir, `feature_list_${missionId}.json`);
  }

  _getProgressPath(missionId) {
    return path.join(this.baseDir, `progress_${missionId}.md`);
  }

  /**
   * Initializes a mission with a feature list
   */
  initializeMission(missionId, features = [], metadata = {}) {
    const featureList = {
      schemaVersion: '1.0.0',
      missionId,
      initializedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata,
      features: features.map((f, idx) => ({
        id: f.id || `FEAT-${String(idx + 1).padStart(3, '0')}`,
        name: f.name || `Feature ${idx + 1}`,
        status: f.status || 'PENDING',
        stage: f.stage || 'BACKLOG',
        assignedAgent: f.assignedAgent || 'UNASSIGNED',
        evidenceReceipt: f.evidenceReceipt || null,
        notes: f.notes || ''
      }))
    };

    this._writeAtomicJson(this._getFeatureListPath(missionId), featureList);
    this.appendEvent(missionId, 'MISSION_INITIALIZED', { features: featureList.features, metadata });
    this._updateProgressMarkdown(missionId, featureList);
    this._projectLegacyView(missionId, featureList);

    return featureList;
  }

  /**
   * Appends an event to the immutable event log
   */
  appendEvent(missionId, eventType, payload = {}) {
    const logPath = this._getLogPath(missionId);
    const event = {
      eventId: `EVT-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      missionId,
      timestamp: new Date().toISOString(),
      eventType,
      payload
    };

    fs.appendFileSync(logPath, JSON.stringify(event) + '\n', 'utf8');
    return event;
  }

  /**
   * Updates status of a specific feature
   */
  updateFeatureStatus(missionId, featureId, newStatus, evidenceReceipt = null) {
    const featureList = this.getFeatureList(missionId);
    if (!featureList) {
      throw new Error(`Mission ${missionId} not found`);
    }

    const feature = featureList.features.find(f => f.id === featureId);
    if (!feature) {
      throw new Error(`Feature ${featureId} not found in mission ${missionId}`);
    }

    const oldStatus = feature.status;
    feature.status = newStatus;
    feature.updatedAt = new Date().toISOString();

    if (newStatus === 'VERIFIED' && !evidenceReceipt) {
      throw new Error(`Cannot mark feature ${featureId} as VERIFIED without attached evidence receipt`);
    }
    if (evidenceReceipt) {
      feature.evidenceReceipt = evidenceReceipt;
    }

    featureList.updatedAt = new Date().toISOString();
    this._writeAtomicJson(this._getFeatureListPath(missionId), featureList);
    this.appendEvent(missionId, 'FEATURE_STATUS_CHANGED', { featureId, oldStatus, newStatus, evidenceReceipt });
    this._updateProgressMarkdown(missionId, featureList);
    this._projectLegacyView(missionId, featureList);

    return feature;
  }

  /**
   * Reads feature list for a mission
   */
  getFeatureList(missionId) {
    const filePath = this._getFeatureListPath(missionId);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  /**
   * Recovers feature list state from append-only log in case of corruption
   */
  recover(missionId) {
    const logPath = this._getLogPath(missionId);
    if (!fs.existsSync(logPath)) {
      throw new Error(`Cannot recover mission ${missionId}: log file does not exist`);
    }

    const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean);
    let state = {
      schemaVersion: '1.0.0',
      missionId,
      recoveredAt: new Date().toISOString(),
      features: []
    };

    for (const line of lines) {
      const event = JSON.parse(line);
      if (event.eventType === 'MISSION_INITIALIZED') {
        state.features = (event.payload.features || []).map((f, idx) => ({
          id: f.id || `FEAT-${String(idx + 1).padStart(3, '0')}`,
          name: f.name || `Feature ${idx + 1}`,
          status: f.status || 'PENDING',
          evidenceReceipt: null
        }));
      } else if (event.eventType === 'FEATURE_STATUS_CHANGED') {
        const feat = state.features.find(f => f.id === event.payload.featureId);
        if (feat) {
          feat.status = event.payload.newStatus;
          if (event.payload.evidenceReceipt) {
            feat.evidenceReceipt = event.payload.evidenceReceipt;
          }
        }
      }
    }

    this._writeAtomicJson(this._getFeatureListPath(missionId), state);
    this.appendEvent(missionId, 'MISSION_RECOVERED_FROM_LOG', { totalEventsReplayed: lines.length });
    return state;
  }

  _writeAtomicJson(filePath, data) {
    const tmpPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpPath, filePath);
  }

  _updateProgressMarkdown(missionId, featureList) {
    const progressPath = this._getProgressPath(missionId);
    const total = featureList.features.length;
    const passed = featureList.features.filter(f => f.status === 'PASS' || f.status === 'VERIFIED').length;
    const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

    let md = `# Mission Progress: ${missionId}\n\n`;
    md += `**Last Updated:** ${featureList.updatedAt}\n`;
    md += `**Completion:** ${passed}/${total} (${pct}%)\n\n`;
    md += `| ID | Feature | Status | Evidence |\n`;
    md += `|---|---|---|---|\n`;

    for (const f of featureList.features) {
      const evd = f.evidenceReceipt ? `\`${f.evidenceReceipt}\`` : 'None';
      md += `| ${f.id} | ${f.name} | **${f.status}** | ${evd} |\n`;
    }

    fs.writeFileSync(progressPath, md, 'utf8');
  }

  _projectLegacyView(missionId, featureList) {
    const legacyPath = path.join(this.legacyDir, 'CURRENT_MISSION.json');
    const legacyView = {
      missionId,
      updatedAt: featureList.updatedAt,
      projectionNotice: 'READ_ONLY_PROJECTION_FROM_EOS_LEDGER',
      status: 'ACTIVE',
      features: featureList.features
    };
    this._writeAtomicJson(legacyPath, legacyView);
  }
}

export { MissionLedger };
