export type AppMode = 'accepting' | 'referral';

export type BookingStatus =
  | 'pending_payment'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'booked'
  | 'refunded';

export interface SystemSettings {
  id: string;
  mode: AppMode;
  daily_count: number;
  max_daily_limit: number;
  last_reset: string;
  upi_id: string;
  upi_payee_name: string;
  convenience_fee: number;
  is_admin_override: boolean;
  admin_email?: string;
  whatsapp_number?: string;
  whatsapp_alerts_enabled?: boolean;
  quiet_hours_enabled?: boolean;
}

export interface AlertRecord {
  id: string;
  title: string;
  message: string;
  channel: 'dashboard' | 'whatsapp' | 'email';
  priority: 'critical' | 'important' | 'info';
  status: 'unread' | 'read' | 'resolved';
  timestamp: string;
  metadata?: any;
}

export interface ReferralCard {
  id: string;
  appName: string;
  category: string;
  referralCode: string;
  inviteUrl: string;
  benefits: {
    userDiscount: string;
    referrerReward: string | null;
  };
  offlineConfig: {
    offlineAction: 'copy_code_and_queue' | 'download_apk';
    apkPath: string | null;
    cachedDescription: string;
  };
}

export interface PlatformQuote {
  id: string;
  platform: 'Pronto' | 'Urban Company InstaHelp' | 'Snabbit' | 'Broomees';
  service_name: string;
  base_price: number;
  convenience_fee: number;
  total_price: number;
  eta_minutes: number;
  rating: number;
  is_cheapest: boolean;
  is_fastest: boolean;
  notes: string;
  referral_url: string;
  coupon_code?: string;
}

export interface BookingRecord {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  preferred_time?: string;
  service_type: string;
  suggested_platform: string;
  suggested_price: number;
  convenience_fee: number;
  payment_amount: number;
  payment_reference: string;
  status: BookingStatus;
  admin_decision: 'approve' | 'reject' | null;
  admin_notes?: string;
  notes?: string;
  refund_status?: 'not_applicable' | 'pending' | 'initiated' | 'completed';
  refund_reference?: string;
  partner_booking_id?: string;
  eta_time?: string;
  created_at: string;
  updated_at: string;
  timeline: Array<{
    title: string;
    description: string;
    timestamp: string;
    agent?: string;
  }>;
}

export interface AgentLog {
  id: string;
  agent_name:
    | 'Price Scout Agent'
    | 'Payment Watcher Agent'
    | 'Booking Executor Agent'
    | 'Communication Agent'
    | 'Cap & Mode Controller Agent'
    | 'Supervisory Agent (CEO)';
  action: string;
  details: string;
  level: 'info' | 'success' | 'warn' | 'error';
  booking_id?: string;
  timestamp: string;
}

export type Language = 'en' | 'hi';

export interface AgentState {
  customer_name: string;
  customer_phone: string;
  payment_amount: number;
  payment_reference: string;
  suggested_platform: string | null;
  suggested_service: string | null;
  suggested_price: number | null;
  status: BookingStatus;
  daily_count: number;
  mode: AppMode;
  language: Language;
  admin_decision: 'approve' | 'reject' | null;
  error: string | null;
  messages: Array<{
    role: string;
    content: string;
    timestamp?: string;
  }>;
}
