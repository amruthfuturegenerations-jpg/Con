import React, { useState } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, FolderKanban, Check, X } from 'lucide-react';
import { Project } from '../types';

interface ProjectTabsProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onAddProject: (name: string, description: string, color: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onDeleteProject: (projectId: string) => void;
  taskCounts: Record<string, number>;
}

const COLOR_PRESETS = [
  { name: 'Amber', hex: '#f59e0b' },
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Orange', hex: '#f97316' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Slate', hex: '#64748b' },
];

export const ProjectTabs: React.FC<ProjectTabsProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onAddProject,
  onRenameProject,
  onDeleteProject,
  taskCounts,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(COLOR_PRESETS[0].hex);

  // Tab action menu
  const [menuOpenForId, setMenuOpenForId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onAddProject(newProjectName.trim(), newProjectDesc.trim(), newProjectColor);
    setNewProjectName('');
    setNewProjectDesc('');
    setIsAddModalOpen(false);
  };

  const handleStartRename = (project: Project) => {
    setRenamingId(project.id);
    setRenameValue(project.name);
    setMenuOpenForId(null);
  };

  const handleSaveRename = (projectId: string) => {
    if (renameValue.trim()) {
      onRenameProject(projectId, renameValue.trim());
    }
    setRenamingId(null);
  };

  return (
    <div className="bg-slate-200/90 border-b border-slate-300 px-3 sm:px-6 pt-2 pb-0 flex items-center justify-between gap-3 shadow-inner">
      {/* Scrollable Tabs Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 -mb-px flex-1">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          const count = taskCounts[proj.id] || 0;
          const isRenaming = renamingId === proj.id;

          if (isRenaming) {
            return (
              <div
                key={proj.id}
                className="flex items-center gap-1 px-3 py-1.5 rounded-t-lg bg-white border-t-2 border-amber-500 shadow-sm"
              >
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(proj.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  autoFocus
                  className="bg-slate-50 text-xs px-2 py-1 rounded text-slate-900 border border-slate-300 focus:outline-none focus:border-amber-500 w-36 sm:w-48"
                />
                <button
                  type="button"
                  onClick={() => handleSaveRename(proj.id)}
                  className="p-1 hover:text-emerald-600 text-slate-600"
                  title="Save"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRenamingId(null)}
                  className="p-1 hover:text-red-500 text-slate-400"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={proj.id}
              className={`group relative flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 transition select-none cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white text-slate-900 border-amber-500 shadow-sm font-bold'
                  : 'bg-slate-100/90 text-slate-600 hover:text-slate-900 hover:bg-white/70 border-transparent'
              }`}
              onClick={() => onSelectProject(proj.id)}
            >
              {/* Project Indicator dot */}
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ring-1 ring-slate-300"
                style={{ backgroundColor: proj.color || '#f59e0b' }}
              />

              <span className="truncate max-w-[130px] sm:max-w-[220px]">
                {proj.name}
              </span>

              {/* Task Count Badge */}
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>

              {/* Action Dropdown Menu Trigger */}
              <div
                className="relative ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenForId(menuOpenForId === proj.id ? null : proj.id);
                }}
              >
                <button
                  type="button"
                  className="opacity-50 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                  title="Project options"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {/* Popover Menu */}
                {menuOpenForId === proj.id && (
                  <div
                    className="absolute z-40 right-0 top-full mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl p-1 text-slate-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleStartRename(proj)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-100 text-slate-800 transition text-left"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                      Rename Tab
                    </button>
                    {projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDeleteId(proj.id);
                          setMenuOpenForId(null);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg hover:bg-red-50 text-red-600 transition text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Project
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Dynamic + Add Project Tab Button */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg text-amber-800 hover:text-amber-900 hover:bg-white/60 transition shrink-0 border-b-2 border-transparent"
          title="Add New Project / Site Tab"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline font-bold">Add Site Tab</span>
        </button>
      </div>

      {/* Backdrop for tab menus */}
      {menuOpenForId && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setMenuOpenForId(null)}
        />
      )}

      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-5 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Create New Project / Site</h3>
                  <p className="text-xs text-slate-500">Add a separate task log tab for this job site</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Project / Site Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Site C - Electrical & HVAC"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-amber-500 focus:bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Scope / Location Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Building 4 sub-station conduits and chillers"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-amber-500 focus:bg-white rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Site Badge Color
                </label>
                <div className="flex items-center gap-2.5">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setNewProjectColor(color.hex)}
                      className={`w-7 h-7 rounded-full transition flex items-center justify-center ${
                        newProjectColor === color.hex ? 'ring-2 ring-amber-500 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {newProjectColor === color.hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm"
                >
                  Create Project Tab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 p-5 shadow-2xl text-slate-800">
            <h3 className="text-sm font-bold text-red-600 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Project Tab?
            </h3>
            <p className="mt-2 text-xs text-slate-600">
              Are you sure you want to delete this project tab? All associated tasks, attachments, and logs under this site will also be deleted from local storage.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Keep Project
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProject(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
