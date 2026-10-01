import { Project, Task, TeamMember } from '../types';

const DB_NAME = 'ConstructPro_PWA_DB';
const DB_VERSION = 1;

const STORES = {
  PROJECTS: 'projects',
  TASKS: 'tasks',
  TEAM_MEMBERS: 'teamMembers',
  SETTINGS: 'settings',
};

// Initial Seed Data for construction / site engineering
const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Site A - Earthworks & Foundation',
    description: 'Excavation, grading, piling, and ground compaction works.',
    color: '#f59e0b', // Amber
    createdAt: '2026-03-01T08:00:00.000Z',
    updatedAt: '2026-09-20T10:30:00.000Z',
  },
  {
    id: 'proj-2',
    name: 'Site B - Structural Framework',
    description: 'RCC columns, rebar reinforcement, formwork, and slab pouring.',
    color: '#3b82f6', // Blue
    createdAt: '2026-04-15T09:00:00.000Z',
    updatedAt: '2026-09-24T14:15:00.000Z',
  },
  {
    id: 'proj-3',
    name: 'Office & QA/Safety Compliance',
    description: 'Regulatory permits, material testing certifications, and site safety audits.',
    color: '#10b981', // Emerald
    createdAt: '2026-05-10T11:00:00.000Z',
    updatedAt: '2026-09-22T16:45:00.000Z',
  },
];

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  { id: 'tm-1', name: 'Rajesh Kumar (Project Mgr)', role: 'Project Manager', lastUsedAt: '2026-09-24T12:00:00.000Z' },
  { id: 'tm-2', name: 'Vikram Singh (Site Supervisor)', role: 'Field Supervisor', lastUsedAt: '2026-09-24T11:30:00.000Z' },
  { id: 'tm-3', name: 'Amina Bello (Safety Officer)', role: 'HSE Lead', lastUsedAt: '2026-09-23T15:00:00.000Z' },
  { id: 'tm-4', name: 'Carlos Morales (QC Inspector)', role: 'Quality Control', lastUsedAt: '2026-09-24T09:00:00.000Z' },
  { id: 'tm-5', name: 'Sarah Jenkins (Chief Structural)', role: 'Lead Engineer', lastUsedAt: '2026-09-22T14:20:00.000Z' },
  { id: 'tm-6', name: 'David Chen (Chief Surveyor)', role: 'Topographer', lastUsedAt: '2026-09-21T10:10:00.000Z' },
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-101',
    projectId: 'proj-1',
    slNo: 1,
    taskName: 'Inspect trench shoring and dewatering pumps in Zone 3',
    dateOfAssign: '2026-09-18',
    dueDate: '2026-09-25',
    personToAssign: 'Vikram Singh (Site Supervisor)',
    taskAssigner: 'Rajesh Kumar (Project Mgr)',
    priority: 5,
    status: 'In Progress',
    attachments: [
      {
        id: 'att-1',
        name: 'Zone3_trench_drainage.jpg',
        size: 245000,
        type: 'image/jpeg',
        dataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" fill="%23334155"/><text x="50%25" y="45%25" dominant-baseline="middle" text-anchor="middle" fill="%23fbbf24" font-size="16" font-family="sans-serif">Field Inspection Report: Zone 3</text><text x="50%25" y="65%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-size="12" font-family="sans-serif">Shoring depth check verified at 4.2m</text></svg>',
        uploadedAt: '2026-09-18T10:15:00.000Z',
      },
    ],
    priorityComments: 'Water table elevated after rain. Must maintain continuous pump cycle before next footing excavation.',
    lastUpdated: '2026-09-24 14:10',
    createdAt: '2026-09-18T08:30:00.000Z',
  },
  {
    id: 'task-102',
    projectId: 'proj-1',
    slNo: 2,
    taskName: 'Density & soil compaction lab test verification (ASTM D1557)',
    dateOfAssign: '2026-09-15',
    dueDate: '2026-09-22',
    personToAssign: 'Carlos Morales (QC Inspector)',
    taskAssigner: 'Sarah Jenkins (Chief Structural)',
    priority: 4,
    status: 'Completed',
    attachments: [],
    priorityComments: 'Achieved 98.4% modified Proctor compaction across test pits 1 through 8.',
    lastUpdated: '2026-09-22 17:00',
    createdAt: '2026-09-15T09:00:00.000Z',
  },
  {
    id: 'task-103',
    projectId: 'proj-1',
    slNo: 3,
    taskName: 'Install erosion control barriers along north boundary perimeter',
    dateOfAssign: '2026-09-23',
    dueDate: '2026-09-30',
    personToAssign: 'Amina Bello (Safety Officer)',
    taskAssigner: 'Rajesh Kumar (Project Mgr)',
    priority: 3,
    status: 'Not Started',
    attachments: [],
    priorityComments: 'Ensure silt fences comply with municipal stormwater discharge requirements.',
    lastUpdated: '2026-09-23 11:45',
    createdAt: '2026-09-23T11:45:00.000Z',
  },
  {
    id: 'task-201',
    projectId: 'proj-2',
    slNo: 1,
    taskName: 'Level 2 Column Rebar tying and spacer block check',
    dateOfAssign: '2026-09-20',
    dueDate: '2026-09-26',
    personToAssign: 'Vikram Singh (Site Supervisor)',
    taskAssigner: 'Sarah Jenkins (Chief Structural)',
    priority: 5,
    status: 'In Progress',
    attachments: [],
    priorityComments: 'Check 40mm clear cover on outer face columns C-12 through C-18 before shuttering closes.',
    lastUpdated: '2026-09-24 09:20',
    createdAt: '2026-09-20T08:00:00.000Z',
  },
  {
    id: 'task-202',
    projectId: 'proj-2',
    slNo: 2,
    taskName: 'Ready-mix batch plant slump test & concrete cube casting',
    dateOfAssign: '2026-09-24',
    dueDate: '2026-09-24',
    personToAssign: 'Carlos Morales (QC Inspector)',
    taskAssigner: 'Rajesh Kumar (Project Mgr)',
    priority: 4,
    status: 'In Progress',
    attachments: [],
    priorityComments: 'Casting 6 test cylinders for 7-day and 28-day compressive strength checks (M35 Grade).',
    lastUpdated: '2026-09-24 13:40',
    createdAt: '2026-09-24T08:30:00.000Z',
  },
  {
    id: 'task-301',
    projectId: 'proj-3',
    slNo: 1,
    taskName: 'Weekly site safety induction for 18 new subcontractors',
    dateOfAssign: '2026-09-21',
    dueDate: '2026-09-22',
    personToAssign: 'Amina Bello (Safety Officer)',
    taskAssigner: 'Rajesh Kumar (Project Mgr)',
    priority: 3,
    status: 'Completed',
    attachments: [],
    priorityComments: 'All signed PPE acknowledgment forms archived in field registry.',
    lastUpdated: '2026-09-22 16:15',
    createdAt: '2026-09-21T07:45:00.000Z',
  },
];

// IndexedDB Helper
class ConstructProDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isFallback = false;

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        this.isFallback = true;
        reject(new Error('IndexedDB not supported, falling back to localStorage'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Projects
        if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
          db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
        }

        // Tasks
        if (!db.objectStoreNames.contains(STORES.TASKS)) {
          const taskStore = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
          taskStore.createIndex('projectId', 'projectId', { unique: false });
          taskStore.createIndex('slNo', 'slNo', { unique: false });
        }

        // Team Members
        if (!db.objectStoreNames.contains(STORES.TEAM_MEMBERS)) {
          db.createObjectStore(STORES.TEAM_MEMBERS, { keyPath: 'id' });
        }

        // Settings / Meta
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = (e) => {
        console.warn('IndexedDB failed to open, switching to localStorage fallback:', e);
        this.isFallback = true;
        reject(e);
      };
    });

    return this.dbPromise;
  }

  // --- Projects ---
  async getProjects(): Promise<Project[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.PROJECTS, 'readonly');
        const store = tx.objectStore(STORES.PROJECTS);
        const request = store.getAll();
        request.onsuccess = () => {
          let projects = request.result as Project[];
          if (!projects || projects.length === 0) {
            // Seed defaults
            this.seedDefaults().then(resolve).catch(reject);
          } else {
            resolve(projects);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      // LocalStorage Fallback
      const raw = localStorage.getItem('constructpro_projects');
      if (!raw) {
        localStorage.setItem('constructpro_projects', JSON.stringify(DEFAULT_PROJECTS));
        return DEFAULT_PROJECTS;
      }
      return JSON.parse(raw);
    }
  }

  async saveProject(project: Project): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.PROJECTS, 'readwrite');
        const store = tx.objectStore(STORES.PROJECTS);
        const req = store.put(project);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const projects = await this.getProjects();
      const idx = projects.findIndex((p) => p.id === project.id);
      if (idx >= 0) projects[idx] = project;
      else projects.push(project);
      localStorage.setItem('constructpro_projects', JSON.stringify(projects));
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      const db = await this.initDB();
      // Delete project and all associated tasks
      const tx = db.transaction([STORES.PROJECTS, STORES.TASKS], 'readwrite');
      const pStore = tx.objectStore(STORES.PROJECTS);
      const tStore = tx.objectStore(STORES.TASKS);
      pStore.delete(projectId);

      const req = tStore.getAll();
      req.onsuccess = () => {
        const tasks = req.result as Task[];
        tasks.filter((t) => t.projectId === projectId).forEach((t) => tStore.delete(t.id));
      };

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const projects = (await this.getProjects()).filter((p) => p.id !== projectId);
      localStorage.setItem('constructpro_projects', JSON.stringify(projects));

      const tasks = (await this.getAllTasks()).filter((t) => t.projectId !== projectId);
      localStorage.setItem('constructpro_tasks', JSON.stringify(tasks));
    }
  }

  // --- Tasks ---
  async getAllTasks(): Promise<Task[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.TASKS, 'readonly');
        const store = tx.objectStore(STORES.TASKS);
        const request = store.getAll();
        request.onsuccess = () => {
          let tasks = request.result as Task[];
          if (!tasks || tasks.length === 0) {
            this.seedDefaults().then(() => this.getAllTasks()).then(resolve).catch(reject);
          } else {
            resolve(tasks);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      const raw = localStorage.getItem('constructpro_tasks');
      if (!raw) {
        localStorage.setItem('constructpro_tasks', JSON.stringify(DEFAULT_TASKS));
        return DEFAULT_TASKS;
      }
      return JSON.parse(raw);
    }
  }

  async getTasksByProject(projectId: string): Promise<Task[]> {
    const all = await this.getAllTasks();
    return all
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => a.slNo - b.slNo);
  }

  async getNextSlNo(projectId: string): Promise<number> {
    const tasks = await this.getTasksByProject(projectId);
    if (tasks.length === 0) return 1;
    const maxSl = Math.max(...tasks.map((t) => t.slNo || 0));
    return maxSl + 1;
  }

  async saveTask(task: Task): Promise<void> {
    // Ensure lastUpdated is set to current readable date/time
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    task.lastUpdated = formattedDate;

    // Auto-record person names in persistent master list
    if (task.personToAssign) {
      await this.recordPersonName(task.personToAssign);
    }
    if (task.taskAssigner) {
      await this.recordPersonName(task.taskAssigner);
    }

    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.TASKS, 'readwrite');
        const store = tx.objectStore(STORES.TASKS);
        const req = store.put(task);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const tasks = await this.getAllTasks();
      const idx = tasks.findIndex((t) => t.id === task.id);
      if (idx >= 0) tasks[idx] = task;
      else tasks.push(task);
      localStorage.setItem('constructpro_tasks', JSON.stringify(tasks));
    }
  }

  async deleteTask(taskId: string, projectId?: string): Promise<void> {
    if (!projectId) {
      const all = await this.getAllTasks();
      const existing = all.find((t) => t.id === taskId);
      if (existing) projectId = existing.projectId;
    }

    try {
      const db = await this.initDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORES.TASKS, 'readwrite');
        const store = tx.objectStore(STORES.TASKS);
        const req = store.delete(taskId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      // Resequence remaining tasks in project
      if (projectId) {
        await this.resequenceProjectTasks(projectId);
      }
    } catch {
      let tasks = (await this.getAllTasks()).filter((t) => t.id !== taskId);
      localStorage.setItem('constructpro_tasks', JSON.stringify(tasks));
      if (projectId) {
        await this.resequenceProjectTasks(projectId);
      }
    }
  }

  async resequenceProjectTasks(projectId: string): Promise<void> {
    const tasks = (await this.getAllTasks())
      .filter((t) => t.projectId === projectId)
      .sort((a, b) => a.slNo - b.slNo);

    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].slNo !== i + 1) {
        tasks[i].slNo = i + 1;
        await this.saveTask(tasks[i]);
      }
    }
  }

  // --- Dynamic Dropdowns & Person Memory ---
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.TEAM_MEMBERS, 'readonly');
        const store = tx.objectStore(STORES.TEAM_MEMBERS);
        const req = store.getAll();
        req.onsuccess = () => {
          let list = req.result as TeamMember[];
          if (!list || list.length === 0) {
            this.seedTeamMembers().then(resolve).catch(reject);
          } else {
            resolve(list.sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()));
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const raw = localStorage.getItem('constructpro_team');
      if (!raw) {
        localStorage.setItem('constructpro_team', JSON.stringify(DEFAULT_TEAM_MEMBERS));
        return DEFAULT_TEAM_MEMBERS;
      }
      return JSON.parse(raw);
    }
  }

  async recordPersonName(name: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      const list = await this.getTeamMembers();
      const existing = list.find((m) => m.name.toLowerCase() === trimmed.toLowerCase());
      const now = new Date().toISOString();

      const member: TeamMember = {
        id: existing ? existing.id : `tm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: trimmed,
        role: existing?.role || 'Team Member',
        lastUsedAt: now,
      };

      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.TEAM_MEMBERS, 'readwrite');
        const store = tx.objectStore(STORES.TEAM_MEMBERS);
        const req = store.put(member);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = await this.getTeamMembers();
      const idx = list.findIndex((m) => m.name.toLowerCase() === trimmed.toLowerCase());
      const now = new Date().toISOString();
      if (idx >= 0) {
        list[idx].lastUsedAt = now;
      } else {
        list.push({
          id: `tm-${Date.now()}`,
          name: trimmed,
          role: 'Team Member',
          lastUsedAt: now,
        });
      }
      localStorage.setItem('constructpro_team', JSON.stringify(list));
    }
  }

  async deleteTeamMember(id: string): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.TEAM_MEMBERS, 'readwrite');
        const store = tx.objectStore(STORES.TEAM_MEMBERS);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const list = (await this.getTeamMembers()).filter((m) => m.id !== id);
      localStorage.setItem('constructpro_team', JSON.stringify(list));
    }
  }

  // --- Seed Defaults ---
  private async seedDefaults(): Promise<Project[]> {
    try {
      const db = await this.initDB();
      const tx = db.transaction([STORES.PROJECTS, STORES.TASKS, STORES.TEAM_MEMBERS], 'readwrite');
      const pStore = tx.objectStore(STORES.PROJECTS);
      const tStore = tx.objectStore(STORES.TASKS);
      const tmStore = tx.objectStore(STORES.TEAM_MEMBERS);

      DEFAULT_PROJECTS.forEach((p) => pStore.put(p));
      DEFAULT_TASKS.forEach((t) => tStore.put(t));
      DEFAULT_TEAM_MEMBERS.forEach((tm) => tmStore.put(tm));

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return DEFAULT_PROJECTS;
    } catch {
      localStorage.setItem('constructpro_projects', JSON.stringify(DEFAULT_PROJECTS));
      localStorage.setItem('constructpro_tasks', JSON.stringify(DEFAULT_TASKS));
      localStorage.setItem('constructpro_team', JSON.stringify(DEFAULT_TEAM_MEMBERS));
      return DEFAULT_PROJECTS;
    }
  }

  private async seedTeamMembers(): Promise<TeamMember[]> {
    try {
      const db = await this.initDB();
      const tx = db.transaction(STORES.TEAM_MEMBERS, 'readwrite');
      const tmStore = tx.objectStore(STORES.TEAM_MEMBERS);
      DEFAULT_TEAM_MEMBERS.forEach((tm) => tmStore.put(tm));
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return DEFAULT_TEAM_MEMBERS;
    } catch {
      localStorage.setItem('constructpro_team', JSON.stringify(DEFAULT_TEAM_MEMBERS));
      return DEFAULT_TEAM_MEMBERS;
    }
  }

  // --- Backup & Restore (JSON / CSV) ---
  async exportFullDatabase(): Promise<string> {
    const projects = await this.getProjects();
    const tasks = await this.getAllTasks();
    const team = await this.getTeamMembers();

    const data = {
      app: 'ConstructPro Task Manager PWA',
      version: 1,
      exportedAt: new Date().toISOString(),
      projects,
      tasks,
      team,
    };

    return JSON.stringify(data, null, 2);
  }

  async exportProjectToCSV(projectId: string): Promise<string> {
    const projects = await this.getProjects();
    const proj = projects.find((p) => p.id === projectId) || { name: 'Tasks' };
    const tasks = await this.getTasksByProject(projectId);

    const headers = [
      'SL No.',
      'Task Name',
      'Date of Assign',
      'Due Date',
      'Person to Assign',
      'Task Assigner',
      'Priority',
      'Status',
      'Attachments Count',
      'Priority Comments',
      'Last Updated',
    ];

    const rows = tasks.map((t) => [
      t.slNo,
      `"${(t.taskName || '').replace(/"/g, '""')}"`,
      t.dateOfAssign || '',
      t.dueDate || '',
      `"${(t.personToAssign || '').replace(/"/g, '""')}"`,
      `"${(t.taskAssigner || '').replace(/"/g, '""')}"`,
      t.priority,
      `"${t.status}"`,
      t.attachments ? t.attachments.length : 0,
      `"${(t.priorityComments || '').replace(/"/g, '""')}"`,
      `"${t.lastUpdated || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  }

  async importFullDatabase(
    jsonData: string,
    mode: 'merge' | 'replace' = 'merge'
  ): Promise<{ success: boolean; projectsCount: number; tasksCount: number }> {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.projects || !parsed.tasks) {
        throw new Error('Invalid backup file format: missing projects or tasks data.');
      }

      if (mode === 'replace') {
        const existingProjects = await this.getProjects();
        for (const p of existingProjects) {
          await this.deleteProject(p.id);
        }
      }

      for (const p of parsed.projects as Project[]) {
        await this.saveProject(p);
      }

      for (const t of parsed.tasks as Task[]) {
        await this.saveTask(t);
      }

      if (parsed.team && Array.isArray(parsed.team)) {
        for (const tm of parsed.team as TeamMember[]) {
          await this.recordPersonName(tm.name);
        }
      }

      return {
        success: true,
        projectsCount: parsed.projects.length,
        tasksCount: parsed.tasks.length,
      };
    } catch (err: any) {
      throw new Error(`Failed to import data: ${err.message}`);
    }
  }
}

export const db = new ConstructProDatabase();
