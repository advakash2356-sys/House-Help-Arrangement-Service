import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  CheckCheck,
  QrCode,
  ArrowRight,
  User,
  Phone,
  MapPin,
  FileText,
  BadgeAlert,
  Loader2,
} from 'lucide-react';
import { PlatformQuote, BookingRecord, SystemSettings, Language } from '../types';
import { ToastMessage, playNotificationChime } from './Toast';
import { translations } from '../i18n';

interface AcceptingModeViewProps {
  settings: SystemSettings;
  language: Language;
  onBookingCreated: (booking: BookingRecord) => void;
  openTracker: (bookingId?: string) => void;
  onTriggerToast?: (toast: Omit<ToastMessage, 'id'>) => void;
  onSwitchToOffline?: () => void;
}

export const AcceptingModeView: React.FC<AcceptingModeViewProps> = ({
  settings,
  language,
  onBookingCreated,
  openTracker,
  onTriggerToast,
  onSwitchToOffline,
}) => {
  const t = translations[language];

  const [selectedService, setSelectedService] = useState<string>('utensils');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [ncrAreas, setNcrAreas] = useState<string[]>([
    'Gurgaon DLF Phase 1-5 & Cyber City',
    'Gurgaon Golf Course Road & Sector 42-56',
    'Gurgaon Sohna Road & Southern Peripheral Road',
    'South Delhi (GK, Saket, Vasant Kunj, Hauz Khas)',
    'Noida Sector 18, 62 & Expressway',
    'Dwarka Sectors 1-23',
    'Indirapuram & Ghaziabad',
    'Faridabad Sector 15-37'
  ]);
  const [quotes, setQuotes] = useState<PlatformQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<PlatformQuote | null>(null);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState<boolean>(false);
  const [areaMessage, setAreaMessage] = useState<string | null>(null);

  // Form Fields - Strictly Real, No Fake Placeholders
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [acknowledgedDisclosure, setAcknowledgedDisclosure] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBooking, setSuccessBooking] = useState<BookingRecord | null>(null);

  const services = [
    {
      id: 'utensils',
      name: t.serviceUtensilsName,
      duration: '30-45 mins',
      desc: t.serviceUtensilsDesc,
    },
    {
      id: 'cooking',
      name: t.serviceCookingName,
      duration: '45-60 mins',
      desc: t.serviceCookingDesc,
    },
    {
      id: 'mopping',
      name: t.serviceMoppingName,
      duration: '35-50 mins',
      desc: t.serviceMoppingDesc,
    },
    {
      id: 'bathroom',
      name: t.serviceBathroomName,
      duration: '30-40 mins',
      desc: t.serviceBathroomDesc,
    },
    {
      id: 'allrounder',
      name: t.serviceAllrounderName,
      duration: '120 mins',
      desc: t.serviceAllrounderDesc,
    },
  ];

  // Fetch NCR areas on mount
  useEffect(() => {
    fetch('/api/areas')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setNcrAreas(data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch Quotes when service or area changes
  useEffect(() => {
    if (!selectedArea) {
      setQuotes([]);
      setSelectedQuote(null);
      setAreaMessage(t.selectAreaPrompt);
      return;
    }
    fetchQuotes(selectedService, selectedArea);
  }, [selectedService, selectedArea]);

  const fetchQuotes = async (serviceId: string, area: string) => {
    if (!area) return;
    setIsLoadingQuotes(true);
    setAreaMessage(null);
    try {
      const res = await fetch(`/api/price-scout?service=${serviceId}&area=${encodeURIComponent(area)}`);
      const data = await res.json();
      if (data.available && data.allQuotes) {
        setQuotes(data.allQuotes);
        setSelectedQuote(data.bestQuote || data.allQuotes[0]);
        setAreaMessage(null);
      } else {
        setQuotes([]);
        setSelectedQuote(null);
        setAreaMessage(data.message || t.noRatesAvailable);
      }
    } catch (err) {
      console.error('Error fetching quotes:', err);
      setAreaMessage(t.noRatesAvailable);
    } finally {
      setIsLoadingQuotes(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(settings.upi_id);
    setCopiedUpi(true);

    // Haptic feedback for mobile devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([40, 30, 40]);
      } catch {
        // Vibration not supported or blocked
      }
    }

    // Audio chime feedback
    playNotificationChime('success');

    // Trigger toast notification
    if (onTriggerToast) {
      onTriggerToast({
        type: 'success',
        title: language === 'hi' ? 'यूपीआई आईडी कॉपी हो गई!' : 'UPI ID Copied to Clipboard!',
        message:
          language === 'hi'
            ? `${settings.upi_id} कॉपी हो चुकी है। अपने यूपीआई ऐप (GPay, PhonePe, Paytm, BHIM) में पेस्ट करके भुगतान करें।`
            : `${settings.upi_id} has been copied. Open your UPI app (GPay, PhonePe, Paytm, BHIM) and paste to transfer.`,
        duration: 4000,
      });
    }

    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setErrorMessage(t.fillAllFieldsError);
      return;
    }

    if (customerPhone.replace(/\D/g, '').length < 10) {
      setErrorMessage(t.invalidPhoneError);
      return;
    }

    if (!paymentReference.trim()) {
      setErrorMessage(t.invalidUtrError);
      return;
    }

    if (!acknowledgedDisclosure) {
      setErrorMessage(t.mustAcknowledgeDisclosure);
      return;
    }

    if (!selectedQuote) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          customer_address: customerAddress.trim(),
          preferred_time: preferredTime.trim(),
          service_id: selectedQuote.service_name,
          platform: selectedQuote.platform,
          base_price: selectedQuote.base_price,
          convenience_fee: selectedQuote.convenience_fee,
          payment_amount: selectedQuote.total_price,
          payment_reference: paymentReference.trim(),
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create booking arrangement.');
      }

      setSuccessBooking(data.booking);
      onBookingCreated(data.booking);
      // Reset form
      setPaymentReference('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating arrangement request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      {/* Service Intro Banner */}
      <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{t.bannerBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {t.bannerTitle}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm sm:text-base leading-relaxed">
            {t.bannerDesc}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="font-semibold text-amber-300 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{t.serviceAreas}</span>
            </div>
            {onSwitchToOffline && (
              <button
                type="button"
                onClick={onSwitchToOffline}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <span>{language === 'hi' ? '← ऑफलाइन डायरेक्टरी और रेफरल मोड' : '← Prefer Offline Direct Codes & Directory?'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Booking Created Modal or Alert */}
      {successBooking && (
        <div className="mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800 shadow-sm animate-in fade-in">
          <div className="flex items-start space-x-3.5 sm:space-x-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 break-words">
                  {t.requestReceivedTitle} (ID: {successBooking.id})
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 w-fit shrink-0">
                  {t.statusPendingApproval}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {t.requestReceivedDesc}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <button
                  id="track-booking-btn"
                  onClick={() => openTracker(successBooking.id)}
                  className="min-h-[44px] px-5 py-2.5 bg-slate-900 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-xs active:scale-98"
                >
                  <span>{t.trackBookingBtn}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  id="new-request-btn"
                  onClick={() => setSuccessBooking(null)}
                  className="min-h-[44px] px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center active:scale-98"
                >
                  {t.newRequestBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Select Area in Delhi NCR */}
      <div className="mb-6 sm:mb-8 bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
            1
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{t.step1AreaLabel}</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 mb-3">
          {language === 'hi' ? 'लाइव दरें जांचने के लिए अपना क्षेत्र चुनें।' : 'Select your locality or sector to check real-time availability and transparent partner rates.'}
        </p>
        <div className="relative">
          <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            id="select-ncr-area"
            value={selectedArea}
            onChange={(e) => {
              setSelectedArea(e.target.value);
              setCustomerAddress(e.target.value);
            }}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors cursor-pointer"
          >
            <option value="">{t.chooseAreaPlaceholder}</option>
            {ncrAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Step 2: Select Service */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center space-x-2 mb-3">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
            2
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">{t.chooseService}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {services.map((svc) => (
            <button
              key={svc.id}
              id={`service-card-${svc.id}`}
              onClick={() => setSelectedService(svc.id)}
              className={`p-4 sm:p-5 rounded-2xl text-left transition-all border cursor-pointer min-h-[44px] active:scale-[0.99] ${
                selectedService === svc.id
                  ? 'bg-amber-50/70 border-amber-500 shadow-sm ring-2 ring-amber-400/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between mb-1.5 gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-900">{svc.name}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 shrink-0">
                  {svc.duration}
                </span>
              </div>
              <p className="text-xs sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">{svc.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Price Scout Agent Live Evaluation */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t.step2Title}
            </h2>
          </div>
          <span className="text-xs text-slate-500 flex items-center space-x-1 pl-8 sm:pl-0">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{t.step2Desc}</span>
          </span>
        </div>

        {!selectedArea ? (
          <div className="p-8 bg-amber-50/70 rounded-2xl border-2 border-dashed border-amber-300 text-center text-xs sm:text-sm text-amber-900 font-medium">
            <MapPin className="w-6 h-6 mx-auto mb-2 text-amber-600 animate-bounce" />
            {t.selectAreaPrompt}
          </div>
        ) : isLoadingQuotes ? (
          <div className="p-8 bg-white rounded-2xl border border-slate-200 flex items-center justify-center space-x-3 text-xs sm:text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            <span>{t.fetchingLiveRates}</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {quotes.map((quote) => {
              const isSelected = selectedQuote?.id === quote.id;
              return (
                <div
                  key={quote.id}
                  id={`quote-card-${quote.id}`}
                  onClick={() => setSelectedQuote(quote)}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between active:scale-[0.99] ${
                    isSelected
                      ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900/15'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm sm:text-base text-slate-900">{quote.platform}</span>
                      {quote.is_cheapest && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {t.lowestPriceBadge}
                        </span>
                      )}
                      {quote.is_fastest && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          {t.fastestBadge}
                        </span>
                      )}
                    </div>

                    <div className="my-2">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                          ₹{quote.total_price}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">{t.totalAmountDue}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 space-y-0.5 mt-1.5">
                        <div className="flex justify-between">
                          <span>{t.partnerBasePrice}:</span>
                          <span className="font-medium text-slate-700">₹{quote.base_price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.convenienceFee}:</span>
                          <span className="font-medium text-slate-700">
                            +₹{quote.convenience_fee}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <p className="flex items-center space-x-1 font-medium text-slate-800">
                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{t.etaLabel}: ~{quote.eta_minutes} mins</span>
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{quote.notes}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2">
                    <span
                      className={`block w-full min-h-[40px] sm:min-h-[36px] py-2 text-center text-xs font-semibold rounded-xl transition-colors flex items-center justify-center ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? t.selectedOption : t.selectOption}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 3: MANDATORY LEGAL DISCLOSURE (VERBATIM ONLY IN ACCEPTING MODE) */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-start space-x-3 mb-3">
            <BadgeAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide">
                {t.legalDisclosureTitle}
              </h3>
              <p className="text-xs text-amber-900 font-medium">
                {t.legalDisclosureSubtitle}
              </p>
            </div>
          </div>

          {/* Exact Verbatim Text as mandated */}
          <div className="bg-white/90 rounded-xl p-3.5 sm:p-4 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line select-text">
            {t.legalDisclosureBody}
          </div>

          {/* Touch-Friendly Checkbox Container */}
          <label className="flex items-start sm:items-center space-x-3 mt-4 p-3 rounded-xl bg-amber-100/60 border border-amber-300/80 cursor-pointer min-h-[44px] active:bg-amber-100 transition-colors">
            <input
              type="checkbox"
              id="disclosure-checkbox"
              checked={acknowledgedDisclosure}
              onChange={(e) => setAcknowledgedDisclosure(e.target.checked)}
              className="w-5 h-5 mt-0.5 sm:mt-0 rounded border-amber-400 text-slate-900 focus:ring-slate-900 cursor-pointer shrink-0"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
              {t.legalDisclosureAcknowledge}
            </span>
          </label>
        </div>
      </div>

      {/* Step 4: Advance UPI Payment & Booking Request Form */}
      {selectedQuote && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm">
          <div className="flex items-center space-x-2 mb-5 sm:mb-6">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t.step3Title}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Left: Static UPI Payment Panel */}
            <div className="lg:col-span-5 bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {t.scanAndPayUpi}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    UPI Instant
                  </span>
                </div>

                {/* QR Code representation */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center justify-center mb-4">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 bg-slate-900 rounded-xl p-2 flex items-center justify-center text-white relative shadow-xs">
                    <div className="w-full h-full border-2 sm:border-4 border-dashed border-amber-400/40 rounded-lg flex flex-col items-center justify-center text-center p-2">
                      <QrCode className="w-20 h-20 sm:w-28 sm:h-28 text-white" />
                      <span className="text-xs sm:text-sm font-mono font-bold tracking-wider text-amber-300 mt-1">
                        ₹{selectedQuote.total_price}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-600 mt-2.5 font-medium text-center">
                    GPay • PhonePe • Paytm • BHIM
                  </span>
                </div>

                {/* UPI Details Card with explicit 'Copy UPI ID' button */}
                <div className="space-y-2.5 text-xs">
                  <div
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 gap-2 ${
                      copiedUpi
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-4 ring-emerald-400/30'
                        : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                        {t.officialUpiId}
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm tracking-tight select-all truncate block">
                        {settings.upi_id}
                      </span>
                    </div>

                    <button
                      id="copy-upi-id-button-inline"
                      type="button"
                      onClick={handleCopyUpi}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0 active:scale-95 ${
                        copiedUpi
                          ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 animate-pulse'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                      title={t.copyUpiBtn}
                    >
                      {copiedUpi ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-white" />
                          <span>{t.copiedUpiBtn}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t.copyUpiBtn}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 block">{t.beneficiaryName}</span>
                      <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                        {settings.upi_payee_name}
                      </span>
                    </div>
                  </div>

                  {/* Dedicated Action Button */}
                  <button
                    id="copy-upi-id-action-btn"
                    type="button"
                    onClick={handleCopyUpi}
                    className={`w-full min-h-[44px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 border cursor-pointer active:scale-98 shadow-xs ${
                      copiedUpi
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 ring-4 ring-emerald-400/40 animate-pulse'
                        : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900'
                    }`}
                  >
                    {copiedUpi ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-white" />
                        <span>{t.copiedUpiBtn} ({settings.upi_id})</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-amber-400" />
                        <span>{t.copyUpiBtn} ({settings.upi_id})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Amount Breakdown Summary */}
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs sm:text-sm">
                <div className="flex justify-between text-slate-600 mb-1.5">
                  <span>{t.selectedOption}:</span>
                  <span className="font-bold text-slate-900">{selectedQuote.platform}</span>
                </div>
                <div className="flex justify-between text-slate-600 mb-1.5">
                  <span>{t.partnerBasePrice}:</span>
                  <span>₹{selectedQuote.base_price}</span>
                </div>
                <div className="flex justify-between text-slate-600 mb-2">
                  <span>{t.convenienceFee}:</span>
                  <span>₹{selectedQuote.convenience_fee}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>{t.totalAmountDue}:</span>
                  <span className="text-amber-600">₹{selectedQuote.total_price}</span>
                </div>
              </div>
            </div>

            {/* Right: Submission Form - Clean, No Fake Placeholders */}
            <form onSubmit={handleSubmitBooking} className="lg:col-span-7 space-y-4">
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label htmlFor="input-customer-name" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  {t.fullNameLabel}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    id="input-customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t.fullNamePlaceholder}
                    autoComplete="name"
                    className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 min-h-[44px] text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="input-customer-phone" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    inputMode="tel"
                    id="input-customer-phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    autoComplete="tel"
                    className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 min-h-[44px] text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {t.phoneHelp}
                </span>
              </div>

              <div>
                <label htmlFor="input-customer-address" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  {t.localityLabel}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <textarea
                    rows={2}
                    id="input-customer-address"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder={t.localityPlaceholder}
                    autoComplete="street-address"
                    className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 min-h-[64px] text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="input-preferred-time" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  {t.preferredTimeLabel}
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    id="input-preferred-time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    placeholder={t.preferredTimePlaceholder}
                    className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 min-h-[44px] text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="input-payment-ref" className="block text-xs sm:text-sm font-bold text-slate-900 mb-1.5">
                  {t.paymentRefLabel}
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    id="input-payment-ref"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder={t.paymentRefPlaceholder}
                    className="w-full pl-10 pr-3.5 py-3 sm:py-2.5 min-h-[44px] text-sm border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    required
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {t.paymentRefHelp}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="submit-booking-btn"
                disabled={isSubmitting || !acknowledgedDisclosure}
                className={`w-full min-h-[48px] py-3.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-98 cursor-pointer ${
                  acknowledgedDisclosure && !isSubmitting
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.submittingPaymentBtn}</span>
                  </>
                ) : (
                  <>
                    <span>{t.submitPaymentBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center leading-relaxed">
                {t.pendingApprovalNotice}
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
