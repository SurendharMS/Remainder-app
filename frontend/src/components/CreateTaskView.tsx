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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12 pt-4">
      {/* Success Banner */}
      {createdTitle && (
        <div className="max-w-4xl mx-auto p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-sm animate-fadeIn bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-3 min-w-0">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm truncate">
              Reminder <strong>"{createdTitle}"</strong> was created successfully!
            </span>
          </div>
          <button
            type="button"
            onClick={onTaskCreatedSuccess}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 hover:brightness-110 active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 flex-shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            View in Home
          </button>
        </div>
      )}

      {/* Main Creation Card */}
      <div className="w-full max-w-5xl mx-auto rounded-2xl border p-6 sm:px-10 sm:py-8 transition-colors duration-300 shadow-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex flex-row items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 flex-shrink-0">
            <PlusCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Create Reminder or Routine
          </h1>
        </div>

        <TaskForm onTaskCreated={handleCreate} />
      </div>
    </div>
  );
};
