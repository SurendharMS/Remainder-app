import React, { useState, useEffect } from 'react';
import { Filter, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';
import { TaskCard } from './TaskCard';
import { getPendingTasks, completeTask } from '../lib/api';
import type { Task, TaskCategory } from '../types';

interface DashboardProps {
  onNavigateToCreate?: () => void;
}

type FilterOption = 'All' | TaskCategory | 'Primary Tasks' | 'Overdue Tasks';

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToCreate }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('All');

  const loadTasks = async () => {
    try {
      setIsTasksLoading(true);
      const data = await getPendingTasks(false);
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setIsTasksLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleTaskComplete = async (taskId: string) => {
    const updated = await completeTask(taskId);
    if (updated.status === 'completed') {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } else {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Primary Tasks') return task.isPrimary;
    if (selectedFilter === 'Overdue Tasks') return isPast(parseISO(task.due_date));
    return task.category === selectedFilter;
  });

  const filters: FilterOption[] = [
    'All',
    'General Tasks',
    'Primary Tasks',
    'Birthday',
    'Overdue Tasks',
    'Daily Tasks',
  ];

  const filterLabels: Record<FilterOption, string> = {
    'All': 'All',
    'General Tasks': 'General Tasks',
    'Primary Tasks': 'Primary Tasks',
    'Birthday': 'Birthday Reminders',
    'Overdue Tasks': 'Overdue Tasks',
    'Daily Tasks': 'Daily Tasks',
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-16 pt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Filtering Hub
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Dynamic view of all your tasks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onNavigateToCreate && (
            <button
              type="button"
              onClick={onNavigateToCreate}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 text-base rounded-lg shadow-sm transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          )}
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedFilter === filter
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
            }`}
          >
            {filter === 'Overdue Tasks' && <AlertCircle className="inline-block w-4 h-4 mr-1.5 -mt-0.5" />}
            {filterLabels[filter]}
          </button>
        ))}
      </div>

      {/* Dynamic View */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 dark:bg-slate-900/80 dark:border-slate-700 dark:shadow-none">
        {isTasksLoading ? (
          <div className="text-slate-600 dark:text-slate-300 text-center font-medium py-10">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-4" />
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-slate-500 dark:text-slate-400 text-center py-10 text-lg">
            No tasks found for "{selectedFilter}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} onComplete={handleTaskComplete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
