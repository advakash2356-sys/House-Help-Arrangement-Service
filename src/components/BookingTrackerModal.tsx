import React, { useState, useEffect } from 'react';
import { X, Search, CheckCircle2, Clock, AlertCircle, RefreshCw, Bot, ShieldCheck, MapPin, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';

interface BookingTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBookingId?: string;
  language?: Language;
}

export const BookingTrackerModal: React.FC<BookingTrackerModalProps> = ({
  isOpen,
  onClose,
  initialBookingId,
  language = 'en',
}) => {
  const t = translations[language];
  const [searchQuery, setSearchQuery] = useState<string>(initialBookingId || '');
  const [foundBooking, setFoundBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && initialBookingId) {
      setSearchQuery(initialBookingId);
      performSearch(initialBookingId);
    }
  }, [isOpen, initialBookingId]);

  const performSearch = async (queryToSearch: string) => {
    const q = queryToSearch.trim();
    if (!q) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/bookings/track?query=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (res.ok && data.booking) {
        setFoundBooking(data.booking);
      } else {
        setFoundBooking(null);
      }
    } catch {
      setFoundBooking(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {t.trackerTitle}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500">
              {t.trackerSubtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="p-3 sm:p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.trackerInputPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 min-h-[44px] text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchQuery.trim()}
            className="min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors active:scale-98"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{t.trackerSearchBtn}</span>
          </button>
        </form>

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span>Checking live arrangement status...</span>
            </div>
          ) : foundBooking ? (
            <div>
              {/* Status Header */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm sm:text-base text-slate-900">{foundBooking.id}</span>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        foundBooking.status === 'booked'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : foundBooking.status === 'pending_approval'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300'
                      }`}
                    >
                      {foundBooking.status === 'booked'
                        ? t.trackerStatusBooked
                        : foundBooking.status === 'pending_approval'
                        ? t.trackerStatusPending
                        : t.trackerStatusRejected}
                    </span>
                  </div>
                  {foundBooking.payment_reference && (
                    <span className="text-xs text-slate-500 font-mono">
                      UTR: {foundBooking.payment_reference}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 text-xs pt-3 border-t border-slate-200">
                  <div className="p-2 rounded-lg bg-white/70 border border-slate-100 sm:border-0 sm:bg-transparent sm:p-0">
                    <span className="text-slate-400 block text-[11px]">Customer</span>
                    <span className="font-semibold text-slate-800">
                      {foundBooking.customer_name}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/70 border border-slate-100 sm:border-0 sm:bg-transparent sm:p-0">
                    <span className="text-slate-400 block text-[11px]">Assigned Platform</span>
                    <span className="font-semibold text-slate-800">
                      {foundBooking.suggested_platform}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/70 border border-slate-100 sm:border-0 sm:bg-transparent sm:p-0">
                    <span className="text-slate-400 block text-[11px]">Service</span>
                    <span className="font-semibold text-slate-900 capitalize">
                      {foundBooking.service_type}
                    </span>
                  </div>
                  {foundBooking.partner_booking_id && (
                    <div className="p-2 rounded-lg bg-white/70 border border-slate-100 sm:border-0 sm:bg-transparent sm:p-0">
                      <span className="text-slate-400 block text-[11px]">Partner Order Ref</span>
                      <span className="font-semibold text-emerald-700 font-mono">
                        {foundBooking.partner_booking_id}
                      </span>
                    </div>
                  )}
                  {foundBooking.eta_time && (
                    <div className="p-2 rounded-lg bg-white/70 border border-slate-100 sm:border-0 sm:bg-transparent sm:p-0">
                      <span className="text-slate-400 block text-[11px]">Estimated Arrival</span>
                      <span className="font-semibold text-slate-800">
                        {foundBooking.eta_time}
                      </span>
                    </div>
                  )}
                  {foundBooking.refund_status && (
                    <div className="p-2 rounded-lg bg-white/70 border border-slate-100 sm:border-0 sm:bg-transparent sm:p-0">
                      <span className="text-slate-400 block text-[11px]">Refund Status</span>
                      <span className="font-semibold text-amber-700 capitalize">
                        {foundBooking.refund_status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Multi-Agent Orchestration Timeline */}
              {foundBooking.timeline && foundBooking.timeline.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                    <Bot className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Agent Orchestration Timeline</span>
                  </h4>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {foundBooking.timeline.map((event: any, idx: number) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white" />
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className="font-bold text-slate-900">{event.title}</span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {event.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                        {event.agent && (
                          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {event.agent}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              {hasSearched ? (
                <>
                  <p className="font-semibold text-slate-700">{t.trackerNotFound}</p>
                  <p className="mt-1">Please verify your booking reference (e.g. BK-1001) or WhatsApp phone number.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-700">{t.trackerEmptyState}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-800 transition-colors cursor-pointer active:scale-98"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
