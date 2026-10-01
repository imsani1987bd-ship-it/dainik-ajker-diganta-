import React, { useState } from 'react';
import { Calendar as CalendarIcon, X, Clock, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { toBanglaNumber } from './BroadsheetPage';

interface ArchiveCalendarModalProps {
  isOpen: boolean;
  currentDateText: string;
  onClose: () => void;
  onSelectDate: (date: { banglaDate: string; englishDate: string; hijriDate: string }) => void;
}

const monthsBangla = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const ArchiveCalendarModal: React.FC<ArchiveCalendarModalProps> = ({
  isOpen,
  currentDateText,
  onClose,
  onSelectDate,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<number>(9); // 0-indexed, 9 = October
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  if (!isOpen) return null;

  // Preset dates
  const handlePresetSelect = (daysAgo: number) => {
    const d = new Date(2026, 9, 1);
    d.setDate(d.getDate() - daysAgo);

    const banglaDay = d.getDate();
    const englishDay = d.getDate();
    const monthName = monthsBangla[d.getMonth()];
    const year = d.getFullYear();

    const daysName = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const dayName = daysName[d.getDay()];

    onSelectDate({
      banglaDate: `${dayName}, ${toBanglaNumber(banglaDay + 16)} আশ্বিন ১৪৩৩ বঙ্গাব্দ`,
      englishDate: `${toBanglaNumber(englishDay)} ${monthName} ${toBanglaNumber(year)} খ্রিস্টাব্দ`,
      hijriDate: `${toBanglaNumber(banglaDay + 18)} রবিউস সানি ১৪৪৮ হিজরি`,
    });
    onClose();
  };

  const handleApplyCustomDate = () => {
    const d = new Date(selectedYear, selectedMonth, selectedDay);
    const daysName = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const dayName = daysName[d.getDay()];
    const monthName = monthsBangla[selectedMonth];

    onSelectDate({
      banglaDate: `${dayName}, ${toBanglaNumber(selectedDay + 16)} আশ্বিন ১৪৩৩ বঙ্গাব্দ`,
      englishDate: `${toBanglaNumber(selectedDay)} ${monthName} ${toBanglaNumber(selectedYear)} খ্রিস্টাব্দ`,
      hijriDate: `${toBanglaNumber(selectedDay + 18)} রবিউস সানি ১৪৪৮ হিজরি`,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans-bn"
      onClick={onClose}
    >
      <div
        className="bg-stone-900 border-2 border-stone-700 text-stone-100 w-full max-w-md rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-950 px-4 py-3 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-100 font-serif-bn font-bold text-sm">
            <CalendarIcon className="w-4 h-4 text-red-500" />
            <span>ই-পেপার পুরনো আর্কাইভ ও তারিখ নির্বাচন</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Quick Presets */}
          <div>
            <label className="block text-stone-400 mb-2 font-medium">দ্রুত নির্বাচন:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handlePresetSelect(0)}
                className="bg-red-800 hover:bg-red-700 text-white py-1.5 px-2 rounded font-semibold text-center transition-colors"
              >
                আজকের পত্রিকা
              </button>
              <button
                onClick={() => handlePresetSelect(1)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 py-1.5 px-2 rounded text-center transition-colors"
              >
                গতকাল
              </button>
              <button
                onClick={() => handlePresetSelect(2)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 py-1.5 px-2 rounded text-center transition-colors"
              >
                গত পরশু
              </button>
              <button
                onClick={() => handlePresetSelect(7)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 py-1.5 px-2 rounded text-center transition-colors"
              >
                ৭ দিন আগের
              </button>
            </div>
          </div>

          {/* Month / Year selection */}
          <div className="bg-stone-950 p-3 rounded border border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-stone-300">
              <span className="font-semibold text-amber-400">
                {monthsBangla[selectedMonth]} {toBanglaNumber(selectedYear)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (selectedMonth > 0) setSelectedMonth(selectedMonth - 1);
                  }}
                  className="p-1 bg-stone-800 hover:bg-stone-700 rounded text-stone-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (selectedMonth < 11) setSelectedMonth(selectedMonth + 1);
                  }}
                  className="p-1 bg-stone-800 hover:bg-stone-700 rounded text-stone-300"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Days grid 1 to 30 */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'].map((d, i) => (
                <div key={i} className="text-[10px] text-stone-500 font-bold py-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const isSelected = day === selectedDay;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`py-1.5 rounded text-xs font-semibold transition-colors ${
                      isSelected
                        ? 'bg-red-700 text-white ring-1 ring-red-400'
                        : 'text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {toBanglaNumber(day)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-stone-800">
            <span className="text-[11px] text-stone-400 truncate max-w-56">
              বর্তমান: {currentDateText}
            </span>
            <button
              onClick={handleApplyCustomDate}
              className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-4 py-1.5 rounded transition-colors flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              তারিখ লোড করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
