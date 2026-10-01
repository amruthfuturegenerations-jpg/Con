import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  Copy,
  Paperclip,
  Calendar,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Plus,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, TaskAttachment } from '../types';
import { AttachmentViewerModal } from './AttachmentViewerModal';

interface TaskTableViewProps {
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
  1: { label: '1 - Low', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  2: { label: '2 - Minor', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  3: { label: '3 - Standard', bg: 'bg-amber-50', text: 'text-amber-900', border: 'border-amber-300' },
  4: { label: '4 - Urgent', bg: 'bg-orange-50', text: 'text-orange-900', border: 'border-orange-300' },
  5: { label: '5 - Critical', bg: 'bg-red-50', text: 'text-red-900', border: 'border-red-300' },
};

const STATUS_PILLS: Record<
  TaskStatus,
  { pillClass: string; dot: string }
> = {
  'Not Started': {
    pillClass: 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100',
    dot: 'bg-red-500',
  },
  'In Progress': {
    pillClass: 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100',
    dot: 'bg-amber-500',
  },
  'Completed': {
    pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100',
    dot: 'bg-emerald-500',
  },
};

export const TaskTableView: React.FC<TaskTableViewProps> = ({
  tasks,
  onEditTask,
  onDeleteTask,
  onDuplicateTask,
  onQuickUpdateStatus,
  onQuickUpdatePriority,
}) => {
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [selectedAttachment, setSelectedAttachment] = useState<TaskAttachment | null>(null);

  const toggleComment = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isOverdue = (dueDate: string, status: TaskStatus) => {
    if (!dueDate || status === 'Completed') return false;
    const due = new Date(dueDate + 'T23:59:59').getTime();
    return due < Date.now();
  };

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        {/* Table Header with High-Contrast Industrial Design */}
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
            <th className="py-3 px-3 w-14 text-center font-mono">1. SL</th>
            <th className="py-3 px-4 min-w-[240px]">2. Task Name</th>
            <th className="py-3 px-3 min-w-[110px]">3. Assigned</th>
            <th className="py-3 px-3 min-w-[110px]">4. Due Date</th>
            <th className="py-3 px-3 min-w-[160px]">5. Person to Assign</th>
            <th className="py-3 px-3 min-w-[160px]">6. Assigner</th>
            <th className="py-3 px-3 min-w-[110px] text-center">7. Priority</th>
            <th className="py-3 px-3 min-w-[125px] text-center">8. Status</th>
            <th className="py-3 px-3 min-w-[100px] text-center">9. Attachments</th>
            <th className="py-3 px-4 min-w-[200px]">10. Priority Comments</th>
            <th className="py-3 px-3 min-w-[125px]">11. Last Updated</th>
            <th className="py-3 px-3 text-right w-24">Actions</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status);
            const isCommentExpanded = !!expandedComments[task.id];
            const pBadge = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES[3];
            const sPill = STATUS_PILLS[task.status] || STATUS_PILLS['Not Started'];

            return (
              <tr
                key={task.id}
                className="hover:bg-slate-50 transition-colors group cursor-pointer"
                onClick={() => onEditTask(task)}
              >
                {/* 1. SL No. */}
                <td className="py-3 px-3 text-center font-mono font-bold text-amber-800 bg-amber-50/40">
                  #{task.slNo}
                </td>

                {/* 2. Task Name */}
                <td className="py-3 px-4 text-slate-900 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate max-w-[260px] sm:max-w-[360px] group-hover:text-amber-800 transition-colors">
                      {task.taskName}
                    </span>
                  </div>
                </td>

                {/* 3. Date of Assign */}
                <td className="py-3 px-3 text-slate-600 font-mono whitespace-nowrap">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{task.dateOfAssign || '—'}</span>
                  </div>
                </td>

                {/* 4. Due Date */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <div
                    className={`inline-flex items-center gap-1 font-mono text-[11px] px-1.5 py-0.5 rounded ${
                      overdue
                        ? 'bg-red-100 text-red-800 font-bold border border-red-300 animate-pulse'
                        : 'text-slate-600'
                    }`}
                  >
                    <Calendar className={`w-3.5 h-3.5 ${overdue ? 'text-red-500' : 'text-slate-400'}`} />
                    <span>{task.dueDate || '—'}</span>
                    {overdue && <AlertCircle className="w-3 h-3 text-red-500" />}
                  </div>
                </td>

                {/* 5. Person to Assign */}
                <td className="py-3 px-3 text-slate-800">
                  <div className="flex items-center gap-1.5 truncate max-w-[170px]" title={task.personToAssign}>
                    <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[9px] font-bold text-amber-900 shrink-0">
                      {task.personToAssign ? task.personToAssign.slice(0, 1).toUpperCase() : '?'}
                    </div>
                    <span className="truncate">{task.personToAssign || '—'}</span>
                  </div>
                </td>

                {/* 6. Task Assigner */}
                <td className="py-3 px-3 text-slate-500">
                  <div className="flex items-center gap-1.5 truncate max-w-[170px]" title={task.taskAssigner}>
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{task.taskAssigner || '—'}</span>
                  </div>
                </td>

                {/* 7. Priority (Interactive inline changer) */}
                <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={task.priority}
                    onChange={(e) => onQuickUpdatePriority(task.id, Number(e.target.value) as TaskPriority)}
                    className={`px-2 py-1 rounded text-[11px] font-bold border cursor-pointer outline-none transition ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}
                  >
                    <option value={1} className="bg-white text-slate-700">1 - Low</option>
                    <option value={2} className="bg-white text-blue-800">2 - Minor</option>
                    <option value={3} className="bg-white text-amber-900">3 - Standard</option>
                    <option value={4} className="bg-white text-orange-900">4 - Urgent</option>
                    <option value={5} className="bg-white text-red-900">5 - Critical</option>
                  </select>
                </td>

                {/* 8. Status (Interactive inline changer) */}
                <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="relative inline-block">
                    <select
                      value={task.status}
                      onChange={(e) => onQuickUpdateStatus(task.id, e.target.value as TaskStatus)}
                      className={`appearance-none pl-5 pr-4 py-1 rounded-full text-[11px] font-semibold border cursor-pointer outline-none transition ${sPill.pillClass}`}
                    >
                      <option value="Not Started" className="bg-white text-red-800">Not Started</option>
                      <option value="In Progress" className="bg-white text-amber-900">In Progress</option>
                      <option value="Completed" className="bg-white text-emerald-800">Completed</option>
                    </select>
                    <span className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${sPill.dot}`} />
                  </div>
                </td>

                {/* 9. Attachments */}
                <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  {task.attachments && task.attachments.length > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedAttachment(task.attachments[0])}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-amber-800 font-mono text-[11px] border border-slate-300 transition"
                        title="View attachments"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>{task.attachments.length}</span>
                      </button>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px]">—</span>
                  )}
                </td>

                {/* 10. Priority Comments */}
                <td className="py-3 px-4 text-slate-700 max-w-[240px]">
                  {task.priorityComments ? (
                    <div>
                      <p
                        className={`text-xs text-slate-700 font-sans ${
                          isCommentExpanded ? 'whitespace-normal' : 'line-clamp-1 truncate'
                        }`}
                        title={task.priorityComments}
                      >
                        {task.priorityComments}
                      </p>
                      {task.priorityComments.length > 40 && (
                        <button
                          type="button"
                          onClick={(e) => toggleComment(task.id, e)}
                          className="text-[10px] text-amber-700 hover:text-amber-800 font-medium inline-flex items-center gap-0.5 mt-0.5"
                        >
                          {isCommentExpanded ? (
                            <>
                              <ChevronUp className="w-3 h-3" /> Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" /> More
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400 text-[11px] italic">No comments</span>
                  )}
                </td>

                {/* 11. Last Updated */}
                <td className="py-3 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{task.lastUpdated || 'Just now'}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onDuplicateTask(task)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-amber-700 transition"
                      title="Duplicate task"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-slate-500 hover:text-red-600 transition"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Attachment Preview Viewer */}
      <AttachmentViewerModal
        attachment={selectedAttachment}
        onClose={() => setSelectedAttachment(null)}
      />
    </div>
  );
};
