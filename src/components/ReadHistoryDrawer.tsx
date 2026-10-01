import React, { useState } from 'react';
import { ReadHistoryItem, Article } from '../types/newspaper';
import { toBanglaNumber } from './BroadsheetPage';
import {
  History,
  X,
  Trash2,
  ExternalLink,
  BookOpen,
  Clock,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface ReadHistoryDrawerProps {
  isOpen: boolean;
  history: ReadHistoryItem[];
  onClose: () => void;
  onSelectHistoryItem: (articleId: string, pageNumber: number) => void;
  onClearHistory: () => void;
  onRemoveItem: (articleId: string) => void;
}

export const ReadHistoryDrawer: React.FC<ReadHistoryDrawerProps> = ({
  isOpen,
  history,
  onClose,
  onSelectHistoryItem,
  onClearHistory,
  onRemoveItem,
}) => {
  const [filterText, setFilterText] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (!filterText.trim()) return true;
    const q = filterText.toLowerCase();
    return (
      item.headline.toLowerCase().includes(q) ||
      item.byline.toLowerCase().includes(q) ||
      (item.kicker && item.kicker.toLowerCase().includes(q))
    );
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex justify-end font-sans-bn"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-[460px] bg-stone-900 text-stone-100 shadow-2xl h-full flex flex-col border-l-2 border-red-700 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-900/60 rounded border border-red-700 text-red-300">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif-bn font-bold text-stone-100 leading-tight">
                পঠিত সংবাদ (Read History)
              </h2>
              <p className="text-xs text-stone-400">
                ইতিমধ্যে পড়া সংবাদসমূহের তালিকা ({toBanglaNumber(history.length)}টি)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        {history.length > 0 && (
          <div className="p-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="পঠিত সংবাদে খুঁজুন..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded pl-8 pr-3 py-1.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-red-600"
              />
            </div>

            <button
              onClick={() => {
                if (confirm('আপনি কি সমস্ত পঠিত সংবাদের তালিকা মুছে ফেলতে চান?')) {
                  onClearHistory();
                }
              }}
              className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-red-400 bg-stone-800/80 hover:bg-stone-800 px-2.5 py-1.5 rounded transition-colors cursor-pointer shrink-0"
              title="পুরো হিস্ট্রি মুছুন"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">সব মুছুন</span>
            </button>
          </div>
        )}

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400 space-y-3">
              <div className="p-4 bg-stone-800/50 rounded-full border border-stone-700">
                <BookOpen className="w-8 h-8 text-stone-500" />
              </div>
              <h3 className="font-serif-bn font-bold text-sm text-stone-200">
                কোনো পঠিত সংবাদ নেই
              </h3>
              <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
                ব্রডশিটের যেকোনো খবরে ক্লিক করলেই তা স্বয়ংক্রিয়ভাবে আপনার পঠিত তালিকায় সংরক্ষিত হবে।
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs">
              <p>“{filterText}” দিয়ে কোনো পঠিত সংবাদ পাওয়া যায়নি।</p>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.articleId}
                onClick={() => {
                  onSelectHistoryItem(item.articleId, item.pageNumber);
                  onClose();
                }}
                className="group p-3 bg-stone-800/70 hover:bg-stone-800 rounded border border-stone-750 hover:border-red-700 transition-all cursor-pointer relative"
              >
                {/* Top Meta */}
                <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-800 text-white font-bold px-1.5 py-0.2 rounded text-[10px]">
                      পৃষ্ঠা {toBanglaNumber(item.pageNumber)}
                    </span>
                    {item.kicker && (
                      <span className="text-red-400 font-semibold truncate max-w-36">
                        {item.kicker}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-stone-500 text-[10px]">
                    <Clock className="w-3 h-3" />
                    <span>{item.timeFormatted}</span>
                  </div>
                </div>

                {/* Headline */}
                <h4 className="font-serif-bn font-bold text-stone-100 text-sm group-hover:text-red-400 transition-colors leading-snug">
                  {item.headline}
                </h4>

                {/* Byline & Action */}
                <div className="mt-2 pt-1.5 border-t border-stone-700/60 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="truncate max-w-48">{item.byline}</span>

                  <div className="flex items-center gap-2">
                    <span className="text-red-400 group-hover:underline text-[10px] flex items-center gap-0.5">
                      পুনরায় পড়ুন
                      <ExternalLink className="w-2.5 h-2.5" />
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveItem(item.articleId);
                      }}
                      className="p-1 text-stone-500 hover:text-red-400 transition-colors"
                      title="তালিকা থেকে সরান"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        {history.length > 0 && (
          <div className="p-3 bg-stone-950 border-t border-stone-800 text-xs text-stone-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>স্বয়ংক্রিয়ভাবে সংরক্ষিত ইতিহাস</span>
            </span>
            <span className="text-[11px] text-stone-500">
              মোট: {toBanglaNumber(history.length)}টি
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
