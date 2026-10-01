import { Task, Project, TeamMember, CrewMember, LiveNotification } from '../types';
import { db } from './db';

const CREW_STORAGE_KEY = 'constructpro_active_crew';

export const PRESET_CREW_PROFILES: Omit<CrewMember, 'id'>[] = [
  { name: 'Amruth (Project Lead)', role: 'Project Manager', avatarColor: '#f59e0b', email: 'amruth.futuregenerations@gmail.com' },
  { name: 'David Zhang', role: 'Site Engineer', avatarColor: '#3b82f6', email: 'david.zhang@site.field' },
  { name: 'Marcus Brody', role: 'Safety Inspector', avatarColor: '#10b981', email: 'marcus.safety@site.field' },
  { name: 'Elena Ramos', role: 'Structural Supervisor', avatarColor: '#8b5cf6', email: 'elena.structural@site.field' },
  { name: 'James O\'Connor', role: 'Foreman / Field Crew', avatarColor: '#ec4899', email: 'james.oc@site.field' },
  { name: 'Rajesh Patel', role: 'QC / Compliance Officer', avatarColor: '#06b6d4', email: 'rajesh.qc@site.field' },
];

class SyncService {
  private eventSource: EventSource | null = null;
  private currentCrew: CrewMember | null = null;
  private activeCrewList: CrewMember[] = [];
  private onDataChangedCallbacks: Set<() => void> = new Set();
  private onNotificationCallbacks: Set<(notif: LiveNotification) => void> = new Set();
  private onCrewPresenceCallbacks: Set<(crew: CrewMember[]) => void> = new Set();
  private isConnecting = false;
  private heartbeatTimer: any = null;

  constructor() {
    this.loadSavedCrew();
  }

  public getCurrentCrew(): CrewMember {
    if (!this.currentCrew) {
      this.currentCrew = {
        id: `crew-${Date.now()}`,
        name: 'Amruth (Project Lead)',
        role: 'Project Manager',
        avatarColor: '#f59e0b',
        email: 'amruth.futuregenerations@gmail.com',
      };
      this.saveCrewToStorage(this.currentCrew);
    }
    return this.currentCrew;
  }

  public getActiveCrewList(): CrewMember[] {
    return this.activeCrewList;
  }

  public loadSavedCrew(): CrewMember {
    try {
      const saved = localStorage.getItem(CREW_STORAGE_KEY);
      if (saved) {
        this.currentCrew = JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return this.getCurrentCrew();
  }

  private saveCrewToStorage(crew: CrewMember) {
    this.currentCrew = crew;
    try {
      localStorage.setItem(CREW_STORAGE_KEY, JSON.stringify(crew));
    } catch {
      // ignore
    }
  }

  public subscribeDataChange(cb: () => void) {
    this.onDataChangedCallbacks.add(cb);
    return () => this.onDataChangedCallbacks.delete(cb);
  }

  public subscribeNotification(cb: (notif: LiveNotification) => void) {
    this.onNotificationCallbacks.add(cb);
    return () => this.onNotificationCallbacks.delete(cb);
  }

  public subscribeCrewPresence(cb: (crew: CrewMember[]) => void) {
    this.onCrewPresenceCallbacks.add(cb);
    return () => this.onCrewPresenceCallbacks.delete(cb);
  }

  private notifyDataChanged() {
    this.onDataChangedCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Data changed cb error:', err);
      }
    });
  }

  private emitNotification(notif: LiveNotification) {
    this.onNotificationCallbacks.forEach((cb) => {
      try {
        cb(notif);
      } catch (err) {
        console.error('Notification cb error:', err);
      }
    });
  }

  private emitCrewPresence(crew: CrewMember[]) {
    this.activeCrewList = crew;
    this.onCrewPresenceCallbacks.forEach((cb) => {
      try {
        cb(crew);
      } catch (err) {
        console.error('Crew presence cb error:', err);
      }
    });
  }

  /**
   * Connect to Server-Sent Events (SSE) stream for real-time live synchronization.
   */
  public connect() {
    if (this.eventSource || this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.eventSource = new EventSource('/api/events');

      this.eventSource.onopen = () => {
        this.isConnecting = false;
        // Broadcast self presence
        this.sendPresenceHeartbeat();
      };

      this.eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerEvent(data);
        } catch (e) {
          // ignore keep-alive
        }
      };

      this.eventSource.onerror = () => {
        this.eventSource?.close();
        this.eventSource = null;
        this.isConnecting = false;
        // Reconnect after 3s
        setTimeout(() => this.connect(), 3000);
      };
    } catch (err) {
      console.error('Failed to connect to SSE:', err);
      this.isConnecting = false;
    }

    // Start periodic heartbeat
    if (!this.heartbeatTimer) {
      this.heartbeatTimer = setInterval(() => {
        this.sendPresenceHeartbeat();
      }, 20000);
    }
  }

  private async handleServerEvent(event: { type: string; payload: any; sender?: string }) {
    const currentUserName = this.currentCrew?.name;

    switch (event.type) {
      case 'CONNECTED':
        if (event.payload?.activeCrew) {
          this.emitCrewPresence(event.payload.activeCrew);
        }
        break;

      case 'CREW_PRESENCE_UPDATED':
        this.emitCrewPresence(event.payload || []);
        break;

      case 'CREW_JOINED':
        if (event.payload?.activeCrew) {
          this.emitCrewPresence(event.payload.activeCrew);
        }
        if (event.sender && event.sender !== currentUserName) {
          this.emitNotification({
            id: `notif-${Date.now()}`,
            sender: event.sender,
            message: `${event.sender} joined the site log`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'crew',
          });
        }
        break;

      case 'CREW_LEFT':
        if (event.payload?.activeCrew) {
          this.emitCrewPresence(event.payload.activeCrew);
        }
        break;

      case 'TASK_UPDATED': {
        const task: Task = event.payload.task;
        if (task) {
          // Save into local IndexedDB
          await db.saveTask(task);
          this.notifyDataChanged();

          if (event.sender && event.sender !== currentUserName) {
            this.emitNotification({
              id: `notif-${Date.now()}`,
              sender: event.sender,
              message: `${event.sender} updated "${task.taskName}" (SL #${task.slNo})`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'task',
            });
          }
        }
        break;
      }

      case 'TASK_DELETED': {
        const { id } = event.payload;
        if (id) {
          await db.deleteTask(id);
          this.notifyDataChanged();

          if (event.sender && event.sender !== currentUserName) {
            this.emitNotification({
              id: `notif-${Date.now()}`,
              sender: event.sender,
              message: `${event.sender} removed a task`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'task',
            });
          }
        }
        break;
      }

      case 'PROJECT_UPDATED': {
        const project: Project = event.payload.project;
        if (project) {
          await db.saveProject(project);
          this.notifyDataChanged();

          if (event.sender && event.sender !== currentUserName) {
            this.emitNotification({
              id: `notif-${Date.now()}`,
              sender: event.sender,
              message: `${event.sender} updated site tab "${project.name}"`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'project',
            });
          }
        }
        break;
      }

      case 'PROJECT_DELETED': {
        const { id } = event.payload;
        if (id) {
          await db.deleteProject(id);
          this.notifyDataChanged();

          if (event.sender && event.sender !== currentUserName) {
            this.emitNotification({
              id: `notif-${Date.now()}`,
              sender: event.sender,
              message: `${event.sender} deleted a project tab`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'project',
            });
          }
        }
        break;
      }

      case 'FULL_SYNC': {
        if (event.payload?.projects && event.payload?.tasks) {
          for (const p of event.payload.projects) {
            await db.saveProject(p);
          }
          for (const t of event.payload.tasks) {
            await db.saveTask(t);
          }
          this.notifyDataChanged();

          if (event.sender && event.sender !== currentUserName) {
            this.emitNotification({
              id: `notif-${Date.now()}`,
              sender: event.sender,
              message: `${event.sender} restored full backup data`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'project',
            });
          }
        }
        break;
      }

      default:
        break;
    }
  }

  /**
   * Log in or switch active crew member profile.
   */
  public async loginCrew(crewInfo: { name: string; role: string; avatarColor?: string; email?: string }): Promise<CrewMember> {
    const member: CrewMember = {
      id: this.currentCrew?.id || `crew-${Date.now()}`,
      name: crewInfo.name.trim(),
      role: crewInfo.role.trim() || 'Field Member',
      avatarColor: crewInfo.avatarColor || '#f59e0b',
      email: crewInfo.email || '',
    };

    this.saveCrewToStorage(member);

    try {
      const res = await fetch('/api/crew/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activeCrew) {
          this.emitCrewPresence(data.activeCrew);
        }
      }
    } catch (e) {
      console.warn('Offline: logged in locally:', e);
    }

    return member;
  }

  public async sendPresenceHeartbeat() {
    if (!this.currentCrew) return;
    try {
      await fetch('/api/crew/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: this.currentCrew.id }),
      });
    } catch {
      // offline
    }
  }

  /**
   * Initial sync from server into local IndexedDB
   */
  public async syncFromServer(): Promise<boolean> {
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) return false;
      const data = await res.json();

      if (data.projects && data.tasks) {
        // Seed local database with any server records
        for (const p of data.projects) {
          await db.saveProject(p);
        }
        for (const t of data.tasks) {
          await db.saveTask(t);
        }
        if (data.teamMembers) {
          for (const tm of data.teamMembers) {
            await db.recordPersonName(tm.name);
          }
        }
        if (data.activeCrew) {
          this.emitCrewPresence(data.activeCrew);
        }
        this.notifyDataChanged();
        return true;
      }
    } catch (e) {
      console.warn('Server sync unavailable (working from local cache):', e);
    }
    return false;
  }

  /**
   * Save task: saves locally in IndexedDB and broadcasts to server
   */
  public async saveTask(task: Task): Promise<Task> {
    // 1. Local IndexedDB immediate save
    await db.saveTask(task);

    // 2. Dispatch to server for live sync
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task,
          sender: this.currentCrew?.name || 'Crew Member',
        }),
      });
    } catch (err) {
      console.warn('Saved offline; will sync once server is reachable:', err);
    }

    return task;
  }

  /**
   * Delete task: deletes from local IndexedDB and broadcasts to server
   */
  public async deleteTask(id: string): Promise<void> {
    await db.deleteTask(id);

    try {
      const sender = encodeURIComponent(this.currentCrew?.name || 'Crew Member');
      await fetch(`/api/tasks/${id}?sender=${sender}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Deleted locally; offline mode:', err);
    }
  }

  /**
   * Save project: saves locally and broadcasts to server
   */
  public async saveProject(project: Project): Promise<Project> {
    await db.saveProject(project);

    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project,
          sender: this.currentCrew?.name || 'Crew Member',
        }),
      });
    } catch (err) {
      console.warn('Saved project offline:', err);
    }

    return project;
  }

  /**
   * Delete project: deletes locally and broadcasts to server
   */
  public async deleteProject(id: string): Promise<void> {
    await db.deleteProject(id);

    try {
      const sender = encodeURIComponent(this.currentCrew?.name || 'Crew Member');
      await fetch(`/api/projects/${id}?sender=${sender}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Deleted project locally:', err);
    }
  }

  /**
   * Restore full backup and broadcast to all crew members
   */
  public async restoreFullDatabase(projects: Project[], tasks: Task[], teamMembers: TeamMember[], mode: 'merge' | 'replace') {
    try {
      await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects,
          tasks,
          teamMembers,
          mode,
          sender: this.currentCrew?.name || 'Crew Member',
        }),
      });
    } catch (err) {
      console.warn('Restore dispatched locally only:', err);
    }
  }
}

export const syncService = new SyncService();
