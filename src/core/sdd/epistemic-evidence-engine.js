/**
 * @module EpistemicEvidenceEngine
 * @description EOS Epistemic Evidence Engine and Hash-Chained Mission Ledger.
 * Provides immutable cryptographic provenance, tamper detection, crash recovery,
 * concurrency locking, fsync flushing, and strict epistemic status enforcement.
 */

import { createHash, randomBytes } from 'node:crypto';
import {
  readFileSync,
  appendFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  renameSync,
  openSync,
  closeSync,
  writeSync,
  fsyncSync,
  unlinkSync,
  statSync,
  truncateSync
} from 'node:fs';
import { resolve, join } from 'node:path';

export const EPISTEMIC_STATUSES = Object.freeze({
  VERIFIED: 'VERIFIED',
  NOT_VERIFIED: 'NOT_VERIFIED',
  NOT_RUN: 'NOT_RUN',
  UNKNOWN: 'UNKNOWN',
  BLOCKED: 'BLOCKED',
  SIMULATION_ONLY: 'SIMULATION_ONLY'
});

export const EVIDENCE_CATEGORIES = Object.freeze({
  UNIT_TEST: 'UNIT_TEST',
  INTEGRATION_TEST: 'INTEGRATION_TEST',
  STRICT_LINT: 'STRICT_LINT',
  SECURITY_AUDIT: 'SECURITY_AUDIT',
  MANUAL_INSPECTION: 'MANUAL_INSPECTION',
  HUMAN_DECISION: 'HUMAN_DECISION'
});

export const GENESIS_PREVIOUS_HASH = '0'.repeat(64);

/**
 * Deterministically serializes an object into Canonical JSON (sorted keys).
 */
export function canonicalJson(data) {
  if (data === null || typeof data !== 'object') {
    return JSON.stringify(data);
  }
  if (Array.isArray(data)) {
    return '[' + data.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(data).sort();
  const pairs = keys.map(k => `${JSON.stringify(k)}:${canonicalJson(data[k])}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Computes SHA-256 hash of a string or buffer.
 */
export function calculateSha256(data) {
  const content = typeof data === 'string' ? data : canonicalJson(data);
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Evidence Factory & Validator
 */
export class EpistemicEvidenceEngine {
  static createReceipt(options = {}) {
    const {
      receipt_id,
      evidence_id,
      mission_id,
      task_id,
      category,
      status,
      execution_context,
      provenance,
      assertions,
      evidence_payload,
      command_executed,
      exit_code,
      verifier_id,
      timestamp
    } = options;

    const finalStatus = status || EPISTEMIC_STATUSES.NOT_VERIFIED;
    const finalCategory = category || EVIDENCE_CATEGORIES.UNIT_TEST;

    // Epistemic Invariant Check
    if (execution_context?.command && execution_context.command.includes('--mock') && finalStatus === EPISTEMIC_STATUSES.VERIFIED) {
      throw new Error('EPISTEMIC_VIOLATION: Mocked execution cannot be classified as VERIFIED');
    }

    const id = receipt_id || evidence_id || `EVD-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;
    const ts = timestamp || new Date().toISOString();

    const rawReceipt = {
      schema_version: '1.0.0',
      receipt_id: id,
      evidence_id: id,
      mission_id: mission_id || 'MIS-UNSPECIFIED',
      task_id: task_id || 'TASK-UNSPECIFIED',
      category: finalCategory,
      status: finalStatus,
      execution_context: execution_context || { command: command_executed || null, exit_code: exit_code !== undefined ? exit_code : null },
      provenance: provenance || {},
      assertions: assertions || [],
      evidence_payload: evidence_payload || {},
      verifier_id: verifier_id || 'LOCAL_INTEGRITY_VERIFIER',
      timestamp: ts
    };

    const hash = calculateSha256(rawReceipt);

    return {
      ...rawReceipt,
      sha256: hash,
      receipt_hash: hash
    };
  }

  static validateReceipt(receipt) {
    if (!receipt || typeof receipt !== 'object') {
      return { valid: false, error: 'Invalid receipt object' };
    }

    const { sha256, receipt_hash, ...rest } = receipt;
    const expectedHash = sha256 || receipt_hash;
    const computedHash = calculateSha256(rest);

    if (computedHash !== expectedHash) {
      return {
        valid: false,
        error: `Hash mismatch: expected ${expectedHash}, got ${computedHash}`,
        receiptId: receipt.receipt_id || receipt.evidence_id
      };
    }

    return {
      valid: true,
      receiptId: receipt.receipt_id || receipt.evidence_id,
      hash: computedHash
    };
  }
}

/**
 * Hash-Chained Mission Ledger with Advisory Locking, Atomic Append, and Safe Crash Recovery
 */
export class HashChainedLedger {
  constructor(options = {}) {
    this.baseDir = options.baseDir || resolve('.eos/ledger');
    this.lockTimeoutMs = options.lockTimeoutMs || 3000;
    this.staleLockMs = options.staleLockMs || 5000;
    this._ensureDirectories();
  }

  _ensureDirectories() {
    if (!existsSync(this.baseDir)) {
      mkdirSync(this.baseDir, { recursive: true });
    }
  }

  getLogPath(missionId) {
    return join(this.baseDir, `run_log_${missionId}.jsonl`);
  }

  getLockPath(missionId) {
    return join(this.baseDir, `run_log_${missionId}.lock`);
  }

  _acquireLock(missionId) {
    const lockPath = this.getLockPath(missionId);
    const start = Date.now();

    while (Date.now() - start < this.lockTimeoutMs) {
      try {
        const fd = openSync(lockPath, 'wx');
        writeSync(fd, `${process.pid}:${Date.now()}`);
        closeSync(fd);
        return true;
      } catch (err) {
        if (err.code === 'EEXIST') {
          // Check stale lock
          try {
            const stats = statSync(lockPath);
            if (Date.now() - stats.mtimeMs > this.staleLockMs) {
              unlinkSync(lockPath);
              continue;
            }
          } catch (_) {}
          // Busy wait briefly
          const waitLimit = Date.now() + 10;
          while (Date.now() < waitLimit) {}
        } else {
          throw err;
        }
      }
    }
    throw new Error(`LOCK_TIMEOUT: Failed to acquire ledger lock for mission '${missionId}' within ${this.lockTimeoutMs}ms`);
  }

  _releaseLock(missionId) {
    const lockPath = this.getLockPath(missionId);
    try {
      if (existsSync(lockPath)) {
        unlinkSync(lockPath);
      }
    } catch (_) {}
  }

  getEvents(missionId) {
    const logPath = this.getLogPath(missionId);
    if (!existsSync(logPath)) {
      return [];
    }
    const raw = readFileSync(logPath, 'utf8').trim();
    if (!raw) return [];
    return raw.split('\n').filter(Boolean).map(line => JSON.parse(line));
  }

  getLatestEvent(missionId) {
    const events = this.getEvents(missionId);
    return events.length > 0 ? events[events.length - 1] : null;
  }

  /**
   * Appends an event to the ledger with advisory file locking and fsync persistence
   */
  appendEvent(missionId, eventType, payload = {}) {
    this._acquireLock(missionId);
    try {
      const logPath = this.getLogPath(missionId);
      const lastEvent = this.getLatestEvent(missionId);

      const sequence = lastEvent ? lastEvent.sequence + 1 : 0;
      const previous_hash = lastEvent ? lastEvent.event_hash : GENESIS_PREVIOUS_HASH;
      const timestamp = new Date().toISOString();
      const event_id = `EVT-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`;

      const payload_hash = calculateSha256(payload);

      const header = {
        sequence,
        previous_hash,
        payload_hash,
        timestamp,
        event_type: eventType
      };
      const event_hash = calculateSha256(header);

      const ledgerEvent = {
        schema_version: '1.0.0',
        sequence,
        event_id,
        mission_id: missionId,
        event_type: eventType,
        previous_hash,
        payload_hash,
        event_hash,
        payload,
        timestamp
      };

      const line = JSON.stringify(ledgerEvent) + '\n';
      const fd = openSync(logPath, 'a');
      try {
        writeSync(fd, line, null, 'utf8');
        fsyncSync(fd); // Flush physically to disk
      } finally {
        closeSync(fd);
      }

      return ledgerEvent;
    } finally {
      this._releaseLock(missionId);
    }
  }

  /**
   * Recovers and repairs a ledger after a crash or partial trailing write
   * @param {string} missionId
   * @returns {Object} { recovered: boolean, valid_events: number, repaired_trailing: boolean }
   */
  recoverAndRepairLedger(missionId) {
    this._acquireLock(missionId);
    try {
      const logPath = this.getLogPath(missionId);
      if (!existsSync(logPath)) {
        return { recovered: true, valid_events: 0, repaired_trailing: false };
      }

      const raw = readFileSync(logPath, 'utf8');
      const lines = raw.split('\n').filter(l => l.trim().length > 0);
      const validEvents = [];
      let expectedPrevHash = GENESIS_PREVIOUS_HASH;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let evt;

        try {
          evt = JSON.parse(line);
        } catch (parseErr) {
          // If the parse error is on the very last line, it was a truncated/half-written trailing write
          if (i === lines.length - 1) {
            // Safe truncation of trailing partial write
            const validContent = validEvents.map(e => JSON.stringify(e)).join('\n') + (validEvents.length > 0 ? '\n' : '');
            writeFileSync(logPath, validContent, 'utf8');
            return {
              recovered: true,
              valid_events: validEvents.length,
              repaired_trailing: true,
              repaired_line_index: i
            };
          } else {
            // Corruption is in the middle of the chain -> Fail Closed
            throw new Error(`FAIL_CLOSED_CORRUPTED_MIDDLE_BLOCK: Invalid JSON at line index ${i} before end of ledger.`);
          }
        }

        // Verify sequence and hash link
        const computedPayloadHash = calculateSha256(evt.payload);
        const header = {
          sequence: evt.sequence,
          previous_hash: evt.previous_hash,
          payload_hash: evt.payload_hash,
          timestamp: evt.timestamp,
          event_type: evt.event_type
        };
        const computedEventHash = calculateSha256(header);

        const isIntegrityBroken = (
          evt.sequence !== i ||
          evt.previous_hash !== expectedPrevHash ||
          computedPayloadHash !== evt.payload_hash ||
          computedEventHash !== evt.event_hash
        );

        if (isIntegrityBroken) {
          if (i === lines.length - 1) {
            // Truncate broken trailing block
            const validContent = validEvents.map(e => JSON.stringify(e)).join('\n') + (validEvents.length > 0 ? '\n' : '');
            writeFileSync(logPath, validContent, 'utf8');
            return {
              recovered: true,
              valid_events: validEvents.length,
              repaired_trailing: true,
              repaired_line_index: i
            };
          } else {
            throw new Error(`FAIL_CLOSED_CORRUPTED_MIDDLE_BLOCK: Broken hash chain link or modified payload at sequence ${i}`);
          }
        }

        expectedPrevHash = evt.event_hash;
        validEvents.push(evt);
      }

      return {
        recovered: true,
        valid_events: validEvents.length,
        repaired_trailing: false
      };
    } finally {
      this._releaseLock(missionId);
    }
  }

  verifyChainIntegrity(missionId) {
    const events = this.getEvents(missionId);
    if (events.length === 0) {
      return { valid: true, count: 0, message: 'Empty ledger' };
    }

    let expectedPrevHash = GENESIS_PREVIOUS_HASH;

    for (let i = 0; i < events.length; i++) {
      const evt = events[i];

      // 1. Sequence check
      if (evt.sequence !== i) {
        return {
          valid: false,
          error: 'TAMPER_DETECTED_SEQUENCE_GAP',
          brokenSequence: i,
          expectedSeq: i,
          observedSeq: evt.sequence
        };
      }

      // 2. Previous hash link check
      if (evt.previous_hash !== expectedPrevHash) {
        return {
          valid: false,
          error: 'TAMPER_DETECTED_PREVIOUS_HASH_MISMATCH',
          brokenSequence: i,
          expectedPrevHash,
          observedPrevHash: evt.previous_hash
        };
      }

      // 3. Payload hash integrity check
      const computedPayloadHash = calculateSha256(evt.payload);
      if (computedPayloadHash !== evt.payload_hash) {
        return {
          valid: false,
          error: 'TAMPER_DETECTED_PAYLOAD_MODIFIED',
          brokenSequence: i,
          expectedPayloadHash: evt.payload_hash,
          computedPayloadHash
        };
      }

      // 4. Event hash computation check
      const header = {
        sequence: evt.sequence,
        previous_hash: evt.previous_hash,
        payload_hash: evt.payload_hash,
        timestamp: evt.timestamp,
        event_type: evt.event_type
      };
      const computedEventHash = calculateSha256(header);
      if (computedEventHash !== evt.event_hash) {
        return {
          valid: false,
          error: 'TAMPER_DETECTED_EVENT_HASH_CORRUPT',
          brokenSequence: i,
          expectedEventHash: evt.event_hash,
          computedEventHash
        };
      }

      expectedPrevHash = evt.event_hash;
    }

    return {
      valid: true,
      count: events.length,
      lastHash: expectedPrevHash
    };
  }

  replayAndRecover(missionId) {
    const integrity = this.verifyChainIntegrity(missionId);
    if (!integrity.valid) {
      throw new Error(`CRASH_RECOVERY_HALTED [${integrity.error}]: Ledger at sequence ${integrity.brokenSequence} is corrupt or tampered`);
    }

    const events = this.getEvents(missionId);
    const snapshot = {
      mission_id: missionId,
      state: 'VISION_INTAKE',
      sequence: 0,
      features: [],
      evidenceIndex: {},
      lastEventHash: GENESIS_PREVIOUS_HASH,
      recoveredAt: new Date().toISOString()
    };

    for (const evt of events) {
      snapshot.sequence = evt.sequence;
      snapshot.lastEventHash = evt.event_hash;

      switch (evt.event_type) {
        case 'MISSION_INITIALIZED':
        case 'mission.formulate':
          snapshot.state = 'MISSION_FORMULATION';
          if (evt.payload.features) {
            snapshot.features = evt.payload.features;
          }
          break;
        case 'mission.propose_direction':
          snapshot.state = 'HUMAN_DIRECTION_GATE';
          break;
        case 'human.approve_direction':
          snapshot.state = 'DISCOVER';
          break;
        case 'discovery.complete':
          snapshot.state = 'DISCOVER';
          break;
        case 'definition.complete':
        case 'mission.plan':
        case 'MISSION_PLANNED':
          snapshot.state = 'PLAN';
          break;
        case 'task.delegate':
        case 'MISSION_PACKAGED':
          snapshot.state = 'DELEGATE';
          break;
        case 'task.execute':
        case 'TASK_SUPERVISED':
          snapshot.state = 'SUPERVISE';
          break;
        case 'task.verify':
        case 'CURSOR_RETURN_INGESTED':
          snapshot.state = 'VERIFY';
          break;
        case 'FEATURE_STATUS_CHANGED':
          if (evt.payload && evt.payload.featureId) {
            const feat = snapshot.features.find(f => f.id === evt.payload.featureId);
            if (feat) {
              feat.status = evt.payload.newStatus;
              feat.evidenceReceipt = evt.payload.evidenceReceipt;
            }
          }
          break;
        case 'EVIDENCE_RECORDED':
          if (evt.payload && evt.payload.receipt_id) {
            snapshot.evidenceIndex[evt.payload.receipt_id] = evt.payload;
          }
          break;
        case 'mission.close':
        case 'MISSION_CLOSED':
          snapshot.state = 'COMPLETED';
          break;
        default:
          break;
      }
    }

    return snapshot;
  }
}
