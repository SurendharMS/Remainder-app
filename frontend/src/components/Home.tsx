import React, { useState, useEffect } from 'react';
import { getPendingTasks, completeTask } from '../lib/api';
import type { Task } from '../types';
import { TaskCard } from './TaskCard';
import { Loader2, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigateToCreate: () => void;
  onNavigateToDashboard: () => void;
  username: string;
}

export const Home: React.FC<HomeProps> = ({ onNavigateToDashboard }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getPendingTasks(false);
        setTasks(data);
      } catch (err) {
        console.error('Failed to load tasks:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTaskComplete = async (taskId: string) => {
    try {
      const updated = await completeTask(taskId);
      if (updated.status === 'completed') {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? (updated as Task) : t))
        );
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p>Loading your tasks...</p>
      </div>
    );
  }

  const dailyTasks = tasks.filter((t) => t.category === 'Daily Tasks');
  const birthdayTasks = tasks.filter((t) => t.category === 'Birthday');
  const generalTasks = tasks.filter((t) => t.category === 'General Tasks');

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Home
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Your categorized tasks and reminders.
          </p>
        </div>
        <button
          onClick={onNavigateToDashboard}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Filtering Hub
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
            Daily Tasks
          </h2>
          {dailyTasks.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No daily tasks.</p>
          ) : (
            <div className="space-y-3">
              {dailyTasks.map((t) => (
                <TaskCard key={t.id} task={t} onComplete={handleTaskComplete} />
              ))}
            </div>
          )}
        </div>

        {/* Birthday Reminders */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
            Birthday Reminders
          </h2>
          {birthdayTasks.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No birthdays coming up.</p>
          ) : (
            <div className="space-y-3">
              {birthdayTasks.map((t) => (
                <TaskCard key={t.id} task={t} onComplete={handleTaskComplete} />
              ))}
            </div>
          )}
        </div>

        {/* General Tasks */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
            General Tasks
          </h2>
          {generalTasks.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">No general tasks.</p>
          ) : (
            <div className="space-y-3">
              {generalTasks.map((t) => (
                <TaskCard key={t.id} task={t} onComplete={handleTaskComplete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
