import React from 'react';
import { NewspaperPage, Article, Advertisement, MastheadInfo } from '../types/newspaper';
import { Masthead } from './Masthead';
import {
  ChevronLeft,
  ChevronRight,
  Scissors,
  Plus,
  Edit2,
  User,
  Printer,
  Sparkles,
  Check,
} from 'lucide-react';

interface BroadsheetPageProps {
  page: NewspaperPage;
  masthead: MastheadInfo;
  isCreatorMode?: boolean;
  totalPages?: number;
  hideMasthead?: boolean;
  readArticleIds?: Set<string>;
  onSelectArticle: (article: Article) => void;
  onClipArticle?: (article: Article) => void;
  onEditArticle?: (article: Article) => void;
  onAddArticle?: (pageNumber: number) => void;
  onEditMasthead?: () => void;
  onOpenCalendar?: () => void;
  onPageChange?: (page: number) => void;
}

const banglaDigits: { [key: string]: string } = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

export const toBanglaNumber = (num: number | string): string => {
  return String(num).replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
};

export const BroadsheetPage: React.FC<BroadsheetPageProps> = ({
  page,
  masthead,
  isCreatorMode = false,
  totalPages = 16,
  hideMasthead = false,
  readArticleIds,
  onSelectArticle,
  onClipArticle,
  onEditArticle,
  onAddArticle,
  onEditMasthead,
  onOpenCalendar,
  onPageChange,
}) => {
  return (
    <article
      id={`broadsheet-page-${page.pageNumber}`}
      className="w-full max-w-5xl mx-auto bg-inherit transition-all duration-200 relative select-text"
    >
      {/* Floating Side Page-Turners (প্রথম আলো স্টাইল পাতা পরিবর্তনের তীরচিহ্ন) */}
      {onPageChange && page.pageNumber > 1 && !hideMasthead && (
        <button
          onClick={() => onPageChange(page.pageNumber - 1)}
          className="fixed left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-stone-900/80 hover:bg-red-800 text-white p-2.5 sm:p-3 rounded-full shadow-xl backdrop-blur transition-all duration-150 hidden md:flex items-center justify-center group cursor-pointer"
          title={`পূর্ববর্তী পাতা (${toBanglaNumber(page.pageNumber - 1)})`}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      )}

      {onPageChange && page.pageNumber < totalPages && !hideMasthead && (
        <button
          onClick={() => onPageChange(page.pageNumber + 1)}
          className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-stone-900/80 hover:bg-red-800 text-white p-2.5 sm:p-3 rounded-full shadow-xl backdrop-blur transition-all duration-150 hidden md:flex items-center justify-center group cursor-pointer"
          title={`পরবর্তী পাতা (${toBanglaNumber(page.pageNumber + 1)})`}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* If Page 1, render the iconic Masthead */}
      {page.pageNumber === 1 && !hideMasthead && (
        <Masthead
          info={masthead}
          onEditClick={onEditMasthead}
          onOpenCalendar={onOpenCalendar}
          onSelectPage={onPageChange}
          showEditorAffordance={isCreatorMode}
        />
      )}

      {/* Page Header Strip for all pages with direct Print/PDF affordance */}
      <div className="border-y-2 border-stone-900 py-1.5 px-2 mb-4 flex items-center justify-between text-xs font-sans-bn text-stone-800 bg-stone-100/50">
        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-950 font-serif-bn tracking-tight text-sm">
            {masthead.paperName}
          </span>
          <span className="text-stone-300">|</span>
          <span className="bg-red-800 text-white font-bold px-2 py-0.5 rounded text-[11px]">
            পৃষ্ঠা {toBanglaNumber(page.pageNumber)}
          </span>
          <span className="font-bold text-stone-950 text-sm hidden sm:inline">
            {page.title}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-stone-600 text-[11px]">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 text-[11px] text-stone-700 hover:text-stone-950 bg-white/90 hover:bg-white px-2 py-0.5 rounded border border-stone-300 transition-colors cursor-pointer no-print"
            title="এই পাতাটি প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন"
          >
            <Printer className="w-3 h-3 text-red-800" />
            <span className="hidden sm:inline">পাতা PDF / প্রিন্ট</span>
          </button>
          <span className="italic hidden md:inline text-stone-700">{page.subtitle}</span>
          <span className="text-stone-300 hidden md:inline">|</span>
          <span className="font-medium">{masthead.banglaDate}</span>
          <span className="text-stone-300">|</span>
          <span className="font-semibold text-stone-900">{masthead.edition}</span>
        </div>
      </div>

      {/* Creator Mode Quick Action Bar */}
      {isCreatorMode && (
        <div className="bg-amber-50 border border-amber-300 rounded p-2.5 mb-4 flex items-center justify-between font-sans-bn text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
            <span>
              পৃষ্ঠা {toBanglaNumber(page.pageNumber)} এডিটর মোড সক্রিয় (মোট সংবাদ:{' '}
              {toBanglaNumber(page.articles.length)})
            </span>
          </div>
          <button
            onClick={() => onAddArticle && onAddArticle(page.pageNumber)}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white px-3 py-1.5 rounded font-medium shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            নতুন সংবাদ যোগ করুন
          </button>
        </div>
      )}

      {/* Main Newspaper Grid with Authentic Prothom-Alo Hover Boundaries */}
      <div className="grid grid-cols-12 gap-x-6 gap-y-6">
        {/* Render Articles */}
        {page.articles.map((art) => {
          const colClass =
            art.colSpan === 12
              ? 'col-span-12'
              : art.colSpan === 8
              ? 'col-span-12 lg:col-span-8'
              : art.colSpan === 6
              ? 'col-span-12 md:col-span-6'
              : art.colSpan === 4
              ? 'col-span-12 md:col-span-6 lg:col-span-4'
              : 'col-span-12 sm:col-span-6 lg:col-span-3';

          return (
            <section
              key={art.id}
              className={`${colClass} flex flex-col justify-between border-b lg:border-b-0 border-stone-200 pb-5 lg:pb-0 relative group`}
            >
              {/* Creator Edit Trigger */}
              {isCreatorMode && onEditArticle && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditArticle(art);
                  }}
                  className="absolute top-1 right-1 z-20 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-sans-bn px-2 py-0.5 rounded shadow opacity-90 hover:opacity-100 flex items-center gap-1 cursor-pointer"
                  title="এই সংবাদটি এডিট করুন"
                >
                  <Edit2 className="w-3 h-3" />
                  এডিট
                </button>
              )}

              {/* Clickable News Box with Prothom-Alo Style Hover Outline & Tooltip */}
              <div
                onClick={() => onSelectArticle(art)}
                className={`cursor-pointer transition-all duration-150 p-2.5 -m-1 rounded-xs relative group/box hover:ring-2 hover:ring-red-600 hover:bg-red-50/30 ${
                  art.highlightBox ? 'border-2 border-stone-900 p-3 bg-stone-50/50' : ''
                }`}
              >
                {/* Floating "ক্লিপিং পড়ুন" Indicator on Hover (প্রথম আলো স্টাইল) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover/box:opacity-100 transition-opacity z-10 flex items-center gap-1 bg-red-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md pointer-events-none">
                  <Scissors className="w-3 h-3" />
                  <span>ক্লিপিং পড়ুন</span>
                </div>

                {/* Kicker Tag */}
                {art.kicker && (
                  <div className="text-xs font-bold text-red-800 tracking-wider font-sans-bn mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-800 inline-block"></span>
                    <span>{art.kicker}</span>
                  </div>
                )}

                {/* Headline */}
                <h2
                  className={`font-serif-bn font-black text-stone-950 leading-[1.22] tracking-tight group-hover/box:text-red-900 transition-colors ${
                    art.isLeadStory
                      ? 'text-2xl sm:text-3xl lg:text-4xl mb-2'
                      : art.colSpan >= 8
                      ? 'text-xl sm:text-2xl mb-1.5'
                      : 'text-lg sm:text-xl mb-1.5'
                  }`}
                  style={{ textWrap: 'balance' }}
                >
                  {art.headline}
                </h2>

                {/* Subheadline / Strap */}
                {art.subheadline && (
                  <p className="text-sm font-sans-bn font-semibold text-stone-700 leading-snug mb-2.5">
                    {art.subheadline}
                  </p>
                )}

                {/* Lead Image if Present with Photojournalist Credit */}
                {art.imageUrl && (
                  <figure className="my-2.5 overflow-hidden rounded-xs border border-stone-300 bg-stone-100 relative group/img">
                    <img
                      src={art.imageUrl}
                      alt={art.imageCaption || art.headline}
                      referrerPolicy="no-referrer"
                      className="w-full object-cover max-h-80 group-hover/img:scale-[1.01] transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="flex items-center justify-between text-[10px] font-sans-bn text-stone-600 bg-stone-100/95 px-2 py-1 border-t border-stone-200">
                      <span className="italic truncate mr-2">{art.imageCaption || 'ফোকাস বাংলা'}</span>
                      <span className="font-semibold text-stone-700 shrink-0">ছবি: আজকের দিগন্ত</span>
                    </div>
                  </figure>
                )}

                {/* Bylines & Metadata */}
                <div className="flex items-center gap-2 text-[11px] font-sans-bn text-stone-500 mb-2 border-b border-stone-200 pb-1 flex-wrap">
                  <span className="font-bold text-stone-900 flex items-center gap-1">
                    <User className="w-3 h-3 text-stone-700" />
                    {art.byline}
                  </span>
                  {art.location && (
                    <>
                      <span>·</span>
                      <span className="text-stone-700 font-medium">{art.location}</span>
                    </>
                  )}
                  <span>·</span>
                  <span className="text-red-700 font-bold group-hover/box:underline">
                    বিস্তারিত পাঠ ও কাটিং
                  </span>
                  {readArticleIds?.has(art.id) && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5 text-[10px] bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                        পঠিত
                      </span>
                    </>
                  )}
                </div>

                {/* Article Prose Preview */}
                <div className="text-stone-800 text-[13px] leading-relaxed font-sans-bn space-y-2">
                  {art.content.slice(0, art.isLeadStory ? 3 : 2).map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      className={
                        pIdx === 0 && art.isLeadStory
                          ? 'drop-cap text-stone-900 font-serif-bn text-[14px]'
                          : 'line-clamp-4'
                      }
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Bottom hairline */}
              <div className="h-[1px] w-full bg-stone-200 mt-3"></div>
            </section>
          );
        })}

        {/* Page 2 Editorial Special Cartoon & Quote Box */}
        {page.pageNumber === 2 && (
          <aside className="col-span-12 md:col-span-6 lg:col-span-4 border-2 border-stone-900 p-3 bg-stone-100/90 font-sans-bn rounded-xs self-start">
            <div className="flex items-center justify-between border-b-2 border-stone-900 pb-1 mb-2">
              <h3 className="font-serif-bn font-bold text-sm text-stone-950">আজকের সম্পাদকীয় ব্যঙ্গচিত্র</h3>
              <span className="text-[10px] text-red-800 font-bold">কার্টুন: দিগন্ত ব্যুরো</span>
            </div>
            <div className="border border-stone-300 bg-white p-3 rounded text-center my-2 space-y-1.5 shadow-xs">
              <div className="text-3xl py-1">🌿 🏙️ 🚗</div>
              <p className="font-serif-bn font-bold text-xs text-stone-900">“সবুজ হারানো নগরী ও অক্সিজেন খোঁজার প্রতিযোগিতা”</p>
              <p className="text-[10px] text-stone-500 italic">গাছ কেটে বহুতল ভবন, আর ছাদে প্লাস্টিকের কৃত্রিম টব!</p>
            </div>
            <div className="border-t border-stone-300 pt-2 text-xs">
              <span className="font-bold text-stone-900">আজকের বাণী:</span>
              <p className="italic text-stone-700 mt-0.5 leading-snug">
                “সত্যের পক্ষে অবিচল থাকাই একটি স্বাধীন ও নিরপেক্ষ সংবাদপত্রের প্রধান শক্তি।” — আহমেদ ফয়সাল চৌধুরী
              </p>
            </div>
          </aside>
        )}

        {/* Special Sidebar Box (if any) */}
        {page.specialSidebar && (
          <aside className="col-span-12 md:col-span-6 lg:col-span-4 border-2 border-stone-900 p-3 bg-stone-100/70 font-sans-bn rounded-xs self-start">
            <div className="flex items-center justify-between border-b-2 border-stone-900 pb-1.5 mb-2">
              <h3 className="font-serif-bn font-bold text-sm text-stone-950">
                {page.specialSidebar.title}
              </h3>
              <span className="text-[10px] text-red-800 font-bold">দৈনিক বিশেষ সেবা</span>
            </div>
            <div className="space-y-1.5 text-xs">
              {page.specialSidebar.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-stone-200 py-1 text-stone-800"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="font-semibold text-stone-950 font-mono tabular-nums">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Advertisements */}
        {page.ads.map((ad) => (
          <div
            key={ad.id}
            className="col-span-12 border-2 border-dashed border-stone-400 p-3 bg-amber-50/60 rounded font-sans-bn my-2"
          >
            <div className="flex items-center justify-between text-[10px] text-stone-500 uppercase tracking-widest border-b border-stone-200 pb-1 mb-1.5">
              <span>বিজ্ঞাপন / স্পন্সরড বার্তা</span>
              <span>{ad.clientName}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-serif-bn font-bold text-stone-900 text-sm">
                  {ad.title}
                </h4>
                {ad.text && (
                  <p className="text-xs text-stone-700 mt-0.5 max-w-2xl">{ad.text}</p>
                )}
              </div>
              {ad.phone && (
                <span className="font-semibold text-red-900 text-xs bg-white px-2.5 py-1 rounded border border-red-200 shadow-sm shrink-0">
                  {ad.phone}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Page Footer Rule */}
      <footer className="mt-8 pt-2 border-t-2 border-stone-900 flex items-center justify-between text-xs font-sans-bn text-stone-600 pb-8">
        <div>
          <span className="font-bold text-stone-900">{masthead.paperName}</span>
          <span className="mx-2">·</span>
          <span>পৃষ্ঠা {toBanglaNumber(page.pageNumber)}</span>
          <span className="mx-2">·</span>
          <span>{page.title}</span>
        </div>
        <div>
          <span>{masthead.officeAddress.split('|')[0]}</span>
        </div>
      </footer>
    </article>
  );
};
