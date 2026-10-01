import React from 'react';
import { MastheadInfo } from '../types/newspaper';
import { Calendar, CloudSun, MapPin, Tag, ShieldCheck, Globe, PhoneCall, ChevronDown } from 'lucide-react';
import { toBanglaNumber } from './BroadsheetPage';

interface MastheadProps {
  info: MastheadInfo;
  onEditClick?: () => void;
  onOpenCalendar?: () => void;
  onSelectPage?: (page: number) => void;
  showEditorAffordance?: boolean;
}

export const Masthead: React.FC<MastheadProps> = ({
  info,
  onEditClick,
  onOpenCalendar,
  onSelectPage,
  showEditorAffordance = false,
}) => {
  return (
    <header className="w-full border-b-2 border-stone-900 pb-2 mb-4 select-none">
      {/* Top Utility Ribbon with Prothom-Alo style date and archive trigger */}
      <div className="flex flex-wrap items-center justify-between text-xs border-b border-stone-300 py-1.5 px-1 font-sans-bn text-stone-700 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Clickable Calendar trigger */}
          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 font-bold text-red-900 hover:text-red-700 hover:bg-stone-200/60 px-1.5 py-0.5 rounded transition-colors group cursor-pointer"
            title="পুরনো সংখ্যা বা আর্কাইভ থেকে তারিখ বেছে নিন"
          >
            <Calendar className="w-3.5 h-3.5 text-red-700" />
            <span>{info.banglaDate}</span>
            <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-red-700" />
          </button>
          <span className="text-stone-300">|</span>
          <span className="text-stone-600">{info.englishDate}</span>
          <span className="text-stone-300">|</span>
          <span className="text-stone-500">{info.hijriDate}</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 text-stone-700">
            <CloudSun className="w-3.5 h-3.5 text-amber-600" />
            <span>{info.weatherText}</span>
          </div>
          <span className="text-stone-300">|</span>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-700" />
            <span className="font-bold text-stone-900">{info.edition}</span>
          </div>
          <span className="text-stone-300">|</span>
          <span className="bg-red-800 text-white px-2 py-0.5 rounded text-[11px] font-bold shadow-xs">
            {info.price}
          </span>
        </div>
      </div>

      {/* Main Masthead Banner with Classic Left & Right Ear Panels */}
      <div className="grid grid-cols-12 items-center py-3 px-1 gap-2 sm:gap-4">
        {/* Left Ear Panel (প্রথম আলোর বাম কান) */}
        <div className="hidden lg:flex col-span-3 flex-col justify-center text-xs font-sans-bn border-r border-stone-300 pr-3 space-y-1 bg-stone-100/60 p-2 rounded-xs border-y border-stone-200">
          <div className="flex items-center gap-1 text-red-800 font-bold text-[11px] uppercase tracking-wide">
            <Globe className="w-3 h-3" />
            <span>অনলাইন ডিজিটাল পোর্টাল</span>
          </div>
          <div className="font-bold text-stone-900 text-xs">ajkerdigonto.com.bd</div>
          <div className="text-[10px] text-stone-600 leading-tight">
            সার্বক্ষণিক লাইভ ব্রেকিং নিউজ ও ভিডিও বিশ্লেষণ
          </div>
          <div className="text-[9px] text-stone-400 pt-0.5">
            {info.regNo} · {info.foundedYear}
          </div>
        </div>

        {/* Center: Iconic Newspaper Brand Mark */}
        <div className="col-span-12 lg:col-span-6 text-center flex flex-col items-center justify-center relative py-1">
          {showEditorAffordance && onEditClick && (
            <button
              onClick={onEditClick}
              className="absolute -top-2 right-0 text-[11px] font-sans-bn bg-amber-100 hover:bg-amber-200 text-amber-950 font-semibold px-2 py-0.5 rounded border border-amber-300 transition-colors shadow-xs"
              title="মাস্টহেড তথ্য পরিবর্তন করুন"
            >
              হেড এডিট
            </button>
          )}

          <div className="inline-block relative">
            <div className="text-center">
              <span className="text-xs sm:text-sm font-serif-bn font-bold tracking-widest text-red-800 uppercase block mb-0.5">
                জাতীয় দৈনিক পত্রিকা
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-serif-bn text-stone-950 tracking-tight leading-none py-0.5">
                <span className="text-red-800">দৈনিক</span> আজকের দিগন্ত
              </h1>
            </div>

            <div className="flex items-center justify-center gap-2 mt-1.5">
              <div className="h-[1.5px] w-10 sm:w-16 bg-red-800"></div>
              <p className="text-xs sm:text-sm font-serif-bn text-stone-700 tracking-wide font-medium">
                {info.tagline}
              </p>
              <div className="h-[1.5px] w-10 sm:w-16 bg-red-800"></div>
            </div>
          </div>
        </div>

        {/* Right Ear Panel (প্রথম আলোর ডান কান) */}
        <div className="hidden lg:flex col-span-3 flex-col justify-center items-end text-xs font-sans-bn border-l border-stone-300 pl-3 space-y-1 bg-stone-100/60 p-2 rounded-xs border-y border-stone-200 text-right">
          <div className="flex items-center gap-1 text-stone-800 font-bold text-[11px]">
            <PhoneCall className="w-3 h-3 text-red-700" />
            <span>গ্রাহক সেবা ও বিজ্ঞাপন</span>
          </div>
          <div className="font-bold text-red-900 text-xs">হটলাইন: ১৬৫৫৫</div>
          <div className="text-[10px] text-stone-600 leading-tight">
            প্রধান সম্পাদক: <span className="font-semibold text-stone-900">{info.chiefEditor}</span>
          </div>
          {/* Simulated Barcode */}
          <div className="pt-0.5 flex flex-col items-end">
            <div className="flex items-end gap-[1.5px] h-4 opacity-80">
              {[2, 1, 3, 2, 1, 4, 1, 3, 2, 1, 2, 3, 1, 4, 2].map((w, idx) => (
                <div key={idx} className="bg-stone-900" style={{ width: `${w}px`, height: '100%' }} />
              ))}
            </div>
            <span className="text-[8px] font-mono text-stone-500">ISSN 2617-4812</span>
          </div>
        </div>
      </div>

      {/* Prothom-Alo Style "আজকের পাতায় পাতায়" (On Pages Today) Interactive Navigation Bar */}
      <div className="bg-stone-900 text-stone-100 text-xs px-3 py-1.5 flex items-center justify-between rounded-sm font-sans-bn">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="bg-red-700 text-white font-bold px-2 py-0.5 text-[10px] tracking-wider shrink-0 rounded-xs">
            আজকের পাতায় পাতায়
          </span>
          <div className="flex items-center gap-2.5 text-stone-300 text-[11px] whitespace-nowrap overflow-x-auto no-scrollbar">
            {[
              { p: 1, label: '১. প্রচ্ছদ' },
              { p: 2, label: '২. সম্পাদকীয়' },
              { p: 3, label: '৩. জাতীয়' },
              { p: 4, label: '৪. নগর' },
              { p: 5, label: '৫. অর্থনীতি' },
              { p: 6, label: '৬. বিশ্ব' },
              { p: 7, label: '৭. খেলা' },
              { p: 8, label: '৮. বিনোদন' },
              { p: 9, label: '৯. প্রযুক্তি' },
              { p: 10, label: '১০. স্বাস্থ্য' },
              { p: 11, label: '১১. ক্যাম্পাস' },
              { p: 12, label: '১২. সাহিত্য' },
              { p: 13, label: '১৩. সারাদেশ' },
              { p: 14, label: '১৪. আইন' },
              { p: 15, label: '১৫. ঐতিহ্য' },
              { p: 16, label: '১৬. শেষ পাতা' },
            ].map(({ p, label }) => (
              <button
                key={p}
                onClick={() => onSelectPage && onSelectPage(p)}
                className="hover:text-red-400 hover:underline transition-colors cursor-pointer text-stone-300"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-stone-300 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ই-পেপার ঢাকা ও জাতীয় সংস্করণ</span>
        </div>
      </div>
    </header>
  );
};
