import React, { useState, useEffect } from 'react';
import { Cake, CalendarDays, Plus, Trash2, Clock, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getImportantDates, createImportantDate, deleteImportantDate } from '../lib/api';
import type { ImportantDate } from '../types';

interface EventCountdownWidgetProps {
  compact?: boolean;
}

export const EventCountdownWidget: React.FC<EventCountdownWidgetProps> = ({ compact = false }) => {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadDates = async () => {
    try {
      setIsLoading(true);
      const data = await getImportantDates();
      setDates(data);
    } catch (err) {
      console.error('Failed to load important dates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDates();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newEventDate) return;

    try {
      setError(null);
      await createImportantDate({
        title: newTitle.trim(),
        event_date: newEventDate,
      });
      setNewTitle('');
      setNewEventDate('');
      setShowAddModal(false);
      await loadDates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save date');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImportantDate(id);
      setDates((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete important date:', err);
    }
  };

  const renderCountdownBadge = (days?: number) => {
    if (days === undefined) return null;
    if (days === 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold animate-pulse bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
          Today!
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800">
          Tomorrow
        </span>
      );
    }
    if (days > 1) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900">
          {days} days left
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-500 border border-slate-200 dark:bg-black/50 dark:text-zinc-400 dark:border-blue-900/50">
        {Math.abs(days)} days ago
      </span>
    );
  };

  const isBirthday = (title: string) => {
    const lower = title.toLowerCase();
    return lower.includes('birthday') || lower.includes('bday') || lower.includes('born');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
            <Cake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-zinc-100">
              Upcoming Events & Birthdays
            </h3>
            <p className="text-xs text-slate-500 dark:text-blue-300/70">
              Live day countdown for milestones and celebrations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(!showAddModal)}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-xl border transition-colors duration-200 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:border-blue-900 dark:text-blue-300"
        >
          <Plus className="w-3.5 h-3.5" />
          {showAddModal ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {showAddModal && (
        <form
          onSubmit={handleCreate}
          className="mb-6 p-4 rounded-2xl border space-y-3 shadow-sm bg-white border-blue-200 dark:bg-blue-950/60 dark:border-blue-900"
        >
          {error && <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Event Title (e.g. Mom's Birthday, Exam)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 border bg-white border-blue-200 text-slate-900 placeholder-slate-400 dark:bg-black/60 dark:border-blue-900 dark:text-zinc-100 dark:placeholder-zinc-500"
            />
            <input
              type="date"
              required
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 border bg-white border-blue-200 text-slate-900 dark:bg-black/60 dark:border-blue-900 dark:text-zinc-100"
            />
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-1.5 text-white rounded-xl text-xs font-medium transition-colors duration-200 shadow-sm bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-blue-500/20"
            >
              Save Event
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-xs text-slate-400 dark:text-blue-300/60">
          <Clock className="w-4 h-4 animate-spin mr-2 text-blue-600 dark:text-blue-400" />
          Calculating countdowns...
        </div>
      ) : dates.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 dark:text-blue-300/60">
          <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50 text-blue-500" />
          No upcoming events or birthdays added yet.
        </div>
      ) : (
        <div
          className={
            compact
              ? 'space-y-3'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          }
        >
          {dates.map((item) => {
            const isBday = isBirthday(item.title);
            return (
              <div
                key={item.id}
                className="group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 bg-white border-blue-200 hover:border-blue-300 hover:bg-blue-50/40 dark:bg-blue-950/40 dark:border-blue-900 dark:hover:border-blue-700 dark:hover:bg-blue-950/60"
              >
                <div className="min-w-0 pr-3 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isBday
                        ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                    }`}
                  >
                    {isBday ? (
                      <Cake className="w-4 h-4" />
                    ) : (
                      <CalendarDays className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate text-slate-900 dark:text-zinc-200">
                      {item.title}
                    </p>
                    <p className="text-xs mt-0.5 text-slate-500 dark:text-blue-300/70">
                      {format(parseISO(item.event_date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {renderCountdownBadge(item.days_remaining)}
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Delete event ${item.title}`}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:text-blue-300/60 dark:hover:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
