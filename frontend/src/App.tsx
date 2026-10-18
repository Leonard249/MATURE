import { useState } from 'react';
import { LayoutDashboard, PenSquare } from 'lucide-react';
import Dashboard from './views/Dashboard';
import StagingWorkspace from './views/StagingWorkspace';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'staging'>('dashboard');

  return (
    <div className="min-h-screen text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto p-8 space-y-8">
        
        <header className="flex justify-between items-center pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">M.A.T.U.R.E</h1>
            <p className="text-slate-500 text-sm mt-1">Money Auditing & Transaction Understanding Runtime Engine</p>
          </div>
          
          <div className="flex gap-3 p-1 bg-slate-200 rounded-lg">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'dashboard' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('staging')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'staging' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <PenSquare size={18} /> Extract Notes
            </button>
          </div>
        </header>

        <main>
          {activeTab === 'dashboard' ? <Dashboard /> : <StagingWorkspace />}
        </main>

      </div>
    </div>
  );
}