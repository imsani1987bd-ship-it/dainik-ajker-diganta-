import React, { useState, useEffect } from 'react';
import { NewspaperEdition, Article, NewspaperPage, MastheadInfo, Advertisement, ReadHistoryItem } from './types/newspaper';
import { initialNewspaperEdition } from './data/defaultNewspaper';
import { BroadsheetPage, toBanglaNumber } from './components/BroadsheetPage';
import { PageNavigationBar } from './components/PageNavigationBar';
import { ArticleModal } from './components/ArticleModal';
import { ClippingCardModal } from './components/ClippingCardModal';
import { ArchiveCalendarModal } from './components/ArchiveCalendarModal';
import { StudioDrawer } from './components/StudioDrawer';
import { ThumbnailStrip } from './components/ThumbnailStrip';
import { SearchModal } from './components/SearchModal';
import { ReadHistoryDrawer } from './components/ReadHistoryDrawer';
import { Scissors, Sparkles, X, BookOpen, Layers } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'ajker_digonto_edition_v3';
const HISTORY_STORAGE_KEY = 'ajker_digonto_read_history_v1';

export default function App() {
  // Main Edition state
  const [edition, setEdition] = useState<NewspaperEdition>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.masthead && Array.isArray(parsed?.pages) && parsed.pages.length === 16) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load saved edition:', e);
    }
    return initialNewspaperEdition;
  });

  // Recently Viewed / Read History state
  const [readHistory, setReadHistory] = useState<ReadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load read history:', e);
    }
    return [];
  });

  // Navigation & View States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [paperTheme, setPaperTheme] = useState<'classic' | 'white' | 'night'>('classic');
  const [isSpreadView, setIsSpreadView] = useState<boolean>(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [clippingArticle, setClippingArticle] = useState<Article | null>(null);
  const [isCreatorMode, setIsCreatorMode] = useState<boolean>(false);
  const [isCropMode, setIsCropMode] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Save edition to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(edition));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [edition]);

  // Save read history to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(readHistory));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [readHistory]);

  // Set of already read article IDs
  const readArticleIds = new Set(readHistory.map((item) => item.articleId));

  // Keyboard navigation for pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'Escape') {
        setIsHistoryOpen(false);
        setIsSearchOpen(false);
        setIsCalendarOpen(false);
        return;
      }

      const step = isSpreadView ? 2 : 1;

      if (e.key === 'ArrowRight' && !selectedArticle && !clippingArticle && !isSearchOpen && !isCalendarOpen && !isHistoryOpen) {
        setCurrentPage((prev) => Math.min(16, prev + step));
      } else if (e.key === 'ArrowLeft' && !selectedArticle && !clippingArticle && !isSearchOpen && !isCalendarOpen && !isHistoryOpen) {
        setCurrentPage((prev) => Math.max(1, prev - step));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedArticle, clippingArticle, isSearchOpen, isCalendarOpen, isHistoryOpen, isSpreadView]);

  // Current page data calculation for single vs spread view
  const currentPageData = edition.pages.find((p) => p.pageNumber === currentPage) || edition.pages[0];

  // In Spread View: calculate left and right pages
  let leftPageData: NewspaperPage = currentPageData;
  let rightPageData: NewspaperPage | null = null;

  if (isSpreadView) {
    if (currentPage === 1) {
      leftPageData = edition.pages[0];
      rightPageData = null;
    } else if (currentPage >= 16) {
      leftPageData = edition.pages[15];
      rightPageData = null;
    } else {
      const baseEven = currentPage % 2 === 0 ? currentPage : currentPage - 1;
      leftPageData = edition.pages[baseEven - 1] || edition.pages[0];
      rightPageData = edition.pages[baseEven] || null;
    }
  }

  // Page titles map
  const pageTitles: { [key: number]: string } = {};
  edition.pages.forEach((p) => {
    pageTitles[p.pageNumber] = p.title;
  });

  // Track Article Read
  const trackArticleRead = (art: Article) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'সন্ধ্যা' : 'সকাল';
    const displayHours = hours % 12 || 12;
    const timeFormatted = `${toBanglaNumber(displayHours)}:${toBanglaNumber(minutes < 10 ? '0' + minutes : minutes)} (${ampm})`;

    const newItem: ReadHistoryItem = {
      articleId: art.id,
      pageNumber: art.pageNumber,
      headline: art.headline,
      kicker: art.kicker,
      byline: art.byline,
      timestamp: Date.now(),
      timeFormatted,
    };

    setReadHistory((prev) => {
      const filtered = prev.filter((item) => item.articleId !== art.id);
      return [newItem, ...filtered].slice(0, 50);
    });
  };

  // Article selection handler
  const handleArticleClick = (art: Article) => {
    trackArticleRead(art);
    if (isCropMode) {
      setClippingArticle(art);
    } else {
      setSelectedArticle(art);
    }
  };

  // History item select handler
  const handleSelectHistoryItem = (articleId: string, pageNumber: number) => {
    setCurrentPage(pageNumber);
    const targetPage = edition.pages.find((p) => p.pageNumber === pageNumber);
    const targetArticle = targetPage?.articles.find((a) => a.id === articleId);
    if (targetArticle) {
      setSelectedArticle(targetArticle);
    }
  };

  // Masthead updates
  const handleUpdateMasthead = (newMasthead: MastheadInfo) => {
    setEdition((prev) => ({
      ...prev,
      masthead: newMasthead,
    }));
  };

  const handleSelectEdition = (editionName: string) => {
    setEdition((prev) => ({
      ...prev,
      masthead: {
        ...prev.masthead,
        edition: editionName,
      },
    }));
  };

  const handleSelectDate = (dates: { banglaDate: string; englishDate: string; hijriDate: string }) => {
    setEdition((prev) => ({
      ...prev,
      masthead: {
        ...prev.masthead,
        banglaDate: dates.banglaDate,
        englishDate: dates.englishDate,
        hijriDate: dates.hijriDate,
      },
    }));
  };

  const handleSaveArticle = (article: Article) => {
    setEdition((prev) => {
      const newPages = prev.pages.map((p) => {
        if (p.pageNumber === article.pageNumber) {
          const exists = p.articles.some((a) => a.id === article.id);
          const newArticles = exists
            ? p.articles.map((a) => (a.id === article.id ? article : a))
            : [article, ...p.articles];
          return {
            ...p,
            articles: newArticles,
          };
        }
        return p;
      });
      return { ...prev, pages: newPages };
    });
    setEditingArticle(null);
  };

  const handleDeleteArticle = (articleId: string, pageNumber: number) => {
    setEdition((prev) => {
      const newPages = prev.pages.map((p) => {
        if (p.pageNumber === pageNumber) {
          return {
            ...p,
            articles: p.articles.filter((a) => a.id !== articleId),
          };
        }
        return p;
      });
      return { ...prev, pages: newPages };
    });
    setEditingArticle(null);
  };

  const handleAddAdvertisement = (ad: Advertisement) => {
    setEdition((prev) => {
      const newPages = prev.pages.map((p) => {
        if (p.pageNumber === ad.pageNumber) {
          return {
            ...p,
            ads: [...p.ads, ad],
          };
        }
        return p;
      });
      return { ...prev, pages: newPages };
    });
  };

  const handleResetToDefault = () => {
    setEdition(initialNewspaperEdition);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const handleImportEdition = (imported: NewspaperEdition) => {
    setEdition(imported);
  };

  // Zoom handlers
  const handleZoomChange = (delta: number) => {
    setZoomLevel((prev) => {
      const next = Math.round((prev + delta) * 10) / 10;
      return Math.min(1.5, Math.max(0.6, next));
    });
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
  };

  // Print current page
  const handlePrint = () => {
    window.print();
  };

  // Modal Article Navigation within current page
  const currentArticleIndex = selectedArticle
    ? currentPageData.articles.findIndex((a) => a.id === selectedArticle.id)
    : -1;

  const handlePrevArticle =
    currentArticleIndex > 0
      ? () => {
          const prevArt = currentPageData.articles[currentArticleIndex - 1];
          trackArticleRead(prevArt);
          setSelectedArticle(prevArt);
        }
      : undefined;

  const handleNextArticle =
    currentArticleIndex >= 0 && currentArticleIndex < currentPageData.articles.length - 1
      ? () => {
          const nextArt = currentPageData.articles[currentArticleIndex + 1];
          trackArticleRead(nextArt);
          setSelectedArticle(nextArt);
        }
      : undefined;

  // Paper Theme Classes
  const themeClasses = {
    classic: 'paper-classic',
    white: 'paper-white',
    night: 'paper-night',
  }[paperTheme];

  return (
    <div className={`min-h-screen flex flex-col font-sans-bn transition-colors duration-200 ${themeClasses}`}>
      {/* Top Operations Bar (প্রথম আলো স্টাইল) */}
      <PageNavigationBar
        currentPage={currentPage}
        totalPages={16}
        zoomLevel={zoomLevel}
        paperTheme={paperTheme}
        isCreatorMode={isCreatorMode}
        isCropMode={isCropMode}
        isSpreadView={isSpreadView}
        readCount={readHistory.length}
        currentEdition={edition.masthead.edition}
        banglaDate={edition.masthead.banglaDate}
        onPageChange={(p) => {
          setCurrentPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onZoomChange={handleZoomChange}
        onResetZoom={handleResetZoom}
        onPaperThemeChange={setPaperTheme}
        onToggleCreatorMode={() => setIsCreatorMode((prev) => !prev)}
        onToggleCropMode={() => setIsCropMode((prev) => !prev)}
        onToggleSpreadView={() => setIsSpreadView((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onSelectEdition={handleSelectEdition}
        onPrint={handlePrint}
        pageTitles={pageTitles}
      />

      {/* Crop Mode Banner Notification */}
      {isCropMode && (
        <div className="bg-red-800 text-white px-4 py-2 text-xs flex items-center justify-between no-print shadow-md font-sans-bn">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 animate-bounce text-amber-300" />
            <span className="font-bold">প্রথম আলো স্টাইল ক্লিপিং মোড সক্রিয়:</span>
            <span>যেকোনো সংবাদের উপর ক্লিক করুন — তাৎক্ষণিক ওয়াটারমার্কযুক্ত কাটিং ছবি হিসেবে সেভ ও শেয়ার করতে পারবেন।</span>
          </div>
          <button
            onClick={() => setIsCropMode(false)}
            className="text-stone-200 hover:text-white bg-red-900 px-2 py-0.5 rounded text-[11px] flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>মোড বন্ধ করুন</span>
          </button>
        </div>
      )}

      {/* Main Broadsheet Reading / Editing Viewport */}
      <main className="flex-1 w-full overflow-x-auto py-5 px-2 sm:px-6 pb-28">
        <div
          className="broadsheet-canvas mx-auto"
          style={{
            transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined,
          }}
        >
          {isSpreadView && rightPageData ? (
            /* Dual-Page Spread View: Two pages side-by-side like reading real broadsheet */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-[1700px] mx-auto">
              <div className="border-r-0 lg:border-r-2 border-stone-400 lg:pr-8">
                <BroadsheetPage
                  page={leftPageData}
                  masthead={edition.masthead}
                  isCreatorMode={isCreatorMode}
                  totalPages={16}
                  readArticleIds={readArticleIds}
                  onSelectArticle={handleArticleClick}
                  onClipArticle={(art) => {
                    trackArticleRead(art);
                    setClippingArticle(art);
                  }}
                  onEditArticle={(art) => {
                    setEditingArticle(art);
                    setIsCreatorMode(true);
                  }}
                  onAddArticle={(pNum) => {
                    setEditingArticle(null);
                    setIsCreatorMode(true);
                  }}
                  onEditMasthead={() => setIsCreatorMode(true)}
                  onOpenCalendar={() => setIsCalendarOpen(true)}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>

              <div>
                <BroadsheetPage
                  page={rightPageData}
                  masthead={edition.masthead}
                  isCreatorMode={isCreatorMode}
                  totalPages={16}
                  hideMasthead={true}
                  readArticleIds={readArticleIds}
                  onSelectArticle={handleArticleClick}
                  onClipArticle={(art) => {
                    trackArticleRead(art);
                    setClippingArticle(art);
                  }}
                  onEditArticle={(art) => {
                    setEditingArticle(art);
                    setIsCreatorMode(true);
                  }}
                  onAddArticle={(pNum) => {
                    setEditingArticle(null);
                    setIsCreatorMode(true);
                  }}
                  onEditMasthead={() => setIsCreatorMode(true)}
                  onOpenCalendar={() => setIsCalendarOpen(true)}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            </div>
          ) : (
            /* Single Page View */
            <BroadsheetPage
              page={currentPageData}
              masthead={edition.masthead}
              isCreatorMode={isCreatorMode}
              totalPages={16}
              readArticleIds={readArticleIds}
              onSelectArticle={handleArticleClick}
              onClipArticle={(art) => {
                trackArticleRead(art);
                setClippingArticle(art);
              }}
              onEditArticle={(art) => {
                setEditingArticle(art);
                setIsCreatorMode(true);
              }}
              onAddArticle={(pNum) => {
                setEditingArticle(null);
                setIsCreatorMode(true);
              }}
              onEditMasthead={() => {
                setIsCreatorMode(true);
              }}
              onOpenCalendar={() => setIsCalendarOpen(true)}
              onPageChange={(p) => {
                setCurrentPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </div>
      </main>

      {/* 16-Page Bottom Visual Thumbnail Strip */}
      <ThumbnailStrip
        pages={edition.pages}
        currentPage={currentPage}
        onSelectPage={(pNum) => {
          setCurrentPage(pNum);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Article Full Modal */}
      <ArticleModal
        article={selectedArticle}
        masthead={edition.masthead}
        onClose={() => setSelectedArticle(null)}
        onPrevArticle={handlePrevArticle}
        onNextArticle={handleNextArticle}
      />

      {/* Prothom-Alo Style Clipping Card Modal (ডাউনলোড ও শেয়ার কাটিং) */}
      <ClippingCardModal
        isOpen={Boolean(clippingArticle)}
        article={clippingArticle}
        masthead={edition.masthead}
        onClose={() => setClippingArticle(null)}
      />

      {/* Archive Calendar Modal */}
      <ArchiveCalendarModal
        isOpen={isCalendarOpen}
        currentDateText={edition.masthead.banglaDate}
        onClose={() => setIsCalendarOpen(false)}
        onSelectDate={handleSelectDate}
      />

      {/* Recently Viewed / Read History Sidebar Drawer */}
      <ReadHistoryDrawer
        isOpen={isHistoryOpen}
        history={readHistory}
        onClose={() => setIsHistoryOpen(false)}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={() => setReadHistory([])}
        onRemoveItem={(artId) =>
          setReadHistory((prev) => prev.filter((item) => item.articleId !== artId))
        }
      />

      {/* E-Paper Studio / Creator Drawer */}
      <StudioDrawer
        isOpen={isCreatorMode}
        edition={edition}
        currentPageNumber={currentPage}
        editingArticle={editingArticle}
        onClose={() => {
          setIsCreatorMode(false);
          setEditingArticle(null);
        }}
        onUpdateMasthead={handleUpdateMasthead}
        onSaveArticle={handleSaveArticle}
        onDeleteArticle={handleDeleteArticle}
        onAddAdvertisement={handleAddAdvertisement}
        onResetToDefault={handleResetToDefault}
        onImportEdition={handleImportEdition}
        onSelectPage={(pNum) => setCurrentPage(pNum)}
      />

      {/* Search Modal across all 16 pages */}
      <SearchModal
        isOpen={isSearchOpen}
        edition={edition}
        onClose={() => setIsSearchOpen(false)}
        onSelectArticle={(art, pNum) => {
          setCurrentPage(pNum);
          setSelectedArticle(art);
        }}
      />
    </div>
  );
}
