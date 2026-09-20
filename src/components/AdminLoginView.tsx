import React, { useState } from 'react';
import { Shield, Lock, ArrowRight, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';

interface AdminLoginViewProps {
  language?: Language;
  onLoginSuccess: () => void;
  onBackToCustomer: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  language = 'en',
  onLoginSuccess,
  onBackToCustomer,
}) => {
  const t = translations[language];
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Successful login
      try {
        sessionStorage.setItem('sahayak_admin_auth', 'true');
      } catch {
        // ignore
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || t.adminLoginError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-16">
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t.adminLoginHeading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
            {t.adminLoginSubheading}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-password-input" className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
              {t.adminPasswordLabel}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                id="admin-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.adminPasswordPlaceholder}
                className="w-full pl-10 pr-4 py-3 sm:py-2.5 min-h-[44px] text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none"
                autoFocus
                required
              />
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Default operational access: <code className="text-slate-600 font-mono font-bold">admin123</code>
            </span>
          </div>

          <button
            type="submit"
            id="admin-login-submit-btn"
            disabled={isLoading || !password.trim()}
            className="w-full min-h-[48px] py-3.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer active:scale-98"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{t.adminLoginSubmitBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center">
          <button
            type="button"
            onClick={onBackToCustomer}
            className="min-h-[44px] px-4 py-2 text-xs sm:text-sm text-slate-500 hover:text-slate-800 font-medium flex items-center space-x-1.5 cursor-pointer transition-colors active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backToPublicBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
