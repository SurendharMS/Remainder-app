import React, { useState } from 'react';
import { PlusCircle, Calendar, AlignLeft, Clock, Star, Folder } from 'lucide-react';
import type { RecurrencePattern, TaskCreateInput, TaskCategory, CustomRecurrence } from '../types';

interface TaskFormProps {
  onTaskCreated: (task: TaskCreateInput) => Promise<void>;
  showHeader?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated, showHeader = false }) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>('once');
  const [category, setCategory] = useState<TaskCategory>('General Tasks');
  const [isPrimary, setIsPrimary] = useState(false);
  const [customInterval, setCustomInterval] = useState<number>(1);
  const [customUnit, setCustomUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');

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
        custom_recurrence: recurrencePattern === 'custom' ? { interval: customInterval, unit: customUnit } : null,
        category,
        isPrimary,
        due_date: new Date(dueDate).toISOString(),
      });

      setTitle('');
      setNote('');
      setRecurrencePattern('once');
      setCategory('General Tasks');
      setIsPrimary(false);
      setCustomInterval(1);
      setCustomUnit('days');
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

        {/* Primary Checkbox */}
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            role="switch"
            aria-checked={isPrimary}
            onClick={() => setIsPrimary(!isPrimary)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isPrimary ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
          >
            <span className="sr-only">Mark as Primary Task (Important)</span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isPrimary ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer" onClick={() => setIsPrimary(!isPrimary)}>
            <Star className={`w-4 h-4 ${isPrimary ? 'text-yellow-500 fill-current' : 'text-slate-400'}`} />
            Mark as Primary Task (Important)
          </label>
        </div>

        {/* Category */}
        <div>
          <label className="block text-base font-medium mb-2 flex items-center gap-2 text-slate-700 dark:text-blue-300/90">
            <Folder className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            className="w-full px-5 py-3.5 rounded-xl text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border bg-white border-blue-200 text-slate-900 dark:bg-black/60 dark:border-blue-900 dark:text-zinc-100 dark:focus:border-blue-600"
          >
            <option value="General Tasks">General Tasks</option>
            <option value="Daily Tasks">Daily Tasks</option>
            <option value="Birthday">Birthday</option>
          </select>
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
              <option value="custom">Custom...</option>
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

        {/* Custom Recurrence Inputs */}
        {recurrencePattern === 'custom' && (
          <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
            <span className="text-slate-600 dark:text-slate-300 text-sm">Repeat every</span>
            <input
              type="number"
              min="1"
              value={customInterval}
              onChange={(e) => setCustomInterval(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value as any)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        )}

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

export default TaskForm;
