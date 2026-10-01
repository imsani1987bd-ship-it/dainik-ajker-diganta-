import React, { useRef, useState } from 'react';
import { Article, MastheadInfo } from '../types/newspaper';
import { toBanglaNumber } from './BroadsheetPage';
import {
  X,
  Download,
  Share2,
  Printer,
  Copy,
  Check,
  Volume2,
  VolumeX,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface ClippingCardModalProps {
  isOpen: boolean;
  article: Article | null;
  masthead: MastheadInfo;
  onClose: () => void;
}

export const ClippingCardModal: React.FC<ClippingCardModalProps> = ({
  isOpen,
  article,
  masthead,
  onClose,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);

  if (!isOpen || !article) return null;

  const handleCopyLink = async () => {
    const textToCopy = `${article.headline}\n\nদৈনিক আজকের দিগন্ত (পৃষ্ঠা ${toBanglaNumber(
      article.pageNumber
    )})\n${window.location.href}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `*${article.headline}*\n\nদৈনিক আজকের দিগন্ত • পৃষ্ঠা ${toBanglaNumber(
        article.pageNumber
      )}\n${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  const handleTextToSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('আপনার ব্রাউজার অডিও সাপোর্ট করছে না।');
      return;
    }
    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    const fullSpeech = `${article.headline}। ${article.subheadline || ''}। ${article.content.join(' ')}`;
    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    utterance.lang = 'bn-BD';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingSpeech(false);
    utterance.onerror = () => setIsPlayingSpeech(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingSpeech(true);
  };

  const handleDownloadPng = () => {
    setIsGeneratingPng(true);
    // Draw on HTML5 Canvas for pristine newspaper clipping PNG download
    const canvas = document.createElement('canvas');
    const width = 800;
    const padding = 40;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGeneratingPng(false);
      return;
    }

    // Estimate height
    const linesOfText: string[] = [];
    const text = article.content.join('\n\n');
    const paras = article.content;

    canvas.width = width;
    canvas.height = 1000; // temporary height, will fill background

    // Background paper
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer border
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#1c1917';
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Inner hairline border
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#a8a29e';
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // Header masthead line
    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 28px serif';
    ctx.fillText('দৈনিক আজকের দিগন্ত', padding, 60);

    ctx.fillStyle = '#44403c';
    ctx.font = '14px sans-serif';
    ctx.fillText(
      `সংবাদ ক্লিপিং • পৃষ্ঠা ${toBanglaNumber(article.pageNumber)} • ${masthead.banglaDate}`,
      padding,
      85
    );

    // Dividing rule
    ctx.beginPath();
    ctx.moveTo(padding, 100);
    ctx.lineTo(width - padding, 100);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#991b1b';
    ctx.stroke();

    // Headline
    ctx.fillStyle = '#0c0a09';
    ctx.font = 'bold 26px serif';
    const headlineWords = article.headline.split(' ');
    let currentLine = '';
    let currentY = 140;

    headlineWords.forEach((word) => {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > width - padding * 2) {
        ctx.fillText(currentLine, padding, currentY);
        currentLine = word + ' ';
        currentY += 34;
      } else {
        currentLine = testLine;
      }
    });
    ctx.fillText(currentLine, padding, currentY);
    currentY += 25;

    // Byline
    ctx.fillStyle = '#78716c';
    ctx.font = 'italic 14px sans-serif';
    ctx.fillText(`${article.byline} ${article.location ? `· ${article.location}` : ''}`, padding, currentY);
    currentY += 30;

    // Divider
    ctx.beginPath();
    ctx.moveTo(padding, currentY);
    ctx.lineTo(width - padding, currentY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#d6d3d1';
    ctx.stroke();
    currentY += 25;

    // Content paragraphs
    ctx.fillStyle = '#1c1917';
    ctx.font = '16px sans-serif';
    const lineHeight = 26;

    paras.forEach((para) => {
      const words = para.split(' ');
      let line = '';
      words.forEach((w) => {
        const test = line + w + ' ';
        if (ctx.measureText(test).width > width - padding * 2) {
          ctx.fillText(line, padding, currentY);
          line = w + ' ';
          currentY += lineHeight;
        } else {
          line = test;
        }
      });
      ctx.fillText(line, padding, currentY);
      currentY += lineHeight + 12;
    });

    // Footer Watermark
    currentY = Math.max(currentY + 20, 850);
    ctx.fillStyle = '#e7e5e4';
    ctx.fillRect(20, currentY, width - 40, 50);

    ctx.fillStyle = '#57534e';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('অনলাইন ই-পেপার: epaper.ajkerdigonto.com • সৌজন্যে: দৈনিক আজকের দিগন্ত', padding, currentY + 30);

    // Resize canvas to exact height
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = width;
    finalCanvas.height = currentY + 70;
    const finalCtx = finalCanvas.getContext('2d');
    if (finalCtx) {
      finalCtx.drawImage(canvas, 0, 0);
      const dataUrl = finalCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `ajker-digonto-clipping-page-${article.pageNumber}.png`;
      a.click();
    }
    setIsGeneratingPng(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans-bn"
      onClick={() => {
        window.speechSynthesis?.cancel();
        onClose();
      }}
    >
      <div
        className="bg-stone-900 text-stone-100 w-full max-w-2xl rounded-lg shadow-2xl border-2 border-stone-700 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="bg-stone-950 px-4 py-2.5 border-b border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="bg-red-700 text-white font-bold px-2 py-0.5 rounded text-[11px]">
              প্রথম আলো স্টাইল সংবাদ কাটিং
            </span>
            <span className="text-stone-400">পৃষ্ঠা {toBanglaNumber(article.pageNumber)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Listen */}
            <button
              onClick={handleTextToSpeech}
              className={`p-1.5 rounded transition-colors ${
                isPlayingSpeech ? 'bg-red-700 text-white animate-pulse' : 'bg-stone-800 text-stone-300 hover:text-white'
              }`}
              title="অডিও শুনুন"
            >
              {isPlayingSpeech ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Download PNG */}
            <button
              onClick={handleDownloadPng}
              disabled={isGeneratingPng}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-2.5 py-1 rounded text-xs transition-colors"
              title="সংবাদ কাটিং ছবি হিসেবে সেভ করুন"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPng ? 'তৈরি হচ্ছে...' : 'ক্লিপিং ডাউনলোড'}</span>
            </button>

            {/* WhatsApp Share */}
            <button
              onClick={handleWhatsAppShare}
              className="p-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded transition-colors"
              title="হোয়াটসঅ্যাপে পাঠান"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded transition-colors"
              title="লিংক কপি করুন"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                onClose();
              }}
              className="p-1.5 bg-red-900 hover:bg-red-800 text-white rounded transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable / Realistic Newspaper Cut-out Card */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-stone-950/60">
          <div
            ref={cardRef}
            className="bg-[#faf7f2] text-stone-900 border-4 border-stone-800 p-6 shadow-xl rounded-sm relative"
          >
            {/* Newspaper Cut-out Masthead Watermark */}
            <div className="flex items-center justify-between border-b-2 border-red-900 pb-2 mb-3">
              <div>
                <h3 className="font-serif-bn font-black text-2xl text-red-900 tracking-tight leading-none">
                  {masthead.paperName}
                </h3>
                <p className="text-[11px] text-stone-600 font-sans-bn mt-0.5">
                  জাতীয় ই-পেপার • পৃষ্ঠা {toBanglaNumber(article.pageNumber)} • {masthead.banglaDate}
                </p>
              </div>

              {/* Barcode & ISSN */}
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-[1px] h-4">
                  {[2, 1, 3, 1, 2, 4, 1, 2, 3, 2, 1, 4, 2].map((w, i) => (
                    <div key={i} className="bg-stone-800 h-full" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <span className="text-[9px] font-mono text-stone-500">DIGONTO E-PAPER</span>
              </div>
            </div>

            {/* Kicker */}
            {article.kicker && (
              <span className="inline-block text-xs font-bold text-red-800 font-sans-bn uppercase tracking-wider mb-1">
                {article.kicker}
              </span>
            )}

            {/* Headline */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-serif-bn text-stone-950 leading-tight mb-2">
              {article.headline}
            </h1>

            {/* Subhead */}
            {article.subheadline && (
              <p className="text-sm font-sans-bn text-stone-700 font-medium italic mb-3">
                {article.subheadline}
              </p>
            )}

            {/* Reporter / Date */}
            <div className="text-xs font-sans-bn text-stone-600 border-y border-stone-300 py-1.5 mb-3 flex items-center justify-between">
              <span className="font-bold text-stone-900">
                {article.byline} {article.location && `· ${article.location}`}
              </span>
              <span>{masthead.edition}</span>
            </div>

            {/* Image if present */}
            {article.imageUrl && (
              <figure className="my-3 border border-stone-300 rounded overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.imageCaption || article.headline}
                  className="w-full max-h-72 object-cover"
                />
                {article.imageCaption && (
                  <figcaption className="text-xs font-sans-bn text-stone-700 bg-stone-100 p-2 italic border-t border-stone-200">
                    {article.imageCaption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Prose */}
            <div className="text-stone-900 text-sm leading-relaxed font-sans-bn space-y-3">
              {article.content.map((p, idx) => (
                <p key={idx} className={idx === 0 ? 'drop-cap font-serif-bn' : ''}>
                  {p}
                </p>
              ))}
            </div>

            {/* Bottom Stamp */}
            <div className="mt-6 pt-3 border-t border-dashed border-stone-400 flex items-center justify-between text-[11px] text-stone-500 font-sans-bn">
              <span>ই-পেপার ক্লিপিং সেভার</span>
              <span>epaper.ajkerdigonto.com</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-stone-950 px-4 py-2.5 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>ক্লিপিংটি সরাসরি শেয়ার অথবা ইমেজ ফরম্যাটে ডাউনলোড করুন</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 text-stone-300 hover:text-white transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>প্রিন্ট</span>
          </button>
        </div>
      </div>
    </div>
  );
};
