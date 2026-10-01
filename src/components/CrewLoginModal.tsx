import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Shield,
  Radio,
  Check,
  LogIn,
  Users,
  HardHat,
  Sparkles,
} from 'lucide-react';
import { CrewMember } from '../types';
import { PRESET_CREW_PROFILES } from '../utils/syncService';

interface CrewLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCrew: CrewMember;
  activeCrewList: CrewMember[];
  onLogin: (crewInfo: { name: string; role: string; avatarColor?: string; email?: string }) => Promise<void>;
}

const AVATAR_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#ef4444', '#f97316'];

export const CrewLoginModal: React.FC<CrewLoginModalProps> = ({
  isOpen,
  onClose,
  currentCrew,
  activeCrewList,
  onLogin,
}) => {
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [selectedColor, setSelectedColor] = useState('#f59e0b');
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = async (preset: (typeof PRESET_CREW_PROFILES)[0]) => {
    setIsSubmitting(true);
    await onLogin({
      name: preset.name,
      role: preset.role,
      avatarColor: preset.avatarColor,
      email: preset.email,
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    setIsSubmitting(true);
    await onLogin({
      name: customName.trim(),
      role: customRole.trim() || 'Site Supervisor',
      avatarColor: selectedColor,
      email: customEmail.trim(),
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6 text-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
              <HardHat className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Crew Authentication & Live Sync</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Log in so any task update you make is immediately visible to all site crew
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Logged In Badge */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-xs"
              style={{ backgroundColor: currentCrew.avatarColor || '#f59e0b' }}
            >
              {currentCrew.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{currentCrew.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold border border-amber-300">
                  {currentCrew.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Currently logged in on this device • Real-time broadcaster active
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>Connected</span>
          </div>
        </div>

        {/* Active Online Crew Presence Strip */}
        {activeCrewList.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                Crew Currently Online ({activeCrewList.length})
              </span>
              <span className="text-emerald-700 font-mono lowercase">syncing across devices</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {activeCrewList.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs shrink-0 shadow-2xs"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: m.avatarColor || '#f59e0b' }}
                  />
                  <span className="font-semibold text-slate-800">{m.name}</span>
                  <span className="text-[10px] text-slate-500">({m.role})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Switch / Log In Tabs */}
        <div className="mt-4 flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setMode('preset')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              mode === 'preset'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Preset Crew Role</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              mode === 'custom'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span>Custom Name & Credentials</span>
          </button>
        </div>

        {/* Body content */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
          {mode === 'preset' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_CREW_PROFILES.map((preset) => {
                const isSelected = currentCrew.name === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40'
                        : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs"
                        style={{ backgroundColor: preset.avatarColor }}
                      >
                        {preset.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate">{preset.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">{preset.role}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="p-1 rounded-full bg-amber-500 text-slate-950 ml-2 shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Full Name / Callsign <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amruth (Future Generations) or Jack Smith"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Site Role / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Project Director, Electrical Subcontractor, QA Inspector"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Email / Phone (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-amber-500 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Avatar Color Badge
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-6 h-6 rounded-full transition ${
                        selectedColor === c ? 'ring-2 ring-slate-900 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95"
                >
                  Log In & Sync With Crew
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Instant sync works across multiple devices and browser tabs simultaneously</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
