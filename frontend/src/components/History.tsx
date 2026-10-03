import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Trash2, CheckCircle2, AlertTriangle, Clock, Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getTaskHistory, deleteHistoryTask } from '../lib/api';
import type { Task } from '../types';

export const History: React.FC = () => {
  const [historyTasks, setHistoryTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getTaskHistory();
      setHistoryTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      setIsDeleting(true);
      await deleteHistoryTask(deleteTargetId);
      setHistoryTasks((prev) => prev.filter((t) => t.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task from history');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateShort = (isoString: string) => format(parseISO(isoString), 'MMM d');

  const filteredTasks = historyTasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      (task.note && task.note.toLowerCase().includes(query))
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 pt-4">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
              <HistoryIcon className="w-6 h-6 stroke-[2]" />
            </div>
            History Log
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-2">
            Archive of your completed tasks and routines.
          </p>
        </div>
        <button
          type="button"
          onClick={loadHistory}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 border bg-white hover:bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-200 shadow-sm self-start md:self-auto"
        >
          Refresh Log
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search history by title or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:focus:border-blue-600 transition-colors"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl border text-sm bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/30 dark:border-rose-800 dark:text-rose-300 shadow-sm">
          {error}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border bg-white border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
            <div className="flex items-center gap-3 text-red-500 dark:text-red-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Permanently Erase Record?</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              This will permanently delete this record from your history journal and database. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 text-white text-sm font-bold rounded-lg shadow-sm transition-colors disabled:opacity-50 bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Erase Record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
          <Clock className="w-8 h-8 animate-spin text-blue-500 mb-4" />
          Loading your journal entries...
        </div>
      ) : historyTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No completed tasks yet. Check off items in your Dashboard.</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No tasks match your search.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-900/30 group"
            >
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="mt-1 sm:mt-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-lg text-slate-900 dark:text-slate-100 line-through opacity-70">
                    {task.title}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                    <span>Created: {formatDateShort(task.created_at)}</span>
                    <span className="hidden sm:inline text-slate-300 dark:text-slate-600">|</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Completed: {task.completed_at ? formatDateShort(task.completed_at) : 'N/A'}
                    </span>
                  </div>
                  {task.note && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                      {task.note}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setDeleteTargetId(task.id)}
                className="self-end sm:self-center p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                title="Permanently erase from history"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
