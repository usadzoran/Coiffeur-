import React, { useState } from 'react';
import { Scissors, User, Calendar, ShieldCheck, PlusCircle, LogOut, Key, Menu, X, MapPin } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'client') {
      onViewChange('client');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
          {/* Zone 1: Brand wordmark */}
          <div
            className="flex items-center gap-2 sm:gap-3 shrink-0 cursor-pointer"
            onClick={() => {
              if (currentView !== 'client') onViewChange('client');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
              <Scissors className="w-4 h-4 sm:w-5 sm:h-5 rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-bold tracking-tight text-white whitespace-nowrap">
                صالون المقص الذهبي
              </span>
              <span className="text-[10px] sm:text-xs text-amber-500/80 font-medium whitespace-nowrap">
                بن فريحة (وهران) · ٣ حلاقين
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-300">
            <button
              onClick={() => handleNavClick('barbers-section')}
              className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              الحلاقون الثلاثة
            </button>
            <button
              onClick={() => handleNavClick('services-section')}
              className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer"
            >
              الخدمات والأسعار
            </button>
            <button
              onClick={() => handleNavClick('location-section')}
              className="hover:text-amber-400 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>موقع المحل (بن فريحة)</span>
            </button>
            <button
              onClick={onOpenMyBookings}
              className="hover:text-amber-400 transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>متابعة حجوزاتي</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Mobile Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Desktop Switcher for Role Toggle */}
            <div className="hidden sm:flex items-center p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
              <button
                onClick={() => onViewChange('client')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  currentView === 'client'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>الزبائن</span>
              </button>
              <button
                onClick={() => onViewChange('barber')}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap relative cursor-pointer ${
                  currentView === 'barber'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>لوحة الحلاقين</span>
                {pendingCount > 0 && (
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-600 text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center -mr-0.5 animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* Client Booking Button */}
            {currentView === 'client' && (
              <button
                onClick={onOpenBooking}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>احجز موعد</span>
              </button>
            )}

            {/* Barber Session Logout */}
            {authSession && currentView === 'barber' && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={onOpenCredentialsManager}
                  className="p-2 sm:px-3 sm:py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  title="إدارة بيانات دخول الحلاقين"
                >
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden md:inline">كلمات السر</span>
                </button>
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-neutral-900 hover:bg-red-950/60 hover:text-red-400 text-neutral-300 border border-neutral-800 hover:border-red-800/60 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">خروج</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="قائمة الخيارات"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-neutral-950 border-b border-neutral-800 px-4 pt-3 pb-5 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          {/* Mobile Role Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
            <button
              onClick={() => {
                onViewChange('client');
                setMobileMenuOpen(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                currentView === 'client'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>واجهة الزبائن</span>
            </button>
            <button
              onClick={() => {
                onViewChange('barber');
                setMobileMenuOpen(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${
                currentView === 'barber'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة الحلاقين</span>
              {pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Navigation List */}
          <div className="space-y-1 pt-1">
            <button
              onClick={() => handleNavClick('barbers-section')}
              className="w-full text-right px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:bg-neutral-900 hover:text-amber-400 transition-colors flex items-center justify-between"
            >
              <span>الحلاقون الثلاثة المعتمدون</span>
              <Scissors className="w-4 h-4 text-amber-500/70" />
            </button>

            <button
              onClick={() => handleNavClick('services-section')}
              className="w-full text-right px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:bg-neutral-900 hover:text-amber-400 transition-colors flex items-center justify-between"
            >
              <span>قائمة الخدمات والأسعار</span>
              <span className="text-xs text-amber-400 font-bold">د.ج</span>
            </button>

            <button
              onClick={() => handleNavClick('location-section')}
              className="w-full text-right px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:bg-neutral-900 hover:text-amber-400 transition-colors flex items-center justify-between"
            >
              <span>موقع الصالون (بن فريحة، وهران)</span>
              <MapPin className="w-4 h-4 text-amber-500" />
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMyBookings();
              }}
              className="w-full text-right px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:bg-neutral-900 hover:text-amber-400 transition-colors flex items-center justify-between"
            >
              <span>متابعة حجوزاتي برقم الهاتف</span>
              <Calendar className="w-4 h-4 text-amber-500" />
            </button>
          </div>

          {/* Quick Booking CTA in mobile menu */}
          <div className="pt-2 border-t border-neutral-800/80">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>احجز موعدك الآن مع حلاقك</span>
            </button>
          </div>

          {/* Barber Session Mobile Actions */}
          {authSession && (
            <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="text-neutral-400">
                الحساب: <strong className="text-white">{authSession.barberName}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCredentialsManager();
                  }}
                  className="px-2.5 py-1.5 bg-neutral-900 text-amber-400 rounded-lg border border-neutral-800"
                >
                  كلمات السر
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="px-2.5 py-1.5 bg-red-950/40 text-red-400 rounded-lg border border-red-900/40"
                >
                  خروج
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
