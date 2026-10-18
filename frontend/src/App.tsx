import { useState, useEffect } from 'react';
import { LayoutDashboard, PenSquare, Moon, Sun } from 'lucide-react';
import Dashboard from './views/Dashboard';
import StagingWorkspace from './views/StagingWorkspace';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staging'>('dashboard');
  
  // 1. Initialize state by checking the user's system preferences
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // 2. Inject or remove the 'dark' class on the HTML tag when the state changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        
        {/* Header Section */}
        <header className="flex justify-between items-center pb-6 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">M.A.T.U.R.E</h1>
            <p className="text-slate-500 text-sm mt-1">Money Auditing & Transaction Understanding Runtime Engine</p>
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* 3. The Dark Mode Toggle Button */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
            >
              {isDark ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            {/* View Navigation Tabs */}
            <div className="flex gap-3 p-1 bg-slate-200 dark:bg-slate-800 rounded-lg transition-colors">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('staging')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                  activeTab === 'staging' 
                    ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-white' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <PenSquare size={18} /> Extract Notes
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main>
          {activeTab === 'dashboard' ? <Dashboard /> : <StagingWorkspace />}
        </main>

      </div>
    </div>
  );
}