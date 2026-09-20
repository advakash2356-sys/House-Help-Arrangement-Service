import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Shield, Lock, Eye, EyeOff, CheckCircle2, ArrowRight, LogOut, Smartphone, Globe, Check, Loader2 } from 'lucide-react';
import { Language, AppMode } from '../types';
import { translations } from '../i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  activeMode: 'offline' | 'online';
  onSelectMode: (mode: 'offline' | 'online') => void;
  isAdminAuthenticated: boolean;
  onAdminLoginSuccess: () => void;
  onAdminLogout: () => void;
  onOpenAdminDashboard: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onToggleLanguage,
  activeMode,
  onSelectMode,
  isAdminAuthenticated,
  onAdminLoginSuccess,
  onAdminLogout,
  onOpenAdminDashboard,
}) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) return;

    setIsSubmitting(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      try {
        sessionStorage.setItem('sahayak_admin_auth', 'true');
      } catch {}

      setAdminPassword('');
      onAdminLoginSuccess();
    } catch (err: any) {
      setLoginError(err.message || 'Incorrect passkey. Access denied.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <SettingsIcon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {language === 'hi' ? 'सेटिंग्स और प्राथमिकताएं' : 'Settings & Preferences'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'एप्लिकेशन मोड और व्यवस्थापक विकल्प' : 'Application modes and operator options'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Section 1: Default Experience Mode */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              {language === 'hi' ? 'सक्रिय प्लेटफ़ॉर्म मोड' : 'Active Experience Mode'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSelectMode('offline')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  activeMode === 'offline'
                    ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-amber-600" />
                    {language === 'hi' ? 'ऑफलाइन मोड' : 'Offline Mode'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 font-mono">
                    DEFAULT
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {language === 'hi' 
                    ? 'डायरेक्ट रेफरल डायरेक्टरी, सत्यापित कूपन कोड एवं ऑफलाइन इंस्टालर।'
                    : 'Direct partner referral directory, verified promo codes & local APK downloads.'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectMode('online')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  activeMode === 'online'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    {language === 'hi' ? 'ऑनलाइन मोड' : 'Online Mode'}
                  </span>
                  {activeMode === 'online' && (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {language === 'hi'
                    ? 'सहायक कंसीयज, अग्रिम यूपीआई भुगतान एवं लाइव कोटेशन तुलना।'
                    : 'Live concierge arrangement, upfront booking & multi-platform quotes.'}
                </p>
              </button>
            </div>
          </div>

          {/* Section 2: Language Preference */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              {language === 'hi' ? 'भाषा चुनें (Language)' : 'Language Selection'}
            </label>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onToggleLanguage('en')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  language === 'en'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span>English</span>
                {language === 'en' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => onToggleLanguage('hi')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                  language === 'hi'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <span>हिन्दी (Hindi)</span>
                {language === 'hi' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>
          </div>

          {/* Section 3: Operator & Administrator Access (Discreetly tucked away) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {language === 'hi' ? 'ऑपरेटर एवं व्यवस्थापक नियंत्रण' : 'Operator & Admin Controls'}
                </span>
              </div>
              {isAdminAuthenticated && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Authenticated
                </span>
              )}
            </div>

            {isAdminAuthenticated ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {language === 'hi' ? 'एडमिन सत्र सक्रिय है' : 'Admin Session Active'}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {language === 'hi' ? 'आपको पूर्ण संचालन और डिस्पैच नियंत्रण प्राप्त है।' : 'You have full operations and capacity management access.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAdminDashboard();
                    }}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs active:scale-98"
                  >
                    <span>{language === 'hi' ? 'एडमिन डैशबोर्ड खोलें' : 'Open Admin Dashboard'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onAdminLogout();
                    }}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-98"
                    title="Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'लॉग आउट' : 'Log Out'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'hi' ? 'व्यवस्थापक पासकी (Admin Passkey)' : 'Authorized Operator Passkey'}
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="Enter passkey..."
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {loginError && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">
                      {loginError}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Default operator access: <code className="font-mono text-slate-600 font-bold">admin123</code>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !adminPassword.trim()}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs active:scale-98"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'hi' ? 'एडमिन लॉगिन करें' : 'Sign In as Operator'}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {language === 'hi' ? 'बंद करें' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
