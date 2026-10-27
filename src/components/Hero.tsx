import React from 'react';
import { CalendarCheck, Shield, Clock, Award, ArrowLeft, Star } from 'lucide-react';
import { HERO_IMAGE, INITIAL_BARBERS } from '../data/mockData';
import { Barber } from '../types/barber';

interface HeroProps {
  onOpenBooking: () => void;
  onGoToBarbers: () => void;
  onOpenBarberPortal: () => void;
  pendingCount: number;
  barbers?: Barber[];
  onSelectBarber?: (barber: Barber) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenBooking,
  onGoToBarbers,
  onOpenBarberPortal,
  pendingCount,
  barbers = INITIAL_BARBERS,
  onSelectBarber,
}) => {
  const displayBarbers = barbers && barbers.length > 0 ? barbers : INITIAL_BARBERS;

  return (
    <div className="relative overflow-hidden bg-neutral-950 border-b border-neutral-800">
      {/* Background with Dark Scrim Overlay for WCAG AA Contrast */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_IMAGE}
          alt="صالون المقص الذهبي للحلاقة الرجالية الفاخرة"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-25 filter brightness-90 contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-neutral-950/50" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
        <div className="max-w-3xl">
          {/* Subtle Category Kicker */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-semibold text-amber-500 uppercase tracking-wider sm:tracking-widest mb-3 sm:mb-4">
            <span>صالون حلاقة رجالي فاخر</span>
            <span aria-hidden="true">·</span>
            <span>بن فريحة، وهران</span>
            <span aria-hidden="true">·</span>
            <span>نظام موافقة الحلاق المباشر</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white tracking-tight leading-[1.2] mb-4 sm:mb-6 text-balance">
            فن الحلاقة الرجالية في بن فريحة (وهران)، بأيدي نخبة من أمهر الحلاقين.
          </h1>

          {/* Value Proposition */}
          <p className="text-sm sm:text-base lg:text-lg text-neutral-300 leading-relaxed mb-6 sm:mb-8 max-w-2xl font-normal">
            مرحباً بكم في صالوننا ببلدية بن فريحة، ولاية وهران. اختر حلاقك المفضل، حدد اليوم والتوقيت المناسبين لك، ويقوم الحلاق بمراجعة موعدك وقبوله وتأكيد كرسيك فورياً.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <button
              onClick={onOpenBooking}
              className="w-full sm:w-auto px-6 py-3.5 text-sm sm:text-base font-bold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>احجز موعدك مع حلاقك الآن</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onGoToBarbers}
              className="w-full sm:w-auto px-5 py-3 text-sm font-semibold text-neutral-200 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 rounded-xl transition-all flex items-center justify-center cursor-pointer"
            >
              استعراض الحلاقين الثلاثة
            </button>

            <button
              onClick={onOpenBarberPortal}
              className="w-full sm:w-auto px-4 py-3 text-sm font-semibold text-amber-400 hover:text-amber-300 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-800/60 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>دخول لوحة الحلاق للموافقة</span>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-neutral-950 text-xs px-2 py-0.5 rounded-md font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          {/* Targeted Section: Barbers Photos Showcase & Proof Bar */}
          <div className="pt-8 border-t border-neutral-800/80 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                  <span>طاقم حلاقي الصالون في بن فريحة (اختر حلاقك المفضل):</span>
                </span>
                <span className="text-[11px] text-neutral-400">
                  انقر على صورة الحلاق لحجز موعد معه
                </span>
              </div>

              {/* Barbers Photos Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {displayBarbers.slice(0, 3).map((barber) => (
                  <button
                    type="button"
                    key={barber.id}
                    onClick={() => {
                      if (onSelectBarber) {
                        onSelectBarber(barber);
                      } else {
                        onGoToBarbers();
                      }
                    }}
                    className="group bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-500/70 p-3 rounded-2xl flex items-center gap-3 transition-all text-right cursor-pointer shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={barber.image}
                        alt={barber.name}
                        referrerPolicy="no-referrer"
                        className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-neutral-700 group-hover:border-amber-500 transition-colors shadow-md"
                      />
                      <span className="absolute -bottom-1 -left-1 bg-amber-500 text-neutral-950 font-extrabold text-[10px] px-1.5 py-0.2 rounded-md font-mono shadow">
                        #{barber.chairNumber}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors block truncate">
                        {barber.name}
                      </span>
                      <span className="text-[11px] text-neutral-400 block truncate mt-0.5">
                        {barber.title.split('(')[0]}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold mt-1">
                        <span className="flex items-center gap-0.5 tabular-nums">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{barber.rating}</span>
                        </span>
                        <span className="text-neutral-500">· خبرة {barber.experienceYears} سنوات</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Proof Indicators Strip */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-800/60">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-amber-500 tabular-nums">١٠٠٪</span>
                <span className="text-xs text-neutral-400 mt-0.5">تأكيد الموعد بيد الحلاق</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">٤.٩ / ٥</span>
                <span className="text-xs text-neutral-400 mt-0.5">تقييم أكثر من ٤٠٠ زبون</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">بن فريحة</span>
                <span className="text-xs text-neutral-400 mt-0.5">وهران، الجزائر</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
