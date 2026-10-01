import React, { useState } from 'react';
import { NewspaperPage } from '../types/newspaper';
import { toBanglaNumber } from './BroadsheetPage';
import { ChevronUp, ChevronDown, Layers, FileText } from 'lucide-react';

interface ThumbnailStripProps {
  pages: NewspaperPage[];
  currentPage: number;
  onSelectPage: (pageNumber: number) => void;
}

export const ThumbnailStrip: React.FC<ThumbnailStripProps> = ({
  pages,
  currentPage,
  onSelectPage,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-stone-900/95 backdrop-blur border-t-2 border-stone-800 text-stone-200 font-sans-bn no-print transition-all duration-300">
      {/* Drawer Toggle Bar */}
      <div className="max-w-7xl mx-auto px-4 py-1 flex items-center justify-between text-xs">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-red-500" />
          <span className="font-semibold">
            সম্পূর্ণ ১৬ পাতার থাম্বনেইল গ্যালারি
          </span>
          <span className="text-[11px] text-stone-400">
            ({toBanglaNumber(currentPage)} নং পাতা প্রদর্শিত)
          </span>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
          )}
        </button>

        <div className="text-[11px] text-stone-400 hidden sm:block">
          ক্লিক করে সরাসরি যেকোনো পাতায় যান
        </div>
      </div>

      {/* 16 Page Thumbnails Row */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 pb-2.5 pt-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {pages.map((page) => {
              const isSelected = page.pageNumber === currentPage;
              const leadArticle = page.articles[0];

              return (
                <button
                  key={page.pageNumber}
                  onClick={() => onSelectPage(page.pageNumber)}
                  className={`group relative text-left w-36 sm:w-40 p-2 rounded transition-all duration-150 border ${
                    isSelected
                      ? 'bg-stone-800 border-red-600 shadow-md ring-1 ring-red-500'
                      : 'bg-stone-950/70 border-stone-800 hover:border-stone-600 hover:bg-stone-800/80'
                  }`}
                >
                  {/* Page Indicator Tag */}
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span
                      className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                        isSelected
                          ? 'bg-red-700 text-white'
                          : 'bg-stone-800 text-stone-300 group-hover:text-white'
                      }`}
                    >
                      পাতা {toBanglaNumber(page.pageNumber)}
                    </span>
                    <span className="text-[10px] text-stone-400 truncate max-w-16">
                      {page.category}
                    </span>
                  </div>

                  {/* Page Title */}
                  <div className="text-xs font-serif-bn font-bold text-stone-100 truncate mb-0.5">
                    {page.title}
                  </div>

                  {/* Micro headline snippet */}
                  <div className="text-[10px] text-stone-400 line-clamp-2 leading-tight">
                    {leadArticle ? leadArticle.headline : 'খবরাখবর...'}
                  </div>

                  {/* Article count badge */}
                  <div className="mt-1.5 pt-1 border-t border-stone-800 text-[9px] text-stone-500 flex items-center justify-between">
                    <span>{toBanglaNumber(page.articles.length)}টি সংবাদ</span>
                    {page.ads.length > 0 && <span>বিজ্ঞাপন</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
