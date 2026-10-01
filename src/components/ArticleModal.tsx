import React, { useState, useEffect, useRef } from 'react';
import { Article, MastheadInfo } from '../types/newspaper';
import { toBanglaNumber } from './BroadsheetPage';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Printer,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ArticleModalProps {
  article: Article | null;
  masthead: MastheadInfo;
  onClose: () => void;
  onPrevArticle?: () => void;
  onNextArticle?: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  masthead,
  onClose,
  onPrevArticle,
  onNextArticle,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isPausedSpeech, setIsPausedSpeech] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');

  const keepAliveTimerRef = useRef<any>(null);

  // Stop any active speech cleanly
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    setIsPlayingSpeech(false);
    setIsPausedSpeech(false);
  };

  // Keyboard navigation & clean up on unmount or ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopSpeech();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopSpeech();
    };
  }, [onClose]);

  // Clean up when article changes
  useEffect(() => {
    stopSpeech();
    setTtsError(null);
  }, [article?.id]);

  // Listen to voiceschanged event for Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const handleVoicesChanged = () => {
      // Voices loaded asynchronously in Chromium
    };
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  if (!article) return null;

  const handleShare = async () => {
    const shareText = `${article.headline}\n\nদৈনিক আজকের দিগন্ত - পৃষ্ঠা ${toBanglaNumber(
      article.pageNumber
    )}\n${window.location.href}`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setTtsError('আপনার ব্রাউজার টেক্সট-টু-স্পিচ (Web Speech API) সমর্থন করে না।');
      return;
    }

    if (isPlayingSpeech) {
      stopSpeech();
      return;
    }

    // Reset any previous speech
    window.speechSynthesis.cancel();
    setTtsError(null);

    // Build the full article text in Bengali
    const textParts: string[] = [];
    if (article.kicker) textParts.push(article.kicker);
    if (article.headline) textParts.push(article.headline);
    if (article.subheadline) textParts.push(article.subheadline);
    if (article.byline) textParts.push(article.byline);
    if (article.location) textParts.push(article.location);
    if (Array.isArray(article.content) && article.content.length > 0) {
      article.content.forEach((para) => {
        if (para && para.trim()) textParts.push(para.trim());
      });
    }

    const fullText = textParts.join('। ');
    const utterance = new SpeechSynthesisUtterance(fullText);

    // Find Bengali voice if available (bn-BD, bn-IN, bn)
    const voices = window.speechSynthesis.getVoices();
    const bnVoice =
      voices.find((v) => v.lang === 'bn-BD') ||
      voices.find((v) => v.lang === 'bn-IN') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('bn')) ||
      voices.find(
        (v) =>
          v.name.toLowerCase().includes('bangla') ||
          v.name.toLowerCase().includes('bengali')
      );

    if (bnVoice) {
      utterance.voice = bnVoice;
      utterance.lang = bnVoice.lang;
    } else {
      utterance.lang = 'bn-BD';
    }

    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsPlayingSpeech(true);
      setIsPausedSpeech(false);
    };

    utterance.onend = () => {
      stopSpeech();
    };

    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') {
        return;
      }
      console.warn('SpeechSynthesis error:', e);
      stopSpeech();
    };

    utterance.onpause = () => {
      setIsPausedSpeech(true);
    };

    utterance.onresume = () => {
      setIsPausedSpeech(false);
    };

    // Chrome keep-alive workaround to prevent speech synthesis timing out on longer texts
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
    }
    keepAliveTimerRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 12000);

    window.speechSynthesis.speak(utterance);
    setIsPlayingSpeech(true);
    setIsPausedSpeech(false);
  };

  const handlePauseResume = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPausedSpeech) {
      window.speechSynthesis.resume();
      setIsPausedSpeech(false);
    } else {
      window.speechSynthesis.pause();
      setIsPausedSpeech(true);
    }
  };

  const handleChangeRate = (newRate: number) => {
    setSpeechRate(newRate);
    if (isPlayingSpeech) {
      stopSpeech();
      setTimeout(() => {
        handleToggleSpeech();
      }, 60);
    }
  };

  const handlePrev = () => {
    stopSpeech();
    onPrevArticle?.();
  };

  const handleNext = () => {
    stopSpeech();
    onNextArticle?.();
  };

  const handlePrint = () => {
    window.print();
  };

  const fontClasses = {
    normal: 'text-base leading-relaxed',
    large: 'text-lg leading-relaxed',
    huge: 'text-xl leading-relaxed',
  }[fontSize];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-modal-title"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={() => {
        stopSpeech();
        onClose();
      }}
    >
      <div
        className="bg-[#faf7f2] text-stone-900 w-full max-w-3xl rounded-sm shadow-2xl border-4 border-stone-800 overflow-hidden my-auto max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Broadsheet Clipping Header */}
        <div className="bg-stone-900 text-stone-100 px-4 py-2.5 flex items-center justify-between border-b-2 border-red-800 shrink-0 font-sans-bn">
          <div className="flex items-center gap-2">
            <span className="font-serif-bn font-bold text-red-400 tracking-tight text-sm">
              {masthead.paperName}
            </span>
            <span className="text-stone-500">|</span>
            <span className="bg-stone-800 text-stone-300 text-xs px-2 py-0.5 rounded">
              সংবাদ ক্লিপিং · পৃষ্ঠা {toBanglaNumber(article.pageNumber)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Text-to-Speech 'Listen' Button */}
            <button
              onClick={handleToggleSpeech}
              data-testid="listen-button"
              aria-label={isPlayingSpeech ? 'Stop' : 'Listen'}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded shadow-xs transition-colors ${
                isPlayingSpeech
                  ? 'bg-red-700 hover:bg-red-800 text-white animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
              title={
                isPlayingSpeech
                  ? 'সংবাদ পাঠ থামান (Stop)'
                  : 'বাংলায় সংবাদটি শুনুন (Listen to article in Bengali)'
              }
            >
              {isPlayingSpeech ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-white" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-stone-950" />
                  <span>Listen</span>
                </>
              )}
            </button>

            {/* Font Size controls */}
            <div className="hidden sm:flex items-center bg-stone-800 rounded p-0.5">
              <button
                onClick={() => setFontSize('normal')}
                className={`px-1.5 py-0.5 text-xs rounded ${
                  fontSize === 'normal' ? 'bg-stone-600 text-white' : 'text-stone-400'
                }`}
                title="সাধারণ ফন্ট"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-1.5 py-0.5 text-xs rounded ${
                  fontSize === 'large' ? 'bg-stone-600 text-white' : 'text-stone-400'
                }`}
                title="বড় ফন্ট"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('huge')}
                className={`px-1.5 py-0.5 text-xs rounded ${
                  fontSize === 'huge' ? 'bg-stone-600 text-white' : 'text-stone-400'
                }`}
                title="সর্বোচ্চ বড় ফন্ট"
              >
                A++
              </button>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded transition-colors"
              title="কপি ও শেয়ার করুন"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded transition-colors"
              title="ক্লিপিং প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="p-1.5 bg-red-900 hover:bg-red-800 text-white rounded transition-colors ml-1"
              title="বন্ধ করুন (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body (Authentic Newspaper Format) */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Web Speech API Error Message if any */}
          {ttsError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded text-xs flex items-center justify-between font-sans-bn">
              <span>{ttsError}</span>
              <button
                onClick={() => setTtsError(null)}
                className="font-bold text-red-900 hover:text-red-950 ml-2 text-sm"
              >
                ×
              </button>
            </div>
          )}

          {/* Active Audio Playback Control Strip */}
          {isPlayingSpeech && (
            <div className="bg-amber-100/90 border border-amber-300 text-stone-900 px-4 py-2.5 rounded-sm shadow-xs flex flex-wrap items-center justify-between gap-3 font-sans-bn">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  {!isPausedSpeech && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-3 w-3 ${
                      isPausedSpeech ? 'bg-amber-600' : 'bg-red-600'
                    }`}
                  ></span>
                </span>
                <span className="font-bold text-xs text-stone-900">
                  {isPausedSpeech
                    ? '⏸️ সংবাদ পাঠ স্থগিত রয়েছে'
                    : '🔊 বাংলায় সংবাদ পাঠ করা হচ্ছে...'}
                </span>
                <span className="text-[11px] text-stone-600 bg-amber-200/80 px-2 py-0.5 rounded font-mono">
                  bn-BD
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Pause / Resume */}
                <button
                  onClick={handlePauseResume}
                  className="flex items-center gap-1 px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded text-xs transition-colors"
                  title={isPausedSpeech ? 'চালিয়ে যান (Resume)' : 'স্থগিত করুন (Pause)'}
                >
                  {isPausedSpeech ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pause</span>
                    </>
                  )}
                </button>

                {/* Speed Controls */}
                <div className="flex items-center bg-stone-200 rounded p-0.5 text-xs">
                  <button
                    onClick={() => handleChangeRate(0.8)}
                    className={`px-1.5 py-0.5 rounded ${
                      speechRate === 0.8
                        ? 'bg-stone-800 text-white font-bold'
                        : 'text-stone-700 hover:text-stone-950'
                    }`}
                    title="ধীর গতি (0.8x)"
                  >
                    0.8x
                  </button>
                  <button
                    onClick={() => handleChangeRate(0.95)}
                    className={`px-1.5 py-0.5 rounded ${
                      speechRate === 0.95
                        ? 'bg-stone-800 text-white font-bold'
                        : 'text-stone-700 hover:text-stone-950'
                    }`}
                    title="স্বাভাবিক গতি (1.0x)"
                  >
                    1.0x
                  </button>
                  <button
                    onClick={() => handleChangeRate(1.2)}
                    className={`px-1.5 py-0.5 rounded ${
                      speechRate === 1.2
                        ? 'bg-stone-800 text-white font-bold'
                        : 'text-stone-700 hover:text-stone-950'
                    }`}
                    title="দ্রুত গতি (1.2x)"
                  >
                    1.2x
                  </button>
                </div>

                {/* Stop button */}
                <button
                  onClick={stopSpeech}
                  className="flex items-center gap-1 px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs transition-colors"
                  title="বন্ধ করুন (Stop)"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </button>
              </div>
            </div>
          )}

          {/* Kicker */}
          {article.kicker && (
            <div className="text-xs font-semibold text-red-800 tracking-wider font-sans-bn uppercase">
              {article.kicker}
            </div>
          )}

          {/* Headline */}
          <h1
            id="article-modal-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif-bn text-stone-950 leading-[1.2] border-b border-stone-300 pb-3"
            style={{ textWrap: 'balance' }}
          >
            {article.headline}
          </h1>

          {/* Subheadline */}
          {article.subheadline && (
            <p className="text-base sm:text-lg font-serif-bn italic text-stone-700 leading-snug">
              {article.subheadline}
            </p>
          )}

          {/* Byline and Dateline Strip */}
          <div className="flex flex-wrap items-center justify-between text-xs font-sans-bn text-stone-600 bg-stone-100 p-2.5 border-y border-stone-300">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">{article.byline}</span>
              {article.location && (
                <>
                  <span>·</span>
                  <span>{article.location}</span>
                </>
              )}
            </div>
            <div>
              <span>{masthead.banglaDate}</span>
              <span className="mx-2">·</span>
              <span>{masthead.edition}</span>
            </div>
          </div>

          {/* Article Image if Present */}
          {article.imageUrl && (
            <figure className="my-4 border border-stone-300 bg-stone-100 rounded overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.imageCaption || article.headline}
                className="w-full max-h-96 object-cover"
                referrerPolicy="no-referrer"
              />
              {article.imageCaption && (
                <figcaption className="text-xs font-sans-bn text-stone-700 bg-stone-50 p-2 border-t border-stone-200 italic">
                  {article.imageCaption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Full Paragraphs */}
          <div className={`space-y-4 text-stone-900 font-sans-bn ${fontClasses}`}>
            {article.content.map((para, idx) => (
              <p
                key={idx}
                className={
                  idx === 0
                    ? 'drop-cap font-serif-bn font-medium'
                    : 'text-stone-800'
                }
              >
                {para}
              </p>
            ))}
          </div>

          {/* Authentic Newspaper Stamp */}
          <div className="mt-8 pt-4 border-t-2 border-stone-900 flex flex-wrap items-center justify-between text-xs font-sans-bn text-stone-600">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-stone-900">{masthead.paperName}</span>
              <span>· অনলাইন ই-পেপার সংস্করণ</span>
            </div>
            <div className="italic">
              ক্লিপিং আইডি: {article.id}
            </div>
          </div>
        </div>

        {/* Modal Bottom Navigator between articles */}
        <div className="bg-stone-200/80 px-4 py-2 border-t border-stone-300 flex items-center justify-between font-sans-bn text-xs shrink-0">
          <button
            onClick={handlePrev}
            disabled={!onPrevArticle}
            className="flex items-center gap-1 text-stone-700 hover:text-stone-950 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>পূর্ববর্তী সংবাদ</span>
          </button>
          <span className="text-stone-500">পাতা {toBanglaNumber(article.pageNumber)}</span>
          <button
            onClick={handleNext}
            disabled={!onNextArticle}
            className="flex items-center gap-1 text-stone-700 hover:text-stone-950 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <span>পরবর্তী সংবাদ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
