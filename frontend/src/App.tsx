import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthGate } from './components/AuthGate';
import { Navbar, type NavigationTab } from './components/Navbar';
import { Home } from './components/Home';
import { Dashboard } from './components/Dashboard';
import { CreateTaskView } from './components/CreateTaskView';
import { History } from './components/History';
import { Notes } from './components/Notes';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');

  return (
    <AuthGate>
      {({ username }) => (
        <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-blue-500 selection:text-white transition-colors duration-200 overflow-hidden">
          
          <div className="flex-none mt-12 mb-14 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-50">
            <Navbar
              currentTab={currentTab}
              onTabChange={setCurrentTab}
              username={username}
            />
          </div>

          <main className="flex-1 overflow-y-auto w-full">
            <div key={currentTab} className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-fadeIn ${currentTab === 'notes' ? 'pb-0 h-full overflow-hidden' : 'pb-16'}`}>
              {currentTab === 'home' && (
                <Home
                  username={username}
                  onNavigateToCreate={() => setCurrentTab('create')}
                  onNavigateToDashboard={() => setCurrentTab('dashboard')}
                />
              )}
              {currentTab === 'dashboard' && (
                <Dashboard
                  onNavigateToCreate={() => setCurrentTab('create')}
                />
              )}
              {currentTab === 'notes' && <Notes />}
              {currentTab === 'create' && (
                <CreateTaskView
                  onTaskCreatedSuccess={() => setCurrentTab('home')}
                  onNavigateHome={() => setCurrentTab('home')}
                />
              )}
              {currentTab === 'history' && <History />}
            </div>
          </main>
        </div>
      )}
    </AuthGate>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
