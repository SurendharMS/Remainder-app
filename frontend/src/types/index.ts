export type RecurrencePattern = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  note?: string | null;
  recurrence_pattern: RecurrencePattern;
  status: TaskStatus;
  created_at: string;
  due_date: string;
  completed_at?: string | null;
}

export interface TaskCreateInput {
  title: string;
  note?: string | null;
  recurrence_pattern: RecurrencePattern;
  due_date: string;
}

export interface ImportantDate {
  id: string;
  user_id?: string;
  title: string;
  event_date: string;
  created_at: string;
  days_remaining?: number;
}

export interface ImportantDateCreateInput {
  title: string;
  event_date: string;
}
