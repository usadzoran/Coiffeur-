import React from 'react';
import { AdSlot } from '../types/barber';

interface HtmlAdSlotProps {
  ad?: AdSlot;
  className?: string;
}

export const HtmlAdSlot: React.FC<HtmlAdSlotProps> = ({ ad, className = '' }) => {
  if (!ad || !ad.enabled || !ad.htmlContent.trim()) {
    return null;
  }

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-4 ${className}`}>
      <div className="relative group">
        {/* Subtle unboxed metadata indicator */}
        <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-1 px-1">
          <span>مساحة إعلانية مخصصة</span>
          <span>{ad.title.split('(')[0]}</span>
        </div>

        {/* Render HTML content pasted by the owner */}
        <div
          className="rounded-xl overflow-hidden transition-all"
          dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
        />
      </div>
    </div>
  );
};
