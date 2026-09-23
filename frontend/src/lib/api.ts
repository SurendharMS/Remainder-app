import { supabase } from './supabase';
import { initialMockTasks, initialMockDates } from './mockData';
import type {
  Task,
  TaskCreateInput,
  ImportantDate,
  ImportantDateCreateInput,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// In-memory state for local preview bypass mode
let mockTasks: Task[] = [...initialMockTasks];
let mockDates: ImportantDate[] = [...initialMockDates];

export const isDevMode = (): boolean => {
  return localStorage.getItem('dev_mode') === 'true';
};

export const setDevMode = (active: boolean): void => {
  if (active) {
    localStorage.setItem('dev_mode', 'true');
  } else {
    localStorage.removeItem('dev_mode');
  }
};

export class ApiError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: sessionData } = await supabase.auth.getSession();
  let token = sessionData?.session?.access_token;

  if (!token) {
    token = 'dev-token-Surendhar2252';
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail: unknown;
    try {
      errorDetail = await response.json();
    } catch {
      errorDetail = await response.text();
    }

    const errorMessage =
      typeof errorDetail === 'object' && errorDetail !== null && 'detail' in errorDetail
        ? String((errorDetail as { detail: unknown }).detail)
        : `Request failed with status ${response.status}`;

    throw new ApiError(errorMessage, response.status, errorDetail);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}

// ============================================================================
// Tasks Endpoints (with local development mock bypass)
// ============================================================================

export async function getPendingTasks(dueOnly: boolean = false): Promise<Task[]> {
  if (isDevMode()) {
    const now = new Date();
    return mockTasks
      .filter((t) => t.status === 'pending')
      .filter((t) => (!dueOnly ? true : new Date(t.due_date) <= now))
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }

  const query = dueOnly ? '?due_only=true' : '';
  return apiClient<Task[]>(`/api/tasks${query}`, {
    method: 'GET',
  });
}

export async function completeTask(taskId: string): Promise<Task> {
  if (isDevMode()) {
    const idx = mockTasks.findIndex((t) => t.id === taskId);
    if (idx === -1) {
      throw new ApiError('Task not found in mock store', 404);
    }

    const task = mockTasks[idx];
    const now = new Date();

    if (task.recurrence_pattern === 'once') {
      const updated: Task = {
        ...task,
        status: 'completed',
        completed_at: now.toISOString(),
      };
      mockTasks[idx] = updated;
      return updated;
    } else {
      // Advance due date for recurring task
      const nextDue = new Date(task.due_date);
      if (task.recurrence_pattern === 'daily') {
        nextDue.setDate(nextDue.getDate() + 1);
      } else if (task.recurrence_pattern === 'weekly') {
        nextDue.setDate(nextDue.getDate() + 7);
      } else if (task.recurrence_pattern === 'monthly') {
        nextDue.setMonth(nextDue.getMonth() + 1);
      } else if (task.recurrence_pattern === 'yearly') {
        nextDue.setFullYear(nextDue.getFullYear() + 1);
      }

      const updated: Task = {
        ...task,
        due_date: nextDue.toISOString(),
        status: 'pending',
      };
      mockTasks[idx] = updated;
      return updated;
    }
  }

  return apiClient<Task>(`/api/tasks/${taskId}/complete`, {
    method: 'POST',
  });
}

export async function createTask(taskInput: TaskCreateInput): Promise<Task> {
  if (isDevMode()) {
    const newTask: Task = {
      id: `mock-task-${Date.now()}`,
      title: taskInput.title,
      note: taskInput.note || null,
      recurrence_pattern: taskInput.recurrence_pattern,
      due_date: taskInput.due_date,
      status: 'pending',
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    mockTasks.unshift(newTask);
    return newTask;
  }

  return apiClient<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(taskInput),
  });
}

export async function getTaskHistory(): Promise<Task[]> {
  if (isDevMode()) {
    return mockTasks
      .filter((t) => t.status === 'completed')
      .sort(
        (a, b) =>
          new Date(b.completed_at || b.created_at).getTime() -
          new Date(a.completed_at || a.created_at).getTime()
      );
  }

  return apiClient<Task[]>('/api/tasks/history', {
    method: 'GET',
  });
}

export async function deleteHistoryTask(taskId: string): Promise<void> {
  if (isDevMode()) {
    mockTasks = mockTasks.filter((t) => t.id !== taskId);
    return;
  }

  return apiClient<void>(`/api/tasks/history/${taskId}`, {
    method: 'DELETE',
  });
}

// ============================================================================
// Important Dates Endpoints (with local development mock bypass)
// ============================================================================

export async function getImportantDates(): Promise<ImportantDate[]> {
  if (isDevMode()) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return mockDates.map((d) => {
      const eventDate = new Date(d.event_date);
      eventDate.setHours(0, 0, 0, 0);
      const diffTime = eventDate.getTime() - today.getTime();
      const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
      return {
        ...d,
        days_remaining: days,
      };
    });
  }

  return apiClient<ImportantDate[]>('/api/important-dates', {
    method: 'GET',
  });
}

export async function createImportantDate(data: ImportantDateCreateInput): Promise<ImportantDate> {
  if (isDevMode()) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(data.event_date);
    eventDate.setHours(0, 0, 0, 0);
    const days = Math.round((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const newDate: ImportantDate = {
      id: `mock-date-${Date.now()}`,
      title: data.title,
      event_date: data.event_date,
      created_at: new Date().toISOString(),
      days_remaining: days,
    };
    mockDates.push(newDate);
    return newDate;
  }

  return apiClient<ImportantDate>('/api/important-dates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteImportantDate(dateId: string): Promise<void> {
  if (isDevMode()) {
    mockDates = mockDates.filter((d) => d.id !== dateId);
    return;
  }

  return apiClient<void>(`/api/important-dates/${dateId}`, {
    method: 'DELETE',
  });
}
