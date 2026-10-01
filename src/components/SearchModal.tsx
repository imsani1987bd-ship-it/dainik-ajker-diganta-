import React, { useState, useMemo } from 'react';
import { NewspaperEdition, Article } from '../types/newspaper';
import { toBanglaNumber } from './BroadsheetPage';
import { Search, X, ChevronRight, FileText } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  edition: NewspaperEdition;
  onClose: () => void;
  onSelectArticle: (article: Article, pageNumber: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  edition,
  onClose,
  onSelectArticle,
}) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    const matches: { article: Article; pageNumber: number; matchSnippet: string }[] = [];

    edition.pages.forEach((page) => {
      page.articles.forEach((art) => {
        const inHeadline = art.headline.toLowerCase().includes(q);
        const inSubhead = art.subheadline?.toLowerCase().includes(q);
        const inByline = art.byline.toLowerCase().includes(q);
        const inContent = art.content.some((p) => p.toLowerCase().includes(q));

        if (inHeadline || inSubhead || inByline || inContent) {
          // Find best snippet
          let snippet = art.subheadline || '';
          if (inContent) {
            const matchedP = art.content.find((p) => p.toLowerCase().includes(q));
            if (matchedP) snippet = matchedP;
          }
          matches.push({
            article: art,
            pageNumber: page.pageNumber,
            matchSnippet: snippet,
          });
        }
      });
    });

    return matches;
  }, [query, edition]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border-2 border-stone-700 text-stone-100 w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden font-sans-bn flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-stone-800 flex items-center gap-3 bg-stone-950">
          <Search className="w-5 h-5 text-red-500 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="সম্পূর্ণ ১৬ পাতায় সংবাদ বা বিষয় খুঁজুন (যেমন: ক্রিকেট, বাজেট, মেট্রোরেল...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-stone-100 placeholder:text-stone-500 focus:outline-none text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-200 text-xs px-1.5 py-0.5"
            >
              মুছুন
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {!query.trim() ? (
            <div className="text-center py-10 text-stone-500 text-xs">
              <p>১৬ পাতার যেকোনো খবর, কলাম বা প্রতিবেদকের নাম লিখে অনুসন্ধান করুন</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              <p>“{query}” দিয়ে কোনো সংবাদ পাওয়া যায়নি। অন্য কোনো শব্দ দিয়ে চেষ্টা করুন।</p>
            </div>
          ) : (
            <div>
              <div className="text-xs text-stone-400 mb-3">
                মোট <span className="font-bold text-amber-400">{toBanglaNumber(searchResults.length)}</span>টি ফলাফল পাওয়া গেছে:
              </div>
              <div className="space-y-2">
                {searchResults.map(({ article, pageNumber, matchSnippet }, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onSelectArticle(article, pageNumber);
                      onClose();
                    }}
                    className="p-3 bg-stone-800/80 hover:bg-stone-800 rounded border border-stone-700 hover:border-red-600 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-stone-400">
                        <span className="bg-red-900 text-white font-bold px-1.5 py-0.2 rounded text-[10px]">
                          পৃষ্ঠা {toBanglaNumber(pageNumber)}
                        </span>
                        {article.kicker && (
                          <span className="text-red-400 font-semibold">{article.kicker}</span>
                        )}
                        <span>·</span>
                        <span>{article.byline}</span>
                      </div>
                      <h4 className="font-serif-bn font-bold text-stone-100 text-sm group-hover:text-amber-400 transition-colors">
                        {article.headline}
                      </h4>
                      {matchSnippet && (
                        <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                          {matchSnippet}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 shrink-0 mt-2 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
