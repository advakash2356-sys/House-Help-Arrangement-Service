import React, { useState, useMemo, useEffect } from 'react';
import {
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Bot,
  AlertTriangle,
  RotateCcw,
  Zap,
  Phone,
  FileCode,
  Copy,
  Check,
  CheckCheck,
  User,
  ExternalLink,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Code,
  Filter,
  Search,
  Sparkles,
  Terminal,
  Info,
  Mail,
  Edit3,
  Download,
  FileSpreadsheet,
  Sun,
  Moon,
  IndianRupee,
  Percent,
  FileText,
  Save,
  LogOut,
  RefreshCw,
  Loader2,
  Trash2,
  Share2,
  Tag,
} from 'lucide-react';
import { BookingRecord, SystemSettings, AgentLog, AlertRecord, ReferralCard } from '../types';
import { BookingTrendsChart } from './BookingTrendsChart';
import { ToastMessage, playNotificationChime } from './Toast';

interface AdminDashboardProps {
  settings: SystemSettings;
  bookings: BookingRecord[];
  agentLogs: AgentLog[];
  onToggleMode: () => void;
  onResetCounter: () => void;
  onSetCount: (count: number) => void;
  onApproveBooking: (id: string, notes?: string) => Promise<void>;
  onRejectBooking: (
    id: string,
    notes: string,
    refundStatus: 'pending' | 'initiated' | 'completed',
    refundRef: string
  ) => Promise<void>;
  onUpdateRefund?: (
    id: string,
    refundStatus: 'pending' | 'initiated' | 'completed',
    refundRef: string
  ) => Promise<void>;
  onUpdateAdminEmail?: (email: string) => Promise<void>;
  onUpdateUpiSettings?: (upiId: string, payeeName?: string, fee?: number) => Promise<void>;
  onUpdateBookingNotes?: (id: string, notes: string) => Promise<void> | void;
  onTriggerToast?: (toast: Omit<ToastMessage, 'id'>) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  bookings,
  agentLogs,
  onToggleMode,
  onResetCounter,
  onSetCount,
  onApproveBooking,
  onRejectBooking,
  onUpdateRefund,
  onUpdateAdminEmail,
  onUpdateUpiSettings,
  onUpdateBookingNotes,
  onTriggerToast,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'agents' | 'export' | 'alerts' | 'referrals'>('pending');

  // Theme toggle state with localStorage persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('sahayak_admin_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sahayak_admin_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Admin Email configuration state
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(settings.admin_email || 'adv.akash2356@gmail.com');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailSaveSuccess, setEmailSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings.admin_email) {
      setEmailInput(settings.admin_email);
    }
  }, [settings.admin_email]);

  const handleSaveEmail = async () => {
    if (!emailInput || !emailInput.includes('@')) return;
    if (onUpdateAdminEmail) {
      setIsSavingEmail(true);
      try {
        await onUpdateAdminEmail(emailInput.trim());
        setIsEditingEmail(false);
        setEmailSaveSuccess(true);
        setTimeout(() => setEmailSaveSuccess(false), 3000);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSavingEmail(false);
      }
    }
  };

  // Admin UPI configuration state
  const [upiIdInput, setUpiIdInput] = useState(settings.upi_id || '');
  const [payeeNameInput, setPayeeNameInput] = useState(settings.upi_payee_name || '');
  const [isSavingUpi, setIsSavingUpi] = useState(false);
  const [upiSaveSuccess, setUpiSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings.upi_id !== undefined) setUpiIdInput(settings.upi_id);
    if (settings.upi_payee_name !== undefined) setPayeeNameInput(settings.upi_payee_name);
  }, [settings.upi_id, settings.upi_payee_name]);

  const handleSaveUpi = async () => {
    setIsSavingUpi(true);
    try {
      if (onUpdateUpiSettings) {
        await onUpdateUpiSettings(upiIdInput.trim(), payeeNameInput.trim(), settings.convenience_fee);
      } else {
        const res = await fetch('/api/settings/upi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            upi_id: upiIdInput.trim(),
            upi_payee_name: payeeNameInput.trim(),
            convenience_fee: settings.convenience_fee,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update UPI settings');
      }
      setUpiSaveSuccess(true);
      setTimeout(() => setUpiSaveSuccess(false), 3500);
      if (onTriggerToast) {
        onTriggerToast({
          type: 'success',
          title: 'UPI Payment Coordinates Saved',
          message: 'Official UPI ID updated successfully. This is now live for customers.',
          duration: 3500,
        });
      }
    } catch (err: any) {
      if (onTriggerToast) {
        onTriggerToast({
          type: 'error',
          title: 'Save Failed',
          message: err.message || 'Error saving UPI ID',
          duration: 4000,
        });
      }
    } finally {
      setIsSavingUpi(false);
    }
  };

  // Alerts and WhatsApp notification channels state
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [whatsappInput, setWhatsappInput] = useState(settings.whatsapp_number || '+919876543210');
  const [whatsappEnabled, setWhatsappEnabled] = useState(settings.whatsapp_alerts_enabled ?? true);
  const [quietHours, setQuietHours] = useState(settings.quiet_hours_enabled ?? false);
  const [isSavingAlerts, setIsSavingAlerts] = useState(false);

  // Agent Swarm & Account Health state
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [accountsList, setAccountsList] = useState<any[]>([]);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Referral Cards & Offline Integration Generator state
  const [referralInput, setReferralInput] = useState('/add Blinkit | Grocery | BLINK100 | ₹100 off | https://blinkit.com/invite | /downloads/blinkit.apk');
  const [generatedReferralJson, setGeneratedReferralJson] = useState<ReferralCard | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [referralCardsList, setReferralCardsList] = useState<ReferralCard[]>([]);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [copiedReferralJson, setCopiedReferralJson] = useState(false);

  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAlerts(data);
      })
      .catch(() => {});

    fetch('/api/agents')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAgentsList(data);
      })
      .catch(() => {});

    fetch('/api/accounts/health')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAccountsList(data);
      })
      .catch(() => {});

    fetch('/api/referrals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReferralCardsList(data);
      })
      .catch(() => {});
  }, []);

  const handleGenerateReferralCard = async (customInput?: string) => {
    const textToProcess = customInput || referralInput;
    if (!textToProcess.trim()) return;
    setIsGeneratingCard(true);
    try {
      const res = await fetch('/api/referrals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: textToProcess }),
      });
      const data = await res.json();
      if (data && data.id) {
        setGeneratedReferralJson(data);
        if (onTriggerToast) {
          onTriggerToast({
            type: 'success',
            title: 'Schema Generated',
            message: `Parsed standard referral schema for ${data.appName}`,
            duration: 3000,
          });
        }
      }
    } catch (e: any) {
      if (onTriggerToast) {
        onTriggerToast({
          type: 'error',
          title: 'Generation Failed',
          message: e.message || 'Could not parse input',
          duration: 3500,
        });
      }
    } finally {
      setIsGeneratingCard(false);
    }
  };

  const handleSaveReferralCardToDirectory = async () => {
    if (!generatedReferralJson) return;
    setIsSavingCard(true);
    try {
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generatedReferralJson),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.cards)) {
        setReferralCardsList(data.cards);
        if (onTriggerToast) {
          onTriggerToast({
            type: 'success',
            title: 'Card Published',
            message: `${generatedReferralJson.appName} added to live referral directory!`,
            duration: 3500,
          });
          playNotificationChime('success');
        }
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSavingCard(false);
    }
  };

  const handleDeleteReferralCard = async (id: string) => {
    if (!confirm('Remove this referral card from directory?')) return;
    try {
      const res = await fetch(`/api/referrals/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success && Array.isArray(data.cards)) {
        setReferralCardsList(data.cards);
        if (onTriggerToast) {
          onTriggerToast({
            type: 'info',
            title: 'Card Removed',
            message: 'Referral promotion removed from directory',
            duration: 2500,
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleAgent = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/toggle`, { method: 'POST' });
      const data = await res.json();
      if (data.success && Array.isArray(data.agents)) {
        setAgentsList(data.agents);
        if (onTriggerToast) {
          onTriggerToast({ type: 'success', title: 'Agent State Updated', message: `Agent ${agentId} toggled successfully.`, duration: 3000 });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunAgentTask = async (agentId: string) => {
    const taskName = prompt('Enter manual task description for this agent:', 'Check live partner rates & sync SLA');
    if (!taskName) return;
    try {
      const res = await fetch(`/api/agents/${agentId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskName }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.agents)) {
        setAgentsList(data.agents);
        if (onTriggerToast) {
          onTriggerToast({ type: 'success', title: 'Task Executed', message: `Manual task dispatched to agent ${agentId}.`, duration: 3000 });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch('/api/agents/health-check', { method: 'POST' });
      const data = await res.json();
      if (data.success && onTriggerToast) {
        onTriggerToast({ type: 'success', title: 'Health Check Passed', message: 'All 6 agents and backend partner integrations verified successfully.', duration: 4000 });
        playNotificationChime('success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (settings.whatsapp_number) setWhatsappInput(settings.whatsapp_number);
    if (settings.whatsapp_alerts_enabled !== undefined) setWhatsappEnabled(settings.whatsapp_alerts_enabled);
    if (settings.quiet_hours_enabled !== undefined) setQuietHours(settings.quiet_hours_enabled);
  }, [settings.whatsapp_number, settings.whatsapp_alerts_enabled, settings.quiet_hours_enabled]);

  const handleResolveAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}/resolve`, { method: 'POST' });
      const data = await res.json();
      if (Array.isArray(data.alerts)) setAlerts(data.alerts);
      playNotificationChime('success');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAlertConfig = async () => {
    setIsSavingAlerts(true);
    try {
      const res = await fetch('/api/settings/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp_number: whatsappInput.trim(),
          whatsapp_alerts_enabled: whatsappEnabled,
          quiet_hours_enabled: quietHours,
        }),
      });
      const data = await res.json();
      if (data.success && onTriggerToast) {
        onTriggerToast({
          type: 'success',
          title: 'Alert Channels Updated',
          message: 'WhatsApp notification routing and quiet hours preference saved securely.',
          duration: 3500,
        });
        playNotificationChime('success');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingAlerts(false);
    }
  };

  // Rejection modal state
  const [rejectingBooking, setRejectingBooking] = useState<BookingRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('Partner capacity unavailable');
  const [refundStatus, setRefundStatus] = useState<'initiated' | 'completed'>('initiated');
  const [refundReference, setRefundReference] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Direct refund update modal state
  const [updatingRefundBooking, setUpdatingRefundBooking] = useState<BookingRecord | null>(null);
  const [updateRefundStatus, setUpdateRefundStatus] = useState<'pending' | 'initiated' | 'completed'>('completed');
  const [updateRefundRef, setUpdateRefundRef] = useState<string>('');
  const [isUpdatingRefund, setIsUpdatingRefund] = useState<boolean>(false);

  const handleOpenUpdateRefundModal = (b: BookingRecord) => {
    setUpdatingRefundBooking(b);
    setUpdateRefundStatus((b.refund_status as any) || 'completed');
    setUpdateRefundRef(
      b.refund_reference || `REF/UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`
    );
  };

  const handleSaveRefundUpdate = async () => {
    if (!updatingRefundBooking) return;
    setIsUpdatingRefund(true);
    try {
      if (onUpdateRefund) {
        await onUpdateRefund(updatingRefundBooking.id, updateRefundStatus, updateRefundRef);
      } else {
        const res = await fetch(`/api/bookings/${updatingRefundBooking.id}/refund`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            refund_status: updateRefundStatus,
            refund_reference: updateRefundRef,
          }),
        });
        if (!res.ok) throw new Error('Failed to update refund status');
      }
      // Update locally
      updatingRefundBooking.refund_status = updateRefundStatus;
      updatingRefundBooking.refund_reference = updateRefundRef;
      setUpdatingRefundBooking(null);
      playNotificationChime('success');
      if (onTriggerToast) {
        onTriggerToast({
          type: 'success',
          title: 'Refund Status Updated',
          message: `Booking #${updatingRefundBooking.id} refund is now marked as ${updateRefundStatus}.`,
          duration: 3500,
        });
      }
    } catch (err: any) {
      if (onTriggerToast) {
        onTriggerToast({
          type: 'error',
          title: 'Refund Update Failed',
          message: err.message || 'Error updating refund status',
          duration: 4000,
        });
      }
    } finally {
      setIsUpdatingRefund(false);
    }
  };

  // Editable notes state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  const handleStartEditNote = (b: BookingRecord) => {
    setEditingNoteId(b.id);
    setNoteInput(b.notes || b.admin_notes || '');
  };

  const handleCancelEditNote = () => {
    setEditingNoteId(null);
    setNoteInput('');
  };

  const handleSaveNote = async (id: string) => {
    setSavingNoteId(id);
    try {
      if (onUpdateBookingNotes) {
        await onUpdateBookingNotes(id, noteInput);
      } else {
        await fetch(`/api/bookings/${id}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: noteInput }),
        });
        const target = bookings.find((b) => b.id === id);
        if (target) {
          target.notes = noteInput;
          target.admin_notes = noteInput;
        }
      }
      setEditingNoteId(null);
      playNotificationChime('success');
      if (onTriggerToast) {
        onTriggerToast({
          type: 'success',
          title: 'Internal Notes Saved',
          message: `Notes updated successfully for booking #${id}`,
          duration: 3500,
        });
      }
    } catch (err: any) {
      if (onTriggerToast) {
        onTriggerToast({
          type: 'error',
          title: 'Failed to Save Notes',
          message: err.message || 'Error updating notes',
          duration: 4000,
        });
      }
    } finally {
      setSavingNoteId(null);
    }
  };

  // High-Level Daily Performance Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalRevenue = bookings
      .filter((b) => b.status === 'booked')
      .reduce((sum, b) => sum + (Number(b.payment_amount) || 0), 0);

    const pendingApprovals = bookings.filter((b) => b.status === 'pending_approval').length;

    const resolved = bookings.filter((b) => b.status === 'booked' || b.status === 'rejected');
    const completionRate =
      resolved.length > 0
        ? Math.round((bookings.filter((b) => b.status === 'booked').length / resolved.length) * 100)
        : bookings.length > 0
        ? Math.round((bookings.filter((b) => b.status === 'booked').length / bookings.length) * 100)
        : 100;

    const totalFees = bookings
      .filter((b) => b.status === 'booked')
      .reduce((sum, b) => sum + (Number(b.convenience_fee) || 0), 0);

    return {
      totalRevenue,
      pendingApprovals,
      completionRate,
      totalFees,
    };
  }, [bookings]);

  // Export code state
  const [artifacts, setArtifacts] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Agent Logs enhancement state
  const [expandedLogIds, setExpandedLogIds] = useState<Record<string, boolean>>({});
  const [logFilterLevel, setLogFilterLevel] = useState<'all' | 'success' | 'info' | 'warn' | 'error'>('all');
  const [logSearch, setLogSearch] = useState<string>('');
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);

  const toggleLogExpand = (id: string) => {
    setExpandedLogIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleExpandAllLogs = () => {
    const anyExpanded = Object.values(expandedLogIds).some(Boolean);
    if (anyExpanded) {
      setExpandedLogIds({});
    } else {
      const all: Record<string, boolean> = {};
      agentLogs.forEach((l) => {
        all[l.id] = true;
      });
      setExpandedLogIds(all);
    }
  };

  const handleCopyLogJson = (log: AgentLog) => {
    const fullLogJson = JSON.stringify(
      {
        id: log.id,
        timestamp: log.timestamp,
        agent_name: log.agent_name,
        action: log.action,
        level: log.level,
        booking_id: log.booking_id || null,
        details: log.details,
        langgraph_context: {
          node: log.agent_name.toLowerCase().replace(/ agent/i, '').replace(/ /g, '_'),
          execution_state: log.level === 'error' ? 'FAILED' : 'COMPLETED',
          engine: 'LangGraph StateGraph v0.2.1',
        },
      },
      null,
      2
    );
    navigator.clipboard.writeText(fullLogJson);
    setCopiedLogId(log.id);
    setTimeout(() => setCopiedLogId(null), 2000);
  };

  const filteredLogs = useMemo(() => {
    return agentLogs.filter((log) => {
      const matchesLevel =
        logFilterLevel === 'all'
          ? true
          : logFilterLevel === 'warn' || logFilterLevel === 'warning'
          ? log.level === 'warn' || log.level === 'warning'
          : log.level === logFilterLevel;
      const searchLower = logSearch.toLowerCase().trim();
      const matchesSearch =
        !searchLower ||
        log.agent_name.toLowerCase().includes(searchLower) ||
        log.action.toLowerCase().includes(searchLower) ||
        log.details.toLowerCase().includes(searchLower) ||
        (log.booking_id && log.booking_id.toLowerCase().includes(searchLower));
      return matchesLevel && matchesSearch;
    });
  }, [agentLogs, logFilterLevel, logSearch]);

  const pendingBookings = bookings.filter((b) => b.status === 'pending_approval');
  const bookedBookings = bookings.filter((b) => b.status === 'booked');
  const rejectedBookings = bookings.filter((b) => b.status === 'rejected');

  // Bookings table search and filter state
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<
    'all' | 'pending_approval' | 'booked' | 'rejected'
  >('all');
  const [bookingServiceFilter, setBookingServiceFilter] = useState<string>('all');

  // Dynamic distinct list of services from bookings
  const availableServices = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach((b) => {
      if (b.service_type) set.add(b.service_type.trim());
    });
    return Array.from(set).sort();
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesStatus =
        bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
      const matchesService =
        bookingServiceFilter === 'all' || b.service_type === bookingServiceFilter;
      const searchLower = bookingSearch.toLowerCase().trim();
      const notesContent = (b.notes || b.admin_notes || '').toLowerCase();
      const matchesSearch =
        !searchLower ||
        b.id.toLowerCase().includes(searchLower) ||
        b.customer_name.toLowerCase().includes(searchLower) ||
        b.customer_phone.toLowerCase().includes(searchLower) ||
        b.customer_address.toLowerCase().includes(searchLower) ||
        b.service_type.toLowerCase().includes(searchLower) ||
        b.suggested_platform.toLowerCase().includes(searchLower) ||
        b.payment_reference.toLowerCase().includes(searchLower) ||
        (b.partner_booking_id && b.partner_booking_id.toLowerCase().includes(searchLower)) ||
        notesContent.includes(searchLower);
      return matchesStatus && matchesService && matchesSearch;
    });
  }, [bookings, bookingStatusFilter, bookingServiceFilter, bookingSearch]);

  // CSV Export utility
  const handleDownloadCSV = (recordsToExport: BookingRecord[] = filteredBookings) => {
    if (!recordsToExport || recordsToExport.length === 0) {
      if (onTriggerToast) {
        onTriggerToast({
          type: 'warn',
          title: 'No Bookings to Export',
          message: 'The current booking selection is empty. There are no rows to export.',
          duration: 3500,
        });
      }
      return;
    }

    const headers = [
      'Booking ID',
      'Created At',
      'Customer Name',
      'Phone Number',
      'Address',
      'Service Type',
      'Suggested Platform',
      'Base Price (INR)',
      'Convenience Fee (INR)',
      'Total Amount Paid (INR)',
      'Payment Reference (UTR)',
      'Status',
      'Partner Booking ID',
      'ETA Time',
      'Refund Status',
      'Refund Reference',
      'Internal Notes',
      'Rejection Reason / Notes',
    ];

    const escapeCsv = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = recordsToExport.map((b) => [
      escapeCsv(b.id),
      escapeCsv(b.created_at),
      escapeCsv(b.customer_name),
      escapeCsv(b.customer_phone),
      escapeCsv(b.customer_address),
      escapeCsv(b.service_type),
      escapeCsv(b.suggested_platform),
      escapeCsv(b.suggested_price),
      escapeCsv(b.convenience_fee),
      escapeCsv(b.payment_amount),
      escapeCsv(b.payment_reference),
      escapeCsv(b.status),
      escapeCsv(b.partner_booking_id || ''),
      escapeCsv(b.eta_time || ''),
      escapeCsv(b.refund_status || ''),
      escapeCsv(b.refund_reference || ''),
      escapeCsv(b.notes || b.admin_notes || ''),
      escapeCsv(b.admin_notes || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `sahayak_bookings_export_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Audio & Toast confirmation
    playNotificationChime('success');
    if (onTriggerToast) {
      onTriggerToast({
        type: 'success',
        title: 'Bookings CSV Exported!',
        message: `Successfully downloaded ${recordsToExport.length} booking records for record-keeping and audit analysis.`,
        duration: 4000,
      });
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await onApproveBooking(id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRejectModal = (b: BookingRecord) => {
    setRejectingBooking(b);
    setRefundReference(`REF/UPI/${Math.floor(100000000000 + Math.random() * 900000000000)}`);
  };

  const handleConfirmReject = async () => {
    if (!rejectingBooking) return;
    setActionLoading(rejectingBooking.id);
    try {
      await onRejectBooking(
        rejectingBooking.id,
        rejectionReason,
        refundStatus,
        refundReference
      );
      setRejectingBooking(null);
    } finally {
      setActionLoading(null);
    }
  };

  const fetchArtifacts = async () => {
    try {
      const res = await fetch('/api/export/artifacts');
      const data = await res.json();
      setArtifacts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCode = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div
      id="admin-dashboard-root"
      className={`min-h-screen transition-colors duration-200 py-6 sm:py-8 ${
        theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50/50 text-slate-900'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        {/* Top Admin Bar */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-md border border-slate-800 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
                  Admin Operations Control Panel
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black mt-1">Arrangement Operations Dashboard</h1>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Supervising LangGraph state machines, UPI reconciliations, and platform partner dispatch.
              </p>
            </div>

            {/* Controls: Operational Mode Toggle & Theme Toggle */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Theme Toggle Button */}
              <button
                id="admin-theme-toggle-btn"
                type="button"
                onClick={() => {
                  const nextTheme = theme === 'light' ? 'dark' : 'light';
                  setTheme(nextTheme);
                  playNotificationChime('info');
                }}
                className="min-h-[44px] flex items-center space-x-2 px-3.5 py-2 rounded-2xl border bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-xs active:scale-95"
                title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode (Saved in localStorage)`}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
                    <div className="text-left hidden sm:block">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider leading-none">
                        Theme
                      </span>
                      <span className="text-xs font-bold text-amber-300">Light Mode</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-300" />
                    <div className="text-left hidden sm:block">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider leading-none">
                        Theme
                      </span>
                      <span className="text-xs font-bold text-white">Dark Mode</span>
                    </div>
                  </>
                )}
              </button>

              {/* Operational Mode Toggle */}
              <div className="min-h-[44px] flex items-center bg-slate-800/90 px-3 py-2 rounded-2xl border border-slate-700 space-x-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    Operational Mode
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      settings.mode === 'accepting' ? 'text-emerald-400' : 'text-blue-400'
                    }`}
                  >
                    {settings.mode === 'accepting' ? 'Accepting (ON)' : 'Referral (OFF)'}
                  </span>
                </div>
                <button
                  id="toggle-mode-btn"
                  onClick={onToggleMode}
                  className={`min-h-[40px] min-w-[40px] p-1.5 rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95 ${
                    settings.mode === 'accepting'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                  title="Toggle Mode"
                >
                  {settings.mode === 'accepting' ? (
                    <ToggleRight className="w-7 h-7" />
                  ) : (
                    <ToggleLeft className="w-7 h-7" />
                  )}
                </button>
              </div>

              {/* Log Out Button */}
              {onLogout && (
                <button
                  id="admin-logout-btn"
                  type="button"
                  onClick={onLogout}
                  className="min-h-[44px] flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl border bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border-rose-800/60 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Securely exit Admin Dashboard"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-bold hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>

          {/* Administrator Identity & HITL Alert Routing Details */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                    Admin Authority
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    HITL Verified
                  </span>
                </div>
                {isEditingEmail ? (
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="px-2.5 py-1 bg-slate-950 text-white border border-slate-700 rounded-lg text-xs font-mono focus:outline-none focus:border-amber-400"
                      placeholder="adv.akash2356@gmail.com"
                    />
                    <button
                      onClick={handleSaveEmail}
                      disabled={isSavingEmail}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      {isSavingEmail ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingEmail(false);
                        setEmailInput(settings.admin_email || 'adv.akash2356@gmail.com');
                      }}
                      className="px-2 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-mono font-bold text-white text-sm">
                      {settings.admin_email || 'adv.akash2356@gmail.com'}
                    </span>
                    <button
                      onClick={() => setIsEditingEmail(true)}
                      className="text-slate-400 hover:text-amber-400 transition-colors p-1 cursor-pointer"
                      title="Edit Admin Email"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {emailSaveSuccess && (
                      <span className="text-[11px] text-emerald-400 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Updated!</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>HITL Alerts &amp; 15/15 Cap Notifications Active</span>
            </div>
          </div>
        </div>

        {/* High-Level Daily Performance Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* 1. Total Revenue */}
          <div
            id="summary-card-revenue"
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black tracking-tight">
                ₹{summaryMetrics.totalRevenue.toLocaleString('en-IN')}
              </span>
              <span
                className={`text-xs font-semibold ${
                  theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
                }`}
              >
                Realized
              </span>
            </div>
            <div
              className={`mt-2.5 pt-2.5 border-t flex items-center justify-between text-[11px] ${
                theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}
            >
              <span>Coord Fees: ₹{summaryMetrics.totalFees.toLocaleString('en-IN')}</span>
              <span className="font-semibold text-emerald-500">{bookedBookings.length} Booked</span>
            </div>
          </div>

          {/* 2. Pending Approvals */}
          <div
            id="summary-card-pending"
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Pending Approvals
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  summaryMetrics.pendingApprovals > 0
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse'
                    : theme === 'dark'
                    ? 'bg-slate-800 text-slate-500'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black tracking-tight">
                {summaryMetrics.pendingApprovals}
              </span>
              <span
                className={`text-xs font-semibold ${
                  summaryMetrics.pendingApprovals > 0 ? 'text-amber-500' : 'text-slate-400'
                }`}
              >
                {summaryMetrics.pendingApprovals === 1 ? 'Booking Awaiting' : 'Bookings Awaiting'}
              </span>
            </div>
            <div
              className={`mt-2.5 pt-2.5 border-t flex items-center justify-between text-[11px] ${
                theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}
            >
              <span
                className={
                  summaryMetrics.pendingApprovals > 0 ? 'text-amber-500 font-bold' : 'text-slate-400'
                }
              >
                {summaryMetrics.pendingApprovals > 0
                  ? 'Action Required (HITL Gate)'
                  : 'All Orders Processed'}
              </span>
              {summaryMetrics.pendingApprovals > 0 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('pending')}
                  className="text-amber-500 hover:text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Review Tab &rarr;
                </button>
              ) : (
                <span className="text-emerald-500 font-medium">Zero Backlog</span>
              )}
            </div>
          </div>

          {/* 3. Completion Rate */}
          <div
            id="summary-card-completion"
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-900 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Completion Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-500">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black tracking-tight">
                {summaryMetrics.completionRate}%
              </span>
              <span
                className={`text-xs font-semibold ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                Fulfillment Rate
              </span>
            </div>
            <div
              className={`w-full rounded-full h-1.5 mt-2.5 overflow-hidden ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
              }`}
            >
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, summaryMetrics.completionRate)}%` }}
              />
            </div>
            <div
              className={`mt-2 flex items-center justify-between text-[11px] ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span>{bookedBookings.length} fulfilled successfully</span>
              <span>{rejectedBookings.length} refunded</span>
            </div>
          </div>
        </div>

        {/* Operational KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* 1. Daily Cap Counter (Hard limit: 15) */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                : 'bg-white border-slate-200 shadow-xs text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Today's Hard Cap
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  settings.daily_count >= 15
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                }`}
              >
                Limit: 15
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span
                className={`text-3xl font-black ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              >
                {settings.daily_count}
              </span>
              <span className="text-sm font-bold text-slate-400">/ 15 Bookings</span>
            </div>

            {/* Capacity Progress Bar */}
            <div
              className={`w-full rounded-full h-2 mt-3 overflow-hidden ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'
              }`}
            >
              <div
                className={`h-full rounded-full transition-all ${
                  settings.daily_count >= 15
                    ? 'bg-rose-500'
                    : settings.daily_count > 10
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (settings.daily_count / 15) * 100)}%` }}
              />
            </div>

            {/* Quick simulator buttons */}
            <div
              className={`mt-3 flex items-center justify-between text-[11px] pt-2 border-t ${
                theme === 'dark'
                  ? 'border-slate-800 text-slate-400'
                  : 'border-slate-100 text-slate-500'
              }`}
            >
              <button
                onClick={() => onSetCount(15)}
                className="hover:text-amber-400 font-semibold underline cursor-pointer"
                title="Test auto-switch to referral mode"
              >
                Simulate 15 Cap
              </button>
              <button
                onClick={onResetCounter}
                className="hover:text-white flex items-center space-x-1 cursor-pointer"
                title="Reset today's count"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset 0</span>
              </button>
            </div>
          </div>

          {/* 2. Pending Approvals (Human-in-the-loop) */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                : 'bg-white border-slate-200 shadow-xs text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Pending Approvals
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Interrupt Paused
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-amber-500">{pendingBookings.length}</span>
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Awaiting Admin Decision
              </span>
            </div>
            <p className={`text-[11px] mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Booking Executor Agent is paused until human authorizes UPI receipt.
            </p>
          </div>

          {/* 3. Confirmed Booked */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                : 'bg-white border-slate-200 shadow-xs text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Dispatched & Booked
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                Fulfilled
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-emerald-500">{bookedBookings.length}</span>
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Partner Orders Active
              </span>
            </div>
            <p className={`text-[11px] mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              WhatsApp confirmations & partner tracking links sent.
            </p>
          </div>

          {/* 4. Multi-Agent Engine Health */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-white shadow-md'
                : 'bg-white border-slate-200 shadow-xs text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Agent Health
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                All 6 Healthy
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span
                className={`text-3xl font-black ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              >
                100%
              </span>
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                LangGraph Nodes
              </span>
            </div>
            <p className={`text-[11px] mt-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Supervisory Agent monitoring state transitions & retries.
            </p>
          </div>
        </div>

        {/* Admin Secure UPI Gateway Configuration Card */}
        <div
          className={`p-6 rounded-3xl border mb-8 transition-all ${
            theme === 'dark'
              ? 'bg-slate-900 border-slate-800 text-white shadow-lg'
              : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-bold flex items-center space-x-2">
                <span>🔒 Secure Admin UPI Payment Gateway Configuration</span>
              </h3>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Set the official merchant UPI ID and Payee Name for incoming customer payments. No hardcoded or third-party UPI IDs are ever exposed.
              </p>
            </div>
            {upiSaveSuccess && (
              <span className="text-xs font-semibold px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 rounded-xl flex items-center space-x-1.5">
                <Check className="w-4 h-4" />
                <span>Saved Live Successfully!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Official UPI ID (VPA)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  placeholder="e.g. yourname@oksbi or merchant@paytm"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Beneficiary / Payee Name
              </label>
              <input
                type="text"
                value={payeeNameInput}
                onChange={(e) => setPayeeNameInput(e.target.value)}
                placeholder="e.g. Sahayak Express Services"
                className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className={`text-[11px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Current Active UPI: <code className="font-mono font-bold text-amber-500">{settings.upi_id || 'Not Set'}</code>
            </span>
            <button
              onClick={handleSaveUpi}
              disabled={isSavingUpi}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center space-x-2 shadow-xs disabled:opacity-50"
            >
              {isSavingUpi && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save & Publish UPI Gateway</span>
            </button>
          </div>
        </div>

        {/* 7-Day Daily Booking Trends & Capacity Usage Analytics (Recharts) */}
        <BookingTrendsChart
          bookings={bookings}
          settings={settings}
          onSimulateCap={() => onSetCount(15)}
          theme={theme}
        />

        {/* Tabs Navigation */}
        <div
          className={`flex items-center space-x-1 sm:space-x-2 border-b mb-6 overflow-x-auto pb-1 no-scrollbar ${
            theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <button
            onClick={() => setActiveTab('pending')}
            className={`min-h-[44px] pb-3 px-3 sm:px-4 text-xs font-bold transition-all relative whitespace-nowrap shrink-0 flex items-center ${
              activeTab === 'pending'
                ? theme === 'dark'
                  ? 'text-white border-b-2 border-amber-400'
                  : 'text-slate-900 border-b-2 border-slate-900'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Pending Approvals</span>
            {pendingBookings.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black">
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`min-h-[44px] pb-3 px-3 sm:px-4 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center ${
              activeTab === 'all'
                ? theme === 'dark'
                  ? 'text-white border-b-2 border-amber-400'
                  : 'text-slate-900 border-b-2 border-slate-900'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Bookings ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('agents')}
            className={`min-h-[44px] pb-3 px-3 sm:px-4 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center ${
              activeTab === 'agents'
                ? theme === 'dark'
                  ? 'text-white border-b-2 border-amber-400'
                  : 'text-slate-900 border-b-2 border-slate-900'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Agent Telemetry ({agentLogs.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('export');
              if (!artifacts) fetchArtifacts();
            }}
            className={`min-h-[44px] pb-3 px-3 sm:px-4 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center ${
              activeTab === 'export'
                ? theme === 'dark'
                  ? 'text-white border-b-2 border-amber-400'
                  : 'text-slate-900 border-b-2 border-slate-900'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Deploy Artifacts
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`min-h-[44px] pb-3 px-3 sm:px-4 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center ${
              activeTab === 'alerts'
                ? theme === 'dark'
                  ? 'text-white border-b-2 border-amber-400'
                  : 'text-slate-900 border-b-2 border-slate-900'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Alerts & WhatsApp</span>
            {alerts.filter(a => a.status === 'unread').length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {alerts.filter(a => a.status === 'unread').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`min-h-[44px] pb-3 px-3 sm:px-4 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center ${
              activeTab === 'referrals'
                ? theme === 'dark'
                  ? 'text-white border-b-2 border-amber-400'
                  : 'text-slate-900 border-b-2 border-slate-900'
                : theme === 'dark'
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            <span>Referral Card Generator</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-mono">
              {referralCardsList.length}
            </span>
          </button>

          {/* Global CSV Download Quick Action */}
          <button
            id="download-csv-nav-btn"
            type="button"
            onClick={() => handleDownloadCSV(bookings)}
            className={`shrink-0 ml-auto mb-1.5 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs border active:scale-95 ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-700'
            }`}
            title="Export all booking records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Download CSV ({bookings.length})</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>

      {/* TAB 1: PENDING APPROVALS */}
      {activeTab === 'pending' && (
        <div>
          {pendingBookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 text-base">All Caught Up!</h3>
              <p className="text-xs text-slate-500 mt-1">
                No pending customer payments awaiting authorization right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((b) => (
                <div
                  key={b.id}
                  id={`pending-card-${b.id}`}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-base text-slate-900">{b.customer_name}</span>
                      <span className="text-xs font-mono text-slate-500">{b.customer_phone}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        {b.id}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 block">Address / Society:</span>
                        <span className="font-medium text-slate-800">{b.customer_address}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Requested Service:</span>
                        <span className="font-medium text-slate-800">{b.service_type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Suggested Platform:</span>
                        <span className="font-bold text-amber-700">{b.suggested_platform}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Amount Paid (UTR Ref):</span>
                        <span className="font-bold text-slate-900">
                          ₹{b.payment_amount}{' '}
                          <span className="font-mono text-slate-500 font-normal">
                            ({b.payment_reference})
                          </span>
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Logged at {new Date(b.created_at).toLocaleTimeString()} • Price Scout: Base ₹
                      {b.suggested_price} + Coord Fee ₹{b.convenience_fee}
                    </p>
                  </div>

                  {/* Actions: Approve or Reject */}
                  <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      id={`approve-btn-${b.id}`}
                      disabled={actionLoading === b.id}
                      onClick={() => handleApprove(b.id)}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer active:scale-98 w-full sm:w-auto"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{actionLoading === b.id ? 'Executing...' : 'Approve Booking'}</span>
                    </button>

                    <button
                      id={`reject-btn-${b.id}`}
                      disabled={actionLoading === b.id}
                      onClick={() => handleOpenRejectModal(b)}
                      className="min-h-[44px] px-5 py-2.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98 w-full sm:w-auto"
                    >
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Reject & Refund</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL BOOKINGS */}
      {activeTab === 'all' && (
        <div
          className={`rounded-2xl border overflow-hidden shadow-xs transition-colors ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {/* Table Toolbar with Search, Status Filter, Service Filter & 'Download CSV' Button */}
          <div
            className={`p-4 sm:p-5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
              theme === 'dark'
                ? 'border-slate-800 bg-slate-950/60'
                : 'border-slate-200 bg-slate-50/70'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
              <div>
                <span
                  className={`font-bold text-sm block ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Bookings Master Registry ({filteredBookings.length} of {bookings.length})
                </span>
                <span className={`text-[11px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Export complete booking history including payments, dispatches, refunds & internal notes
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5">
              {/* Search Bar */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="booking-search-input"
                  type="text"
                  placeholder="Search customer, ID, notes..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className={`w-full sm:w-56 pl-9 pr-3 py-2.5 min-h-[44px] rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Status Filter Dropdown */}
              <select
                id="booking-status-filter"
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value as any)}
                aria-label="Filter bookings by status"
                className={`px-3 py-2.5 min-h-[44px] rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-medium ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="all">All Statuses ({bookings.length})</option>
                <option value="pending_approval">Pending ({pendingBookings.length})</option>
                <option value="booked">Booked ({bookedBookings.length})</option>
                <option value="rejected">Rejected ({rejectedBookings.length})</option>
              </select>

              {/* Service Type Filter Dropdown */}
              <select
                id="booking-service-filter"
                value={bookingServiceFilter}
                onChange={(e) => setBookingServiceFilter(e.target.value)}
                aria-label="Filter bookings by service type"
                className={`px-3 py-2.5 min-h-[44px] rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-medium ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="all">All Services ({availableServices.length})</option>
                {availableServices.map((svc) => (
                  <option key={svc} value={svc}>
                    {svc}
                  </option>
                ))}
              </select>

              {/* Clear filters shortcut */}
              {(bookingSearch.trim() !== '' ||
                bookingStatusFilter !== 'all' ||
                bookingServiceFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setBookingSearch('');
                    setBookingStatusFilter('all');
                    setBookingServiceFilter('all');
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:underline cursor-pointer flex items-center justify-center ${
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  }`}
                  title="Clear all active filters"
                >
                  Reset
                </button>
              )}

              {/* Download CSV Button */}
              <button
                id="download-csv-btn"
                type="button"
                onClick={() => handleDownloadCSV(filteredBookings)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer border border-emerald-700"
                title="Download current filtered booking records as CSV"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredBookings.length === 0 ? (
              <div
                className={`p-12 text-center text-xs ${
                  theme === 'dark' ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-400'
                }`}
              >
                <p
                  className={`font-semibold mb-1 ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  No booking records match your search or filter criteria.
                </p>
                <p className="text-[11px] text-slate-400 mb-3">
                  Try clearing your filters or search keywords.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBookingSearch('');
                    setBookingStatusFilter('all');
                    setBookingServiceFilter('all');
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b font-bold uppercase tracking-wider ${
                    theme === 'dark'
                      ? 'bg-slate-950/80 border-slate-800 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <tr>
                    <th className="px-4 py-3">Booking ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Service & Platform</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Partner Dispatch / Refund</th>
                    <th className="px-4 py-3 min-w-[200px]">Internal Notes</th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    theme === 'dark' ? 'divide-slate-800' : 'divide-slate-100'
                  }`}
                >
                  {filteredBookings.map((b) => (
                    <tr
                      key={b.id}
                      className={`transition-colors ${
                        theme === 'dark' ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td
                        className={`px-4 py-3 font-mono font-bold ${
                          theme === 'dark' ? 'text-slate-200' : 'text-slate-900'
                        }`}
                      >
                        {b.id}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`font-semibold ${
                            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                          }`}
                        >
                          {b.customer_name}
                        </div>
                        <div className="text-[11px] text-slate-400">{b.customer_phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`font-medium ${
                            theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                          }`}
                        >
                          {b.service_type}
                        </div>
                        <div className="text-[11px] font-bold text-amber-500">
                          {b.suggested_platform}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className={`font-bold ${
                            theme === 'dark' ? 'text-slate-100' : 'text-slate-900'
                          }`}
                        >
                          ₹{b.payment_amount}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {b.payment_reference}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            b.status === 'booked'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                              : b.status === 'pending_approval'
                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {b.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {b.partner_booking_id ? (
                          <div>
                            <span className="font-mono font-bold text-emerald-500">
                              {b.partner_booking_id}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              ETA: {b.eta_time}
                            </span>
                          </div>
                        ) : b.refund_status && b.refund_status !== 'not_applicable' ? (
                          <div
                            onClick={() => handleOpenUpdateRefundModal(b)}
                            className="cursor-pointer group p-1 -m-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Click to update refund status or reference"
                          >
                            <span className="font-bold text-rose-500 group-hover:underline flex items-center space-x-1">
                              <span>Refund: {b.refund_status}</span>
                              <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-rose-400" />
                            </span>
                            <span className="block text-[10px] font-mono text-slate-400">
                              {b.refund_reference}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      {/* Editable Internal Notes Column */}
                      <td className="px-4 py-3">
                        {editingNoteId === b.id ? (
                          <div className="space-y-1.5 min-w-[210px]">
                            <textarea
                              id={`note-textarea-${b.id}`}
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="Add internal context (VIP client, gate code)..."
                              rows={2}
                              className={`w-full p-2 text-xs rounded-lg border focus:ring-1 focus:ring-amber-500 focus:outline-none resize-none ${
                                theme === 'dark'
                                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                              }`}
                              autoFocus
                            />
                            <div className="flex items-center space-x-1.5 justify-end">
                              <button
                                type="button"
                                onClick={handleCancelEditNote}
                                className="px-2 py-1 text-[11px] rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                id={`save-note-btn-${b.id}`}
                                disabled={savingNoteId === b.id}
                                onClick={() => handleSaveNote(b.id)}
                                className="px-2.5 py-1 text-[11px] font-bold rounded bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                              >
                                {savingNoteId === b.id ? (
                                  <span>Saving...</span>
                                ) : (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Save</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {b.notes || b.admin_notes ? (
                              <div
                                id={`note-bubble-${b.id}`}
                                onClick={() => handleStartEditNote(b)}
                                className={`group p-2 rounded-xl border text-xs cursor-pointer transition-all max-w-[220px] ${
                                  theme === 'dark'
                                    ? 'bg-slate-800/70 border-slate-700 hover:border-amber-400/60'
                                    : 'bg-amber-50/70 border-amber-200/80 hover:border-amber-400'
                                }`}
                                title="Click to edit internal note"
                              >
                                <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400 mb-0.5">
                                  <span className="font-semibold uppercase tracking-wider text-amber-500 flex items-center space-x-1">
                                    <FileText className="w-2.5 h-2.5" />
                                    <span>Context</span>
                                  </span>
                                  <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                                </div>
                                <p
                                  className={`line-clamp-2 text-[11px] ${
                                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                                  }`}
                                >
                                  {b.notes || b.admin_notes}
                                </p>
                              </div>
                            ) : (
                              <button
                                type="button"
                                id={`add-note-btn-${b.id}`}
                                onClick={() => handleStartEditNote(b)}
                                className={`px-2.5 py-1.5 rounded-lg border border-dashed text-[11px] font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                                  theme === 'dark'
                                    ? 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 bg-slate-800/40'
                                    : 'border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400 bg-slate-50'
                                }`}
                                title="Add internal context or operational updates"
                              >
                                <Edit3 className="w-3 h-3 text-slate-400" />
                                <span>+ Add Notes</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: AGENT SWARM MONITOR, ACCOUNT HEALTH & TELEMETRY */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          {/* Quick Actions & System Controls Header */}
          <div className={`p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-amber-500" />
                  <span>Autonomous Multi-Agent Swarm Control Center</span>
                </h3>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Observe everything. Intervene only when necessary. Agents run autonomously; use manual overrides only for recovery.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRunHealthCheck}
                  disabled={isCheckingHealth}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                >
                  {isCheckingHealth ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Run Health Check</span>
                </button>

                <button
                  onClick={() => onToggleMode(settings.mode === 'accepting' ? 'referral' : 'accepting')}
                  className={`px-4 py-2 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    settings.mode === 'accepting'
                      ? 'bg-rose-500/15 border border-rose-500/30 text-rose-500 hover:bg-rose-500/25'
                      : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/25'
                  }`}
                >
                  <span>{settings.mode === 'accepting' ? 'Force Referral Mode' : 'Switch to Accepting'}</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset today s daily booking counter?')) {
                      onResetCounter();
                    }
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Counter</span>
                </button>
              </div>
            </div>

            {/* Platform Accounts Health Panel */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span>Partner Platform Accounts & API Health</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {accountsList.map((acc) => (
                  <div
                    key={acc.id}
                    className={`p-3.5 rounded-2xl border ${
                      theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs">{acc.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{acc.status}</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Latency: <strong className="text-slate-200">{acc.latency}</strong></span>
                      <span>{acc.balanceOrLimit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent Activity Monitor Table */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                <Bot className="w-3.5 h-3.5 text-amber-500" />
                <span>Agent Activity Monitor (Live Swarm State)</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b ${theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <th className="pb-2.5 font-bold uppercase tracking-wider">Agent</th>
                      <th className="pb-2.5 font-bold uppercase tracking-wider">Status</th>
                      <th className="pb-2.5 font-bold uppercase tracking-wider">Current Task</th>
                      <th className="pb-2.5 font-bold uppercase tracking-wider">Last Run</th>
                      <th className="pb-2.5 font-bold uppercase tracking-wider">Today Completed</th>
                      <th className="pb-2.5 font-bold uppercase tracking-wider">Errors</th>
                      <th className="pb-2.5 font-bold uppercase tracking-wider text-right">Controlled Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {agentsList.map((agent) => (
                      <tr key={agent.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 font-bold text-sm flex items-center space-x-2">
                          <Bot className="w-4 h-4 text-amber-500" />
                          <span>{agent.name}</span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            agent.status === 'Working' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                            agent.status === 'Waiting' ? 'bg-blue-500/20 text-blue-400' :
                            agent.status === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                            agent.status === 'Paused' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-slate-500/20 text-slate-300'
                          }`}>
                            {agent.status}
                          </span>
                        </td>
                        <td className="py-3 font-mono text-[11px] text-slate-300 max-w-xs truncate">
                          {agent.currentTask}
                        </td>
                        <td className="py-3 text-slate-400 text-[11px]">{agent.lastRun}</td>
                        <td className="py-3 font-bold text-emerald-400">{agent.completedToday}</td>
                        <td className="py-3">
                          <span className={`font-bold ${agent.errors > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                            {agent.errors}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleRunAgentTask(agent.id)}
                              className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                              title="Trigger manual task for this agent"
                            >
                              Run Task
                            </button>
                            <button
                              onClick={() => handleToggleAgent(agent.id)}
                              className={`px-2.5 py-1 font-semibold rounded-lg text-[11px] transition-colors cursor-pointer ${
                                agent.enabled
                                  ? 'bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
                                  : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                              }`}
                            >
                              {agent.enabled ? 'Pause' : 'Resume'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Visual LangGraph State Machine Schema */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4 flex items-center space-x-2">
              <Bot className="w-4 h-4" />
              <span>LangGraph Multi-Agent Architecture & State Machine</span>
            </h3>

            {/* Step diagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">AGENT 1</span>
                <span className="font-bold text-white block text-sm mb-1">Price Scout</span>
                <p className="text-slate-400 text-[11px]">
                  Scouts Pronto, UC InstaHelp & Snabbit live quotes & best SLA.
                </p>
              </div>

              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">AGENT 2</span>
                <span className="font-bold text-white block text-sm mb-1">Payment Watcher</span>
                <p className="text-slate-400 text-[11px]">
                  Detects UPI payment submissions and creates Pending Approval.
                </p>
              </div>

              <div className="bg-amber-950/60 p-3.5 rounded-xl border border-amber-500/50">
                <span className="text-[10px] font-bold text-amber-400 block mb-1">INTERRUPT</span>
                <span className="font-bold text-amber-300 block text-sm mb-1">Human Gate</span>
                <p className="text-amber-200/80 text-[11px]">
                  LangGraph interrupt: Human Admin must explicitly Approve or Reject.
                </p>
              </div>

              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">AGENT 3</span>
                <span className="font-bold text-white block text-sm mb-1">Booking Executor</span>
                <p className="text-slate-400 text-[11px]">
                  Controlled high-risk node: Dispatches partner platform order.
                </p>
              </div>

              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">AGENT 4</span>
                <span className="font-bold text-white block text-sm mb-1">Communication</span>
                <p className="text-slate-400 text-[11px]">
                  Dispatches WhatsApp & SMS notifications with live tracking links.
                </p>
              </div>

              <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">AGENT 5 & 6</span>
                <span className="font-bold text-white block text-sm mb-1">Cap & CEO</span>
                <p className="text-slate-400 text-[11px]">
                  Enforces 15 daily hard cap & auto-switches mode; CEO logs health.
                </p>
              </div>
            </div>
          </div>

          {/* Agent Activity Log Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Real-Time Multi-Agent Execution Stream & Telemetry
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {filteredLogs.length} / {agentLogs.length} Events
                </span>
              </div>

              {/* Master JSON Toggle */}
              <button
                type="button"
                onClick={handleToggleExpandAllLogs}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {Object.values(expandedLogIds).some(Boolean) ? 'Collapse All JSON' : 'Expand All JSON'}
                </span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              {/* Level Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setLogFilterLevel('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    logFilterLevel === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({agentLogs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLogFilterLevel('success')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                    logFilterLevel === 'success'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Success ({agentLogs.filter((l) => l.level === 'success').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogFilterLevel('info')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                    logFilterLevel === 'info'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                  <span>Info ({agentLogs.filter((l) => l.level === 'info').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogFilterLevel('warn')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                    logFilterLevel === 'warn' || logFilterLevel === 'warning'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Warning ({agentLogs.filter((l) => l.level === 'warn' || l.level === 'warning').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogFilterLevel('error')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                    logFilterLevel === 'error'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Error ({agentLogs.filter((l) => l.level === 'error').length})</span>
                </button>
              </div>

              {/* Log Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  placeholder="Filter logs or bookings..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Logs List */}
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                No agent logs match the current filter or search criteria.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredLogs.map((log) => {
                  const isExpanded = !!expandedLogIds[log.id];

                  // Agent color coding
                  const getAgentBadgeStyle = (name: string) => {
                    if (name.includes('Price Scout')) return 'bg-purple-100 text-purple-900 border-purple-300';
                    if (name.includes('Payment Watcher')) return 'bg-indigo-100 text-indigo-900 border-indigo-300';
                    if (name.includes('Booking Executor')) return 'bg-blue-100 text-blue-900 border-blue-300';
                    if (name.includes('Communication')) return 'bg-teal-100 text-teal-900 border-teal-300';
                    if (name.includes('Cap & Mode')) return 'bg-orange-100 text-orange-900 border-orange-300';
                    return 'bg-slate-200 text-slate-800 border-slate-300';
                  };

                  // Level color coding
                  const getLevelBadge = (level: string) => {
                    switch (level) {
                      case 'success':
                        return (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wide">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>SUCCESS</span>
                          </span>
                        );
                      case 'warn':
                      case 'warning':
                        return (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wide">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>WARNING</span>
                          </span>
                        );
                      case 'error':
                        return (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 uppercase tracking-wide">
                            <XCircle className="w-2.5 h-2.5" />
                            <span>ERROR</span>
                          </span>
                        );
                      default:
                        return (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 uppercase tracking-wide">
                            <Info className="w-2.5 h-2.5" />
                            <span>INFO</span>
                          </span>
                        );
                    }
                  };

                  return (
                    <div
                      key={log.id}
                      id={`log-row-${log.id}`}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isExpanded
                          ? 'bg-slate-50/90 border-slate-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* Status Badge */}
                          {getLevelBadge(log.level)}

                          {/* Agent Name Badge */}
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getAgentBadgeStyle(
                              log.agent_name
                            )}`}
                          >
                            {log.agent_name}
                          </span>

                          {/* Action Name */}
                          <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {log.action}
                          </span>

                          {/* Booking reference tag */}
                          {log.booking_id && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                              {log.booking_id}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-mono text-slate-400">
                            {log.timestamp}
                          </span>

                          {/* Expand/Collapse Toggle Button */}
                          <button
                            type="button"
                            onClick={() => toggleLogExpand(log.id)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer ${
                              isExpanded
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                            title="Toggle detailed JSON view"
                          >
                            <Code className="w-3 h-3" />
                            <span>{isExpanded ? 'Hide JSON' : 'View JSON'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Log Message Description */}
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {log.details}
                      </p>

                      {/* Detailed Log JSON Viewer (When expanded) */}
                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <div className="bg-slate-950 text-slate-100 rounded-xl p-3.5 border border-slate-800 shadow-inner">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                              <span className="flex items-center space-x-1 text-amber-400 font-bold">
                                <Terminal className="w-3 h-3" />
                                <span>LOG EVENT PAYLOAD • {log.id}</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyLogJson(log)}
                                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
                              >
                                {copiedLogId === log.id ? (
                                  <>
                                    <CheckCheck className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400 font-bold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy JSON</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-60 selection:bg-slate-700">
                              {JSON.stringify(
                                {
                                  id: log.id,
                                  timestamp: log.timestamp,
                                  agent_name: log.agent_name,
                                  action: log.action,
                                  level: log.level,
                                  booking_id: log.booking_id || null,
                                  details: log.details,
                                  langgraph_context: {
                                    node: log.agent_name
                                      .toLowerCase()
                                      .replace(/ agent/i, '')
                                      .replace(/ /g, '_'),
                                    execution_state:
                                      log.level === 'error' ? 'FAILED' : 'COMPLETED',
                                    engine: 'LangGraph StateGraph v0.2.1',
                                  },
                                },
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTION EXPORT ARTIFACTS */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Production Architecture & Code Artifacts
            </h3>
            <p className="text-xs text-slate-600 mb-6">
              These pre-generated files provide the exact production backend specifications outlined
              in the master prompt. You can copy them directly for external hosting on Supabase,
              Vercel, and Railway/Render.
            </p>

            {artifacts ? (
              <div className="space-y-6">
                {/* 1. Supabase SQL Schema */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      1. Supabase PostgreSQL Schema (schema.sql with RLS)
                    </span>
                    <button
                      onClick={() => handleCopyCode('schema', artifacts.supabase_sql_schema)}
                      className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
                    >
                      {copiedKey === 'schema' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy SQL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-64">
                    {artifacts.supabase_sql_schema}
                  </pre>
                </div>

                {/* 2. LangGraph Python Code */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      2. LangGraph StateGraph Python Service (agent_graph.py)
                    </span>
                    <button
                      onClick={() => handleCopyCode('python', artifacts.langgraph_python_code)}
                      className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
                    >
                      {copiedKey === 'python' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Python</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-64">
                    {artifacts.langgraph_python_code}
                  </pre>
                </div>

                {/* 3. Supabase Edge Functions */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      3. Supabase Edge Function (create-pending-approval & admin-approve-reject)
                    </span>
                    <button
                      onClick={() =>
                        handleCopyCode(
                          'edge',
                          artifacts.supabase_edge_functions['admin-approve-reject']
                        )
                      }
                      className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
                    >
                      {copiedKey === 'edge' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Edge Function</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-64">
                    {artifacts.supabase_edge_functions['admin-approve-reject']}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">Loading artifacts...</div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ALERTS & WHATSAPP NOTIFICATION CENTER */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Configuration Card */}
          <div className={`p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <h3 className="text-base font-bold mb-2 flex items-center space-x-2">
              <Phone className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp & Critical Alert Routing</span>
            </h3>
            <p className={`text-xs mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
              Configure WhatsApp destination numbers for urgent alerts (Booking execution failures, cap limits reached, payment verification errors).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={`block text-xs font-bold uppercase mb-1.5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Admin WhatsApp Number
                </label>
                <input
                  type="text"
                  value={whatsappInput}
                  onChange={(e) => setWhatsappInput(e.target.value)}
                  placeholder="+919876543210"
                  className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-mono border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center space-x-3 cursor-pointer min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-xs font-semibold">Enable WhatsApp Push Alerts</span>
                </label>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center space-x-3 cursor-pointer min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <input
                    type="checkbox"
                    checked={quietHours}
                    onChange={(e) => setQuietHours(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-xs font-semibold">Respect Quiet Hours (Bypassed for Critical)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveAlertConfig}
                disabled={isSavingAlerts}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center space-x-2 shadow-xs disabled:opacity-50"
              >
                {isSavingAlerts && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Alert Routing Preferences</span>
              </button>
            </div>
          </div>

          {/* Alerts Feed */}
          <div className={`p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>System Notification Center ({alerts.length})</span>
              </h3>
              <span className="text-xs text-slate-400">
                Unread: {alerts.filter(a => a.status === 'unread').length}
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No alerts logged. System is operating normally.
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      alert.priority === 'critical'
                        ? theme === 'dark' ? 'bg-rose-950/30 border-rose-800/60' : 'bg-rose-50 border-rose-200'
                        : alert.priority === 'important'
                        ? theme === 'dark' ? 'bg-amber-950/30 border-amber-800/60' : 'bg-amber-50 border-amber-200'
                        : theme === 'dark' ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        alert.priority === 'critical' ? 'bg-rose-500/20 text-rose-500' :
                        alert.priority === 'important' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {alert.priority === 'critical' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-bold text-xs sm:text-sm">{alert.title}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            alert.priority === 'critical' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200' :
                            alert.priority === 'important' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
                          }`}>
                            {alert.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                        alert.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                      }`}>
                        {alert.status.toUpperCase()}
                      </span>
                      {alert.status !== 'resolved' && (
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer active:scale-98"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: REFERRAL CARD & OFFLINE INTEGRATION GENERATOR */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* Header & Quick Intro */}
          <div className={`p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-amber-500" />
                  <span>Referral Card & Offline Integration Generator</span>
                </h3>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  Automated backend extraction service for referral promotions. Converts shorthand commands or raw promotional copy into standardized, production-ready JSON schemas.
                </p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Strict JSON Schema Engine v1.0
                </span>
              </div>
            </div>

            {/* Quick Template Presets */}
            <div className="mb-4">
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Quick Input Presets:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sample = '/add Blinkit | Grocery | BLINK100 | ₹100 off | https://blinkit.com/invite | /downloads/blinkit.apk';
                    setReferralInput(sample);
                    handleGenerateReferralCard(sample);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  ⚡ Preset 1: Shorthand with Local APK (Blinkit)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = '/add Swiggy | Food Delivery | SWIGGYNEW | Flat ₹120 OFF | https://swiggy.com/invite';
                    setReferralInput(sample);
                    handleGenerateReferralCard(sample);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  ⚡ Preset 2: Shorthand Web Service (Swiggy)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = '🎉 Special invite for Pronto Home Services! Use code *PRONTOFAST* and get flat ₹50 off on your first verified home cleaning or cooking service. Referrer gets ₹150 per successful referral: https://pronto.onelink.me/xj5m/iz6i2udv';
                    setReferralInput(sample);
                    handleGenerateReferralCard(sample);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  📝 Preset 3: Raw Marketing Copy (Pronto)
                </button>
              </div>
            </div>

            {/* Input Box */}
            <div className="space-y-3">
              <label className={`block text-xs font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                Promotional Text, Screenshot Transcription, or Shorthand Command
              </label>
              <textarea
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value)}
                rows={3}
                placeholder="/add [App Name] | [Category] | [Referral Code] | [User Discount] | [Invite URL] | [Optional: Local APK Path]"
                className={`w-full p-3.5 rounded-2xl text-xs sm:text-sm font-mono border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <p className={`text-[11px] ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  Input schema supports shorthand <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">/add ...</code> and raw unstructured referral campaigns.
                </p>
                <button
                  type="button"
                  onClick={() => handleGenerateReferralCard()}
                  disabled={isGeneratingCard || !referralInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isGeneratingCard ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>Generate JSON Schema</span>
                </button>
              </div>
            </div>
          </div>

          {/* Generated Schema & Validation Output */}
          {generatedReferralJson && (
            <div className={`p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Standardized JSON Output</h4>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Strict validation passed • Ready for directory insertion & offline synchronization
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(generatedReferralJson, null, 2));
                      setCopiedReferralJson(true);
                      setTimeout(() => setCopiedReferralJson(false), 2000);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    {copiedReferralJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReferralJson ? 'Copied JSON' : 'Copy JSON'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveReferralCardToDirectory}
                    disabled={isSavingCard}
                    className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer hover:opacity-90 disabled:opacity-50 shadow-xs"
                  >
                    {isSavingCard ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Publish to Live Directory</span>
                  </button>
                </div>
              </div>

              {/* JSON Display */}
              <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed max-h-72">
                {JSON.stringify(generatedReferralJson, null, 2)}
              </pre>

              {/* Offline Action Preview Card */}
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs">
                <span className="font-bold text-amber-600 block mb-1">Offline Behavior Configuration:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Action Type</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {generatedReferralJson.offlineConfig.offlineAction}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Local APK Path</span>
                    <span className="font-mono text-slate-900 dark:text-white">
                      {generatedReferralJson.offlineConfig.apkPath || 'None (Web/App Store Link)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Cached Description</span>
                    <span className="line-clamp-2 text-slate-900 dark:text-white">
                      {generatedReferralJson.offlineConfig.cachedDescription}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Current Live Referral Cards Directory */}
          <div className={`p-6 rounded-3xl border shadow-sm ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>Active Referral Promotions in Directory ({referralCardsList.length})</span>
                </h4>
                <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  Live cards rendered in customer-facing Referral Mode with offline synchronization support.
                </p>
              </div>
            </div>

            {referralCardsList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No referral cards configured yet. Use the generator above to parse and publish your first card.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {referralCardsList.map((card) => (
                  <div
                    key={card.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                      theme === 'dark' ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 font-mono">
                            {card.category}
                          </span>
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                            {card.appName}
                          </h5>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteReferralCard(card.id)}
                          title="Remove referral card"
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Code Pill */}
                      <div className="my-2.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {card.referralCode}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold truncate max-w-[140px]">
                          {card.benefits.userDiscount}
                        </span>
                      </div>

                      {/* Benefits & Offline Description */}
                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-3">
                        {card.benefits.referrerReward && (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400">
                            <strong>Earn:</strong> {card.benefits.referrerReward}
                          </p>
                        )}
                        <p className="text-[11px] line-clamp-2 leading-relaxed">
                          {card.offlineConfig.cachedDescription}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px]">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] ${
                        card.offlineConfig.offlineAction === 'download_apk'
                          ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        {card.offlineConfig.offlineAction === 'download_apk' ? '📦 Local APK' : '📋 Code & Queue'}
                      </span>

                      <a
                        href={card.inviteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-600 hover:underline flex items-center space-x-1 font-semibold"
                      >
                        <span>Invite Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJECTION & REFUND MODAL */}
      {rejectingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Reject Arrangement & Mark Refund
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Booking: <strong>{rejectingBooking.id}</strong> ({rejectingBooking.customer_name}) • ₹
              {rejectingBooking.payment_amount}
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Reason for Rejection</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="No partner helper available within 30 min window">
                    No partner helper available within 30 min window
                  </option>
                  <option value="Invalid or unverified UPI transaction reference">
                    Invalid or unverified UPI transaction reference
                  </option>
                  <option value="Location outside standard Delhi NCR partner coverage">
                    Location outside standard Delhi NCR partner coverage
                  </option>
                  <option value="Customer requested cancellation">
                    Customer requested cancellation
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Refund Status *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRefundStatus('initiated')}
                    className={`min-h-[44px] py-2.5 px-3 rounded-xl font-semibold border cursor-pointer active:scale-98 ${
                      refundStatus === 'initiated'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Refund Initiated
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefundStatus('completed')}
                    className={`min-h-[44px] py-2.5 px-3 rounded-xl font-semibold border cursor-pointer active:scale-98 ${
                      refundStatus === 'completed'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Refund Completed
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Refund UPI Reference</label>
                <input
                  type="text"
                  value={refundReference}
                  onChange={(e) => setRefundReference(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingBooking(null)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer active:scale-98"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer active:scale-98"
              >
                Confirm Rejection & Refund
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT REFUND UPDATE MODAL */}
      {updatingRefundBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Update Refund Details
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Booking: <strong>{updatingRefundBooking.id}</strong> ({updatingRefundBooking.customer_name}) • ₹
              {updatingRefundBooking.payment_amount}
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Refund Status *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pending', 'initiated', 'completed'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setUpdateRefundStatus(st)}
                      className={`min-h-[44px] py-2 px-2 text-center rounded-xl font-semibold capitalize border cursor-pointer active:scale-98 ${
                        updateRefundStatus === st
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Refund UPI / Bank Reference</label>
                <input
                  type="text"
                  value={updateRefundRef}
                  onChange={(e) => setUpdateRefundRef(e.target.value)}
                  placeholder="REF/UPI/..."
                  className="w-full min-h-[44px] p-2.5 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setUpdatingRefundBooking(null)}
                className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer active:scale-98"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingRefund}
                onClick={handleSaveRefundUpdate}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer active:scale-98"
              >
                {isUpdatingRefund ? 'Saving...' : 'Save Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
