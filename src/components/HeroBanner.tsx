import React, { useState } from 'react';
import { ShieldCheck, Tag, Zap, ArrowRight, Smartphone, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onOpenSellModal: () => void;
  onExploreCategory: (category: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenSellModal, onExploreCategory }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      badge: 'VERIFIED DEALS ONLY',
      title: 'Upgrade your wheels with 100% verified inspections',
      description: 'Explore certified pre-owned cars & motorcycles with detailed maintenance history and instant seller chat.',
      buttonText: 'Explore Cars',
      category: 'cars',
      bgGradient: 'from-[#002f34] via-[#00424b] to-[#015863]',
      accentColor: '#23e5db',
      tagIcon: Zap,
    },
    {
      badge: 'SELL IN 3 EASY STEPS',
      title: 'Got something to sell? Post your free ad in 60 seconds',
      description: 'Reach millions of genuine buyers in your neighborhood. Get fast inquiries and real-time cash offers.',
      buttonText: 'Post an Ad Now',
      action: 'sell',
      bgGradient: 'from-[#082f49] via-[#0f766e] to-[#002f34]',
      accentColor: '#ffce32',
      tagIcon: Tag,
    },
    {
      badge: 'NEW ARRIVALS',
      title: 'Flagship Smartphones, Laptops & Gaming Consoles',
      description: 'Top tech at unbelievable prices. iPhone 15 Pro, MacBooks, PS5 and OLED TVs in pristine condition.',
      buttonText: 'Browse Electronics',
      category: 'electronics',
      bgGradient: 'from-[#1e1b4b] via-[#312e81] to-[#002f34]',
      accentColor: '#a78bfa',
      tagIcon: Sparkles,
    },
  ];

  const current = slides[activeSlide];
  const Icon = current.tagIcon;

  return (
    <div className="max-w-[1280px] mx-auto px-3 sm:px-4 pt-3 pb-1 w-full max-w-full overflow-hidden">
      <div className={`relative overflow-hidden rounded-xl bg-linear-to-r ${current.bgGradient} text-white p-4 sm:p-7 md:p-8 shadow-md transition-all duration-500 w-full`}>
        
        {/* Background decorative geometry */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none flex items-center justify-end pr-4 sm:pr-8 overflow-hidden">
          <Smartphone className="w-48 h-48 sm:w-80 sm:h-80 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-black tracking-widest uppercase mb-2.5 bg-white/10 backdrop-blur-xs border border-white/20">
            <Icon className="w-3.5 h-3.5" style={{ color: current.accentColor }} />
            <span style={{ color: current.accentColor }}>{current.badge}</span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-2">
            {current.title}
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-200 mb-5 leading-relaxed font-normal">
            {current.description}
          </p>

          {/* Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (current.action === 'sell') {
                  onOpenSellModal();
                } else if (current.category) {
                  onExploreCategory(current.category);
                }
              }}
              className="px-5 py-2.5 rounded font-bold text-xs bg-white text-[#002f34] hover:bg-[#23e5db] transition-colors flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer"
            >
              <span>{current.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300 sm:ml-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#23e5db] shrink-0" />
              <span>100% Free Ad Posting & Buyer Protection</span>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-3 right-5 flex items-center gap-1.5 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeSlide === idx ? 'w-5 bg-[#23e5db]' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
