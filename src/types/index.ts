export type TaskPriority = 1 | 2 | 3 | 4 | 5;

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface TaskAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // Base64 representation for offline storage
  uploadedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  slNo: number; // Auto-generated sequential number per project
  taskName: string;
  dateOfAssign: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  personToAssign: string;
  taskAssigner: string;
  priority: TaskPriority; // 1 (Lowest) to 5 (Highest)
  status: TaskStatus;
  attachments: TaskAttachment[];
  priorityComments: string;
  lastUpdated: string; // ISO string or human-readable format
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string; // Hex or theme color for industrial badges
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  lastUsedAt: string;
}

export type ViewMode = 'table' | 'cards';

export interface FilterOptions {
  searchQuery: string;
  status: string; // 'all' | TaskStatus
  priority: string; // 'all' | '1' | '2' | '3' | '4' | '5'
  assignee: string; // 'all' | string
  assigner: string; // 'all' | string
}

export interface SortOptions {
  field: 'slNo' | 'taskName' | 'dateOfAssign' | 'dueDate' | 'priority' | 'status' | 'lastUpdated';
  direction: 'asc' | 'desc';
}

export interface CrewMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  avatarColor: string;
  lastActive?: number;
}

export interface LiveNotification {
  id: string;
  message: string;
  sender: string;
  timestamp: string;
  type?: 'task' | 'project' | 'crew';
}
