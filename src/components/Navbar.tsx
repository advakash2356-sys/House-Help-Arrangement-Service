import React from 'react';
import { Sparkles, MapPin, Settings as SettingsIcon, LogOut, ArrowLeft, Search, Smartphone, Globe } from 'lucide-react';
import { AppMode, Language } from '../types';
import { translations } from '../i18n';

interface NavbarProps {
  mode: AppMode;
  currentView: 'customer' | 'admin';
  setCurrentView: (view: 'customer' | 'admin') => void;
  isAdminAuthenticated: boolean;
  onLogout: () => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onOpenTracker?: () => void;
  onOpenSettings?: () => void;
  activeMode?: 'offline' | 'online';
  onSelectMode?: (mode: 'offline' | 'online') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  mode,
  currentView,
  setCurrentView,
  isAdminAuthenticated,
  onLogout,
  language,
  onToggleLanguage,
  onOpenTracker,
  onOpenSettings,
  activeMode = 'offline',
  onSelectMode,
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight truncate">
                {t.brandName}
              </span>
              <span className="hidden sm:inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                <MapPin className="w-3 h-3 mr-1 text-amber-600" />
                Delhi NCR
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden md:block truncate">
              {currentView === 'admin'
                ? t.adminSubtitle
                : activeMode === 'offline'
                ? (language === 'hi' ? 'ऑफलाइन डायरेक्टरी • सत्यापित रेफरल कोड' : 'Offline Directory • Verified Referral Deals')
                : t.brandTagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Customer View Mode Toggle (Offline vs Online) */}
          {currentView === 'customer' && onSelectMode && (
            <div className="flex items-center p-0.5 sm:p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => onSelectMode('offline')}
                className={`min-h-[38px] sm:min-h-[32px] px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  activeMode === 'offline'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Direct Referral Codes & Offline Local APKs (Default)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Offline</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectMode('online')}
                className={`min-h-[38px] sm:min-h-[32px] px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                  activeMode === 'online'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Sahayak Online Concierge & Arranger"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Online</span>
              </button>
            </div>
          )}

          {/* Language Switcher: EN | हिं */}
          <div className="flex items-center p-0.5 sm:p-1 bg-slate-100 rounded-xl border border-slate-200" title={t.languageLabel}>
            <button
              id="lang-en-toggle"
              type="button"
              onClick={() => onToggleLanguage('en')}
              className={`min-h-[38px] sm:min-h-[32px] px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                language === 'en'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              id="lang-hi-toggle"
              type="button"
              onClick={() => onToggleLanguage('hi')}
              className={`min-h-[38px] sm:min-h-[32px] px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                language === 'hi'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              हिं
            </button>
          </div>

          {/* Admin Navigation (When on Admin screen) */}
          {currentView === 'admin' ? (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                id="back-to-public-btn"
                onClick={() => setCurrentView('customer')}
                className="min-h-[40px] sm:min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">{t.customerView}</span>
                <span className="xs:hidden sm:hidden">Site</span>
              </button>
              {isAdminAuthenticated && (
                <button
                  id="admin-logout-btn"
                  onClick={onLogout}
                  className="min-h-[40px] sm:min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all flex items-center space-x-1 cursor-pointer active:scale-95"
                  title={t.adminLogoutBtn}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.adminLogoutBtn}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              {onOpenTracker && (
                <button
                  id="nav-track-booking-btn"
                  type="button"
                  onClick={onOpenTracker}
                  className="min-h-[40px] sm:min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95"
                  title={t.trackStatusBtn}
                >
                  <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="hidden sm:inline">{t.trackStatusBtn}</span>
                  <span className="sm:hidden">Track</span>
                </button>
              )}

              {/* Discreet Settings Place (Where Admin Login & Preferences live) */}
              <button
                id="open-settings-btn"
                type="button"
                onClick={onOpenSettings}
                className="min-h-[40px] sm:min-h-[36px] px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 bg-white transition-all flex items-center space-x-1.5 cursor-pointer active:scale-95 shadow-2xs relative"
                title={language === 'hi' ? 'सेटिंग्स एवं व्यवस्थापक' : 'Settings & Operator'}
              >
                <SettingsIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">{language === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
                {isAdminAuthenticated && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute -top-0.5 -right-0.5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

