import React from 'react';
import { LayoutDashboard, PlusCircle, FileText, History, Sun, Moon, LogOut, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { signOut } from '../lib/supabase';
import { isDevMode, setDevMode } from '../lib/api';

export type NavigationTab = 'home' | 'dashboard' | 'create' | 'notes' | 'history';

interface NavbarProps {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  username: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange }) => {
  const { theme, toggleTheme } = useTheme();

  const handleSignOut = async () => {
    if (isDevMode()) {
      setDevMode(false);
      window.location.reload();
      return;
    }
    await signOut();
  };

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create', label: 'Create Task', icon: PlusCircle },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <header className="relative z-50 w-full">
      <nav className="flex items-center justify-between w-full p-2 backdrop-blur-md bg-white/70 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xl rounded-full">
        <div className="flex items-center gap-1 sm:gap-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-6 py-2.5 text-base font-semibold rounded-full transition-all duration-300 ease-out hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 dark:bg-blue-600 dark:text-white dark:shadow-blue-900/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/50 hover:shadow-sm'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Divider */}
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1 sm:mx-2"></div>
  
          {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark/light mode"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          className="p-2.5 rounded-full transition-all duration-300 ease-out text-slate-600 hover:bg-slate-100 dark:text-amber-400 dark:hover:bg-slate-700 hover:scale-110 active:scale-95 focus:outline-none"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-12" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 transition-transform duration-300 hover:-rotate-12" />
          )}
        </button>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleSignOut}
          title="Sign out"
          className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-all duration-300 ease-out hover:scale-110 active:scale-95"
        >
          <LogOut className="w-5 h-5" />
        </button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
