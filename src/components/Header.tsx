import React from 'react';
import { Scissors, User, Calendar, ShieldCheck, PlusCircle, LogOut, Key } from 'lucide-react';
import { AuthSession } from '../types/barber';

interface HeaderProps {
  currentView: 'client' | 'barber';
  onViewChange: (view: 'client' | 'barber') => void;
  pendingCount: number;
  onOpenBooking: () => void;
  onOpenMyBookings: () => void;
  authSession: AuthSession | null;
  onLogout: () => void;
  onOpenCredentialsManager: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  pendingCount,
  onOpenBooking,
  onOpenMyBookings,
  authSession,
  onLogout,
  onOpenCredentialsManager,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
            <Scissors className="w-5 h-5 rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
              صالون المقص الذهبي
            </span>
            <span className="text-xs text-amber-500/80 font-medium whitespace-nowrap">
              حلاقة راقية · ٣ حلاقين محترفين
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <a
            href="#barbers-section"
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            onClick={(e) => {
              if (currentView !== 'client') {
                e.preventDefault();
                onViewChange('client');
                setTimeout(() => {
                  document.getElementById('barbers-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
          >
            الحلاقون
          </a>
          <a
            href="#services-section"
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            onClick={(e) => {
              if (currentView !== 'client') {
                e.preventDefault();
                onViewChange('client');
                setTimeout(() => {
                  document.getElementById('services-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
          >
            الخدمات والأسعار
          </a>
          <a
            href="#location-section"
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0"
            onClick={(e) => {
              if (currentView !== 'client') {
                e.preventDefault();
                onViewChange('client');
                setTimeout(() => {
                  document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
          >
            موقع المحل (بن فريحة، وهران)
          </a>
          <button
            onClick={onOpenMyBookings}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>متابعة حجوزاتي</span>
          </button>
        </nav>

        {/* Zone 3: Mode Switcher & Booking Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Segmented Control for Role Toggle */}
          <div className="flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            <button
              onClick={() => onViewChange('client')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                currentView === 'client'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>واجهة الزبائن</span>
            </button>
            <button
              onClick={() => onViewChange('barber')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 relative cursor-pointer ${
                currentView === 'barber'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>لوحة الحلاقين</span>
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center -mr-0.5">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Session Indicator when logged in */}
          {authSession && currentView === 'barber' ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCredentialsManager}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl transition-all cursor-pointer"
                title="إدارة بيانات دخول الحلاقين"
              >
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>إدارة كلمات السر</span>
              </button>

              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-red-950/60 hover:text-red-400 text-neutral-300 border border-neutral-800 hover:border-red-800/60 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج ({authSession.barberName.split(' ')[0]})</span>
              </button>
            </div>
          ) : currentView === 'client' ? (
            <button
              onClick={onOpenBooking}
              className="px-4 py-2 text-xs md:text-sm font-semibold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>احجز موعدك الآن</span>
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};
