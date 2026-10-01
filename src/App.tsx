import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  HardHat,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Users,
  LayoutGrid,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
  X,
  Layers,
  ChevronRight,
  Radio,
  LogIn,
  UserCheck,
} from 'lucide-react';
import { db } from './utils/db';
import { syncService } from './utils/syncService';
import {
  Project,
  Task,
  TaskPriority,
  TaskStatus,
  ViewMode,
  FilterOptions,
  SortOptions,
  CrewMember,
  LiveNotification,
} from './types';
import { ProjectTabs } from './components/ProjectTabs';
import { TaskTableView } from './components/TaskTableView';
import { TaskCardView } from './components/TaskCardView';
import { TaskModal } from './components/TaskModal';
import { ExportImportModal } from './components/ExportImportModal';
import { TeamMasterModal } from './components/TeamMasterModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { CrewLoginModal } from './components/CrewLoginModal';
import { LiveNotificationToast } from './components/LiveNotificationToast';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Crew & Real-Time Sync States
  const [currentCrew, setCurrentCrew] = useState<CrewMember>(() => syncService.getCurrentCrew());
  const [activeCrewList, setActiveCrewList] = useState<CrewMember[]>([]);
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);

  // View & Filter states
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortOptions['field']>('slNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Detect mobile width to default to card view on small screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setViewMode('cards');
    }
  }, []);

  // Initial Data Load
  const loadData = useCallback(async () => {
    try {
      const projList = await db.getProjects();
      setProjects(projList);

      setActiveProjectId((prev) => {
        if (prev && projList.some((p) => p.id === prev)) return prev;
        return projList[0]?.id || '';
      });

      const allTasks = await db.getAllTasks();
      setTasks(allTasks);
    } catch (err) {
      console.error('Failed to load database:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Real-Time Sync and SSE Connection Setup
  useEffect(() => {
    // 1. Initial local load
    loadData();

    // 2. Connect to real-time sync SSE stream
    syncService.connect();

    // 3. Initial pull from server
    syncService.syncFromServer().then(() => {
      loadData();
    });

    // 4. Subscriptions
    const unsubData = syncService.subscribeDataChange(() => {
      loadData();
    });

    const unsubNotif = syncService.subscribeNotification((notif) => {
      setNotifications((prev) => [notif, ...prev.slice(0, 4)]);
      // Auto-dismiss notification after 5s
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
      }, 5000);
    });

    const unsubCrew = syncService.subscribeCrewPresence((crew) => {
      setActiveCrewList(crew);
    });

    return () => {
      unsubData();
      unsubNotif();
      unsubCrew();
    };
  }, [loadData]);

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCrewLogin = async (info: { name: string; role: string; avatarColor?: string; email?: string }) => {
    const updated = await syncService.loginCrew(info);
    setCurrentCrew(updated);
  };

  // Active Project object
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || {
      id: 'default',
      name: 'Site Tasks',
      createdAt: '',
      updatedAt: '',
    };
  }, [projects, activeProjectId]);

  // Project Task Counts map
  const taskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      counts[p.id] = tasks.filter((t) => t.projectId === p.id).length;
    });
    return counts;
  }, [projects, tasks]);

  // Next SL No for the active project
  const nextSlNo = useMemo(() => {
    const currentProjectTasks = tasks.filter((t) => t.projectId === activeProjectId);
    if (currentProjectTasks.length === 0) return 1;
    return Math.max(...currentProjectTasks.map((t) => t.slNo || 0)) + 1;
  }, [tasks, activeProjectId]);

  // Unique assignees in current project for filter dropdown
  const uniqueAssignees = useMemo(() => {
    const set = new Set<string>();
    tasks
      .filter((t) => t.projectId === activeProjectId)
      .forEach((t) => {
        if (t.personToAssign?.trim()) set.add(t.personToAssign.trim());
      });
    return Array.from(set).sort();
  }, [tasks, activeProjectId]);

  // Filtered & Sorted Tasks for Active Project
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => task.projectId === activeProjectId)
      .filter((task) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = task.taskName?.toLowerCase().includes(q);
          const matchAssignee = task.personToAssign?.toLowerCase().includes(q);
          const matchAssigner = task.taskAssigner?.toLowerCase().includes(q);
          const matchComments = task.priorityComments?.toLowerCase().includes(q);
          const matchSl = task.slNo.toString().includes(q);
          if (!matchName && !matchAssignee && !matchAssigner && !matchComments && !matchSl) {
            return false;
          }
        }
        // Status filter
        if (statusFilter !== 'all' && task.status !== statusFilter) {
          return false;
        }
        // Priority filter
        if (priorityFilter !== 'all' && task.priority.toString() !== priorityFilter) {
          return false;
        }
        // Assignee filter
        if (assigneeFilter !== 'all' && task.personToAssign !== assigneeFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'slNo') {
          diff = a.slNo - b.slNo;
        } else if (sortField === 'priority') {
          diff = b.priority - a.priority; // higher priority first
        } else if (sortField === 'taskName') {
          diff = (a.taskName || '').localeCompare(b.taskName || '');
        } else if (sortField === 'dueDate') {
          diff = (a.dueDate || '').localeCompare(b.dueDate || '');
        } else if (sortField === 'dateOfAssign') {
          diff = (a.dateOfAssign || '').localeCompare(b.dateOfAssign || '');
        } else if (sortField === 'status') {
          diff = (a.status || '').localeCompare(b.status || '');
        } else if (sortField === 'lastUpdated') {
          diff = (a.lastUpdated || '').localeCompare(b.lastUpdated || '');
        }
        return sortDirection === 'asc' ? diff : -diff;
      });
  }, [tasks, activeProjectId, searchQuery, statusFilter, priorityFilter, assigneeFilter, sortField, sortDirection]);

  // Project KPI Metrics
  const metrics = useMemo(() => {
    const projectTasks = tasks.filter((t) => t.projectId === activeProjectId);
    const total = projectTasks.length;
    const notStarted = projectTasks.filter((t) => t.status === 'Not Started').length;
    const inProgress = projectTasks.filter((t) => t.status === 'In Progress').length;
    const completed = projectTasks.filter((t) => t.status === 'Completed').length;
    const critical = projectTasks.filter((t) => t.priority >= 4).length;
    const overdue = projectTasks.filter((t) => {
      if (t.status === 'Completed' || !t.dueDate) return false;
      return new Date(t.dueDate + 'T23:59:59').getTime() < Date.now();
    }).length;

    return { total, notStarted, inProgress, completed, critical, overdue };
  }, [tasks, activeProjectId]);

  // Handlers for Project Tabs
  const handleAddProject = async (name: string, description: string, color: string) => {
    const newProject: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      description,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await syncService.saveProject(newProject);
    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  const handleRenameProject = async (projectId: string, newName: string) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;
    const updated: Project = { ...proj, name: newName, updatedAt: new Date().toISOString() };
    await syncService.saveProject(updated);
    setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
  };

  const handleDeleteProject = async (projectId: string) => {
    await syncService.deleteProject(projectId);
    const remaining = projects.filter((p) => p.id !== projectId);
    setProjects(remaining);
    if (activeProjectId === projectId) {
      setActiveProjectId(remaining[0]?.id || '');
    }
    // Refresh tasks
    const allTasks = await db.getAllTasks();
    setTasks(allTasks);
  };

  // Handlers for Tasks
  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (task: Task) => {
    await syncService.saveTask(task);
    const allTasks = await db.getAllTasks();
    setTasks(allTasks);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Delete this task row from log?')) {
      await syncService.deleteTask(taskId);
      const allTasks = await db.getAllTasks();
      setTasks(allTasks);
    }
  };

  const handleDuplicateTask = async (task: Task) => {
    const nextSl = await db.getNextSlNo(task.projectId);
    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      slNo: nextSl,
      taskName: `${task.taskName} (Copy)`,
      status: 'Not Started',
      createdAt: new Date().toISOString(),
    };
    await syncService.saveTask(duplicated);
    const allTasks = await db.getAllTasks();
    setTasks(allTasks);
  };

  const handleQuickUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const now = new Date();
    const updated = {
      ...target,
      status: newStatus,
      lastUpdated: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    await syncService.saveTask(updated);
    const allTasks = await db.getAllTasks();
    setTasks(allTasks);
  };

  const handleQuickUpdatePriority = async (taskId: string, newPriority: TaskPriority) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const now = new Date();
    const updated = {
      ...target,
      priority: newPriority,
      lastUpdated: `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
    await syncService.saveTask(updated);
    const allTasks = await db.getAllTasks();
    setTasks(allTasks);
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 text-slate-800 font-sans selection:bg-amber-500 selection:text-slate-950 overflow-hidden">
      {/* Top Application Header Bar */}
      <header className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0 shadow-sm z-20">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
            <HardHat className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                <span>CONSTRUCTPRO</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-amber-800 font-bold">
                  PWA
                </span>
              </h1>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 hidden xs:block font-medium truncate max-w-[200px] sm:max-w-none">
              Real-Time Crew Sync & Site Task Manager
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2">
          {/* Crew Log In & Live Sync Status */}
          <button
            type="button"
            onClick={() => setIsCrewModalOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold border border-amber-300 transition shadow-xs group"
            title="Crew Sign In / View Online Crew"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-2xs"
              style={{ backgroundColor: currentCrew.avatarColor || '#f59e0b' }}
            >
              {currentCrew.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex flex-col text-left leading-tight max-w-[90px] sm:max-w-[140px] truncate">
              <span className="truncate">{currentCrew.name}</span>
              <span className="text-[9px] text-amber-700 font-medium truncate">{currentCrew.role}</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live
            </span>
          </button>

          {/* Team Memory Directory */}
          <button
            type="button"
            onClick={() => setIsTeamModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
            title="Manage Team Directory & Autosuggest Memory"
          >
            <Users className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Team Memory</span>
          </button>

          {/* Export / Backup */}
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition"
            title="Export CSV / JSON Backup"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Backup / CSV</span>
          </button>

          {/* In-App PWA Install Button */}
          <PWAInstallButton />
        </div>
      </header>

      {/* Multi-Project Architecture Tabs Bar */}
      <ProjectTabs
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={(id) => setActiveProjectId(id)}
        onAddProject={handleAddProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
        taskCounts={taskCounts}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 flex flex-col space-y-4">
        {/* KPI Field Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {/* Total Tasks */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Tasks</span>
              <div className="text-lg sm:text-xl font-mono font-black text-slate-900">{metrics.total}</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          {/* Not Started (Red) */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Not Started</span>
              <div className="text-lg sm:text-xl font-mono font-black text-red-600">{metrics.notStarted}</div>
            </div>
            <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* In Progress (Amber) */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">In Progress</span>
              <div className="text-lg sm:text-xl font-mono font-black text-amber-600">{metrics.inProgress}</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>

          {/* Completed (Green) */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Completed</span>
              <div className="text-lg sm:text-xl font-mono font-black text-emerald-600">{metrics.completed}</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* Critical Priority (P4-P5) */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">Urgent/Crit</span>
              <div className="text-lg sm:text-xl font-mono font-black text-orange-600">{metrics.critical}</div>
            </div>
            <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Overdue</span>
              <div className="text-lg sm:text-xl font-mono font-black text-red-600">{metrics.overdue}</div>
            </div>
            <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Action Controls & Filtering Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
          {/* Left Controls: Search & Primary Add Button */}
          <div className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold shadow-sm hover:shadow-amber-500/20 active:scale-95 transition shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Task</span>
            </button>

            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks, assignees, notes..."
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded-lg pl-9 pr-8 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Controls: Filters, Sorter & View Toggle */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between md:justify-end">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="5">Priority 5 (Critical)</option>
              <option value="4">Priority 4 (Urgent)</option>
              <option value="3">Priority 3 (Standard)</option>
              <option value="2">Priority 2 (Minor)</option>
              <option value="1">Priority 1 (Lowest)</option>
            </select>

            {/* Assignee Filter */}
            {uniqueAssignees.length > 0 && (
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-amber-500 cursor-pointer hidden lg:block"
              >
                <option value="all">All Assignees</option>
                {uniqueAssignees.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Field Selector */}
            <div className="flex items-center rounded-lg bg-slate-50 border border-slate-200 p-0.5">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortOptions['field'])}
                className="bg-transparent text-xs text-slate-700 px-2 py-1 outline-none cursor-pointer"
              >
                <option value="slNo">SL No.</option>
                <option value="priority">Priority</option>
                <option value="dueDate">Due Date</option>
                <option value="dateOfAssign">Date Assigned</option>
                <option value="taskName">Task Name</option>
                <option value="status">Status</option>
                <option value="lastUpdated">Last Updated</option>
              </select>
              <button
                type="button"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:text-amber-600 text-slate-500"
                title={`Sort: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* View Mode Toggle: Table vs Cards */}
            <div className="flex items-center rounded-lg bg-slate-50 border border-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid / Table View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded transition ${
                  viewMode === 'cards' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Touch Card View (Mobile/Tablet)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Display */}
        <div className="flex-1 pb-12">
          {isLoading ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-mono">Loading field task log...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <HardHat className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm sm:text-base font-bold text-slate-800">No tasks found for this view</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try clearing active filters or changing your search criteria.'
                  : `Get started by creating the first task for "${activeProject.name}".`}
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task #1</span>
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <TaskTableView
              tasks={filteredTasks}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteTask}
              onDuplicateTask={handleDuplicateTask}
              onQuickUpdateStatus={handleQuickUpdateStatus}
              onQuickUpdatePriority={handleQuickUpdatePriority}
            />
          ) : (
            <TaskCardView
              tasks={filteredTasks}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteTask}
              onDuplicateTask={handleDuplicateTask}
              onQuickUpdateStatus={handleQuickUpdateStatus}
              onQuickUpdatePriority={handleQuickUpdatePriority}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile Screens */}
      <button
        type="button"
        onClick={handleOpenCreateModal}
        className="sm:hidden fixed right-4 bottom-5 z-40 w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl active:scale-95 transition"
        title="Create new task"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Modal: Task Add/Edit Form */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        projectId={activeProjectId}
        nextSlNo={nextSlNo}
      />

      {/* Modal: Export / Import & Backup */}
      <ExportImportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeProject={activeProject}
        onDataRestored={loadData}
      />

      {/* Modal: Team Memory Directory */}
      <TeamMasterModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onUpdate={loadData}
      />

      {/* Modal: Crew Login & Live Multi-User Roster */}
      <CrewLoginModal
        isOpen={isCrewModalOpen}
        onClose={() => setIsCrewModalOpen(false)}
        currentCrew={currentCrew}
        activeCrewList={activeCrewList}
        onLogin={handleCrewLogin}
      />

      {/* Real-Time Live Notification Toast */}
      <LiveNotificationToast
        notifications={notifications}
        onDismiss={handleDismissNotification}
      />

      {/* Non-intrusive Offline Indicator Banner */}
      <OfflineIndicator />
    </div>
  );
}
