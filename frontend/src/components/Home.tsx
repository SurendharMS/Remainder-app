import React, { useState, useEffect } from 'react';
import { getPendingTasks, getImportantDates, completeTask } from '../lib/api';
import type { Task, ImportantDate } from '../types';
import { format, parseISO, isToday, isTomorrow, isPast, startOfDay } from 'date-fns';
import { Check, Clock, Cake, Calendar as CalendarIcon, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface HomeProps {
  onNavigateToCreate: () => void;
  onNavigateToDashboard: () => void;
  username: string;
}

type TimelineItem = 
  | { type: 'task'; data: Task; dateObj: Date }
  | { type: 'event'; data: ImportantDate; dateObj: Date };

export const Home: React.FC<HomeProps> = ({ onNavigateToDashboard }) => {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasks, events] = await Promise.all([
          getPendingTasks(false),
          getImportantDates()
        ]);

        const timeline: TimelineItem[] = [
          ...tasks.map(t => ({ type: 'task' as const, data: t, dateObj: parseISO(t.due_date) })),
          ...events.map(e => ({ type: 'event' as const, data: e, dateObj: parseISO(e.event_date) }))
        ];

        timeline.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        setItems(timeline);
      } catch (err) {
        console.error('Failed to load timeline data:', err);
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
        setItems((prev) => prev.filter((t) => !(t.type === 'task' && t.data.id === taskId)));
      } else {
        setItems((prev) => prev.map((t) => 
          (t.type === 'task' && t.data.id === taskId) ? { ...t, data: updated as Task } : t
        ));
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p>Loading your timeline...</p>
      </div>
    );
  }

  // Separate overdue and upcoming
  const overdueItems = items.filter(item => {
    if (item.type === 'event') {
      return isPast(startOfDay(item.dateObj)) && !isToday(startOfDay(item.dateObj));
    }
    return isPast(item.dateObj);
  });

  const upcomingItems = items.filter(item => {
    if (item.type === 'event') {
      return !isPast(startOfDay(item.dateObj)) || isToday(startOfDay(item.dateObj));
    }
    return !isPast(item.dateObj);
  });

  const getDayHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return `Today, ${format(d, 'd MMM')}`;
    if (isTomorrow(d)) return `Tomorrow, ${format(d, 'd MMM')}`;
    return format(d, 'EEEE, d MMM');
  };

  const groupItems = (list: TimelineItem[]) => {
    const grouped = list.reduce((acc, item) => {
      const dayKey = startOfDay(item.dateObj).toISOString();
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(item);
      return acc;
    }, {} as Record<string, TimelineItem[]>);
    
    return grouped;
  };

  const upcomingGrouped = groupItems(upcomingItems);
  const upcomingGroupKeys = Object.keys(upcomingGrouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const renderItem = (item: TimelineItem, isLast: boolean, overdue: boolean) => {
    if (item.type === 'task') {
      return (
        <div key={item.data.id} className={`flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!isLast ? 'border-b border-slate-100 dark:border-slate-800/60' : ''}`}>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); handleTaskComplete(item.data.id); }}
            className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md border-2 border-slate-300 dark:border-slate-600 bg-slate-50 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer group/chk"
            title="Mark as completed"
          >
            <Check className="w-4 h-4 opacity-0 group-hover/chk:opacity-50 text-slate-500" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-slate-900 dark:text-slate-100 truncate">
              {item.data.title}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              {overdue ? <AlertCircle className="w-3.5 h-3.5 text-red-500" /> : <Clock className="w-3.5 h-3.5 text-blue-500" />}
              <span className={`text-sm ${overdue ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                {overdue && <span className="mr-1">Overdue:</span>}
                {format(item.dateObj, 'MMM d, h:mm a')}
              </span>
            </div>
          </div>
        </div>
      );
    } else {
      const isBday = item.data.title.toLowerCase().includes('birthday') || item.data.title.toLowerCase().includes('bday');
      return (
        <div key={item.data.id} className={`flex items-start gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${!isLast ? 'border-b border-slate-100 dark:border-slate-800/60' : ''}`}>
          <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            {isBday ? <Cake className="w-3.5 h-3.5" /> : <CalendarIcon className="w-3.5 h-3.5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-slate-900 dark:text-slate-100 truncate">
              {item.data.title}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>All Day Event</span>
              {overdue && <span className="text-red-500 font-bold ml-1">(Overdue)</span>}
            </p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Upcoming Reminders
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Your unified timeline of tasks and events.
          </p>
        </div>
        <button 
          onClick={onNavigateToDashboard}
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Manage All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center shadow-sm">
          <CalendarIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">No upcoming reminders</h3>
          <p className="text-slate-500 dark:text-slate-400">You're all caught up! Enjoy your day.</p>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Overdue Section */}
          {overdueItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold tracking-wide uppercase px-2 text-red-500 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Overdue Reminders
              </h2>
              
              <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl shadow-sm overflow-hidden">
                <div className="max-h-[24rem] overflow-y-auto custom-scrollbar">
                  {overdueItems.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime()).map((item, idx) => 
                    renderItem(item, idx === overdueItems.length - 1, true)
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {upcomingGroupKeys.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold tracking-wide uppercase px-2 text-slate-500 dark:text-slate-400">
                Upcoming Reminders
              </h2>
              
              <div className="bg-blue-50/50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
                <div className="max-h-[32rem] overflow-y-auto custom-scrollbar">
                  {upcomingGroupKeys.map((key, groupIdx) => {
                    const dayItems = upcomingGrouped[key];
                    const isLastGroup = groupIdx === upcomingGroupKeys.length - 1;
                    return (
                      <div key={key} className={!isLastGroup ? 'border-b border-slate-200/60 dark:border-slate-700/60' : ''}>
                        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 font-semibold text-sm text-slate-600 dark:text-slate-300 tracking-wide">
                          {getDayHeader(key)}
                        </div>
                        <div>
                          {dayItems.map((item, idx) => 
                            renderItem(item, idx === dayItems.length - 1, false)
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default Home;
