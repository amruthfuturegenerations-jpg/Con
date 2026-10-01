import React, { useState } from 'react';
import {
  Calendar,
  User,
  Paperclip,
  Clock,
  Edit2,
  Trash2,
  Copy,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TaskAttachment } from '../types';
import { AttachmentViewerModal } from './AttachmentViewerModal';

interface TaskCardViewProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onQuickUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onQuickUpdatePriority: (taskId: string, newPriority: TaskPriority) => void;
}

const PRIORITY_BADGES: Record<
  TaskPriority,
  { label: string; bg: string; text: string; border: string }
> = {
  1: { label: 'P1 Lowest', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  2: { label: 'P2 Minor', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  3: { label: 'P3 Standard', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-300' },
  4: { label: 'P4 Urgent', bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-300' },
  5: { label: 'P5 Critical', bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-300' },
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

export const TaskCardView: React.FC<TaskCardViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onQuickUpdateStatus,
  onQuickUpdatePriority,
}) => {
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [selectedAttachment, setSelectedAttachment] = useState<TaskAttachment | null>(null);

  const toggleComment = (id: string) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isOverdue = (dueDate: string, status: TaskStatus) => {
    if (!dueDate || status === 'Completed') return false;
    const due = new Date(dueDate + 'T23:59:59').getTime();
    return due < Date.now();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {tasks.map((task) => {
        const overdue = isOverdue(task.dueDate, task.status);
        const pBadge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES[3];
        const sPill = STATUS_CONFIG[task.status] || STATUS_CONFIG['Not Started'];
        const isCommentExpanded = !!expandedComments[task.id];

        return (
          <div
            key={task.id}
            className="group relative flex flex-col justify-between rounded-xl bg-white border border-slate-200 hover:border-slate-300 p-4 shadow-sm transition"
          >
            {/* Top row: SL No, Priority, Status */}
            <div>
              <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center font-mono font-bold text-xs text-amber-900">
                    #{task.slNo}
                  </span>

                  {/* Priority Selector */}
                  <select
                    value={task.priority}
                    onChange={(e) => onQuickUpdatePriority(task.id, Number(e.target.value) as TaskPriority)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold border cursor-pointer outline-none ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}
                  >
                    <option value={1} className="bg-white text-slate-700">P1 Low</option>
                    <option value={2} className="bg-white text-blue-800">P2 Minor</option>
                    <option value={3} className="bg-white text-amber-900">P3 Standard</option>
                    <option value={4} className="bg-white text-orange-900">P4 Urgent</option>
                    <option value={5} className="bg-white text-red-900">P5 Critical</option>
                  </select>
                </div>

                {/* Status Dropdown */}
                <div className="relative inline-block">
                  <select
                    value={task.status}
                    onChange={(e) => onQuickUpdateStatus(task.id, e.target.value as TaskStatus)}
                    className={`appearance-none pl-5 pr-3 py-1 rounded-full text-xs font-semibold border cursor-pointer outline-none ${sPill.pillClass}`}
                  >
                    <option value="Not Started" className="bg-white text-red-800">Not Started</option>
                    <option value="In Progress" className="bg-white text-amber-900">In Progress</option>
                    <option value="Completed" className="bg-white text-emerald-800">Completed</option>
                  </select>
                  <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${sPill.dot}`} />
                </div>
              </div>

              {/* Task Name */}
              <h4
                onClick={() => onEditTask(task)}
                className="text-sm font-bold text-slate-900 hover:text-amber-800 cursor-pointer transition line-clamp-2"
              >
                {task.taskName}
              </h4>

              {/* People Assigned / Assigner */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Assignee</span>
                  <div className="flex items-center gap-1.5 text-slate-900 truncate" title={task.personToAssign}>
                    <User className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span className="truncate font-semibold">{task.personToAssign || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="overflow-hidden border-l border-slate-200 pl-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Assigner</span>
                  <div className="flex items-center gap-1.5 text-slate-600 truncate" title={task.taskAssigner}>
                    <span className="truncate">{task.taskAssigner || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="mt-2.5 flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Assign: {task.dateOfAssign || '—'}</span>
                </div>

                <div
                  className={`flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded ${
                    overdue
                      ? 'bg-red-100 text-red-800 font-bold border border-red-300'
                      : 'text-slate-600'
                  }`}
                >
                  <Calendar className={`w-3.5 h-3.5 ${overdue ? 'text-red-500' : 'text-slate-400'}`} />
                  <span>Due: {task.dueDate || '—'}</span>
                  {overdue && <AlertCircle className="w-3 h-3 text-red-500" />}
                </div>
              </div>

              {/* Priority Comments */}
              {task.priorityComments && (
                <div className="mt-2.5 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-amber-700" />
                      Priority Notes
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleComment(task.id)}
                      className="text-amber-700 hover:text-amber-800 lowercase font-medium"
                    >
                      {isCommentExpanded ? 'collapse' : 'expand'}
                    </button>
                  </div>
                  <p className={`text-slate-700 text-[11px] ${isCommentExpanded ? '' : 'line-clamp-2'}`}>
                    {task.priorityComments}
                  </p>
                </div>
              )}

              {/* Attachments preview */}
              {task.attachments && task.attachments.length > 0 && (
                <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                  {task.attachments.map((att) => {
                    return (
                      <button
                        key={att.id}
                        type="button"
                        onClick={() => setSelectedAttachment(att)}
                        className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] border border-slate-300 transition"
                      >
                        <Paperclip className="w-3 h-3 text-amber-700" />
                        <span className="truncate max-w-[100px]">{att.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Row: Timestamp & Actions */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Updated: {task.lastUpdated || 'Just now'}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onDuplicateTask(task)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-amber-700 transition"
                  title="Duplicate task"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onEditTask(task)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                  title="Edit task"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Attachment Lightbox Modal */}
      <AttachmentViewerModal
        attachment={selectedAttachment}
        onClose={() => setSelectedAttachment(null)}
      />
    </div>
  );
};
