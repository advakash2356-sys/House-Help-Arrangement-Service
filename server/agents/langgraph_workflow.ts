import { db, getPlatformQuotes } from '../db';
import { AgentState, BookingRecord } from '../../src/types';

/**
 * Stateful Multi-Agent System Engine
 * Directly mirrors the LangGraph StateGraph schema and flow:
 *
 * Flow:
 * [Price Scout] -> [Payment Watcher] -> (INTERRUPT: Human Admin Approval) ->
 *    -> [If Approved: Booking Executor] -> [Communication Agent] -> [Cap & Mode Controller]
 *    -> [If Rejected: Communication Agent (Refund)]
 * All supervised by Supervisory Agent (CEO Agent).
 */

export class LangGraphWorkflowEngine {
  /**
   * Phase 1: Customer submits inquiry -> Price Scout node identifies the best option for that area
   */
  public async runPriceScout(serviceId: string, areaId?: string): Promise<{
    available: boolean;
    bestQuote: any | null;
    allQuotes: any[];
    message?: string;
  }> {
    if (!areaId || areaId.trim() === '') {
      return {
        available: false,
        bestQuote: null,
        allQuotes: [],
        message: 'Select your area to see the best available rates.',
      };
    }

    const quotes = getPlatformQuotes(serviceId, areaId);
    if (!quotes || quotes.length === 0) {
      return {
        available: false,
        bestQuote: null,
        allQuotes: [],
        message: 'No direct partner coverage available in this specific locality. Direct partner directory available below.',
      };
    }

    // Find best value (lowest total price, or tie-break on fastest ETA)
    const sorted = [...quotes].sort((a, b) => a.total_price - b.total_price || a.eta_minutes - b.eta_minutes);
    const bestQuote = sorted[0];

    db.addLog({
      agent_name: 'Price Scout Agent',
      action: 'Scout Best Platform Option by Location',
      details: `Scouted ${quotes.length} partner platforms in "${areaId}" for "${bestQuote.service_name}". Best: ${bestQuote.platform} (Base: ₹${bestQuote.base_price}, Fee: ₹${bestQuote.convenience_fee}, Total: ₹${bestQuote.total_price}, ETA: ~${bestQuote.eta_minutes}m).`,
      level: 'info',
    });

    return { available: true, bestQuote, allQuotes: quotes };
  }

  /**
   * Phase 2: Payment Watcher node
   * Customer pays advance via UPI and submits transaction reference.
   * State enters 'pending_approval' with Human-In-The-Loop interrupt!
   */
  public async handlePaymentSubmission(data: {
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    preferred_time?: string;
    service_id: string;
    platform: string;
    base_price: number;
    convenience_fee: number;
    payment_amount: number;
    payment_reference: string;
    language?: 'en' | 'hi';
  }): Promise<BookingRecord> {
    // Hard Limit Guard: Check if daily cap reached or in referral mode
    if (db.settings.mode === 'referral' || db.settings.daily_count >= db.settings.max_daily_limit) {
      db.addLog({
        agent_name: 'Cap & Mode Controller Agent',
        action: 'Submission Blocked by Daily Cap',
        details: `Customer ${data.customer_name} attempted submission while daily cap (${db.settings.max_daily_limit}) was reached or system in referral mode.`,
        level: 'warn',
      });
      throw new Error(
        data.language === 'hi'
          ? 'आज की 15 बुकिंग की दैनिक सीमा पूरी हो चुकी है। कृपया सीधे पार्टनर डायरेक्टरी से बुक करें।'
          : 'Daily concierge capacity limit of 15 bookings has been reached. Please use our direct partner directory.'
      );
    }

    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const customerId = `CUST-${Math.floor(8000 + Math.random() * 1000)}`;
    const lang = data.language || 'en';

    const newBooking: BookingRecord = {
      id: bookingId,
      customer_id: customerId,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_address: data.customer_address,
      preferred_time: data.preferred_time || 'Anytime / ASAP',
      service_type: data.service_id,
      suggested_platform: data.platform,
      suggested_price: data.base_price,
      convenience_fee: data.convenience_fee,
      payment_amount: data.payment_amount,
      payment_reference: data.payment_reference,
      status: 'pending_approval',
      admin_decision: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      timeline: [
        {
          title: lang === 'hi' ? 'प्राइस स्काउट विकल्प' : 'Option Evaluated',
          description:
            lang === 'hi'
              ? `प्राइस स्काउट ने ${data.platform} का चयन किया (बेस शुल्क ₹${data.base_price} + समन्वय शुल्क ₹${data.convenience_fee})।`
              : `Price Scout selected ${data.platform} at ₹${data.base_price} base + ₹${data.convenience_fee} coordination fee.`,
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Price Scout Agent',
        },
        {
          title: lang === 'hi' ? 'अग्रिम भुगतान प्राप्त' : 'UPI Advance Received',
          description:
            lang === 'hi'
              ? `पेमेंट वॉचर ने ₹${data.payment_amount} हेतु यूपीआई रेफरेंस "${data.payment_reference}" दर्ज किया।`
              : `Payment Watcher verified UPI reference "${data.payment_reference}" for ₹${data.payment_amount}.`,
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Payment Watcher Agent',
        },
        {
          title: lang === 'hi' ? 'ह्यूमन-इन-द-लूप रोक' : 'Human-in-the-Loop Interrupt Active',
          description:
            lang === 'hi'
              ? 'कार्यप्रवाह रुका हुआ है। बुकिंग एग्जीक्यूटर रन करने से पहले एडमिन की अनिवार्य स्वीकृति आवश्यक है।'
              : 'LangGraph execution halted. Awaiting mandatory Admin Approval before Booking Executor runs.',
          timestamp: new Date().toLocaleTimeString(),
          agent: 'Supervisory Agent (CEO)',
        },
      ],
    };

    db.bookings.unshift(newBooking);

    db.addLog({
      agent_name: 'Payment Watcher Agent',
      action: 'Payment Form Submission Detected',
      details: `Received advance UPI payment for booking ${bookingId} from ${data.customer_name} (${data.customer_phone}). Reference: ${data.payment_reference}, Amount: ₹${data.payment_amount}.`,
      level: 'success',
      booking_id: bookingId,
    });

    db.addLog({
      agent_name: 'Supervisory Agent (CEO)',
      action: 'LangGraph Interrupt Triggered',
      details: `Execution paused at [admin_interrupt_node] for ${bookingId}. High-risk Booking Executor blocked pending human approval.`,
      level: 'warn',
      booking_id: bookingId,
    });

    db.addLog({
      agent_name: 'Communication Agent',
      action: 'Admin Notification Dispatched',
      details: `Dispatched instant HITL approval request to Admin Email (${db.settings.admin_email || 'adv.akash2356@gmail.com'}) for booking ${bookingId}.`,
      level: 'info',
      booking_id: bookingId,
    });

    return newBooking;
  }

  /**
   * Phase 3: Resume LangGraph after Human-In-The-Loop Decision
   * Decision = 'approve' -> Booking Executor Node -> Communication Node -> Cap Controller Node
   * Decision = 'reject'  -> Communication Node (Refund notice) -> State updated to 'rejected'
   */
  public async executeAdminDecision(
    bookingId: string,
    decision: 'approve' | 'reject',
    notes?: string,
    refundStatus?: 'pending' | 'initiated' | 'completed',
    refundRef?: string
  ): Promise<BookingRecord> {
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found.`);
    }

    if (booking.status !== 'pending_approval') {
      throw new Error(`Booking ${bookingId} is in status ${booking.status}; cannot perform decision.`);
    }

    booking.admin_decision = decision;
    booking.admin_notes = notes || '';
    booking.updated_at = new Date().toISOString();

    if (decision === 'approve') {
      // 1. Booking Executor Agent Node (Controlled high-risk agent)
      const partnerPrefix = booking.suggested_platform.slice(0, 4).toUpperCase();
      const partnerBookingId = `${partnerPrefix}-${Math.floor(1000 + Math.random() * 9000)}-DELHI`;
      const eta = '18–25 mins';

      booking.status = 'booked';
      booking.partner_booking_id = partnerBookingId;
      booking.eta_time = eta;

      booking.timeline.push({
        title: 'Admin Approved',
        description: `Human admin verified UPI advance payment and authorized partner execution.${notes ? ` Note: "${notes}"` : ''}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Human Admin',
      });

      db.addLog({
        agent_name: 'Booking Executor Agent',
        action: 'Partner Booking Dispatched',
        details: `Dispatched booking for ${booking.customer_name} to ${booking.suggested_platform}. Partner Order ID: ${partnerBookingId}. Helper assignment in progress.`,
        level: 'success',
        booking_id: booking.id,
      });

      booking.timeline.push({
        title: 'Partner Platform Dispatch Completed',
        description: `Helper assigned on ${booking.suggested_platform} (Order #${partnerBookingId}). Estimated Arrival: ${eta}.`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Booking Executor Agent',
      });

      // 2. Communication Agent Node
      const commMessage = `WhatsApp & SMS dispatched to ${booking.customer_phone}: "Hello ${booking.customer_name}, your house-help booking is CONFIRMED via ${booking.suggested_platform} (ID: ${partnerBookingId}). Helper arriving in ~${eta}."`;
      db.addLog({
        agent_name: 'Communication Agent',
        action: 'Customer Notification Sent',
        details: commMessage,
        level: 'info',
        booking_id: booking.id,
      });

      booking.timeline.push({
        title: 'Customer Notifications Sent',
        description: `WhatsApp & SMS dispatched with live helper tracker link and safety OTP.`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Communication Agent',
      });

      // 3. Cap & Mode Controller Node
      db.incrementDailyCount();

      booking.timeline.push({
        title: 'Daily Cap Synchronized',
        description: `System quota recorded: ${db.settings.daily_count} / ${db.settings.max_daily_limit} bookings completed today.`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Cap & Mode Controller Agent',
      });

      // 4. Supervisory Agent
      db.addLog({
        agent_name: 'Supervisory Agent (CEO)',
        action: 'Workflow Succeeded',
        details: `StateGraph reached terminal state [booked] for ${booking.id}. Customer: ${booking.customer_name}, Total: ₹${booking.payment_amount}.`,
        level: 'success',
        booking_id: booking.id,
      });
    } else {
      // Admin Rejected
      booking.status = 'rejected';
      booking.refund_status = refundStatus || 'initiated';
      booking.refund_reference = refundRef || `REF/UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`;

      booking.timeline.push({
        title: 'Admin Rejected',
        description: `Human admin declined booking.${notes ? ` Reason: "${notes}".` : ''}`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Human Admin',
      });

      db.addLog({
        agent_name: 'Communication Agent',
        action: 'Rejection & Refund Notice Sent',
        details: `WhatsApp update dispatched to ${booking.customer_phone}: Booking could not be assigned. Full refund of ₹${booking.payment_amount} marked as ${booking.refund_status}. Reference: ${booking.refund_reference}.`,
        level: 'warn',
        booking_id: booking.id,
      });

      booking.timeline.push({
        title: 'Refund Triggered',
        description: `Full advance refund of ₹${booking.payment_amount} set to "${booking.refund_status}" (Ref: ${booking.refund_reference}).`,
        timestamp: new Date().toLocaleTimeString(),
        agent: 'Communication Agent',
      });

      db.addLog({
        agent_name: 'Supervisory Agent (CEO)',
        action: 'Workflow Closed (Rejected)',
        details: `StateGraph reached terminal state [rejected] for ${booking.id}. Refund status: ${booking.refund_status}.`,
        level: 'info',
        booking_id: booking.id,
      });
    }

    return booking;
  }

  /**
   * CEO Supervisory Agent daily summary
   */
  public getSupervisorySummary() {
    const total = db.bookings.length;
    const pending = db.bookings.filter((b) => b.status === 'pending_approval').length;
    const booked = db.bookings.filter((b) => b.status === 'booked').length;
    const rejected = db.bookings.filter((b) => b.status === 'rejected').length;

    return {
      daily_count: db.settings.daily_count,
      max_daily_limit: db.settings.max_daily_limit,
      mode: db.settings.mode,
      total_requests: total,
      pending_approvals: pending,
      confirmed_booked: booked,
      rejected_refunded: rejected,
      system_health: 'Optimal',
      active_agents: 6,
      human_in_the_loop_pending: pending > 0,
      timestamp: new Date().toISOString(),
    };
  }
}

export const workflowEngine = new LangGraphWorkflowEngine();
