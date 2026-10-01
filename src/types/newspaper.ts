export type ColumnSpan = 1 | 2 | 3 | 4 | 6 | 8 | 12;

export interface Article {
  id: string;
  pageNumber: number;
  kicker?: string; // বিষয় বা উপ-শিরোনাম যেমন: [বিশেষ প্রতিবেদন]
  headline: string; // প্রধান শিরোনাম
  subheadline?: string; // দ্বিতীয় শিরোনাম বা স্ট্র্যাপ
  byline: string; // প্রতিবেদক / নিজস্ব প্রতিবেদক / বিশেষ প্রতিনিধি
  location?: string; // ঢাকা, চট্টগ্রাম, ইত্যাদি
  content: string[]; // অনুচ্ছেদসমূহ
  imageUrl?: string;
  imageCaption?: string;
  colSpan: ColumnSpan; // গ্রিড কলাম বিস্তার
  isLeadStory?: boolean;
  highlightBox?: boolean;
  badge?: string;
}

export interface Advertisement {
  id: string;
  pageNumber: number;
  title: string;
  clientName: string;
  type: 'commercial' | 'classified' | 'tender' | 'notice';
  imageUrl?: string;
  text?: string;
  phone?: string;
  colSpan: ColumnSpan;
}

export interface NewspaperPage {
  pageNumber: number;
  title: string; // যেমন: "প্রথম পাতা", "সম্পাদকীয় ও মতামত"
  subtitle: string; // যেমন: "জাতীয় প্রচ্ছদ ও প্রধান খবরাখবর"
  category: string;
  articles: Article[];
  ads: Advertisement[];
  specialSidebar?: {
    type: 'editorial_quote' | 'market_rates' | 'weather_horoscope' | 'sports_scoreboard' | 'prayer_times' | 'brief_news';
    title: string;
    items: { label: string; value: string }[];
  };
}

export interface MastheadInfo {
  paperName: string; // দৈনিক আজকের দিগন্ত
  tagline: string; // সততা ও সত্যের সন্ধানে নির্ভীক কণ্ঠস্বর
  regNo: string; // রেজিঃ নং ডিএ-৪৮১২
  foundedYear: string; // প্রতিষ্ঠা ১৯৯৮ • বর্ষ ২৮, সংখ্যা ২২৪
  price: string; // মূল্য ১০ টাকা
  edition: string; // ঢাকা ও জাতীয় সংস্করণ
  banglaDate: string; // বৃহস্পতিবার, ১৭ আশ্বিন ১৪৩৩
  englishDate: string; // ১ অক্টোবর ২০২৬
  hijriDate: string; // ১৯ রবিউস সানি ১৪৪৮ হিজরি
  weatherText: string; // ঢাকা ৩১° সে., আর্দ্রতা ৬৮%, আংশিক মেঘলা
  founderEditor: string; // শামসুল আলম চৌধুরী
  chiefEditor: string; // আহমেদ ফয়সাল চৌধুরী
  executiveEditor: string; // ফারহানা রহমান
  officeAddress: string; // দিগন্ত ভবন, কাওরান বাজার, ঢাকা-১২১৫
}

export interface NewspaperEdition {
  id: string;
  masthead: MastheadInfo;
  pages: NewspaperPage[];
}

export interface ReadHistoryItem {
  articleId: string;
  pageNumber: number;
  headline: string;
  kicker?: string;
  byline: string;
  timestamp: number;
  timeFormatted: string;
}
