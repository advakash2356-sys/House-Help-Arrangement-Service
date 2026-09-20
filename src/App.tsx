import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { AcceptingModeView } from './components/AcceptingModeView';
import { ReferralModeView } from './components/ReferralModeView';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginView } from './components/AdminLoginView';
import { BookingTrackerModal } from './components/BookingTrackerModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastMessage, playNotificationChime } from './components/Toast';
import { SystemSettings, BookingRecord, AgentLog, Language } from './types';
import { ShieldCheck, MapPin, Sparkles, UserCheck } from 'lucide-react';
import { useAdminCapacityAlert } from './hooks/useAdminCapacityAlert';
import { translations } from './i18n';

export default function App() {
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');
  // Always default user experience to Offline Mode (direct referral directory, verified promo codes, offline APKs)
  const [activeMode, setActiveMode] = useState<'offline' | 'online'>('offline');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sahayak_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('sahayak_lang');
      if (saved === 'hi' || saved === 'en') return saved;
    } catch {
      // fallback
    }
    return 'en';
  });

  const handleToggleLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('sahayak_lang', lang);
    } catch {
      // ignore
    }
  };

  const t = translations[language];

  const [settings, setSettings] = useState<SystemSettings>({
    id: 'global-settings',
    mode: 'referral',
    daily_count: 0,
    max_daily_limit: 15,
    last_reset: new Date().toISOString(),
    upi_id: '',
    upi_payee_name: '',
    convenience_fee: 49,
    is_admin_override: false,
    admin_email: 'adv.akash2356@gmail.com',
  });

  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [isTrackerOpen, setIsTrackerOpen] = useState<boolean>(false);
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | undefined>(undefined);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const knownBookingIdsRef = useRef<Set<string>>(new Set());
  const previousCountRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastMessage = { ...toast, id };

    // Play appropriate sound chime based on toast category
    if (toast.type === 'new_booking') {
      playNotificationChime('booking');
    } else if (toast.type === 'capacity_alert') {
      playNotificationChime('alert');
    } else if (toast.type === 'error') {
      playNotificationChime('error');
    } else if (toast.type === 'success') {
      playNotificationChime('success');
    } else {
      playNotificationChime('info');
    }

    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Dedicated Hook: Pushes high-priority toast alerts & audio/haptics when 15-booking threshold is reached (Only for active admins)
  useAdminCapacityAlert({
    dailyCount: settings.daily_count,
    maxLimit: settings.max_daily_limit,
    addToast,
    enabled: isAdminAuthenticated,
    onNavigateToAdmin: () => {
      setCurrentView('admin');
      window.location.hash = 'admin';
    },
  });

  // Initial fetch and check route hash
  useEffect(() => {
    if (window.location.hash === '#admin' || window.location.pathname.includes('/admin')) {
      setCurrentView('admin');
    }
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 5000); // Polling for real-time updates
    return () => clearInterval(interval);
  }, [isAdminAuthenticated]);

  const loadData = async (forceAdminAuth?: boolean) => {
    try {
      const isAuthed = forceAdminAuth ?? isAdminAuthenticated;
      const settingsRes = await fetch('/api/settings');
      if (settingsRes.ok) {
        const newSettings = await settingsRes.json();
        setSettings(newSettings);

        // Check for 15-booking hard cap threshold reached (strictly for authenticated admins, never prompt regular users)
        if (isAuthed && !isInitialLoadRef.current && newSettings) {
          if (
            newSettings.daily_count >= 15 &&
            (previousCountRef.current === null || previousCountRef.current < 15)
          ) {
            addToast({
              type: 'capacity_alert',
              title: '⚠️ Daily Hard Cap Reached (15/15)!',
              message:
                'Daily limit of 15 bookings reached. System has automatically transitioned to clean Referral Mode to prevent unfulfillable orders.',
              actionLabel: 'Open Admin Dashboard',
              onAction: () => {
                setCurrentView('admin');
                window.location.hash = 'admin';
              },
              duration: 10000,
            });
          }
        }
        previousCountRef.current = newSettings.daily_count;
      }

      // STRICT ZERO-LEAK SECURITY: Only fetch booking details and agent logs if admin is authenticated
      if (isAuthed) {
        const [bookingsRes, logsRes] = await Promise.all([
          fetch('/api/bookings/all'),
          fetch('/api/agents/logs'),
        ]);

        let newBookings: BookingRecord[] | null = null;
        if (bookingsRes.ok) {
          newBookings = await bookingsRes.json();
          setBookings(newBookings!);
        }
        if (logsRes.ok) {
          const l = await logsRes.json();
          setAgentLogs(l);
        }

        // Check for incoming new bookings and notify admins in Admin view
        if (newBookings && !isInitialLoadRef.current) {
          newBookings.forEach((b) => {
            if (!knownBookingIdsRef.current.has(b.id)) {
              addToast({
                type: 'new_booking',
                title: `New Booking Submitted! (${b.id})`,
                message: `${b.customer_name} paid ₹${b.payment_amount} for ${b.service_type}. Awaiting admin authorization.`,
                actionLabel: 'Review in Admin',
                onAction: () => {
                  setCurrentView('admin');
                  window.location.hash = 'admin';
                },
                duration: 8000,
              });
            }
          });
        }

        if (newBookings) {
          knownBookingIdsRef.current = new Set(newBookings.map((b) => b.id));
        }
      }

      isInitialLoadRef.current = false;
    } catch (err) {
      console.error('Failed to sync server state:', err);
    }
  };

  const handleUpdateUpiSettings = async (upiId: string, payeeName?: string, fee?: number) => {
    const res = await fetch('/api/settings/upi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        upi_id: upiId,
        upi_payee_name: payeeName,
        convenience_fee: fee,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update UPI settings');
    if (data.settings) {
      setSettings(data.settings);
    }
    loadData();
  };

  const handleAdminLoginSuccess = () => {
    try {
      sessionStorage.setItem('sahayak_admin_auth', 'true');
    } catch {}
    setIsAdminAuthenticated(true);
    loadData(true);
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('sahayak_admin_auth');
    } catch {}
    setIsAdminAuthenticated(false);
    setBookings([]);
    setAgentLogs([]);
    setCurrentView('customer');
    window.location.hash = '';
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have exited the Admin Dashboard.',
      duration: 3000,
    });
  };

  const handleToggleMode = async () => {
    try {
      const res = await fetch('/api/settings/toggle', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetCounter = async () => {
    try {
      const res = await fetch('/api/settings/reset-counter', { method: 'POST' });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSetCount = async (count: number) => {
    try {
      const res = await fetch('/api/settings/set-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        if (count >= 15) {
          addToast({
            type: 'capacity_alert',
            title: '⚠️ Daily Hard Cap Reached (15/15)!',
            message:
              'Daily limit of 15 bookings reached. System has automatically transitioned to clean Referral Mode to prevent unfulfillable orders.',
            actionLabel: 'View Admin Dashboard',
            onAction: () => {
              setCurrentView('admin');
              window.location.hash = 'admin';
            },
            duration: 10000,
          });
        }
      }
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveBooking = async (id: string, notes?: string) => {
    const res = await fetch(`/api/bookings/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to approve booking');
    }
    await loadData();
  };

  const handleRejectBooking = async (
    id: string,
    notes: string,
    refundStatus: 'pending' | 'initiated' | 'completed',
    refundRef: string
  ) => {
    const res = await fetch(`/api/bookings/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes, refund_status: refundStatus, refund_reference: refundRef }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to reject booking');
    }
    await loadData();
  };

  const handleUpdateBookingNotes = async (id: string, notes: string) => {
    // Optimistically update local state immediately
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, notes, admin_notes: notes } : b))
    );

    try {
      const res = await fetch(`/api/bookings/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Notes Saved',
          message: `Internal notes updated for booking ${id}`,
          duration: 3000,
        });
      }
    } catch {
      // Local state is already updated
    }
  };

  const handleUpdateAdminEmail = async (email: string) => {
    const res = await fetch('/api/settings/admin-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update admin email');
    }
    const data = await res.json();
    if (data.settings) {
      setSettings(data.settings);
      addToast({
        type: 'success',
        title: 'Admin Email Updated',
        message: `HITL notifications & operational alerts now directed to ${email}`,
        duration: 5000,
      });
    }
    await loadData();
  };

  const handleUpdateRefund = async (
    id: string,
    refundStatus: 'pending' | 'initiated' | 'completed',
    refundRef: string
  ) => {
    const res = await fetch(`/api/bookings/${id}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refund_status: refundStatus, refund_reference: refundRef }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to update refund');
    }
    await loadData();
  };

  const handleOpenTracker = (id?: string) => {
    setSelectedTrackingId(id);
    setIsTrackerOpen(true);
  };

  const pendingCount = bookings.filter((b) => b.status === 'pending_approval').length;

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-200">
      {/* Navigation Header */}
      <Navbar
        mode={settings.mode}
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.location.hash = view === 'admin' ? 'admin' : '';
        }}
        isAdminAuthenticated={isAdminAuthenticated}
        onLogout={handleAdminLogout}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onOpenTracker={() => handleOpenTracker()}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeMode={activeMode}
        onSelectMode={setActiveMode}
      />

      {/* Main Container */}
      <main className="flex-1">
        {currentView === 'admin' ? (
          !isAdminAuthenticated ? (
            <AdminLoginView
              language={language}
              onLoginSuccess={handleAdminLoginSuccess}
              onBackToCustomer={() => {
                setCurrentView('customer');
                window.location.hash = '';
              }}
            />
          ) : (
            <AdminDashboard
              settings={settings}
              bookings={bookings}
              agentLogs={agentLogs}
              onToggleMode={handleToggleMode}
              onResetCounter={handleResetCounter}
              onSetCount={handleSetCount}
              onApproveBooking={handleApproveBooking}
              onRejectBooking={handleRejectBooking}
              onUpdateRefund={handleUpdateRefund}
              onUpdateAdminEmail={handleUpdateAdminEmail}
              onUpdateUpiSettings={handleUpdateUpiSettings}
              onUpdateBookingNotes={handleUpdateBookingNotes}
              onTriggerToast={addToast}
              onLogout={handleAdminLogout}
            />
          )
        ) : activeMode === 'offline' ? (
          <ReferralModeView
            language={language}
            onSwitchToOnline={() => setActiveMode('online')}
          />
        ) : (
          <AcceptingModeView
            settings={settings}
            language={language}
            onBookingCreated={(newBooking) => {
              addToast({
                type: 'new_booking',
                title:
                  language === 'hi'
                    ? `नई बुकिंग प्राप्त! (${newBooking.id})`
                    : `New Booking Submitted! (${newBooking.id})`,
                message:
                  language === 'hi'
                    ? `${newBooking.customer_name} ने ₹${newBooking.payment_amount} का भुगतान किया। व्यवस्था विवरण प्रेषित किए जा रहे हैं।`
                    : `${newBooking.customer_name} paid ₹${newBooking.payment_amount} for ${newBooking.service_type}. Order reference: ${newBooking.id}`,
                actionLabel: isAdminAuthenticated
                  ? language === 'hi'
                    ? 'एडमिन में देखें'
                    : 'Review in Admin'
                  : undefined,
                onAction: isAdminAuthenticated
                  ? () => {
                      setCurrentView('admin');
                      window.location.hash = 'admin';
                    }
                  : undefined,
                duration: 9000,
              });
              if (isAdminAuthenticated) {
                setBookings((prev) => [newBooking, ...prev]);
                loadData();
              }
            }}
            openTracker={handleOpenTracker}
            onTriggerToast={addToast}
            onSwitchToOffline={() => setActiveMode('offline')}
          />
        )}
      </main>

      {/* Global Toast Notification System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Persistent Customer Arrangement Tracker Float (Only in Customer view) */}
      {currentView === 'customer' && (
        <div className="fixed bottom-4 right-4 z-30">
          <button
            onClick={() => handleOpenTracker()}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center space-x-2 transition-all hover:scale-102 border border-slate-700 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{t.trackStatusBtn}</span>
          </button>
        </div>
      )}

      {/* Global Booking Tracker Modal */}
      <BookingTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        initialBookingId={selectedTrackingId}
        language={language}
      />

      {/* Settings & Operator Access Modal (Admin hidden here without intrusive prompts) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        isAdminAuthenticated={isAdminAuthenticated}
        onAdminLoginSuccess={() => {
          handleAdminLoginSuccess();
          addToast({
            type: 'success',
            title: language === 'hi' ? 'सत्यापन सफल' : 'Operator Access Granted',
            message: language === 'hi' ? 'व्यवस्थापक सत्र सक्रिय है।' : 'Authenticated as operations supervisor.',
            duration: 4000,
          });
        }}
        onAdminLogout={handleAdminLogout}
        onOpenAdminDashboard={() => {
          setCurrentView('admin');
          window.location.hash = 'admin';
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">Sahayak Express</span>
            <span>•</span>
            <span>Independent House-Help Comparison & Arrangement Platform</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => {
                if (currentView === 'admin') {
                  setCurrentView('customer');
                  window.location.hash = '';
                } else {
                  setIsSettingsOpen(true);
                }
              }}
              className="hover:text-slate-900 flex items-center space-x-1 underline font-medium cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>
                {currentView === 'admin'
                  ? t.customerView
                  : (language === 'hi' ? 'सेटिंग्स एवं व्यवस्थापक' : 'Settings & Operator')}
              </span>
            </button>
            <span>Delhi NCR (Gurgaon • Noida • South Delhi)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
