import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, SERVICES_CATALOG, NCR_AREAS } from './server/db';
import { workflowEngine } from './server/agents/langgraph_workflow';
import { SUPABASE_SQL_SCHEMA, LANGGRAPH_PYTHON_CODE, SUPABASE_EDGE_FUNCTIONS } from './server/supabase_export';
import { parseReferralInput } from './server/referralGenerator';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // API ROUTES (FIRST)
  // ==========================================

  // 1. Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'House-Help Arrangement Service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // 2. System Settings & Mode
  app.get('/api/settings', (req, res) => {
    res.json(db.settings);
  });

  app.post('/api/settings/toggle', (req, res) => {
    const { mode, reason } = req.body;
    const targetMode = mode || (db.settings.mode === 'accepting' ? 'referral' : 'accepting');
    db.setMode(targetMode, reason || 'Admin toggled mode via dashboard');
    res.json({ success: true, settings: db.settings });
  });

  app.post('/api/settings/reset-counter', (req, res) => {
    db.resetDailyCount();
    res.json({ success: true, settings: db.settings });
  });

  app.post('/api/settings/set-count', (req, res) => {
    const { count } = req.body;
    if (typeof count === 'number' && count >= 0) {
      db.settings.daily_count = count;
      if (count >= db.settings.max_daily_limit) {
        db.settings.mode = 'referral';
        db.addLog({
          agent_name: 'Cap & Mode Controller Agent',
          action: 'Cap Limit Reached via Update',
          details: `Count set to ${count} >= 15. Automatically transitioned to Referral Mode.`,
          level: 'warn',
        });
      }
      res.json({ success: true, settings: db.settings });
    } else {
      res.status(400).json({ error: 'Invalid count parameter' });
    }
  });

  app.post('/api/settings/admin-email', (req, res) => {
    const { email } = req.body;
    if (email && typeof email === 'string' && email.includes('@')) {
      db.setAdminEmail(email.trim());
      res.json({ success: true, settings: db.settings });
    } else {
      res.status(400).json({ error: 'Valid email address required' });
    }
  });

  // Admin-Only Payment Coordinates Configuration (UPI ID, Beneficiary Name, Fee)
  app.post('/api/settings/upi', (req, res) => {
    const { upi_id, upi_payee_name, convenience_fee } = req.body;
    if (upi_id === undefined || typeof upi_id !== 'string') {
      return res.status(400).json({ error: 'Valid UPI ID string is required.' });
    }

    db.setAdminUpi(upi_id, upi_payee_name, typeof convenience_fee === 'number' ? convenience_fee : undefined);
    res.json({ success: true, settings: db.settings });
  });

  // Alerts & Agent Control APIs
  app.get('/api/alerts', (req, res) => {
    res.json(db.alerts);
  });

  app.post('/api/alerts/:id/resolve', (req, res) => {
    const { id } = req.params;
    db.resolveAlert(id);
    res.json({ success: true, alerts: db.alerts });
  });

  app.post('/api/settings/alerts', (req, res) => {
    const { whatsapp_number, whatsapp_alerts_enabled, quiet_hours_enabled } = req.body;
    db.updateAlertSettings(whatsapp_number, whatsapp_alerts_enabled, quiet_hours_enabled);
    res.json({ success: true, settings: db.settings });
  });

  app.get('/api/agents', (req, res) => {
    res.json(db.agents);
  });

  app.post('/api/agents/:id/toggle', (req, res) => {
    const { id } = req.params;
    const agents = db.toggleAgent(id);
    res.json({ success: true, agents });
  });

  app.post('/api/agents/:id/run', (req, res) => {
    const { id } = req.params;
    const { task } = req.body;
    const agents = db.runAgentTask(id, task || 'Manual task trigger');
    res.json({ success: true, agents });
  });

  app.post('/api/agents/health-check', (req, res) => {
    const result = db.runHealthCheck();
    res.json(result);
  });

  app.get('/api/accounts/health', (req, res) => {
    res.json(db.platformAccounts);
  });

  // Referral Directory & Generator APIs
  app.get('/api/referrals', (req, res) => {
    res.json(db.referralCards);
  });

  app.post('/api/referrals/generate', (req, res) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== 'string') {
        return res.status(400).json({ error: 'Valid input string is required' });
      }
      const referralCard = parseReferralInput(input);
      res.json(referralCard);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/referrals', (req, res) => {
    try {
      const card = req.body;
      if (!card || !card.id || !card.appName || !card.referralCode) {
        return res.status(400).json({ error: 'Incomplete referral card schema' });
      }
      const savedCard = db.addReferralCard(card);
      res.json({ success: true, card: savedCard, cards: db.referralCards });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/referrals/:id', (req, res) => {
    const { id } = req.params;
    db.removeReferralCard(id);
    res.json({ success: true, cards: db.referralCards });
  });

  // 7-day bookings & capacity analytics
  app.get('/api/analytics/7days', (req, res) => {
    try {
      const analytics = db.get7DayAnalytics();
      res.json(analytics);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 3. Services, NCR Areas, and Price Scout
  app.get('/api/services', (req, res) => {
    res.json(SERVICES_CATALOG);
  });

  app.get('/api/areas', (req, res) => {
    res.json(NCR_AREAS);
  });

  app.get('/api/price-scout', async (req, res) => {
    try {
      const serviceId = (req.query.service as string) || 'utensils';
      const area = (req.query.area as string) || '';
      const result = await workflowEngine.runPriceScout(serviceId, area);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Booking Submission (Payment Watcher node)
  app.post('/api/bookings/create', async (req, res) => {
    try {
      // Check if accepting mode is active and not capped
      if (db.settings.mode !== 'accepting') {
        return res.status(400).json({
          error: 'Bookings are currently closed. Only referral mode is active.',
        });
      }

      if (db.settings.daily_count >= db.settings.max_daily_limit) {
        db.settings.mode = 'referral';
        return res.status(400).json({
          error: 'Daily booking limit reached. Switched to referral mode.',
        });
      }

      const {
        customer_name,
        customer_phone,
        customer_address,
        preferred_time,
        service_id,
        platform,
        base_price,
        convenience_fee,
        payment_amount,
        payment_reference,
        language,
      } = req.body;

      if (!customer_name || !customer_phone || !payment_reference) {
        return res.status(400).json({
          error: 'Please provide Customer Name, Phone, and UPI Payment Reference.',
        });
      }

      const booking = await workflowEngine.handlePaymentSubmission({
        customer_name,
        customer_phone,
        customer_address: customer_address || 'Delhi NCR',
        preferred_time: preferred_time || '',
        service_id: service_id || 'utensils',
        platform: platform || 'Pronto',
        base_price: Number(base_price) || 180,
        convenience_fee: Number(convenience_fee) || db.settings.convenience_fee,
        payment_amount: Number(payment_amount) || 229,
        payment_reference,
        language: language === 'hi' ? 'hi' : 'en',
      });

      res.json({ success: true, booking });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4b. Customer Safe Booking Tracker (Returns only matching booking, zero database dump)
  app.get('/api/bookings/track', (req, res) => {
    const query = String(req.query.q || '').trim().toLowerCase();
    if (!query) {
      return res.status(400).json({ error: 'Please provide a Booking ID, Phone Number, or UPI reference.' });
    }

    const cleanDigits = query.replace(/\D/g, '');
    const found = db.bookings.find((b) => {
      const matchId = b.id.toLowerCase() === query;
      const matchUtr = b.payment_reference.toLowerCase() === query;
      const matchPhone = cleanDigits.length >= 10 && b.customer_phone.replace(/\D/g, '').includes(cleanDigits);
      return matchId || matchUtr || matchPhone;
    });

    if (!found) {
      return res.status(404).json({ error: 'No arrangement request found matching your query.' });
    }

    res.json({
      success: true,
      booking: {
        id: found.id,
        customer_name: found.customer_name,
        service_type: found.service_type,
        suggested_platform: found.suggested_platform,
        status: found.status,
        preferred_time: found.preferred_time,
        payment_amount: found.payment_amount,
        payment_reference: found.payment_reference,
        partner_booking_id: found.partner_booking_id,
        eta_time: found.eta_time,
        created_at: found.created_at,
        updated_at: found.updated_at,
        timeline: found.timeline,
      },
    });
  });

  // 4c. Admin Authentication
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const validPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password === validPassword) {
      res.json({ success: true, message: 'Admin authenticated successfully' });
    } else {
      res.status(401).json({ success: false, error: 'Incorrect password. Access denied.' });
    }
  });

  // 5. Bookings List & Pending Approvals
  app.get('/api/bookings/pending', (req, res) => {
    const pending = db.bookings.filter((b) => b.status === 'pending_approval');
    res.json(pending);
  });

  app.get('/api/bookings/all', (req, res) => {
    res.json(db.bookings);
  });

  // 6. Admin Decision (Approve / Reject) -> Resumes LangGraph workflow
  app.post('/api/bookings/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const result = await workflowEngine.executeAdminDecision(id, 'approve', notes);
      res.json({ success: true, booking: result, settings: db.settings });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/bookings/:id/reject', async (req, res) => {
    try {
      const { id } = req.params;
      const { notes, refund_status, refund_reference } = req.body;
      const result = await workflowEngine.executeAdminDecision(
        id,
        'reject',
        notes,
        refund_status || 'initiated',
        refund_reference
      );
      res.json({ success: true, booking: result });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // 6b. Mark / Update Refund
  app.post('/api/bookings/:id/refund', (req, res) => {
    try {
      const { id } = req.params;
      const { refund_status, refund_reference, notes } = req.body;
      const booking = db.bookings.find((b) => b.id === id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      booking.refund_status = refund_status || 'completed';
      if (refund_reference) {
        booking.refund_reference = refund_reference;
      }
      if (notes) {
        booking.admin_notes = (booking.admin_notes ? booking.admin_notes + ' | ' : '') + notes;
      }
      booking.updated_at = new Date().toISOString();
      booking.timeline.push({
        title: 'Refund Status Updated',
        description: `Admin marked refund as ${booking.refund_status}${refund_reference ? ` (Ref: ${refund_reference})` : ''}.`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Human Admin',
      });

      db.addLog({
        agent_name: 'Supervisory Agent (CEO)',
        action: 'Refund Status Updated',
        details: `Booking ${id} refund marked as ${booking.refund_status}. Reference: ${refund_reference || 'N/A'}.`,
        level: 'info',
        booking_id: id,
      });

      res.json({ success: true, booking });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6b. Update Booking Notes / Internal Context
  app.post('/api/bookings/:id/notes', (req, res) => {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      const booking = db.bookings.find((b) => b.id === id);
      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }
      booking.notes = typeof notes === 'string' ? notes : '';
      booking.admin_notes = typeof notes === 'string' ? notes : '';
      booking.updated_at = new Date().toISOString();
      res.json({ success: true, booking });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Multi-Agent Logs & Supervisory Overview
  app.get('/api/agents/logs', (req, res) => {
    res.json(db.logs);
  });

  app.get('/api/agents/supervisory', (req, res) => {
    res.json(workflowEngine.getSupervisorySummary());
  });

  // 8. Export Production Code (Supabase Schema, Edge Functions, LangGraph Python)
  app.get('/api/export/artifacts', (req, res) => {
    res.json({
      supabase_sql_schema: SUPABASE_SQL_SCHEMA,
      langgraph_python_code: LANGGRAPH_PYTHON_CODE,
      supabase_edge_functions: SUPABASE_EDGE_FUNCTIONS,
    });
  });

  // ==========================================
  // VITE MIDDLEWARE (DEV) & STATIC SERVE (PROD)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`House-Help Arrangement Service running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
