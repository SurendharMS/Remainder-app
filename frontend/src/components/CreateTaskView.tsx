import React, { useState } from 'react';
import { PlusCircle, CheckCircle2, ArrowLeft, Eye } from 'lucide-react';
import { TaskForm } from './TaskForm';
import { createTask } from '../lib/api';
import type { TaskCreateInput } from '../types';

interface CreateTaskViewProps {
  onTaskCreatedSuccess: () => void;
  onNavigateHome: () => void;
}

export const CreateTaskView: React.FC<CreateTaskViewProps> = ({
  onTaskCreatedSuccess,
  onNavigateHome,
}) => {
  const [createdTitle, setCreatedTitle] = useState<string | null>(null);

  const handleCreate = async (input: TaskCreateInput) => {
    await createTask(input);
    setCreatedTitle(input.title);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 space-y-4 pb-8 pt-2">
      {/* Success Banner */}
      {createdTitle && (
        <div className="p-3 rounded-xl border flex items-center justify-between gap-3 shadow-sm animate-fadeIn bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs sm:text-sm truncate">
              Reminder <strong>"{createdTitle}"</strong> was created successfully!
            </span>
          </div>
          <button
            type="button"
            onClick={onTaskCreatedSuccess}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:brightness-110 active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 flex-shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            View in Home
          </button>
        </div>
      )}

      {/* Main Creation Card */}
      <div className="w-full rounded-2xl border p-5 sm:p-6 transition-colors duration-300 shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex flex-row items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-row items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 flex-shrink-0">
              <PlusCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Create Reminder or Routine
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure schedule, recurrence, and details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateHome}
            title="Back to Home"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>

        <TaskForm onTaskCreated={handleCreate} />
      </div>
    </div>
  );
};
