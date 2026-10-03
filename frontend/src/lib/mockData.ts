import type { Task, ImportantDate } from '../types';

export const initialMockTasks: Task[] = [
  {
    id: 'mock-task-1',
    title: 'Welcome to your Remainder App',
    note: 'Explore the dashboard, add new tasks, or save rich text notes.',
    recurrence_pattern: 'once',
    category: 'General Tasks',
    isPrimary: true,
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    due_date: new Date(Date.now() + 3600000 * 2).toISOString(), // Due in 2 hours
    completed_at: null,
  }
];

export const initialMockDates: ImportantDate[] = [
  {
    id: 'mock-date-1',
    title: 'Product Beta Launch',
    event_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days
    created_at: new Date().toISOString(),
    days_remaining: 3,
  },
  {
    id: 'mock-date-2',
    title: "Mom's Birthday",
    event_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], // 5 days
    created_at: new Date().toISOString(),
    days_remaining: 5,
  }
];
