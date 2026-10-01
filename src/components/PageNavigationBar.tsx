import React, { useState } from 'react';
import { toBanglaNumber } from './BroadsheetPage';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Search,
  PenTool,
  Calendar,
  Scissors,
  Layers,
  MapPin,
  ChevronDown,
  BookOpen,
  FileText,
  History,
} from 'lucide-react';

interface PageNavigationBarProps {
  currentPage: number;
  totalPages: number;
  zoomLevel: number;
  paperTheme: 'classic' | 'white' | 'night';
  isCreatorMode: boolean;
  isCropMode: boolean;
  isSpreadView: boolean;
  readCount: number;
  currentEdition: string;
  banglaDate: string;
  onPageChange: (page: number) => void;
  onZoomChange: (delta: number) => void;
  onResetZoom: () => void;
  onPaperThemeChange: (theme: 'classic' | 'white' | 'night') => void;
  onToggleCreatorMode: () => void;
  onToggleCropMode: () => void;
  onToggleSpreadView: () => void;
  onOpenSearch: () => void;
  onOpenCalendar: () => void;
  onOpenHistory: () => void;
  onSelectEdition: (editionName: string) => void;
  onPrint: () => void;
  pageTitles: { [key: number]: string };
}

const editionsList = [
  'ঢাকা ও জাতীয় সংস্করণ',
  'চট্টগ্রাম সংস্করণ',
  'রাজশাহী ও উত্তরবঙ্গ',
  'খুলনা ও দক্ষিণাঞ্চল',
  'সিলেট সংস্করণ',
  'আন্তর্জাতিক সংস্করণ',
];

export const PageNavigationBar: React.FC<PageNavigationBarProps> = ({
  currentPage,
  totalPages,
  zoomLevel,
  paperTheme,
  isCreatorMode,
  isCropMode,
  isSpreadView,
  readCount,
  currentEdition,
  banglaDate,
  onPageChange,
  onZoomChange,
  onResetZoom,
  onPaperThemeChange,
  onToggleCreatorMode,
  onToggleCropMode,
  onToggleSpreadView,
  onOpenSearch,
  onOpenCalendar,
  onOpenHistory,
  onSelectEdition,
  onPrint,
  pageTitles,
}) => {
  const [isEditionDropdownOpen, setIsEditionDropdownOpen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
    }
  };

  return (
    <nav aria-label="প্রধান নেভিগেশন ও ই-পেপার কন্ট্রোল" className="sticky top-0 z-40 bg-stone-950 text-stone-100 shadow-lg border-b-2 border-red-700 font-sans-bn no-print">
      {/* Top Primary Operational Bar (প্রথম আলো স্টাইল শীর্ষবার) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Brand & Edition Picker */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Brand Logo */}
          <div className="flex items-center gap-1.5">
            <span className="font-serif-bn font-black text-red-600 text-lg sm:text-xl tracking-tight leading-none">
              দৈনিক আজকের দিগন্ত
            </span>
            <span className="bg-red-800 text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase">
              ই-পেপার
            </span>
          </div>

          <span className="text-stone-700 hidden sm:inline">|</span>

          {/* Date & Archive Picker Button */}
          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1 text-xs text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 px-2 py-1 rounded border border-stone-800 transition-colors cursor-pointer"
            title="আর্কাইভ ক্যালেন্ডার থেকে তারিখ নির্বাচন করুন"
          >
            <Calendar className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden md:inline font-medium">{banglaDate.split(',')[0]}</span>
            <span className="md:hidden">আর্কাইভ</span>
            <ChevronDown className="w-3 h-3 text-stone-500" />
          </button>

          {/* Edition Dropdown (প্রথম আলো সংস্করণ নির্বাচক) */}
          <div className="relative">
            <button
              onClick={() => setIsEditionDropdownOpen(!isEditionDropdownOpen)}
              className="flex items-center gap-1 text-xs text-stone-200 bg-stone-900 hover:bg-stone-800 px-2 py-1 rounded border border-stone-800 transition-colors cursor-pointer"
              title="সংস্করণ পরিবর্তন করুন"
            >
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span className="font-semibold">{currentEdition.replace(' ও জাতীয় সংস্করণ', '')}</span>
              <ChevronDown className="w-3 h-3 text-stone-500" />
            </button>

            {isEditionDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-stone-900 border border-stone-700 rounded shadow-2xl py-1 z-50 text-xs">
                {editionsList.map((ed) => (
                  <button
                    key={ed}
                    onClick={() => {
                      onSelectEdition(ed);
                      setIsEditionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-stone-800 flex items-center justify-between ${
                      currentEdition === ed ? 'text-red-400 font-bold bg-stone-800/60' : 'text-stone-300'
                    }`}
                  >
                    <span>{ed}</span>
                    {currentEdition === ed && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Page Jump Dropdown & Prev/Next */}
        <div className="flex items-center gap-1.5 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-stone-800 text-stone-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="পূর্ববর্তী পাতা (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Select Dropdown */}
          <select
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            className="bg-transparent text-xs font-bold text-stone-100 px-1 py-1 focus:outline-none cursor-pointer"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <option key={pNum} value={pNum} className="bg-stone-900 text-stone-200">
                পৃষ্ঠা {toBanglaNumber(pNum)}: {pageTitles[pNum] || ''}
              </option>
            ))}
          </select>

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-1 rounded hover:bg-stone-800 text-stone-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="পরবর্তী পাতা (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action Tools: Crop, View Mode, Zoom, Fullscreen, Studio, Print */}
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {/* Spread View / Single View Toggle (স্প্রেড দুই পাতা ভিউ) */}
          <button
            onClick={onToggleSpreadView}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all cursor-pointer ${
              isSpreadView
                ? 'bg-stone-800 text-amber-300 border border-amber-400 font-bold'
                : 'bg-stone-900 text-stone-300 hover:text-white border border-stone-800'
            }`}
            title={isSpreadView ? 'এক পাতা ভিউতে ফিরুন' : 'দুই পাতা পাশাপাশি স্প্রেড ভিউ'}
          >
            {isSpreadView ? <BookOpen className="w-3.5 h-3.5 text-amber-400" /> : <FileText className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isSpreadView ? 'স্প্রেড ভিউ' : 'এক পাতা'}</span>
          </button>

          {/* Prothom-Alo Style Crop / Clipping Mode Toggle */}
          <button
            onClick={onToggleCropMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              isCropMode
                ? 'bg-red-700 text-white shadow-md ring-2 ring-red-400 animate-pulse'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700'
            }`}
            title="সংবাদ ক্লিপিং / কাটিং টুল সক্রিয় করুন"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isCropMode ? 'ক্লিপিং মোড চালু' : 'ক্লিপিং টুল'}</span>
          </button>

          {/* Recently Viewed / Read History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 hover:border-red-600 transition-colors cursor-pointer"
            title="পঠিত সংবাদের ইতিহাস (Recently Viewed)"
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">পঠিত</span>
            {readCount > 0 && (
              <span className="bg-red-700 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {toBanglaNumber(readCount)}
              </span>
            )}
          </button>

          {/* Maker Studio Toggle */}
          <button
            onClick={onToggleCreatorMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              isCreatorMode
                ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-300'
                : 'bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700'
            }`}
            title="ই-পেপার তৈরি ও সম্পাদনা স্টুডিও"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isCreatorMode ? 'স্টুডিও চালু' : 'পেজ মেকার'}</span>
          </button>

          {/* Search Button */}
          <button
            onClick={onOpenSearch}
            className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded border border-stone-800 transition-colors"
            title="সব পাতায় খুঁজুন"
          >
            <Search className="w-3.5 h-3.5 text-red-500" />
          </button>

          {/* Zoom controls */}
          <div className="hidden lg:flex items-center bg-stone-900 rounded border border-stone-800 p-0.5">
            <button
              onClick={() => onZoomChange(-0.1)}
              className="p-1 text-stone-300 hover:text-white hover:bg-stone-800 rounded transition-colors"
              title="জুম আউট"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onResetZoom}
              className="px-1.5 text-[11px] font-mono text-stone-300 hover:text-white"
              title="জুম স্বাভাবিক করুন"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={() => onZoomChange(0.1)}
              className="p-1 text-stone-300 hover:text-white hover:bg-stone-800 rounded transition-colors"
              title="জুম ইন"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded border border-stone-800 transition-colors"
            title="পূর্ণ পর্দা (Fullscreen)"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {/* Print Broadsheet */}
          <button
            onClick={onPrint}
            className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white rounded border border-stone-800 transition-colors"
            title="বর্তমান পাতা প্রিন্ট বা PDF সেভ করুন"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 16-Page Pills Bar (প্রথম আলো স্টাইল ১ থেকে ১৬ পাতা বাটন) */}
      <div className="bg-stone-900/90 border-t border-stone-800 px-2 sm:px-4 py-1 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center justify-start sm:justify-center gap-1 min-w-max">
          <span className="text-[10px] text-stone-400 mr-2 font-medium shrink-0 uppercase tracking-wider">
            ১৬ পাতা:
          </span>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isActive = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`relative px-2 py-0.5 text-xs rounded transition-all font-bold cursor-pointer ${
                  isActive
                    ? 'bg-red-700 text-white shadow-sm ring-1 ring-red-400'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
                }`}
                title={`পৃষ্ঠা ${toBanglaNumber(pageNum)}: ${pageTitles[pageNum] || ''}`}
              >
                <span>{toBanglaNumber(pageNum)}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
