import React from 'react';
import { Star, Clock, Calendar, CheckCircle2, ChevronLeft, ShieldCheck } from 'lucide-react';
import { Barber, Appointment } from '../types/barber';

interface BarberListProps {
  barbers: Barber[];
  appointments: Appointment[];
  onSelectBarberForBooking: (barber: Barber) => void;
  onOpenBarberDashboard: (barberId: string) => void;
}

export const BarberList: React.FC<BarberListProps> = ({
  barbers,
  appointments,
  onSelectBarberForBooking,
  onOpenBarberDashboard,
}) => {
  return (
    <section id="barbers-section" className="py-20 bg-neutral-950 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
              <span>فريق الحلاقة المعتمد</span>
              <span aria-hidden="true">·</span>
              <span>٣ كفاءات متخصصة</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              تعرّف على حلاقينا الثلاثة
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base mt-2 max-w-2xl">
              لكل حلاق أسلوبه المتميز وخبرته المتراكمة. اختر الحلاق الأنسب لستايلك، وسيقوم بمراجعة موعدك فور إرساله.
            </p>
          </div>

          <div className="text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-xl p-3 max-w-xs">
            <span className="font-semibold text-amber-400 block mb-1">كيف يعمل الحجز؟</span>
            الزبون يحدد اليوم والوقت، ويصل إشعار فوري للحلاق على لوحته ليقرر قبول الموعد أو اقتراح وقت بديل.
          </div>
        </div>

        {/* 3 Barbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {barbers.map((barber) => {
            const barberAppointments = appointments.filter((a) => a.barberId === barber.id);
            const pendingAppointments = barberAppointments.filter((a) => a.status === 'pending');
            const confirmedAppointments = barberAppointments.filter((a) => a.status === 'confirmed');

            return (
              <div
                key={barber.id}
                className="group bg-neutral-900/70 border border-neutral-800 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all duration-300 flex flex-col shadow-lg shadow-black/40"
              >
                {/* Barber Portrait with Overlay */}
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-800">
                  <img
                    src={barber.image}
                    alt={barber.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />

                  {/* Chair & Rating Overlay */}
                  <div className="absolute top-4 right-4 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-xs px-2.5 py-1 rounded-lg text-neutral-200 font-medium">
                    الكرسي #{barber.chairNumber}
                  </div>

                  <div className="absolute top-4 left-4 bg-neutral-950/80 backdrop-blur-md border border-neutral-800 text-xs px-2.5 py-1 rounded-lg text-amber-400 font-medium flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="tabular-nums font-bold">{barber.rating}</span>
                    <span className="text-neutral-400">({barber.reviewsCount})</span>
                  </div>

                  {/* Pending Badge if any */}
                  {pendingAppointments.length > 0 && (
                    <div className="absolute bottom-4 right-4 bg-amber-500 text-neutral-950 text-xs font-bold px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5 animate-pulse">
                      <span>{pendingAppointments.length} طلبات جديدة تنتظر قراره</span>
                    </div>
                  )}
                </div>

                {/* Barber Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                      {barber.name}
                    </h3>
                    <p className="text-xs text-amber-500 font-medium mt-0.5">
                      {barber.title} · خبرة {barber.experienceYears} سنوات
                    </p>

                    <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
                      {barber.bio}
                    </p>

                    {/* Working Hours */}
                    <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-500" />
                        <span>ساعات العمل: {barber.workingHours.start} - {barber.workingHours.end}</span>
                      </span>
                      <span className="text-neutral-500">
                        {confirmedAppointments.length} مواعيد مؤكدة
                      </span>
                    </div>

                    {/* Specialties */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {barber.specialties.map((spec, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded-md"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions for this Barber */}
                  <div className="mt-6 pt-4 border-t border-neutral-800/80 space-y-2">
                    <button
                      onClick={() => onSelectBarberForBooking(barber)}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <span>احجز موعداً مع {barber.name.split(' ')[0]}</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenBarberDashboard(barber.id)}
                      className="w-full py-2 px-3 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold rounded-xl border border-neutral-700/60 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                      <span>فتح لوحة تحكم {barber.name.split(' ')[0]} (لقبول/رفض المواعيد)</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
