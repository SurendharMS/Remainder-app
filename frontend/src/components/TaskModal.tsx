import React, { useEffect } from 'react';
import { X, Clock, Repeat, AlertCircle, Calendar, FileText } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import type { Task } from '../types';

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !task) return null;

  const dueDate = parseISO(task.due_date);
  const isOverdue = isPast(dueDate);

  const renderRecurrenceBadge = (pattern: Task['recurrence_pattern']) => {
    if (pattern === 'once') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          One-time Task
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <Repeat className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        Repeats {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
      </span>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {renderRecurrenceBadge(task.recurrence_pattern)}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isOverdue
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                }`}
              >
                {isOverdue ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    Overdue
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    Scheduled
                  </>
                )}
              </span>
            </div>
            <h2
              id="task-modal-title"
              className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 break-words"
            >
              {task.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Metadata Section */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>
              <strong>Due Date:</strong> {format(dueDate, 'EEEE, MMMM d, yyyy · h:mm a')}
            </span>
          </div>

          {/* Details / Notes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Notes & Details
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4">
              {task.note ? (
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line break-words">
                  {task.note}
                </p>
              ) : (
                <p className="text-sm italic text-slate-400 dark:text-slate-500">
                  No additional notes or description provided for this task.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
