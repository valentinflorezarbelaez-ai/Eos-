/**
 * Luxe Registry Core Domain Engine: Multi-tenant isolation, atomic item reservation, contribution ledger, input sanitization, and performance telemetry.
 */

export class TenantIsolationViolation extends Error {
  constructor(message = 'TENANT_ISOLATION_VIOLATION: Access denied to tenant resource') {
    super(message);
    this.name = 'TenantIsolationViolation';
    this.statusCode = 403;
  }
}

export class DoubleBookingException extends Error {
  constructor(message = 'DOUBLE_BOOKING_CONFLICT: Item has already been reserved by another guest') {
    super(message);
    this.name = 'DoubleBookingException';
    this.statusCode = 409;
  }
}

export class SecurityValidationException extends Error {
  constructor(message = 'SECURITY_VALIDATION_ERROR: Invalid or unsafe input payload') {
    super(message);
    this.name = 'SecurityValidationException';
    this.statusCode = 400;
  }
}

export class LuxeRegistryDomainEngine {
  constructor() {
    this.tenants = new Map(); // tenant_id -> Tenant Object
    this.items = new Map();   // item_id -> Item Object
    this.reservations = new Map(); // item_id -> Reservation Object
    this.contributions = []; // Ledger Array
    this.locks = new Set();  // Lock set for atomic reservations
    this.auditLogs = [];    // Security Audit Log
    this.latencyRecords = []; // Latency telemetry records in ms
  }

  /** Input Sanitization Guard */
  sanitizeInput(str) {
    if (typeof str !== 'string') return str;
    if (/<script|javascript:|on\w+=/i.test(str)) {
      throw new SecurityValidationException('SECURITY_VALIDATION_ERROR: Potentially malicious Script/XSS payload detected');
    }
    return str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
  }

  /** Logs Security Audit Events */
  logSecurityEvent(eventType, tenantId, details) {
    this.auditLogs.push({
      log_id: `AUD-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      event_type: eventType,
      tenant_id: tenantId,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /** Registers a new host tenant */
  registerTenant(tenantId, name, hostEmail) {
    const cleanName = this.sanitizeInput(name);
    const cleanEmail = this.sanitizeInput(hostEmail);
    const tenant = { tenant_id: tenantId, name: cleanName, host_email: cleanEmail, created_at: new Date().toISOString() };
    this.tenants.set(tenantId, tenant);
    this.logSecurityEvent('TENANT_REGISTERED', tenantId, { name: cleanName });
    return tenant;
  }

  /** Adds a gift item scoped to a tenant */
  addGiftItem(tenantId, itemId, title, price, isGoalContribution = false) {
    const start = performance.now();
    if (!this.tenants.has(tenantId)) {
      throw new Error(`TENANT_NOT_FOUND: Tenant '${tenantId}' does not exist`);
    }

    const cleanTitle = this.sanitizeInput(title);
    const item = {
      item_id: itemId,
      tenant_id: tenantId,
      title: cleanTitle,
      price: Number(price),
      is_goal_contribution: Boolean(isGoalContribution),
      status: 'AVAILABLE', // AVAILABLE, RESERVED, FULFILLED
      contributed_amount: 0,
      created_at: new Date().toISOString()
    };

    this.items.set(itemId, item);
    this.latencyRecords.push(performance.now() - start);
    return item;
  }

  /** Gets gift items strictly scoped by tenant_id */
  getItemsByTenant(tenantId, requestingTenantId) {
    const start = performance.now();
    if (tenantId !== requestingTenantId) {
      this.logSecurityEvent('CROSS_TENANT_READ_BLOCKED', requestingTenantId, { target_tenant: tenantId });
      throw new TenantIsolationViolation(`TENANT_ISOLATION_VIOLATION: Requesting tenant '${requestingTenantId}' cannot query items of tenant '${tenantId}'`);
    }

    const tenantItems = [];
    for (const item of this.items.values()) {
      if (item.tenant_id === tenantId) {
        tenantItems.push(item);
      }
    }
    this.latencyRecords.push(performance.now() - start);
    return tenantItems;
  }

  /** Atomic reservation of a gift item by a guest */
  async reserveItem(tenantId, itemId, guestId, requestingTenantId) {
    const start = performance.now();
    if (tenantId !== requestingTenantId) {
      this.logSecurityEvent('CROSS_TENANT_WRITE_BLOCKED', requestingTenantId, { target_tenant: tenantId, action: 'RESERVE' });
      throw new TenantIsolationViolation();
    }

    const item = this.items.get(itemId);
    if (!item || item.tenant_id !== tenantId) {
      throw new Error(`ITEM_NOT_FOUND: Item '${itemId}' not found in tenant '${tenantId}'`);
    }

    // Lock check for concurrency race condition prevention
    if (this.locks.has(itemId) || item.status !== 'AVAILABLE') {
      this.logSecurityEvent('DOUBLE_BOOKING_PREVENTED', tenantId, { item_id: itemId, guest_id: guestId });
      throw new DoubleBookingException();
    }

    // Acquire atomic lock
    this.locks.add(itemId);

    try {
      item.status = 'RESERVED';
      const reservation = {
        reservation_id: `RES-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        item_id: itemId,
        tenant_id: tenantId,
        guest_id: guestId,
        reserved_at: new Date().toISOString()
      };
      this.reservations.set(itemId, reservation);
      this.latencyRecords.push(performance.now() - start);
      return reservation;
    } finally {
      this.locks.delete(itemId);
    }
  }

  /** Records guest monetary or goal contribution in ledger */
  recordContribution(tenantId, itemId, guestId, amount, paymentTxId, requestingTenantId) {
    const start = performance.now();
    if (tenantId !== requestingTenantId) {
      this.logSecurityEvent('CROSS_TENANT_WRITE_BLOCKED', requestingTenantId, { target_tenant: tenantId, action: 'CONTRIBUTE' });
      throw new TenantIsolationViolation();
    }

    const item = this.items.get(itemId);
    if (!item || item.tenant_id !== tenantId) {
      throw new Error(`ITEM_NOT_FOUND: Item '${itemId}' not found`);
    }

    item.contributed_amount += Number(amount);
    if (item.contributed_amount >= item.price) {
      item.status = 'FULFILLED';
    }

    const entry = {
      ledger_id: `LED-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      tenant_id: tenantId,
      item_id: itemId,
      guest_id: guestId,
      amount: Number(amount),
      payment_tx_id: this.sanitizeInput(paymentTxId),
      certified_status: 'CERTIFIED',
      timestamp: new Date().toISOString()
    };

    this.contributions.push(entry);
    this.latencyRecords.push(performance.now() - start);
    return entry;
  }

  /** Computes performance latency distribution */
  getPerformanceDistribution() {
    if (this.latencyRecords.length === 0) {
      return { sample_size: 0, mean_ms: 0, p50_ms: 0, p95_ms: 0, p99_ms: 0 };
    }

    const sorted = [...this.latencyRecords].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const getP = p => sorted[Math.min(Math.floor((p / 100) * n), n - 1)];

    return {
      sample_size: n,
      mean_ms: Number(mean.toFixed(4)),
      p50_ms: Number(getP(50).toFixed(4)),
      p95_ms: Number(getP(95).toFixed(4)),
      p99_ms: Number(getP(99).toFixed(4))
    };
  }
}
