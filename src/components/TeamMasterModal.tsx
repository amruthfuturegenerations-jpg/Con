import React, { useState, useEffect } from 'react';
import { X, Users, Plus, Trash2, UserCheck, Shield } from 'lucide-react';
import { db } from '../utils/db';
import { TeamMember } from '../types';

interface TeamMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const TeamMasterModal: React.FC<TeamMasterModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');

  const loadMembers = async () => {
    try {
      const list = await db.getTeamMembers();
      setMembers(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    await db.recordPersonName(newName.trim());
    setNewName('');
    setNewRole('');
    await loadMembers();
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await db.deleteTeamMember(id);
    await loadMembers();
    onUpdate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 text-slate-800 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Team Directory & Autosuggest Memory</h3>
              <p className="text-xs text-slate-500">Saved assignees & supervisors across all sites</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Member Form */}
        <form onSubmit={handleAdd} className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Add Person to Memory
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Full name & site title..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 bg-white border border-slate-300 hover:border-slate-400 focus:border-amber-500 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none shadow-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </form>

        {/* Members List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-1 pr-1">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1 mb-1">
            Registered Team Members ({members.length})
          </div>
          {members.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No team members recorded yet.
            </div>
          ) : (
            members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
                    {m.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold text-slate-800 truncate">{m.name}</div>
                    <div className="text-[10px] text-slate-500">
                      Last used: {new Date(m.lastUsedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded transition opacity-60 group-hover:opacity-100"
                  title="Remove from master list"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
