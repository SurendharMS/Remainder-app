import React, { useState, useEffect } from 'react';
import { Check, Clock, Repeat, AlertCircle } from 'lucide-react';
import { format, isPast, parseISO } from 'date-fns';
import { TaskModal } from './TaskModal';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => Promise<void>;
  onCardClick?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onCardClick }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const checkOverdue = () => {
      const dueDate = parseISO(task.due_date);
      setIsOverdue(isPast(dueDate));
    };
    checkOverdue();
    const interval = setInterval(checkOverdue, 60000); // check every minute
    return () => clearInterval(interval);
  }, [task.due_date]);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompleting || isSubmitting) return;

    // 1. Immediately trigger 500ms exit animation
    setIsCompleting(true);

    // 2. Wait 500ms before backend completion API execution
    setTimeout(async () => {
      setIsSubmitting(true);
      try {
        await onComplete(task.id);
      } catch (err) {
        console.error('Failed to complete task:', err);
        setIsCompleting(false);
      } finally {
        setIsSubmitting(false);
      }
    }, 500);
  };

  const handleCardClick = () => {
    if (isCompleting) return;
    if (onCardClick) {
      onCardClick(task);
    } else {
      setIsModalOpen(true);
    }
  };

  const renderRecurrenceBadge = (pattern: Task['recurrence_pattern']) => {
    if (pattern === 'once') return null;
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border bg-blue-50 text-blue-700 border-blue-200 dark:bg-slate-700/60 dark:text-blue-300 dark:border-slate-600">
        <Repeat className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
      </span>
    );
  };

  const dueDateObj = parseISO(task.due_date);

  return (
    <>
      <div
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        className={`bg-white border border-slate-200 text-slate-800 shadow-sm rounded-xl transition-all duration-300 ease-in-out dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 p-6 mb-4 cursor-pointer group hover:border-blue-300 dark:hover:border-slate-600 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-900/30 ${
          isCompleting
            ? 'opacity-0 translate-x-5 transition-all duration-500 pointer-events-none'
            : 'opacity-100 translate-x-0'
        }`}
      >
        <div className="flex items-start gap-5">
          {/* Checkbox */}
          <button
            type="button"
            onClick={handleCheckboxClick}
            disabled={isCompleting || isSubmitting}
            aria-label={`Mark "${task.title}" as complete`}
            className={`mt-1 flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ease-out cursor-pointer ${
              isCompleting
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/30 scale-95'
                : 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50 text-transparent hover:text-blue-600 dark:border-slate-600 dark:bg-slate-900/60 dark:hover:border-blue-400 dark:hover:bg-slate-700/60'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-lg tracking-tight leading-snug text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {task.title}
              </h3>
              <div className="flex-shrink-0">
                {renderRecurrenceBadge(task.recurrence_pattern)}
              </div>
            </div>

            {task.note && (
              <p className="text-base leading-relaxed mt-2 text-slate-600 dark:text-slate-300 line-clamp-2 break-words">
                {task.note}
              </p>
            )}

            {/* Due date & time */}
            <div className="mt-4 flex items-center gap-3 text-sm font-medium">
              <div
                className={`flex items-center gap-2 ${
                  isOverdue
                    ? 'text-red-500 font-bold dark:text-red-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                ) : (
                  <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                )}
                <span>
                  Due: {format(dueDateObj, 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              
              {isOverdue && (
                <span className="bg-red-500 text-white font-bold px-2.5 py-0.5 text-xs rounded-full shadow-sm">
                  Overdue
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        task={task}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default TaskCard;
