import React from 'react';
import { Scissors, MapPin, Phone, Clock } from 'lucide-react';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenMyBookings: () => void;
  onOpenBarberPortal: () => void;
  onOpenOwnerPortal: () => void;
  totalVisits?: number;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
  onOpenMyBookings,
  onOpenBarberPortal,
  onOpenOwnerPortal,
  totalVisits = 1420,
}) => {
  return (
    <footer className="bg-neutral-950 border-t border-neutral-900 text-neutral-400 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Scissors className="w-4 h-4 rotate-45" />
              </div>
              <span className="text-lg font-bold text-white">
                صالون المقص الذهبي
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              تجربة حلاقة ملكية راقية تجمع بين فن الشفرة الكلاسيكي والتقنيات العصرية، بإدارة نخبة من الحلاقين المحترفين.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>عدد زوار الموقع: <strong className="text-amber-400 tabular-nums">{totalVisits.toLocaleString('ar-SA')}</strong> زيارة</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              روابط الموقع
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#barbers-section" className="hover:text-amber-400 transition-colors">
                  الحلاقون المعتمدون بالصالون
                </a>
              </li>
              <li>
                <a href="#services-section" className="hover:text-amber-400 transition-colors">
                  قائمة الخدمات والأسعار
                </a>
              </li>
              <li>
                <button onClick={onOpenMyBookings} className="hover:text-amber-400 transition-colors text-right cursor-pointer">
                  الاستعلام عن حالة موعدك بالهاتف
                </button>
              </li>
              <li>
                <button onClick={onOpenBarberPortal} className="hover:text-amber-400 transition-colors text-right text-amber-500 cursor-pointer">
                  لوحة تحكم الحلاقين للموافقة والرفض
                </button>
              </li>
              <li className="pt-1">
                <button
                  onClick={onOpenOwnerPortal}
                  className="text-neutral-500 hover:text-amber-400 transition-colors text-right text-[11px] flex items-center gap-1 cursor-pointer"
                  title="الرابط الخاص المنفصل لصاحب الموقع"
                >
                  <span>🔒 الرابط الخاص بصاحب الموقع</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Working Hours */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              أوقات العمل
            </span>
            <div className="space-y-2 text-xs text-neutral-400">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-white font-medium">السبت إلى الخميس:</span>
                  <span>١٠:٠٠ صباحاً – ١١:٣٠ مساءً</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <span className="block text-white font-medium">الجمعة:</span>
                  <span>١:٣٠ ظهراً – ١٢:٠٠ منتصف الليل</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Booking */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              الموقع والحجز (وهران)
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-white block font-medium">بن فريحة، ولاية وهران</span>
                  <a
                    href="https://maps.app.goo.gl/ffo11T6RT3GXEPrj7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>فتح في خرائط Google ↗</span>
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-mono">بن فريحة · وهران</span>
              </div>
            </div>
            <button
              onClick={onOpenBooking}
              className="mt-2 w-full py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              حجز موعد فوري
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <span>© 2026 صالون المقص الذهبي - بن فريحة، وهران. جميع الحقوق محفوظة.</span>
          <a
            href="https://maps.app.goo.gl/ffo11T6RT3GXEPrj7"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-400 transition-colors"
          >
            الموقع على الخريطة: بن فريحة، وهران ↗
          </a>
        </div>
      </div>
    </footer>
  );
};
