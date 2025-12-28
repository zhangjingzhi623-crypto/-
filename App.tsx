import React, { useState } from 'react';
import { AppTab } from './types';
import MatrixView from './components/MatrixView';
import DashboardView from './components/DashboardView';
import { LayoutGrid, BarChart2 } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.MATRIX);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BarChart2 className="text-white h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Strategist Tools</h1>
            </div>
            
            <nav className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <TabButton 
                active={activeTab === AppTab.MATRIX} 
                onClick={() => setActiveTab(AppTab.MATRIX)}
                icon={<BarChart2 size={18} />}
                label="Time Matrix"
              />
              <TabButton 
                active={activeTab === AppTab.DASHBOARD} 
                onClick={() => setActiveTab(AppTab.DASHBOARD)}
                icon={<LayoutGrid size={18} />}
                label="Work Dashboard"
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === AppTab.MATRIX ? <MatrixView /> : <DashboardView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            Based on the Strategist Time Matrix & Visualization Principles. 
          </p>
        </div>
      </footer>
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const TabButton = ({ active, onClick, icon, label }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
      active 
        ? 'bg-white text-indigo-600 shadow-sm' 
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

export default App;