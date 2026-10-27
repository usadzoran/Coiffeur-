import React from 'react';
import { MapPin, Navigation, ExternalLink, Clock, Phone, Car, Compass } from 'lucide-react';

export const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/ffo11T6RT3GXEPrj7';
export const SHOP_LOCATION_NAME = 'بن فريحة، ولاية وهران';
export const SHOP_FULL_ADDRESS = 'بلدية بن فريحة، دائرة قديل، ولاية وهران، الجزائر';

export const LocationSection: React.FC = () => {
  return (
    <section id="location-section" className="py-20 bg-neutral-950 border-b border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" />
            <span>موقع الصالون · ولاية وهران</span>
            <span aria-hidden="true">·</span>
            <span>سهولة الوصول والمواقف</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            تفضل بزيارتنا في بن فريحة، وهران
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-2">
            موقع متميز ومريح في بن فريحة بوهران، مجهز بأحدث كراسي الحلاقة ومواقف سيارات لخدمتكم بأفضل معايير الراحة.
          </p>
        </div>

        {/* Location & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Info Card (5 Cols) */}
          <div className="lg:col-span-5 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-xl">
            <div className="space-y-6">
              <div className="flex items-start gap-4 pb-6 border-b border-neutral-800">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-amber-500 font-bold block">العنوان الدقيق</span>
                  <h3 className="text-lg font-extrabold text-white mt-0.5">{SHOP_LOCATION_NAME}</h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {SHOP_FULL_ADDRESS}
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">مواعيد استقبال الزبائن:</span>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    السبت إلى الخميس: ١٠:٠٠ ص – ١١:٣٠ م<br />
                    الجمعة: ١:٣٠ ظ – ١٢:٠٠ منتصف الليل
                  </p>
                </div>
              </div>

              {/* Parking & Accessibility */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
                  <Car className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">مواقف السيارات والوصول:</span>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    متوفرة مواقف أمام الصالون، قريب من الطريق الرئيسي لبلدية بن فريحة، وهران.
                  </p>
                </div>
              </div>

              {/* Phone / Contact */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
                  <Phone className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">الاتصال المباشر والاستفسار:</span>
                  <a href="tel:0550000000" className="text-xs text-amber-400 font-mono hover:underline block mt-0.5">
                    05 50 XX XX XX / بن فريحة - وهران
                  </a>
                </div>
              </div>
            </div>

            {/* Direct Google Maps Action CTA */}
            <div className="pt-4 border-t border-neutral-800/80 space-y-2">
              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-bold rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                <span>فتح موقع المحل في خرائط Google مباشرة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <span className="text-[11px] text-neutral-500 text-center block">
                اضغط لتشغيل نظام الملاحة والتوجيه (GPS) في هاتفك إلى المحل مباشرة
              </span>
            </div>
          </div>

          {/* Embedded Google Map (7 Cols) */}
          <div className="lg:col-span-7 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-3 flex flex-col justify-between shadow-xl min-h-[360px] lg:min-h-full">
            <div className="relative w-full h-[360px] lg:h-full min-h-[340px] rounded-2xl overflow-hidden border border-neutral-800">
              {/* Google Maps Embed iframe with Ben Freha, Oran coordinates */}
              <iframe
                title="موقع صالون الحلاقة في بن فريحة، وهران"
                src="https://maps.google.com/maps?q=Ben%20Freha,%20Oran,%20Algeria&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 filter contrast-105"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Floating Overlay Badge on Map */}
              <div className="absolute top-4 right-4 bg-neutral-950/90 backdrop-blur-md border border-neutral-800 px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                <div>
                  <span className="text-xs font-bold text-white block">صالون المقص الذهبي</span>
                  <span className="text-[10px] text-amber-400 block font-medium">بن فريحة · وهران</span>
                </div>
              </div>

              {/* Floating Button on Map */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-neutral-950/90 hover:bg-neutral-900 border border-amber-500/40 text-amber-400 text-xs font-bold rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all backdrop-blur-md"
                >
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>الاتجاهات عبر Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
