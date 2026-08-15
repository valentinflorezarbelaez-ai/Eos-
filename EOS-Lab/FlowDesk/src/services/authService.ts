import type { DatabaseSync } from 'node:sqlite';
import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export class AuthService {
  constructor(private db: DatabaseSync) {}

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = scryptSync(password, salt, 64);
    return timingSafeEqual(keyBuffer, derivedKey);
  }

  registerUser(email: string, password: string): User {
    const id = randomUUID();
    const passwordHash = this.hashPassword(password);

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password_hash)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, email.toLowerCase(), passwordHash);

    return { id, email: email.toLowerCase(), created_at: new Date().toISOString() };
  }

  loginUser(email: string, password: string): User | null {
    const stmt = this.db.prepare(`SELECT * FROM users WHERE email = ?`);
    const userRow = stmt.get(email.toLowerCase()) as any;

    if (!userRow) return null;

    const isValid = this.verifyPassword(password, userRow.password_hash);
    if (!isValid) return null;

    return {
      id: userRow.id,
      email: userRow.email,
      created_at: userRow.created_at
    };
  }
}
