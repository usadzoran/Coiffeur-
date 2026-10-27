/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BarberList } from './components/BarberList';
import { ServicesList } from './components/ServicesList';
import { BookingModal } from './components/BookingModal';
import { ClientAppointmentsLookup } from './components/ClientAppointmentsLookup';
import { BarberDashboard } from './components/BarberDashboard';
import { BarberLogin } from './components/BarberLogin';
import { BarberCredentialsManager } from './components/BarberCredentialsManager';
import { OwnerPortal } from './components/OwnerPortal';
import { HtmlAdSlot } from './components/HtmlAdSlot';
import { LocationSection } from './components/LocationSection';
import { Footer } from './components/Footer';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { Barber, Service, Appointment, AuthSession, AdSlot, VisitorStats } from './types/barber';
import {
  getStoredBarbers,
  getStoredServices,
  getStoredAppointments,
  getCurrentSession,
  logoutBarber,
  getStoredAds,
  getVisitorStats,
  recordVisit,
} from './utils/storage';

export default function App() {
  const [currentView, setCurrentView] = useState<'client' | 'barber' | 'owner'>('client');
  const [barbers, setBarbers] = useState<Barber[]>(() => getStoredBarbers());
  const [services, setServices] = useState<Service[]>(() => getStoredServices());
  const [appointments, setAppointments] = useState<Appointment[]>(() => getStoredAppointments());
  const [activeBarberId, setActiveBarberId] = useState<string>('barber-1');

  // Ads & Visitor Stats
  const [ads, setAds] = useState<AdSlot[]>(() => getStoredAds());
  const [visitorStats, setVisitorStats] = useState<VisitorStats>(() => getVisitorStats());

  // Authentication Session
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => getCurrentSession());
  const [isCredentialsManagerOpen, setIsCredentialsManagerOpen] = useState<boolean>(false);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isLookupOpen, setIsLookupOpen] = useState<boolean>(false);
  const [bookingBarber, setBookingBarber] = useState<Barber | null>(null);
  const [bookingService, setBookingService] = useState<Service | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'warning' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state from storage
  const syncData = () => {
    setBarbers(getStoredBarbers());
    setServices(getStoredServices());
    setAppointments(getStoredAppointments());
    setAuthSession(getCurrentSession());
    setAds(getStoredAds());
    setVisitorStats(getVisitorStats());
  };

  // Listen for private Owner URL hash
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('owner') || hash.includes('admin-portal')) {
        setCurrentView('owner');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Record visit on client view mount
  useEffect(() => {
    const stats = recordVisit();
    setVisitorStats(stats);
    syncData();

    const handleStorageChange = () => syncData();
    window.addEventListener('barbershop-storage-updated', handleStorageChange);
    return () => {
      window.removeEventListener('barbershop-storage-updated', handleStorageChange);
    };
  }, []);

  const pendingAppointmentsCount = appointments.filter((a) => a.status === 'pending').length;

  const handleOpenBooking = (barber?: Barber, service?: Service) => {
    setBookingBarber(barber || null);
    setBookingService(service || null);
    setIsBookingOpen(true);
  };

  const handleOpenBarberDashboard = (barberId: string) => {
    setActiveBarberId(barberId);
    setCurrentView('barber');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenOwnerPortal = () => {
    window.location.hash = '#owner-portal';
    setCurrentView('owner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookingSuccess = (newAppt: Appointment) => {
    addToast(
      `تم إرسال طلب حجز الموعد بنجاح! بانتظار مراجعة وقبول الحلاق للموعد.`,
      'info'
    );
  };

  const handleLogout = () => {
    logoutBarber();
    setAuthSession(null);
    addToast('تم تسجيل الخروج بنجاح من حساب الحلاق.', 'info');
  };

  const handleLoginSuccess = (session: AuthSession) => {
    setAuthSession(session);
    setActiveBarberId(session.barberId);
    addToast(`مرحباً بك، ${session.barberName}! تم تسجيل الدخول بنجاح.`, 'success');
  };

  const topAd = ads.find((a) => a.location === 'top_banner');
  const midAd = ads.find((a) => a.location === 'mid_content');
  const footerAd = ads.find((a) => a.location === 'footer_banner');

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans" dir="rtl">
      {/* Top Header */}
      <Header
        currentView={currentView === 'owner' ? 'client' : currentView}
        onViewChange={(view) => {
          if (view === 'client' && window.location.hash.includes('owner')) {
            window.location.hash = '';
          }
          setCurrentView(view);
        }}
        pendingCount={pendingAppointmentsCount}
        onOpenBooking={() => handleOpenBooking()}
        onOpenMyBookings={() => setIsLookupOpen(true)}
        authSession={authSession}
        onLogout={handleLogout}
        onOpenCredentialsManager={() => setIsCredentialsManagerOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'owner' ? (
          /* Separate Dedicated Owner Portal */
          <OwnerPortal
            barbers={barbers}
            appointments={appointments}
            ads={ads}
            onNotification={addToast}
            onBackToMainSite={() => {
              window.location.hash = '';
              setCurrentView('client');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : currentView === 'client' ? (
          <div className="pb-16 sm:pb-0">
            {/* Ad Slot 1: Top Header Banner */}
            <HtmlAdSlot ad={topAd} className="pt-2" />

            {/* Hero Section */}
            <Hero
              barbers={barbers}
              onSelectBarber={(barber) => handleOpenBooking(barber)}
              onOpenBooking={() => handleOpenBooking()}
              onGoToBarbers={() => {
                document.getElementById('barbers-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenBarberPortal={() => setCurrentView('barber')}
              pendingCount={pendingAppointmentsCount}
            />

            {/* The Barbers Section */}
            <BarberList
              barbers={barbers}
              appointments={appointments}
              onSelectBarberForBooking={(barber) => handleOpenBooking(barber)}
              onOpenBarberDashboard={handleOpenBarberDashboard}
            />

            {/* Ad Slot 2: Mid Content Banner */}
            <HtmlAdSlot ad={midAd} className="my-8" />

            {/* Services & Pricing Section */}
            <ServicesList
              services={services}
              onSelectServiceForBooking={(service) => handleOpenBooking(undefined, service)}
            />

            {/* Shop Location & Interactive Google Map (Ben Freha, Oran) */}
            <LocationSection />

            {/* Ad Slot 3: Footer Banner */}
            <HtmlAdSlot ad={footerAd} className="my-8" />
          </div>
        ) : !authSession ? (
          /* Barber Login Gate */
          <BarberLogin
            onLoginSuccess={handleLoginSuccess}
            onBackToClient={() => setCurrentView('client')}
            onOpenOwnerManager={() => setIsCredentialsManagerOpen(true)}
          />
        ) : (
          /* Authenticated Barber Dashboard & Decision Portal */
          <BarberDashboard
            barbers={barbers}
            services={services}
            appointments={appointments}
            activeBarberId={activeBarberId}
            onSelectBarber={setActiveBarberId}
            onNotification={addToast}
            authSession={authSession}
            onOpenCredentialsManager={() => setIsCredentialsManagerOpen(true)}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onOpenMyBookings={() => setIsLookupOpen(true)}
        onOpenBarberPortal={() => setCurrentView('barber')}
        onOpenOwnerPortal={handleOpenOwnerPortal}
        totalVisits={visitorStats?.totalVisits || 1420}
      />

      {/* Mobile Sticky Bottom Action Bar (Phones only, client view) */}
      {currentView === 'client' && (
        <div className="fixed bottom-0 inset-x-0 z-30 sm:hidden bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800 p-2.5 px-4 shadow-2xl flex items-center justify-between gap-2.5">
          <button
            onClick={() => handleOpenBooking()}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-400 to-amber-500 active:from-amber-500 active:to-amber-600 text-neutral-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>احجز موعدك الآن</span>
          </button>

          <button
            onClick={() => setIsLookupOpen(true)}
            className="py-3 px-3.5 bg-neutral-900 border border-neutral-800 text-neutral-200 active:bg-neutral-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shrink-0"
            title="متابعة الحجوزات"
          >
            <span>حجوزاتي</span>
          </button>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        barbers={barbers}
        services={services}
        initialBarber={bookingBarber}
        initialService={bookingService}
        appointments={appointments}
        onBookingSuccess={handleBookingSuccess}
        onOpenBarberDashboard={handleOpenBarberDashboard}
      />

      {/* Client Appointments Lookup Drawer */}
      <ClientAppointmentsLookup
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        appointments={appointments}
        barbers={barbers}
        services={services}
        onOpenBooking={() => {
          setIsLookupOpen(false);
          setIsBookingOpen(true);
        }}
      />

      {/* Owner Barber Credentials Manager Modal */}
      <BarberCredentialsManager
        isOpen={isCredentialsManagerOpen}
        onClose={() => setIsCredentialsManagerOpen(false)}
        onNotification={addToast}
      />

      {/* Global Toast Notifications */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
