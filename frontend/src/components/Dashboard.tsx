import React, { useState, useEffect } from 'react';
import { Filter, RefreshCw, Plus, Trash2, Calendar, Cake } from 'lucide-react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { TaskCard } from './TaskCard';
import {
  getPendingTasks,
  completeTask,
  getImportantDates,
  createImportantDate,
  deleteImportantDate,
} from '../lib/api';
import type { Task, ImportantDate } from '../types';

interface DashboardProps {
  onNavigateToCreate?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateToCreate }) => {
  // Task State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTasksLoading, setIsTasksLoading] = useState(true);
  const [dueOnlyFilter, setDueOnlyFilter] = useState(false);

  // Birthday / Important Dates State
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [isDatesLoading, setIsDatesLoading] = useState(true);
  const [showAddDateModal, setShowAddDateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  const loadTasks = async (dueOnly: boolean = dueOnlyFilter) => {
    try {
      setIsTasksLoading(true);
      const data = await getPendingTasks(dueOnly);
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const loadDates = async () => {
    try {
      setIsDatesLoading(true);
      const data = await getImportantDates();
      setDates(data);
    } catch (err) {
      console.error('Failed to load important dates:', err);
    } finally {
      setIsDatesLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(dueOnlyFilter);
  }, [dueOnlyFilter]);

  useEffect(() => {
    loadDates();
  }, []);

  const handleTaskComplete = async (taskId: string) => {
    const updated = await completeTask(taskId);
    if (updated.status === 'completed') {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } else {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    }
  };

  const handleCreateDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newEventDate) return;

    try {
      await createImportantDate({
        title: newTitle.trim(),
        event_date: newEventDate,
      });
      setNewTitle('');
      setNewEventDate('');
      setShowAddDateModal(false);
      await loadDates();
    } catch (err) {
      console.error('Failed to save date:', err);
    }
  };

  const handleDeleteDate = async (id: string) => {
    try {
      await deleteImportantDate(id);
      setDates((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Failed to delete date:', err);
    }
  };

  const renderCountdownBadge = (eventDateStr: string, days?: number) => {
    if (days === undefined) return null;
    const dateObj = parseISO(eventDateStr);
    const overdue = isPast(dateObj) && !isToday(dateObj);

    if (overdue) {
       return (
         <span className="bg-red-500 text-white font-bold px-3 py-1 text-sm rounded-full shadow-sm">
           Overdue
         </span>
       );
    }
    
    if (days === 0) {
      return (
        <span className="bg-rose-500 text-white font-semibold px-3 py-1 text-sm rounded-full shadow-sm animate-pulse">
          Today!
        </span>
      );
    }
    if (days === 1) {
      return (
        <span className="bg-amber-500 text-white font-semibold px-3 py-1 text-sm rounded-full shadow-sm">
          Tomorrow
        </span>
      );
    }
    return (
      <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold px-3 py-1 text-sm rounded-full">
        {days} days left
      </span>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Two-Column Wireframe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Task List                                                    */}
        {/* ========================================================================= */}
        <div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">
            Task List
          </h2>

          <div className="bg-blue-50/50 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 p-8 rounded-2xl shadow-sm">
            {/* Controls Bar */}
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-blue-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDueOnlyFilter(false)}
                  className={`px-4 py-2 text-base font-semibold rounded-lg transition-colors ${
                    !dueOnlyFilter
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  All ({!dueOnlyFilter && !isTasksLoading ? tasks.length : '...'})
                </button>
                <button
                  type="button"
                  onClick={() => setDueOnlyFilter(true)}
                  className={`flex items-center gap-2 px-4 py-2 text-base font-semibold rounded-lg transition-colors ${
                    dueOnlyFilter
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  Due Now
                </button>
              </div>

              <div className="flex items-center gap-3">
                {onNavigateToCreate && (
                  <button
                    type="button"
                    onClick={onNavigateToCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 text-base rounded-lg shadow-sm transition-all duration-200 hover:brightness-110 active:scale-95"
                  >
                    <Plus className="w-5 h-5 stroke-[2.5]" />
                    Add Task
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => loadTasks(dueOnlyFilter)}
                  title="Refresh tasks"
                  className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-slate-800 transition-all duration-200 hover:rotate-12 active:scale-95"
                >
                  <RefreshCw className={`w-5 h-5 ${isTasksLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Task Items */}
          {isTasksLoading ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 p-8 text-center font-medium rounded-xl text-lg shadow-sm">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 p-8 text-center font-medium rounded-xl text-lg shadow-sm">
              {dueOnlyFilter
                ? 'No immediate tasks due right now!'
                : 'No pending tasks found. All caught up!'}
            </div>
          ) : (
            <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleTaskComplete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: Birthday Reminder                                           */}
      {/* ========================================================================= */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6 tracking-tight">
          Birthday Reminder
        </h2>

        <div className="bg-blue-50/50 border border-slate-200 dark:bg-slate-800/80 dark:border-slate-700 p-8 rounded-2xl shadow-sm">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-blue-200/60 dark:border-slate-800">
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {dates.length} Upcoming Event{dates.length === 1 ? '' : 's'}
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAddDateModal(!showAddDateModal)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 text-base rounded-lg shadow-sm transition-all duration-200 hover:brightness-110 active:scale-95"
              >
                <Plus className={`w-5 h-5 stroke-[2.5] transition-transform duration-200 ${showAddDateModal ? 'rotate-45' : ''}`} />
                {showAddDateModal ? 'Cancel' : 'Add Birthday'}
              </button>
              <button
                type="button"
                onClick={loadDates}
                title="Refresh birthdays"
                className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-blue-100/50 dark:hover:bg-slate-800 transition-all duration-200 hover:rotate-12 active:scale-95"
              >
                <RefreshCw className={`w-5 h-5 ${isDatesLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Add Birthday Form */}
          {showAddDateModal && (
            <form
              onSubmit={handleCreateDate}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 mb-6 rounded-xl shadow-sm space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                New Milestone or Birthday
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Event Title (e.g. Mom's Birthday, Exam)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 p-3 text-base text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 p-3 text-base text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 text-base rounded-lg transition-colors shadow-sm"
                >
                  Save Date
                </button>
              </div>
            </form>
          )}

          {/* Birthday Items */}
          {isDatesLoading ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 p-8 text-center font-medium rounded-xl text-lg shadow-sm">
              Loading birthday countdowns...
            </div>
          ) : dates.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 p-8 text-center font-medium rounded-xl text-lg shadow-sm">
              No birthdays or milestone events added yet.
            </div>
          ) : (
            <div className="space-y-4 max-h-[32rem] overflow-y-auto pr-2 custom-scrollbar">
              {dates.map((item) => {
                const isBday =
                  item.title.toLowerCase().includes('birthday') ||
                  item.title.toLowerCase().includes('bday');
                  
                const dateObj = parseISO(item.event_date);
                const overdue = isPast(dateObj) && !isToday(dateObj);

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 p-6 rounded-xl shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-blue-900/30 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 rounded-xl">
                        {isBday ? <Cake className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold text-lg truncate tracking-tight ${overdue ? 'text-red-500 dark:text-red-400 font-bold' : 'text-slate-900 dark:text-slate-100'}`}>
                          {item.title}
                        </p>
                        <p className={`text-base mt-1 ${overdue ? 'text-red-500 dark:text-red-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                          {format(dateObj, 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {renderCountdownBadge(item.event_date, item.days_remaining)}
                      <button
                        type="button"
                        onClick={() => handleDeleteDate(item.id)}
                        aria-label={`Delete event ${item.title}`}
                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-110 active:scale-95"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>

    </div>
  );
};
