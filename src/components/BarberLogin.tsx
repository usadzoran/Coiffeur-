import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, KeyRound, Info } from 'lucide-react';
import { loginBarber, getStoredCredentials } from '../utils/storage';
import { AuthSession } from '../types/barber';

interface BarberLoginProps {
  onLoginSuccess: (session: AuthSession) => void;
  onBackToClient: () => void;
  onOpenOwnerManager?: () => void;
}

export const BarberLogin: React.FC<BarberLoginProps> = ({
  onLoginSuccess,
  onBackToClient,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentCredentials = getStoredCredentials();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('يرجى كتابة اسم الدخول وكلمة المرور');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = loginBarber(username, password);
      setIsLoading(false);

      if (res.success && res.session) {
        onLoginSuccess(res.session);
      } else {
        setErrorMessage(res.message || 'بيانات الدخول غير صحيحة');
      }
    }, 200);
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            تسجيل دخول الحلاق
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            لكل حلاق حساب مخصص بكلمة سر يوفرها صاحب الصالون لمراجعة وقبول المواعيد
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                اسم المستخدم للحلاق
              </label>
              <div className="relative">
                <input
                  type="text"
                  dir="ltr"
                  placeholder="مثال: karim أو youssef أو sami"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 pl-10 text-left font-mono"
                />
                <User className="w-4 h-4 text-neutral-500 absolute top-3 left-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-neutral-300">
                  كلمة المرور
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-neutral-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'إخفاء' : 'إظهار'}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 pl-10 text-left font-mono"
                />
                <KeyRound className="w-4 h-4 text-neutral-500 absolute top-3 left-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'جاري التحقق...' : 'دخول لوحة التحكم'}</span>
            </button>
          </form>

          {/* Quick Demo Helper for the Owner & Barbers */}
          <div className="pt-4 border-t border-neutral-800/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="flex items-center gap-1 font-semibold text-amber-500">
                <Info className="w-3.5 h-3.5" />
                <span>حسابات الحلاقين الموفرة حالياً:</span>
              </span>
              <span className="text-[11px] text-neutral-500">اضغط للملء السريع</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {currentCredentials.map((cred) => (
                <button
                  type="button"
                  key={cred.barberId}
                  onClick={() => handleQuickFill(cred.username, cred.password)}
                  className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/60 hover:bg-amber-500/5 text-right transition-all group cursor-pointer"
                >
                  <span className="font-bold text-white block group-hover:text-amber-400 text-[11px]">
                    {cred.barberName}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">
                    {cred.username} / {cred.password}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={onBackToClient}
            className="text-xs text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لواجهة الزبائن وحجز المواعيد</span>
          </button>
        </div>
      </div>
    </div>
  );
};
