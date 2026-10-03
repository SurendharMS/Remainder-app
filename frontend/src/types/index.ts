export type RecurrencePattern = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
export type TaskCategory = 'Daily Tasks' | 'Birthday' | 'General Tasks';
export type TaskStatus = 'pending' | 'completed';

export interface CustomRecurrence {
  interval: number;
  unit: 'days' | 'weeks' | 'months' | 'years';
}

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  note?: string | null;
  recurrence_pattern: RecurrencePattern;
  custom_recurrence?: CustomRecurrence | null;
  category: TaskCategory;
  isPrimary: boolean;
  status: TaskStatus;
  created_at: string;
  due_date: string;
  completed_at?: string | null;
}

export interface TaskCreateInput {
  title: string;
  note?: string | null;
  recurrence_pattern: RecurrencePattern;
  custom_recurrence?: CustomRecurrence | null;
  category: TaskCategory;
  isPrimary: boolean;
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
