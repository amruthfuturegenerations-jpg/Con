import React, { useState, useEffect, useRef } from 'react';
import { User, Check, Plus, ChevronDown, X } from 'lucide-react';
import { db } from '../utils/db';
import { TeamMember } from '../types';

interface AutosuggestInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
}

export const AutosuggestInput: React.FC<AutosuggestInputProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Type or choose a name...',
  required = false,
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load team members on mount and when dropdown opens
  const refreshMembers = async () => {
    try {
      const list = await db.getTeamMembers();
      setTeamMembers(list);
    } catch (e) {
      console.error('Failed to load team members:', e);
    }
  };

  useEffect(() => {
    refreshMembers();
  }, []);

  // Filter based on input
  const filtered = teamMembers.filter((m) =>
    m.name.toLowerCase().includes((value || '').toLowerCase())
  );

  const exactMatchExists = teamMembers.some(
    (m) => m.name.toLowerCase() === (value || '').trim().toLowerCase()
  );

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Persist typed custom name on blur
        if (value && value.trim()) {
          db.recordPersonName(value.trim()).then(refreshMembers);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [value]);

  const handleSelect = async (name: string) => {
    onChange(name);
    setIsOpen(false);
    await db.recordPersonName(name);
    refreshMembers();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && filtered[highlightedIndex]) {
        handleSelect(filtered[highlightedIndex].name);
      } else if (value && value.trim()) {
        handleSelect(value.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name[0] || 'U').toUpperCase();
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <div className="absolute left-3 text-slate-400 pointer-events-none">
          <User className="w-4 h-4 text-amber-600" />
        </div>

        <input
          id={id}
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            refreshMembers();
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-amber-500 text-slate-900 placeholder:text-slate-400 pl-9 pr-8 py-2 rounded-lg text-sm transition outline-none shadow-xs"
        />

        <div className="absolute right-2 flex items-center gap-1">
          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              title="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                refreshMembers();
                setIsOpen(!isOpen);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autosuggest Dropdown */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl bg-white border border-slate-200 shadow-xl p-1 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
          {/* Option to add custom typed name if not currently existing */}
          {value.trim() && !exactMatchExists && (
            <button
              type="button"
              onClick={() => handleSelect(value.trim())}
              className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200 mb-1 transition text-left"
            >
              <span className="flex items-center gap-2 truncate">
                <Plus className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Use new name: <strong className="text-slate-900 truncate">"{value.trim()}"</strong>
              </span>
              <span className="text-[10px] text-amber-700 bg-amber-200/60 px-1.5 py-0.5 rounded font-mono shrink-0">
                Auto-save
              </span>
            </button>
          )}

          {/* Master list suggestions */}
          {filtered.length > 0 ? (
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between border-b border-slate-100">
                <span>Recent Team Directory</span>
                <span>{filtered.length} names</span>
              </div>
              {filtered.map((member, index) => {
                const isSelected = value.trim().toLowerCase() === member.name.toLowerCase();
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={member.id || member.name}
                    type="button"
                    onClick={() => handleSelect(member.name)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition text-left ${
                      isHighlighted
                        ? 'bg-amber-50 text-amber-900'
                        : isSelected
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-amber-700 shrink-0">
                        {getInitials(member.name)}
                      </div>
                      <div className="truncate">
                        <div className="truncate font-medium">{member.name}</div>
                        {member.role && (
                          <div className="text-[10px] text-slate-400 truncate">{member.role}</div>
                        )}
                      </div>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          ) : (
            !value.trim() && (
              <div className="px-3 py-4 text-center text-xs text-slate-500">
                No team members saved yet. Type any name to add to directory.
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
