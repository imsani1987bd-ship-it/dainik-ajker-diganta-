import React, { useState } from 'react';
import { NewspaperEdition, Article, NewspaperPage, MastheadInfo, ColumnSpan, Advertisement } from '../types/newspaper';
import { toBanglaNumber } from './BroadsheetPage';
import {
  X,
  Save,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Trash2,
  FileText,
  Settings,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

interface StudioDrawerProps {
  isOpen: boolean;
  edition: NewspaperEdition;
  currentPageNumber: number;
  editingArticle: Article | null;
  onClose: () => void;
  onUpdateMasthead: (newMasthead: MastheadInfo) => void;
  onSaveArticle: (article: Article) => void;
  onDeleteArticle: (articleId: string, pageNumber: number) => void;
  onAddAdvertisement: (ad: Advertisement) => void;
  onResetToDefault: () => void;
  onImportEdition: (edition: NewspaperEdition) => void;
  onSelectPage: (page: number) => void;
}

export const StudioDrawer: React.FC<StudioDrawerProps> = ({
  isOpen,
  edition,
  currentPageNumber,
  editingArticle,
  onClose,
  onUpdateMasthead,
  onSaveArticle,
  onDeleteArticle,
  onAddAdvertisement,
  onResetToDefault,
  onImportEdition,
  onSelectPage,
}) => {
  const [activeTab, setActiveTab] = useState<'article' | 'masthead' | 'ad' | 'manage'>('article');

  // Masthead form state
  const [mastheadForm, setMastheadForm] = useState<MastheadInfo>(edition.masthead);

  // Article form state
  const [articleForm, setArticleForm] = useState<Partial<Article>>({
    id: `art-${Date.now()}`,
    pageNumber: currentPageNumber,
    headline: '',
    subheadline: '',
    kicker: '',
    byline: 'নিজস্ব প্রতিবেদক',
    location: 'ঢাকা',
    content: [''],
    colSpan: 8,
    isLeadStory: false,
    highlightBox: false,
    imageUrl: '',
    imageCaption: '',
  });

  // Sync when editingArticle changes
  React.useEffect(() => {
    if (editingArticle) {
      setArticleForm(editingArticle);
      setActiveTab('article');
    } else {
      setArticleForm({
        id: `art-${Date.now()}`,
        pageNumber: currentPageNumber,
        headline: '',
        subheadline: '',
        kicker: '',
        byline: 'নিজস্ব প্রতিবেদক',
        location: 'ঢাকা',
        content: [''],
        colSpan: 8,
        isLeadStory: false,
        highlightBox: false,
        imageUrl: '',
        imageCaption: '',
      });
    }
  }, [editingArticle, currentPageNumber]);

  React.useEffect(() => {
    setMastheadForm(edition.masthead);
  }, [edition.masthead]);

  // Advertisement form state
  const [adForm, setAdForm] = useState<Partial<Advertisement>>({
    id: `ad-${Date.now()}`,
    pageNumber: currentPageNumber,
    title: '',
    clientName: '',
    type: 'commercial',
    text: '',
    phone: '',
    colSpan: 12,
  });

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if (!isOpen) return null;

  const handleSaveArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleForm.headline?.trim()) {
      alert('দয়া করে প্রধান শিরোনাম লিখুন।');
      return;
    }

    const fullArticle: Article = {
      id: articleForm.id || `art-${Date.now()}`,
      pageNumber: articleForm.pageNumber || currentPageNumber,
      headline: articleForm.headline || '',
      subheadline: articleForm.subheadline,
      kicker: articleForm.kicker,
      byline: articleForm.byline || 'নিজস্ব প্রতিবেদক',
      location: articleForm.location,
      content:
        Array.isArray(articleForm.content) && articleForm.content.length > 0
          ? articleForm.content.filter((p) => p.trim().length > 0)
          : ['বিস্তারিত আসছে...'],
      colSpan: (articleForm.colSpan || 8) as ColumnSpan,
      isLeadStory: Boolean(articleForm.isLeadStory),
      highlightBox: Boolean(articleForm.highlightBox),
      imageUrl: articleForm.imageUrl,
      imageCaption: articleForm.imageCaption,
    };

    onSaveArticle(fullArticle);
    showNotification('সংবাদ সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const handleSaveMastheadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMasthead(mastheadForm);
    showNotification('মাস্টহেড তথ্য আপডেট হয়েছে!');
  };

  const handleSaveAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.title?.trim()) {
      alert('বিজ্ঞাপনের শিরোনাম লিখুন।');
      return;
    }
    const newAd: Advertisement = {
      id: adForm.id || `ad-${Date.now()}`,
      pageNumber: adForm.pageNumber || currentPageNumber,
      title: adForm.title,
      clientName: adForm.clientName || 'স্পনসর',
      type: adForm.type || 'commercial',
      text: adForm.text,
      phone: adForm.phone,
      colSpan: 12,
    };
    onAddAdvertisement(newAd);
    showNotification('বিজ্ঞাপন যুক্ত করা হয়েছে!');
    setAdForm({
      id: `ad-${Date.now()}`,
      pageNumber: currentPageNumber,
      title: '',
      clientName: '',
      type: 'commercial',
      text: '',
      phone: '',
      colSpan: 12,
    });
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(edition, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ajker-digonto-edition-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && parsed.masthead && Array.isArray(parsed.pages)) {
            onImportEdition(parsed);
            showNotification('ই-পেপার সংস্করণ সফলভাবে লোড হয়েছে!');
          } else {
            alert('ভুল ফাইল ফরম্যাট।');
          }
        } catch {
          alert('JSON ফাইলটি পড়তে ব্যর্থ হয়েছে।');
        }
      };
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-stone-900 text-stone-100 shadow-2xl flex flex-col font-sans-bn border-l-4 border-amber-500">
      {/* Drawer Header */}
      <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-amber-400 font-serif-bn flex items-center gap-2">
            <span>ই-পেপার মেকার স্টুডিও</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
              পৃষ্ঠা {toBanglaNumber(currentPageNumber)}
            </span>
          </h2>
          <p className="text-xs text-stone-400">১৬ পাতার যেকোনো খবর ও হেডলাইন সাজান</p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className="bg-emerald-800 text-white px-4 py-2 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Studio Navigation Tabs */}
      <div className="flex border-b border-stone-800 bg-stone-950/60 text-xs">
        <button
          onClick={() => setActiveTab('article')}
          className={`flex-1 py-2.5 px-2 text-center font-medium transition-colors ${
            activeTab === 'article'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-stone-900'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          সংবাদ সম্পাদনা
        </button>
        <button
          onClick={() => setActiveTab('masthead')}
          className={`flex-1 py-2.5 px-2 text-center font-medium transition-colors ${
            activeTab === 'masthead'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-stone-900'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          পত্রিকার হেড
        </button>
        <button
          onClick={() => setActiveTab('ad')}
          className={`flex-1 py-2.5 px-2 text-center font-medium transition-colors ${
            activeTab === 'ad'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-stone-900'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          বিজ্ঞাপন
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex-1 py-2.5 px-2 text-center font-medium transition-colors ${
            activeTab === 'manage'
              ? 'border-b-2 border-amber-400 text-amber-400 bg-stone-900'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          রিসেট / ফাইল
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Article Edit / Create */}
        {activeTab === 'article' && (
          <form onSubmit={handleSaveArticleSubmit} className="space-y-4 text-xs">
            {/* Target Page Selector */}
            <div className="bg-stone-800/80 p-3 rounded border border-stone-700 space-y-2">
              <label className="block text-stone-300 font-semibold">লক্ষ্য পাতা নির্বাচন:</label>
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 16 }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => {
                      setArticleForm({ ...articleForm, pageNumber: pNum });
                      onSelectPage(pNum);
                    }}
                    className={`py-1 rounded text-center font-bold text-xs ${
                      (articleForm.pageNumber || currentPageNumber) === pNum
                        ? 'bg-amber-500 text-stone-950 ring-1 ring-amber-300'
                        : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
                    }`}
                  >
                    {toBanglaNumber(pNum)}
                  </button>
                ))}
              </div>
            </div>

            {/* Kicker */}
            <div>
              <label className="block text-stone-300 mb-1">বিষয় বা উপ-কিকার (ঐচ্ছিক):</label>
              <input
                type="text"
                placeholder="যেমন: [বিশেষ প্রতিবেদন] বা [অর্থনৈতিক স্বস্তি]"
                value={articleForm.kicker || ''}
                onChange={(e) => setArticleForm({ ...articleForm, kicker: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block text-stone-200 font-semibold mb-1">
                প্রধান শিরোনাম (বাধ্যতামূলক):
              </label>
              <input
                type="text"
                required
                placeholder="বড় আকর্ষক সংবাদ শিরোনাম লিখুন..."
                value={articleForm.headline || ''}
                onChange={(e) => setArticleForm({ ...articleForm, headline: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100 font-serif-bn font-bold text-sm placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Subheadline */}
            <div>
              <label className="block text-stone-300 mb-1">দ্বিতীয় শিরোনাম / স্ট্র্যাপ:</label>
              <input
                type="text"
                placeholder="বিস্তারিত প্রসঙ্গের এক বা দুই লাইনের বিবরণ..."
                value={articleForm.subheadline || ''}
                onChange={(e) => setArticleForm({ ...articleForm, subheadline: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Byline & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 mb-1">প্রতিবেদক:</label>
                <input
                  type="text"
                  placeholder="যেমন: নিজস্ব প্রতিবেদক"
                  value={articleForm.byline || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, byline: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1">স্থান / ব্যুরো:</label>
                <input
                  type="text"
                  placeholder="ঢাকা, চট্টগ্রাম..."
                  value={articleForm.location || ''}
                  onChange={(e) => setArticleForm({ ...articleForm, location: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Column Width & Position */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 mb-1">লেআউট কলাম বিস্তার:</label>
                <select
                  value={articleForm.colSpan || 8}
                  onChange={(e) =>
                    setArticleForm({
                      ...articleForm,
                      colSpan: Number(e.target.value) as ColumnSpan,
                    })
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                >
                  <option value={12}>১২ কলাম (সম্পূর্ণ ব্যানার প্রস্থ)</option>
                  <option value={8}>৮ কলাম (প্রধান লিড স্টোরি)</option>
                  <option value={6}>৬ কলাম (অর্ধেক পাতা)</option>
                  <option value={4}>৪ কলাম (এক-তৃতীয়াংশ)</option>
                  <option value={3}>৩ কলাম (ছোট কলাম)</option>
                </select>
              </div>

              <div className="flex flex-col justify-end gap-2 pb-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={Boolean(articleForm.isLeadStory)}
                    onChange={(e) =>
                      setArticleForm({ ...articleForm, isLeadStory: e.target.checked })
                    }
                    className="accent-amber-400 rounded"
                  />
                  <span>পাতার প্রধান লিড হিসেবে প্রদর্শন</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={Boolean(articleForm.highlightBox)}
                    onChange={(e) =>
                      setArticleForm({ ...articleForm, highlightBox: e.target.checked })
                    }
                    className="accent-amber-400 rounded"
                  />
                  <span>বক্স হাইলাইট ফ্রেম</span>
                </label>
              </div>
            </div>

            {/* Image URL & Caption */}
            <div className="bg-stone-800/80 p-3 rounded border border-stone-700 space-y-2">
              <label className="block text-stone-300 font-semibold">সংবাদের ছবি (ঐচ্ছিক):</label>
              <input
                type="text"
                placeholder="ছবির URL বা পাথ (যেমন: /src/assets/images/...)"
                value={articleForm.imageUrl || ''}
                onChange={(e) => setArticleForm({ ...articleForm, imageUrl: e.target.value })}
                className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-200 text-xs focus:outline-none focus:border-amber-400"
              />
              <input
                type="text"
                placeholder="ছবির ক্যাপশন লিখুন..."
                value={articleForm.imageCaption || ''}
                onChange={(e) =>
                  setArticleForm({ ...articleForm, imageCaption: e.target.value })
                }
                className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-200 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Content Paragraphs */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-stone-300 font-semibold">সংবাদের অনুচ্ছেদসমূহ:</label>
                <button
                  type="button"
                  onClick={() => {
                    const curr = articleForm.content || [];
                    setArticleForm({ ...articleForm, content: [...curr, ''] });
                  }}
                  className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  নতুন প্যারাগ্রাফ যোগ
                </button>
              </div>
              <div className="space-y-2">
                {(articleForm.content || ['']).map((paragraph, pIdx) => (
                  <div key={pIdx} className="relative">
                    <textarea
                      rows={3}
                      placeholder={`অনুচ্ছেদ ${toBanglaNumber(pIdx + 1)} লিখুন...`}
                      value={paragraph}
                      onChange={(e) => {
                        const newContent = [...(articleForm.content || [])];
                        newContent[pIdx] = e.target.value;
                        setArticleForm({ ...articleForm, content: newContent });
                      }}
                      className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-400 leading-relaxed text-xs"
                    />
                    {(articleForm.content || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newContent = (articleForm.content || []).filter(
                            (_, idx) => idx !== pIdx
                          );
                          setArticleForm({ ...articleForm, content: newContent });
                        }}
                        className="absolute top-2 right-2 text-stone-500 hover:text-red-400 p-1"
                        title="এই অনুচ্ছেদ মুছুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 px-4 rounded shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                সংবাদ সংরক্ষণ করুন
              </button>

              {editingArticle && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('আপনি কি এই সংবাদটি মুছে ফেলতে চান?')) {
                      onDeleteArticle(editingArticle.id, editingArticle.pageNumber);
                      showNotification('সংবাদ মুছে ফেলা হয়েছে');
                    }
                  }}
                  className="bg-red-900/80 hover:bg-red-800 text-white p-2.5 rounded transition-colors"
                  title="সংবাদ মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        )}

        {/* Tab 2: Masthead Edit */}
        {activeTab === 'masthead' && (
          <form onSubmit={handleSaveMastheadSubmit} className="space-y-3 text-xs">
            <div className="bg-stone-800/80 p-3 rounded border border-stone-700 space-y-3">
              <h3 className="font-semibold text-amber-400">পত্রিকার মূল হেড ও পরিচিতি</h3>
              <div>
                <label className="block text-stone-300 mb-1">পত্রিকার নাম:</label>
                <input
                  type="text"
                  value={mastheadForm.paperName}
                  onChange={(e) =>
                    setMastheadForm({ ...mastheadForm, paperName: e.target.value })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-100 font-serif-bn font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-300 mb-1">স্লোগান / মূল নীতিবাক্য:</label>
                <input
                  type="text"
                  value={mastheadForm.tagline}
                  onChange={(e) =>
                    setMastheadForm({ ...mastheadForm, tagline: e.target.value })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 mb-1">মূল্য:</label>
                  <input
                    type="text"
                    value={mastheadForm.price}
                    onChange={(e) =>
                      setMastheadForm({ ...mastheadForm, price: e.target.value })
                    }
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1">সংস্করণ:</label>
                  <input
                    type="text"
                    value={mastheadForm.edition}
                    onChange={(e) =>
                      setMastheadForm({ ...mastheadForm, edition: e.target.value })
                    }
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-100"
                  />
                </div>
              </div>
            </div>

            <div className="bg-stone-800/80 p-3 rounded border border-stone-700 space-y-3">
              <h3 className="font-semibold text-amber-400">তারিখ ও আবহাওয়া</h3>
              <div>
                <label className="block text-stone-300 mb-1">বাংলা তারিখ:</label>
                <input
                  type="text"
                  value={mastheadForm.banglaDate}
                  onChange={(e) =>
                    setMastheadForm({ ...mastheadForm, banglaDate: e.target.value })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-100"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1">ইংরেজি তারিখ:</label>
                <input
                  type="text"
                  value={mastheadForm.englishDate}
                  onChange={(e) =>
                    setMastheadForm({ ...mastheadForm, englishDate: e.target.value })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-100"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1">হিজরি তারিখ:</label>
                <input
                  type="text"
                  value={mastheadForm.hijriDate}
                  onChange={(e) =>
                    setMastheadForm({ ...mastheadForm, hijriDate: e.target.value })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-100"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1">আবহাওয়ার বিবরণ:</label>
                <input
                  type="text"
                  value={mastheadForm.weatherText}
                  onChange={(e) =>
                    setMastheadForm({ ...mastheadForm, weatherText: e.target.value })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-100"
                />
              </div>
            </div>

            <div className="bg-stone-800/80 p-3 rounded border border-stone-700 space-y-3">
              <h3 className="font-semibold text-amber-400">সম্পাদকীয় মণ্ডল ও ঠিকানা</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-300 mb-1">প্রধান সম্পাদক:</label>
                  <input
                    type="text"
                    value={mastheadForm.chiefEditor}
                    onChange={(e) =>
                      setMastheadForm({ ...mastheadForm, chiefEditor: e.target.value })
                    }
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 mb-1">প্রতিষ্ঠাতা সম্পাদক:</label>
                  <input
                    type="text"
                    value={mastheadForm.founderEditor}
                    onChange={(e) =>
                      setMastheadForm({ ...mastheadForm, founderEditor: e.target.value })
                    }
                    className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-stone-300 mb-1">অফিস ও যোগাযোগ:</label>
                <input
                  type="text"
                  value={mastheadForm.officeAddress}
                  onChange={(e) =>
                    setMastheadForm({ ...mastheadForm, officeAddress: e.target.value })
                  }
                  className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-1.5 text-stone-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2 px-4 rounded shadow flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              হেড তথ্য আপডেট করুন
            </button>
          </form>
        )}

        {/* Tab 3: Advertisements */}
        {activeTab === 'ad' && (
          <form onSubmit={handleSaveAdSubmit} className="space-y-3 text-xs">
            <div className="bg-stone-800/80 p-3 rounded border border-stone-700 space-y-2">
              <label className="block text-stone-300 font-semibold">বিজ্ঞাপনের পাতা:</label>
              <select
                value={adForm.pageNumber || currentPageNumber}
                onChange={(e) => setAdForm({ ...adForm, pageNumber: Number(e.target.value) })}
                className="w-full bg-stone-900 border border-stone-700 rounded px-3 py-2 text-stone-100"
              >
                {Array.from({ length: 16 }, (_, i) => i + 1).map((pNum) => (
                  <option key={pNum} value={pNum}>
                    পৃষ্ঠা {toBanglaNumber(pNum)} - {edition.pages[pNum - 1]?.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-300 mb-1">বিজ্ঞাপনের শিরোনাম:</label>
              <input
                type="text"
                required
                placeholder="যেমন: গ্রিন সিটি অ্যাপার্টমেন্ট বিক্রয় মেলা"
                value={adForm.title || ''}
                onChange={(e) => setAdForm({ ...adForm, title: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-stone-300 mb-1">বিজ্ঞাপনদাতা প্রতিষ্ঠান:</label>
                <input
                  type="text"
                  placeholder="কোম্পানির নাম"
                  value={adForm.clientName || ''}
                  onChange={(e) => setAdForm({ ...adForm, clientName: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100"
                />
              </div>
              <div>
                <label className="block text-stone-300 mb-1">ধরন:</label>
                <select
                  value={adForm.type || 'commercial'}
                  onChange={(e) =>
                    setAdForm({ ...adForm, type: e.target.value as any })
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100"
                >
                  <option value="commercial">বাণিজ্যিক বিজ্ঞাপন</option>
                  <option value="classified">ক্লাসিফায়েড</option>
                  <option value="tender">দরপত্র / টেন্ডার</option>
                  <option value="notice">জরুরি নোটিশ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-300 mb-1">বিজ্ঞাপনের বার্তা / বিবরণ:</label>
              <textarea
                rows={3}
                placeholder="বিজ্ঞাপনের সংক্ষিপ্ত আকর্ষণীয় বিবরণ..."
                value={adForm.text || ''}
                onChange={(e) => setAdForm({ ...adForm, text: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100"
              />
            </div>

            <div>
              <label className="block text-stone-300 mb-1">যোগাযোগ ফোন / হটলাইন:</label>
              <input
                type="text"
                placeholder="১৬৫৫৫ অথবা ০১৯১১..."
                value={adForm.phone || ''}
                onChange={(e) => setAdForm({ ...adForm, phone: e.target.value })}
                className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-100"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-2.5 px-4 rounded shadow flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              বিজ্ঞাপন যুক্ত করুন
            </button>
          </form>
        )}

        {/* Tab 4: Manage, Export, Reset */}
        {activeTab === 'manage' && (
          <div className="space-y-4 text-xs">
            <div className="bg-stone-800/80 p-3.5 rounded border border-stone-700 space-y-2">
              <h3 className="font-semibold text-amber-400">ই-পেপার সংস্করণ এক্সপোর্ট</h3>
              <p className="text-stone-300 text-[11px]">
                আপনার প্রস্তুতকৃত সম্পূর্ণ ১৬ পাতার পত্রিকাটি JSON ফাইল হিসেবে সেভ করুন যাতে ভবিষ্যতে যেকোনো সময় পুনরায় লোড করা যায়।
              </p>
              <button
                onClick={handleExportJSON}
                className="w-full bg-stone-700 hover:bg-stone-600 text-stone-100 font-semibold py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                সংস্করণ ডাউনলোড করুন (.json)
              </button>
            </div>

            <div className="bg-stone-800/80 p-3.5 rounded border border-stone-700 space-y-2">
              <h3 className="font-semibold text-amber-400">সংরক্ষিত সংস্করণ ইম্পোর্ট</h3>
              <p className="text-stone-300 text-[11px]">
                পূর্বে সেভ করা যেকোনো .json ফাইল থেকে পুরো পত্রিকা রিস্টোর করুন।
              </p>
              <label className="w-full bg-stone-700 hover:bg-stone-600 text-stone-100 font-semibold py-2 px-3 rounded flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>JSON ফাইল আপলোড</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            <div className="bg-red-950/40 p-3.5 rounded border border-red-900/60 space-y-2">
              <h3 className="font-semibold text-red-400">ডিফল্ট ১৬ পাতায় রিসেট</h3>
              <p className="text-stone-300 text-[11px]">
                ‘দৈনিক আজকের দিগন্ত’-এর মূল ১৬ পাতার প্রচ্ছদ ও সব প্রতিবেদন পুনরায় সক্রিয় করুন।
              </p>
              <button
                onClick={() => {
                  if (confirm('আপনি কি নিশ্চিত যে সম্পূর্ণ পত্রিকা ডিফল্ট অবস্থায় ফিরিয়ে নেবেন?')) {
                    onResetToDefault();
                    showNotification('ডিফল্ট ১৬ পাতার পত্রিকা সফলভাবে রিস্টোর হয়েছে!');
                  }
                }}
                className="w-full bg-red-900 hover:bg-red-800 text-white font-semibold py-2 px-3 rounded flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                ফ্যাক্টরি রিসেট করুন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
