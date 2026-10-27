import React, { useState } from 'react';
import { Scissors, Sparkles, Clock, Check, Plus } from 'lucide-react';
import { Service } from '../types/barber';

interface ServicesListProps {
  services: Service[];
  onSelectServiceForBooking: (service: Service) => void;
}

export const ServicesList: React.FC<ServicesListProps> = ({
  services,
  onSelectServiceForBooking,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'جميع الخدمات' },
    { id: 'hair', label: 'قص الشعر' },
    { id: 'beard', label: 'تحديد وعناية اللحية' },
    { id: 'combo', label: 'باقات الـ VIP المتكاملة' },
    { id: 'spa', label: 'العناية بالفوطة الساخنة والمساج' },
  ];

  const filteredServices =
    activeCategory === 'all'
      ? services
      : services.filter((s) => s.category === activeCategory);

  return (
    <section id="services-section" className="py-20 bg-neutral-900/30 border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
            <span>قائمة الخدمات الاحترافية</span>
            <span aria-hidden="true">·</span>
            <span>أسعار شفافة وجودة عالية</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            خدمات متكاملة تناسب كل رجل أنيق
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mt-2">
            نستخدم أجود مستحضرات العناية والشفرات الإيطالية المعقمة لضمان تجربة حلاقة استثنائية.
          </p>

          {/* Interactive Category Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-neutral-950 shadow-md'
                    : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-6 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                    {service.name}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="text-xl font-extrabold text-amber-400 tabular-nums">
                      {service.price}
                    </span>
                    <span className="text-xs text-neutral-400 mr-1">د.ج</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="tabular-nums">{service.durationMinutes} دقيقة</span>
                </div>

                <button
                  onClick={() => onSelectServiceForBooking(service)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-amber-500 text-neutral-300 hover:text-neutral-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>حجز هذه الخدمة</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
