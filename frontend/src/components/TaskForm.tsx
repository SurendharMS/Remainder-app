import React, { useState } from 'react';
import { PlusCircle, Calendar, AlignLeft, Clock, Star, Folder, Tag as TagIcon } from 'lucide-react';
import type { RecurrencePattern, TaskCreateInput, TaskCategory } from '../types';

interface TaskFormProps {
  onTaskCreated: (task: TaskCreateInput) => Promise<void>;
  showHeader?: boolean;
}

const PRESET_TAGS = ['Work', 'Personal', 'Family', 'Friends'];

export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated, showHeader = false }) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [tag, setTag] = useState('');
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
        tag: tag.trim() || undefined,
        recurrence_pattern: recurrencePattern,
        custom_recurrence: recurrencePattern === 'custom' ? { interval: customInterval, unit: customUnit } : null,
        category,
        isPrimary,
        due_date: new Date(dueDate).toISOString(),
      });

      setTitle('');
      setNote('');
      setTag('');
      setRecurrencePattern('once');
      setCategory('General Tasks');
      setIsPrimary(false);
      setCustomInterval(1);
      setCustomUnit('days');
      setDueDate(defaultDateTime());
    } catch (err: unknown) {
      const errorObj = err as { status?: number; message?: string };
      if (errorObj?.status === 401) {
        // Auto-redirect to AuthGate handled in api client
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagToggle = (selectedTag: string) => {
    if (tag.toLowerCase() === selectedTag.toLowerCase()) {
      setTag('');
    } else {
      setTag(selectedTag);
    }
  };

  return (
    <div>
      {showHeader && (
        <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-blue-100 dark:border-blue-900/60">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
            <PlusCircle className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
              Quick Add Task
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-blue-300/70">
              Schedule a new one-time or recurring reminder
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-3 p-2.5 rounded-lg border text-xs bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-slate-600 dark:text-slate-300">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Renew car insurance, Team sync..."
            className="w-full px-3 py-2 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border bg-white border-slate-200 text-slate-900 placeholder-slate-400 dark:bg-black/50 dark:border-slate-700 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-500"
          />
        </div>

        {/* Category & Primary Task Toggle Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Folder className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="w-full px-3 py-2 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border bg-white border-slate-200 text-slate-900 dark:bg-black/50 dark:border-slate-700 dark:text-zinc-100 dark:focus:border-blue-500"
            >
              <option value="General Tasks">General Tasks</option>
              <option value="Daily Tasks">Daily Tasks</option>
              <option value="Birthday">Birthday</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 sm:pt-4">
            <button
              type="button"
              role="switch"
              aria-checked={isPrimary}
              onClick={() => setIsPrimary(!isPrimary)}
              className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isPrimary ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span className="sr-only">Mark as Primary Task</span>
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isPrimary ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <label
              className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer select-none"
              onClick={() => setIsPrimary(!isPrimary)}
            >
              <Star className={`w-3.5 h-3.5 ${isPrimary ? 'text-amber-500 fill-current' : 'text-slate-400'}`} />
              Primary Task (High Priority)
            </label>
          </div>
        </div>

        {/* Custom Tag Field (Pills + Input) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <TagIcon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            Tag
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {PRESET_TAGS.map((t) => {
              const isSelected = tag.toLowerCase() === t.toLowerCase();
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTagToggle(t)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700/70'
                  }`}
                >
                  {t}
                </button>
              );
            })}
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="Or custom tag..."
              maxLength={40}
              className="flex-1 min-w-[120px] px-2.5 py-1 text-xs rounded-lg border bg-white border-slate-200 text-slate-900 placeholder-slate-400 dark:bg-black/50 dark:border-slate-700 dark:text-zinc-100 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        </div>

        {/* Note / Details */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <AlignLeft className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            Notes & Details
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Checklists, notes, or additional context..."
            className="w-full px-3 py-2 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border resize-none leading-relaxed bg-white border-slate-200 text-slate-900 placeholder-slate-400 dark:bg-black/50 dark:border-slate-700 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-blue-500"
          />
        </div>

        {/* Recurrence Pattern & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              Schedule
            </label>
            <select
              value={recurrencePattern}
              onChange={(e) => setRecurrencePattern(e.target.value as RecurrencePattern)}
              className="w-full px-3 py-2 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border bg-white border-slate-200 text-slate-900 dark:bg-black/50 dark:border-slate-700 dark:text-zinc-100 dark:focus:border-blue-500"
            >
              <option value="once">Once (Non-repeating)</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom interval...</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              Due Date & Time
            </label>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 border bg-white border-slate-200 text-slate-900 dark:bg-black/50 dark:border-slate-700 dark:text-zinc-100 dark:focus:border-blue-500"
            />
          </div>
        </div>

        {/* Custom Recurrence Inputs */}
        {recurrencePattern === 'custom' && (
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-600 dark:text-slate-300">Repeat every</span>
            <input
              type="number"
              min="1"
              value={customInterval}
              onChange={(e) => setCustomInterval(parseInt(e.target.value) || 1)}
              className="w-16 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value as any)}
              className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 shadow-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-105 active:scale-95"
          >
            {isSubmitting ? 'Saving...' : 'Save Reminder'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;