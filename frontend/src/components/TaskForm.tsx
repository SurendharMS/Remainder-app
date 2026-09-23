import React, { useState } from 'react';
import { PlusCircle, Calendar, AlignLeft, Clock } from 'lucide-react';
import type { RecurrencePattern, TaskCreateInput } from '../types';

interface TaskFormProps {
  onTaskCreated: (task: TaskCreateInput) => Promise<void>;
  showHeader?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated, showHeader = false }) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('once');

  const defaultDateTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 2, 0, 0, 0);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [dueDate, setDueDate] = useState<string>(defaultDateTime());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onTaskCreated({
        title: title.trim(),
        note: note.trim() || undefined,
        recurrence_pattern: recurrencePattern,
        due_date: new Date(dueDate).toISOString(),
      });

      setTitle('');
      setNote('');
      setRecurrencePattern('once');
      setDueDate(defaultDateTime());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {showHeader && (
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-blue-100 dark:border-blue-900/60">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
              Quick Add Task
            </h2>
            <p className="text-xs text-slate-500 dark:text-blue-300/70">
              Schedule a new one-time or recurring reminder
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3.5 rounded-xl border text-sm bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-base font-medium mb-2 text-slate-700 dark:text-blue-300/90">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Renew car insurance, Team sync..."
            className="w-full px-5 py-3.5 rounded-xl text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border bg-white border-blue-200 text-slate-900 placeholder-slate-400 dark:bg-black/60 dark:border-blue-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-600"
          />
        </div>

        {/* Note / Details */}
        <div>
          <label className="block text-base font-medium mb-2 flex items-center gap-2 text-slate-700 dark:text-blue-300/90">
            <AlignLeft className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            Notes & Details
          </label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Checklists, notes, or additional context..."
            className="w-full px-5 py-3.5 rounded-xl text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border resize-none leading-relaxed bg-white border-blue-200 text-slate-900 placeholder-slate-400 dark:bg-black/60 dark:border-blue-900 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-600"
          />
        </div>

        {/* Recurrence Pattern & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-base font-medium mb-2 flex items-center gap-2 text-slate-700 dark:text-blue-300/90">
              <Clock className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              Recurrence Schedule
            </label>
            <select
              value={recurrencePattern}
              onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
              className="w-full px-5 py-3.5 rounded-xl text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border bg-white border-blue-200 text-slate-900 dark:bg-black/60 dark:border-blue-900 dark:text-zinc-100 dark:focus:border-blue-600"
            >
              <option value="once">Once (Non-repeating)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-base font-medium mb-2 flex items-center gap-2 text-slate-700 dark:text-blue-300/90">
              <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              Due Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border bg-white border-blue-200 text-slate-900 dark:bg-black/60 dark:border-blue-900 dark:text-zinc-100 dark:focus:border-blue-600"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg font-bold text-white transition-all duration-200 shadow-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95"
          >
            {isSubmitting ? 'Saving...' : 'Save Reminder'}
          </button>
        </div>
      </form>
    </div>
  );
};
