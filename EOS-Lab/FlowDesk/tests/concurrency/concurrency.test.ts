import { test, describe, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { createDbConnection } from '../../src/db/database.js';
import { LeadService, OptimisticConcurrencyError } from '../../src/services/leadService.js';
import { AuthService } from '../../src/services/authService.js';

describe('Concurrency & Optimistic Locking Test Suite (SQLite WAL Mode)', () => {
  const dbFile = path.join(process.cwd(), 'test_concurrency.db');

  after(() => {
    try {
      if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
      if (fs.existsSync(`${dbFile}-wal`)) fs.unlinkSync(`${dbFile}-wal`);
      if (fs.existsSync(`${dbFile}-shm`)) fs.unlinkSync(`${dbFile}-shm`);
    } catch {}
  });

  test('should prevent race condition when two writers attempt update with same expected_updated_at timestamp', () => {
    const db = createDbConnection(dbFile);
    const auth = new AuthService(db);
    const leadService = new LeadService(db);

    const user = auth.registerUser(`concurrent_${Date.now()}@flowdesk.io`, 'pass123');
    const lead = leadService.createLead(user.id, {
      name: 'Concurrent Lead',
      email: 'concurrent@test.com',
      phone: '3000000000',
    });

    const initialTimestamp = lead.updated_at;

    // First operator updates successfully
    const updatedLead1 = leadService.updateLeadStatus(
      user.id,
      lead.id,
      'CONTACTADO',
      initialTimestamp
    );
    assert.equal(updatedLead1.status, 'CONTACTADO');

    // Second operator tries to update using the stale initial timestamp
    assert.throws(
      () => {
        leadService.updateLeadStatus(user.id, lead.id, 'CALIFICADO', initialTimestamp);
      },
      (err: any) => err instanceof OptimisticConcurrencyError
    );
  });
});
