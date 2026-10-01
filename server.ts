import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CrewMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatarColor: string;
  lastActive: number;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

interface Task {
  id: string;
  projectId: string;
  slNo: number;
  taskName: string;
  dateOfAssign: string;
  dueDate: string;
  personToAssign: string;
  taskAssigner: string;
  priority: 1 | 2 | 3 | 4 | 5;
  status: 'Not Started' | 'In Progress' | 'Completed';
  attachments: TaskAttachment[];
  priorityComments: string;
  lastUpdated: string;
}

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  lastUsedAt: string;
}

// Initial seed data for field operations
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'site-a',
    name: 'Site A - Earthworks & Foundation',
    description: 'Bulk excavation, grading, soil stabilization & pile caps',
    color: '#f59e0b',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'site-b',
    name: 'Site B - Structural Framework',
    description: 'Columns, precast beams, reinforcement rebar & slabs',
    color: '#3b82f6',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'office-compliance',
    name: 'Office & QA/Safety Compliance',
    description: 'Submittals, city inspections, safety audits, and material tests',
    color: '#10b981',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_TEAM: TeamMember[] = [
  { id: '1', name: 'Amruth (Project Lead)', role: 'Project Manager', lastUsedAt: new Date().toISOString() },
  { id: '2', name: 'David Zhang', role: 'Site Engineer', lastUsedAt: new Date().toISOString() },
  { id: '3', name: 'Marcus Brody', role: 'Safety Inspector', lastUsedAt: new Date().toISOString() },
  { id: '4', name: 'Elena Ramos', role: 'Structural Supervisor', lastUsedAt: new Date().toISOString() },
  { id: '5', name: 'James O\'Connor', role: 'Foreman', lastUsedAt: new Date().toISOString() },
  { id: '6', name: 'Rajesh Patel', role: 'Quality Control', lastUsedAt: new Date().toISOString() },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    projectId: 'site-a',
    slNo: 1,
    taskName: 'Excavator survey & datum point benchmark calibration',
    dateOfAssign: '2026-09-20',
    dueDate: '2026-09-28',
    personToAssign: 'David Zhang',
    taskAssigner: 'Amruth (Project Lead)',
    priority: 4,
    status: 'In Progress',
    attachments: [],
    priorityComments: 'Verify benchmark with municipal surveyor coordinates before cutting trench.',
    lastUpdated: '2026-09-24 14:10',
  },
  {
    id: 't-2',
    projectId: 'site-a',
    slNo: 2,
    taskName: 'Compaction testing for retaining wall subgrade (Sector 3)',
    dateOfAssign: '2026-09-22',
    dueDate: '2026-09-26',
    personToAssign: 'Marcus Brody',
    taskAssigner: 'Elena Ramos',
    priority: 5,
    status: 'Not Started',
    attachments: [],
    priorityComments: 'Requires nuclear density gauge test certification prior to backfilling.',
    lastUpdated: '2026-09-23 09:30',
  },
  {
    id: 't-3',
    projectId: 'site-a',
    slNo: 3,
    taskName: 'Dewatering pump maintenance & sediment basin perimeter check',
    dateOfAssign: '2026-09-18',
    dueDate: '2026-09-22',
    personToAssign: 'James O\'Connor',
    taskAssigner: 'David Zhang',
    priority: 3,
    status: 'Completed',
    attachments: [],
    priorityComments: 'Filter cloths replaced on all 4 suction lines.',
    lastUpdated: '2026-09-22 17:00',
  },
  {
    id: 't-4',
    projectId: 'site-b',
    slNo: 1,
    taskName: 'Level 2 slab pre-pour rebar inspection & conduit tie-down',
    dateOfAssign: '2026-09-24',
    dueDate: '2026-09-27',
    personToAssign: 'Elena Ramos',
    taskAssigner: 'Amruth (Project Lead)',
    priority: 5,
    status: 'In Progress',
    attachments: [],
    priorityComments: 'Check shear links around column grid C4-D6. Structural engineer sign-off required.',
    lastUpdated: '2026-09-24 16:45',
  },
  {
    id: 't-5',
    projectId: 'office-compliance',
    slNo: 1,
    taskName: 'Weekly OSHA safety toolbox meeting log submission',
    dateOfAssign: '2026-09-21',
    dueDate: '2026-09-25',
    personToAssign: 'Marcus Brody',
    taskAssigner: 'Amruth (Project Lead)',
    priority: 3,
    status: 'Completed',
    attachments: [],
    priorityComments: 'All crew signatures scanned and filed for the insurance audit.',
    lastUpdated: '2026-09-24 11:15',
  },
];

// Persistent File Store Helper
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'constructpro-store.json');

interface StoreData {
  projects: Project[];
  tasks: Task[];
  teamMembers: TeamMember[];
}

let store: StoreData = {
  projects: INITIAL_PROJECTS,
  tasks: INITIAL_TASKS,
  teamMembers: INITIAL_TEAM,
};

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.projects && parsed.tasks) {
        store = parsed;
        console.log(`[Store] Loaded ${store.projects.length} projects and ${store.tasks.length} tasks from disk`);
      }
    } else {
      saveStore();
    }
  } catch (err) {
    console.error('[Store] Error reading store from disk:', err);
  }
}

function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Error saving store to disk:', err);
  }
}

loadStore();

// Active SSE Connections and Online Crew
const sseClients = new Set<Response>();
const activeCrew = new Map<string, CrewMember>();

function broadcast(event: { type: string; payload: any; sender?: string }) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(data);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Clean inactive crew members (timeout after 45 seconds of no heartbeat)
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [id, member] of activeCrew.entries()) {
    if (now - member.lastActive > 45000) {
      activeCrew.delete(id);
      changed = true;
    }
  }
  if (changed) {
    broadcast({
      type: 'CREW_PRESENCE_UPDATED',
      payload: Array.from(activeCrew.values()),
    });
  }
}, 15000);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // SSE Real-Time Sync Endpoint
  app.get('/api/events', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    sseClients.add(res);

    // Initial greeting and active crew list
    res.write(
      `data: ${JSON.stringify({
        type: 'CONNECTED',
        payload: {
          activeCrew: Array.from(activeCrew.values()),
          serverTime: new Date().toISOString(),
        },
      })}\n\n`
    );

    // Periodic ping to keep HTTP connection alive
    const pingInterval = setInterval(() => {
      res.write(': ping\n\n');
    }, 15000);

    req.on('close', () => {
      clearInterval(pingInterval);
      sseClients.delete(res);
    });
  });

  // REST API: Full Initial Sync
  app.get('/api/sync', (req: Request, res: Response) => {
    res.json({
      success: true,
      projects: store.projects,
      tasks: store.tasks,
      teamMembers: store.teamMembers,
      activeCrew: Array.from(activeCrew.values()),
      serverTime: new Date().toISOString(),
    });
  });

  // REST API: Save / Update Task
  app.post('/api/tasks', (req: Request, res: Response) => {
    const task: Task = req.body.task;
    const sender = req.body.sender || 'Crew Member';

    if (!task || !task.id || !task.projectId) {
      res.status(400).json({ error: 'Invalid task payload' });
      return;
    }

    const idx = store.tasks.findIndex((t) => t.id === task.id);
    if (idx >= 0) {
      store.tasks[idx] = task;
    } else {
      store.tasks.push(task);
    }

    // Auto-record person names in team directory
    const now = new Date().toISOString();
    if (task.personToAssign) {
      const existing = store.teamMembers.find(
        (m) => m.name.toLowerCase() === task.personToAssign.trim().toLowerCase()
      );
      if (!existing) {
        store.teamMembers.push({
          id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: task.personToAssign.trim(),
          lastUsedAt: now,
        });
      } else {
        existing.lastUsedAt = now;
      }
    }
    if (task.taskAssigner) {
      const existing = store.teamMembers.find(
        (m) => m.name.toLowerCase() === task.taskAssigner.trim().toLowerCase()
      );
      if (!existing) {
        store.teamMembers.push({
          id: `tm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: task.taskAssigner.trim(),
          lastUsedAt: now,
        });
      } else {
        existing.lastUsedAt = now;
      }
    }

    saveStore();

    broadcast({
      type: 'TASK_UPDATED',
      payload: { task, teamMembers: store.teamMembers },
      sender,
    });

    res.json({ success: true, task });
  });

  // REST API: Delete Task
  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const sender = (req.query.sender as string) || 'Crew Member';

    const idx = store.tasks.findIndex((t) => t.id === id);
    if (idx >= 0) {
      const [deleted] = store.tasks.splice(idx, 1);
      saveStore();

      broadcast({
        type: 'TASK_DELETED',
        payload: { id, projectId: deleted.projectId },
        sender,
      });
      res.json({ success: true, id });
    } else {
      res.status(404).json({ error: 'Task not found' });
    }
  });

  // REST API: Save / Update Project
  app.post('/api/projects', (req: Request, res: Response) => {
    const project: Project = req.body.project;
    const sender = req.body.sender || 'Crew Member';

    if (!project || !project.id || !project.name) {
      res.status(400).json({ error: 'Invalid project payload' });
      return;
    }

    const idx = store.projects.findIndex((p) => p.id === project.id);
    if (idx >= 0) {
      store.projects[idx] = project;
    } else {
      store.projects.push(project);
    }

    saveStore();

    broadcast({
      type: 'PROJECT_UPDATED',
      payload: { project },
      sender,
    });

    res.json({ success: true, project });
  });

  // REST API: Delete Project
  app.delete('/api/projects/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    const sender = (req.query.sender as string) || 'Crew Member';

    store.projects = store.projects.filter((p) => p.id !== id);
    store.tasks = store.tasks.filter((t) => t.projectId !== id);
    saveStore();

    broadcast({
      type: 'PROJECT_DELETED',
      payload: { id },
      sender,
    });

    res.json({ success: true, id });
  });

  // REST API: Crew Presence & Login
  app.post('/api/crew/login', (req: Request, res: Response) => {
    const { id, name, role, email, avatarColor } = req.body;
    if (!id || !name) {
      res.status(400).json({ error: 'Crew id and name required' });
      return;
    }

    const member: CrewMember = {
      id,
      name,
      role: role || 'Field Member',
      email: email || '',
      avatarColor: avatarColor || '#f59e0b',
      lastActive: Date.now(),
    };

    activeCrew.set(id, member);

    // Auto-record into team directory
    const existing = store.teamMembers.find(
      (m) => m.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (!existing) {
      store.teamMembers.push({
        id: `tm-${Date.now()}`,
        name: name.trim(),
        role: member.role,
        lastUsedAt: new Date().toISOString(),
      });
      saveStore();
    }

    broadcast({
      type: 'CREW_JOINED',
      payload: {
        member,
        activeCrew: Array.from(activeCrew.values()),
        teamMembers: store.teamMembers,
      },
      sender: name,
    });

    res.json({ success: true, member, activeCrew: Array.from(activeCrew.values()) });
  });

  // REST API: Crew Heartbeat
  app.post('/api/crew/heartbeat', (req: Request, res: Response) => {
    const { id } = req.body;
    if (id && activeCrew.has(id)) {
      const member = activeCrew.get(id)!;
      member.lastActive = Date.now();
      res.json({ success: true });
    } else {
      res.json({ success: false, needLogin: true });
    }
  });

  // REST API: Crew Logout
  app.post('/api/crew/logout', (req: Request, res: Response) => {
    const { id } = req.body;
    if (id && activeCrew.has(id)) {
      const member = activeCrew.get(id)!;
      activeCrew.delete(id);

      broadcast({
        type: 'CREW_LEFT',
        payload: {
          id,
          activeCrew: Array.from(activeCrew.values()),
        },
        sender: member.name,
      });
    }
    res.json({ success: true });
  });

  // REST API: Full Restore Backup
  app.post('/api/restore', (req: Request, res: Response) => {
    const { projects, tasks, teamMembers, mode, sender } = req.body;
    if (!Array.isArray(projects) || !Array.isArray(tasks)) {
      res.status(400).json({ error: 'Invalid backup structure' });
      return;
    }

    if (mode === 'replace') {
      store.projects = projects;
      store.tasks = tasks;
      if (Array.isArray(teamMembers)) {
        store.teamMembers = teamMembers;
      }
    } else {
      // Merge
      for (const p of projects) {
        if (!store.projects.some((ep) => ep.id === p.id)) {
          store.projects.push(p);
        }
      }
      for (const t of tasks) {
        const idx = store.tasks.findIndex((et) => et.id === t.id);
        if (idx >= 0) {
          store.tasks[idx] = t;
        } else {
          store.tasks.push(t);
        }
      }
      if (Array.isArray(teamMembers)) {
        for (const tm of teamMembers) {
          if (!store.teamMembers.some((etm) => etm.name.toLowerCase() === tm.name.toLowerCase())) {
            store.teamMembers.push(tm);
          }
        }
      }
    }

    saveStore();

    broadcast({
      type: 'FULL_SYNC',
      payload: {
        projects: store.projects,
        tasks: store.tasks,
        teamMembers: store.teamMembers,
      },
      sender: sender || 'Crew Lead',
    });

    res.json({ success: true, count: store.tasks.length });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ConstructPro Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[ConstructPro Server] Startup error:', err);
  process.exit(1);
});
