import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, Clock } from 'lucide-react';

interface YearRangeDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  minYearOffset?: number; // e.g. -10
  maxYearOffset?: number; // e.g. +10
  className?: string;
  required?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SHORT_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const YearRangeDatePicker: React.FC<YearRangeDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  minYearOffset = -10,
  maxYearOffset = 10,
  className = '',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reference current date
  const today = new Date();
  const currentYear = today.getFullYear();
  const minYear = currentYear + minYearOffset;
  const maxYear = currentYear + maxYearOffset;

  // Internal view state
  const initialDate = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear() || currentYear);
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth() ?? today.getMonth());
  const [yearPickerMode, setYearPickerMode] = useState<boolean>(false);

  // Sync view when opened or value changed
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value, isOpen]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setYearPickerMode(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Generate Year Array for 10-year past to 10-year future
  const availableYears: number[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    availableYears.push(y);
  }

  // Days in month calculation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInCurrentMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);

  // Quick navigation
  const jumpYear = (delta: number) => {
    const target = viewYear + delta;
    if (target >= minYear && target <= maxYear) {
      setViewYear(target);
    }
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      if (viewYear > minYear) {
        setViewYear(viewYear - 1);
        setViewMonth(11);
      }
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      if (viewYear < maxYear) {
        setViewYear(viewYear + 1);
        setViewMonth(0);
      }
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const selectedStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange(selectedStr);
    setIsOpen(false);
    setYearPickerMode(false);
  };

  // Quick presets
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChange(`${y}-${m}-${day}`);
    setIsOpen(false);
    setYearPickerMode(false);
  };

  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Format display text
  const displayFormatted = value ? value : '';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Input Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-300 hover:border-slate-400 focus-within:border-amber-500 rounded-lg cursor-pointer text-sm text-slate-800 transition shadow-xs select-none"
      >
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <CalendarIcon className="w-4 h-4 text-amber-600 shrink-0" />
          <span className={displayFormatted ? 'text-slate-900 font-medium font-mono' : 'text-slate-400'}>
            {displayFormatted || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={clearDate}
              title="Clear date"
              className="p-1 hover:text-red-500 text-slate-400 hover:bg-slate-100 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Extended 10-Year Calendar Popover / Modal */}
      {isOpen && (
        <div className="absolute z-50 mt-1 left-0 sm:left-auto right-0 sm:right-auto w-[310px] sm:w-[330px] rounded-xl bg-white border border-slate-200 shadow-2xl p-3.5 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
          
          {/* Calendar Header with explicit 10-Year Navigators */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => jumpYear(-5)}
                title="Back 5 Years (-5y)"
                disabled={viewYear - 5 < minYear}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 hover:text-amber-600"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Middle Selectors: Month & Explicit Year Button */}
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer font-sans"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name.slice(0, 3)}
                  </option>
                ))}
              </select>

              {/* Year Dropdown with +/- 10 Year Range */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-amber-700 font-mono font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setYearPickerMode(!yearPickerMode)}
                className={`px-1.5 py-1 rounded text-[11px] font-mono border transition ${
                  yearPickerMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-400'
                }`}
                title="Toggle Year Matrix (±10 Years)"
              >
                ±10Y
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => jumpYear(5)}
                title="Forward 5 Years (+5y)"
                disabled={viewYear + 5 > maxYear}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-500 hover:text-amber-600"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Year Matrix (If toggled for instant decade navigation) */}
          {yearPickerMode ? (
            <div className="my-2">
              <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                <span>Select Year (Range: {minYear} - {maxYear})</span>
                <span className="text-amber-600 font-mono">Current: {viewYear}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto pr-1">
                {availableYears.map((yr) => {
                  const isCurrent = yr === currentYear;
                  const isSelected = yr === viewYear;
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        setViewYear(yr);
                        setYearPickerMode(false);
                      }}
                      className={`py-1.5 text-xs font-mono rounded transition ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : isCurrent
                          ? 'bg-amber-50 border border-amber-300 text-amber-800 font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-1">
                {SHORT_DAYS.map((d) => (
                  <div key={d} className="py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty placeholders for offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7" />
                ))}

                {/* Day numbers */}
                {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
                  const day = i + 1;
                  const formattedMonth = String(viewMonth + 1).padStart(2, '0');
                  const formattedDay = String(day).padStart(2, '0');
                  const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;

                  const isSelected = value === dateStr;
                  const isToday =
                    today.getFullYear() === viewYear &&
                    today.getMonth() === viewMonth &&
                    today.getDate() === day;

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleSelectDay(day)}
                      className={`h-7 w-full flex items-center justify-center rounded text-xs font-mono transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                          : isToday
                          ? 'border border-amber-500 text-amber-700 font-bold hover:bg-amber-50'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Quick Presets Bar */}
          <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] gap-1 flex-wrap">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setQuickDate(0)}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(1)}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(7)}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                +7d
              </button>
              <button
                type="button"
                onClick={() => setQuickDate(30)}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
              >
                +30d
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="px-2 py-1 text-slate-500 hover:text-red-600 font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
