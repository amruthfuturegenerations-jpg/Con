import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Save,
  Paperclip,
  Camera,
  AlertTriangle,
  FileCheck,
  Trash2,
  Eye,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TaskAttachment } from '../types';
import { YearRangeDatePicker } from './YearRangeDatePicker';
import { AutosuggestInput } from './AutosuggestInput';
import { AttachmentViewerModal } from './AttachmentViewerModal';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  taskToEdit?: Task | null;
  projectId: string;
  nextSlNo: number;
}

const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  1: { label: '1 - Lowest', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  2: { label: '2 - Minor', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  3: { label: '3 - Standard', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-300' },
  4: { label: '4 - Urgent', bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-300' },
  5: { label: '5 - Critical', bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-300' },
};

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; pillClass: string; dot: string }
> = {
  'Not Started': {
    label: 'Not Started',
    pillClass: 'bg-red-50 text-red-800 border-red-200',
    dot: 'bg-red-500',
  },
  'In Progress': {
    label: 'In Progress',
    pillClass: 'bg-amber-50 text-amber-900 border-amber-300',
    dot: 'bg-amber-500',
  },
  'Completed': {
    label: 'Completed',
    pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
  },
};

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  projectId,
  nextSlNo,
}) => {
  const [taskName, setTaskName] = useState('');
  const [dateOfAssign, setDateOfAssign] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [personToAssign, setPersonToAssign] = useState('');
  const [taskAssigner, setTaskAssigner] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(3);
  const [status, setStatus] = useState<TaskStatus>('Not Started');
  const [priorityComments, setPriorityComments] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [activePreviewAttachment, setActivePreviewAttachment] = useState<TaskAttachment | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form on open or taskToEdit change
  useEffect(() => {
    if (taskToEdit) {
      setTaskName(taskToEdit.taskName || '');
      setDateOfAssign(taskToEdit.dateOfAssign || '');
      setDueDate(taskToEdit.dueDate || '');
      setPersonToAssign(taskToEdit.personToAssign || '');
      setTaskAssigner(taskToEdit.taskAssigner || '');
      setPriority(taskToEdit.priority || 3);
      setStatus(taskToEdit.status || 'Not Started');
      setPriorityComments(taskToEdit.priorityComments || '');
      setAttachments(taskToEdit.attachments || []);
    } else {
      // Defaults for new task
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      setTaskName('');
      setDateOfAssign(today);
      setDueDate(nextWeek);
      setPersonToAssign('');
      setTaskAssigner('');
      setPriority(3);
      setStatus('Not Started');
      setPriorityComments('');
      setAttachments([]);
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  // File Upload to Base64 (IndexedDB compatible)
  const handleFilesChosen = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newAttachment: TaskAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl,
          uploadedAt: new Date().toISOString(),
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim()) return;

    const taskData: Task = {
      id: taskToEdit ? taskToEdit.id : `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      projectId: taskToEdit ? taskToEdit.projectId : projectId,
      slNo: taskToEdit ? taskToEdit.slNo : nextSlNo,
      taskName: taskName.trim(),
      dateOfAssign,
      dueDate,
      personToAssign: personToAssign.trim(),
      taskAssigner: taskAssigner.trim(),
      priority,
      status,
      attachments,
      priorityComments: priorityComments.trim(),
      lastUpdated: '', // Will be stamped in db.saveTask
      createdAt: taskToEdit ? taskToEdit.createdAt : new Date().toISOString(),
    };

    onSave(taskData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-100">
      <div className="relative w-full max-w-2xl my-auto rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 font-mono font-bold text-sm">
              #{taskToEdit ? taskToEdit.slNo : nextSlNo}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {taskToEdit ? 'Edit Field Task' : 'Create New Site Task'}
              </h3>
              <p className="text-[11px] text-slate-500">
                SL No. {taskToEdit ? taskToEdit.slNo : nextSlNo} • Auto-sequenced
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* 1. Task Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Task Description / Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Pour grade beam concrete in Sector 4 & check rebar alignment"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-amber-500 focus:bg-white rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition"
              autoFocus
            />
          </div>

          {/* 2. Date of Assign & Due Date (Extended 10-Year Pickers) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <YearRangeDatePicker
              label="Date of Assign (±10 Years)"
              value={dateOfAssign}
              onChange={setDateOfAssign}
              placeholder="YYYY-MM-DD"
              minYearOffset={-10}
              maxYearOffset={10}
            />

            <YearRangeDatePicker
              label="Due Date (±10 Years)"
              value={dueDate}
              onChange={setDueDate}
              placeholder="YYYY-MM-DD"
              minYearOffset={-10}
              maxYearOffset={10}
            />
          </div>

          {/* 3. Person to Assign & Task Assigner (Autosuggest & Memory) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <AutosuggestInput
              label="Person to Assign (Assignee)"
              value={personToAssign}
              onChange={setPersonToAssign}
              placeholder="e.g., Vikram Singh (Site Supervisor)"
            />

            <AutosuggestInput
              label="Task Assigner (Supervisor / Manager)"
              value={taskAssigner}
              onChange={setTaskAssigner}
              placeholder="e.g., Rajesh Kumar (Project Mgr)"
            />
          </div>

          {/* 4. Priority & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Priority Selector (1 to 5) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Priority Rating (1 to 5)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as TaskPriority[]).map((level) => {
                  const cfg = PRIORITY_CONFIG[level];
                  const isSelected = priority === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPriority(level)}
                      className={`py-2 px-1 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                        isSelected
                          ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-amber-500 font-bold scale-[1.02] shadow-sm`
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-sm font-black font-mono">{level}</span>
                      <span className="text-[9px] uppercase tracking-tighter truncate max-w-full">
                        {level === 1 ? 'Low' : level === 5 ? 'Crit' : level === 3 ? 'Std' : level === 2 ? 'Min' : 'Urg'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Execution Status
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Not Started', 'In Progress', 'Completed'] as TaskStatus[]).map((st) => {
                  const cfg = STATUS_CONFIG[st];
                  const isSelected = status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`py-2 px-1.5 rounded-lg border text-center transition flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? `${cfg.pillClass} ring-2 ring-amber-500 font-bold scale-[1.02] shadow-sm`
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 text-xs'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} shrink-0`} />
                      <span className="text-xs truncate">{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. Priority Comments (Expandable text area) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Priority Comments & Field Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Notes on safety precautions, special machinery required, site coordinates, or QC checkpoints..."
              value={priorityComments}
              onChange={(e) => setPriorityComments(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:border-amber-500 focus:bg-white rounded-lg p-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition resize-y font-sans"
            />
          </div>

          {/* 6. Attachments & Site Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-amber-600" />
                Attachments & Field Photos ({attachments.length})
              </label>
              <div className="flex items-center gap-1.5">
                {/* Take Photo on Mobile/Tablet */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition border border-amber-200"
                  title="Snap photo with device camera"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snap Photo</span>
                </button>

                {/* Upload File / Document */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-300"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>

                {/* Hidden Inputs */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFilesChosen(e.target.files)}
                  multiple
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => handleFilesChosen(e.target.files)}
                  className="hidden"
                />
              </div>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {attachments.map((att) => {
                  const isImg = att.type.startsWith('image/') || att.dataUrl.startsWith('data:image/');
                  return (
                    <div
                      key={att.id}
                      className="group relative flex items-center gap-2 p-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg overflow-hidden transition shadow-xs"
                    >
                      {/* Thumbnail */}
                      <div
                        onClick={() => setActivePreviewAttachment(att)}
                        className="w-10 h-10 rounded bg-slate-100 shrink-0 flex items-center justify-center overflow-hidden cursor-pointer"
                      >
                        {isImg ? (
                          <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-5 h-5 text-amber-600" />
                        )}
                      </div>

                      <div className="overflow-hidden flex-1 min-w-0 pr-6">
                        <div
                          onClick={() => setActivePreviewAttachment(att)}
                          className="text-xs font-medium text-slate-800 truncate cursor-pointer hover:text-amber-800"
                        >
                          {att.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {(att.size / 1024).toFixed(0)} KB
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAttachment(att.id)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 rounded transition"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 text-center cursor-pointer transition bg-slate-50/70"
              >
                <Paperclip className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-600">
                  Click to attach site photos, inspection checklists, or PDF blueprints
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Stored directly on your device via IndexedDB</p>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-200">
          <div className="text-[11px] text-slate-500">
            {taskToEdit?.lastUpdated && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                Last updated: {taskToEdit.lastUpdated}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-semibold text-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attachment Preview Lightbox */}
      <AttachmentViewerModal
        attachment={activePreviewAttachment}
        onClose={() => setActivePreviewAttachment(null)}
        onDelete={handleDeleteAttachment}
      />
    </div>
  );
};
