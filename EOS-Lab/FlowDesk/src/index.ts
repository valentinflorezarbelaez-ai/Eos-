import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { z } from 'zod';
import { createDbConnection } from './db/database.js';
import { LeadService, OptimisticConcurrencyError, type LeadStatus } from './services/leadService.js';
import { AuthService } from './services/authService.js';
import { renderDashboard } from './views/dashboard.js';
import { renderLogin } from './views/login.js';

const app = new Hono();
const db = createDbConnection(process.env.NODE_ENV === 'test' ? ':memory:' : 'flowdesk.db');
const leadService = new LeadService(db);
const authService = new AuthService(db);

// Helper session middleware
const getAuthUser = (c: any) => {
  const sessionToken = getCookie(c, 'flowdesk_session');
  if (!sessionToken) return null;
  const [userId, email] = sessionToken.split(':');
  return { id: userId, email };
};

// Zod Schema for Inbound Ingestion Boundary (LSN-002 Boundary Contract)
const leadIngestionSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  notes: z.string().optional(),
});

// Root Redirect
app.get('/', (c) => c.redirect('/dashboard'));

// Login View & Action
app.get('/login', (c) => {
  return c.html(renderLogin());
});

app.post('/login', async (c) => {
  const body = await c.req.parseBody();
  const email = String(body.email || '').trim();
  const password = String(body.password || '').trim();

  let user = authService.loginUser(email, password);
  if (!user) {
    // Auto-register for seamless demo testing
    user = authService.registerUser(email, password);
  }

  setCookie(c, 'flowdesk_session', `${user.id}:${user.email}`, {
    httpOnly: true,
    sameSite: 'Strict',
    path: '/',
  });

  return c.redirect('/dashboard');
});

app.post('/logout', (c) => {
  deleteCookie(c, 'flowdesk_session', { path: '/' });
  return c.redirect('/login');
});

// Dashboard View
app.get('/dashboard', (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');

  const filter = c.req.query('status') as LeadStatus | undefined;
  const search = c.req.query('q');
  const error = c.req.query('error');

  const leads = leadService.getLeads(user.id, filter, search);
  return c.html(renderDashboard(user.email, leads, filter, search, error));
});

// Create Lead (UI Action)
app.post('/leads', async (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');

  const body = await c.req.parseBody();
  try {
    const validData = leadIngestionSchema.parse(body);
    leadService.createLead(user.id, validData);
    return c.redirect('/dashboard');
  } catch (err: any) {
    return c.redirect(`/dashboard?error=${encodeURIComponent(err.message || 'Invalid lead data')}`);
  }
});

// Update Lead Status (UI Action with Optimistic Locking Check)
app.post('/leads/:id/status', async (c) => {
  const user = getAuthUser(c);
  if (!user) return c.redirect('/login');

  const leadId = c.req.param('id');
  const body = await c.req.parseBody();
  const newStatus = body.status as LeadStatus;
  const expectedUpdatedAt = String(body.expected_updated_at || '');

  try {
    leadService.updateLeadStatus(user.id, leadId, newStatus, expectedUpdatedAt);
    return c.redirect('/dashboard');
  } catch (err) {
    if (err instanceof OptimisticConcurrencyError) {
      c.status(409);
      return c.html(renderDashboard(user.email, leadService.getLeads(user.id), undefined, undefined, '⚠️ CONFLICTO DE CONCURRENCIA (409): Este lead fue modificado por otro operador mientras lo editabas. Se previno la sobrescritura silenciosa.'));
    }
    return c.redirect(`/dashboard?error=${encodeURIComponent('Failed to update status')}`);
  }
});

// API Ingestion Boundary Endpoint (LSN-002 Evolved System Boundary Contract)
app.post('/api/v1/leads', async (c) => {
  const user = getAuthUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  }

  try {
    const rawBody = await c.req.json();
    const validData = leadIngestionSchema.parse(rawBody);
    const createdLead = leadService.createLead(user.id, validData);
    return c.json({ success: true, lead: createdLead }, 201);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Validation Error', details: err.errors }, 400);
    }
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

const port = Number(process.env.PORT) || 4323;
if (process.env.NODE_ENV !== 'test') {
  console.log(`⚡ FlowDesk running on http://127.0.0.1:${port}`);
  serve({ fetch: app.fetch, port });
}

export { app, db, leadService, authService };
