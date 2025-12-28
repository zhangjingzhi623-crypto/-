import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import MatrixView from './components/MatrixView';
import DashboardView from './components/DashboardView';
import ReviewView from './components/ReviewView';
import { LayoutGrid, BarChart2, Clock, ClipboardCheck } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.MATRIX);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Real-time clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format date and time
  const dateStr = currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const timeStr = currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <LayoutGrid className="text-white h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight leading-none">人生矩阵</h1>
                <p className="text-[10px] text-gray-500 font-medium tracking-wide">LIFE MATRIX SYSTEM</p>
              </div>
            </div>

            {/* Central Clock Display */}
            <div className="hidden md:flex flex-col items-center justify-center bg-gray-50 px-6 py-1 rounded-md border border-gray-100">
              <div className="text-xs text-gray-500 font-medium">{dateStr}</div>
              <div className="text-lg font-bold text-indigo-600 font-mono leading-none mt-0.5">{timeStr}</div>
            </div>
            
            <nav className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <TabButton 
                active={activeTab === AppTab.MATRIX} 
                onClick={() => setActiveTab(AppTab.MATRIX)}
                icon={<BarChart2 size={18} />}
                label="矩阵"
              />
              <TabButton 
                active={activeTab === AppTab.DASHBOARD} 
                onClick={() => setActiveTab(AppTab.DASHBOARD)}
                icon={<LayoutGrid size={18} />}
                label="仪表盘"
              />
              <TabButton 
                active={activeTab === AppTab.REVIEW} 
                onClick={() => setActiveTab(AppTab.REVIEW)}
                icon={<ClipboardCheck size={18} />}
                label="复盘"
              />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === AppTab.MATRIX && <MatrixView />}
        {activeTab === AppTab.DASHBOARD && <DashboardView />}
        {activeTab === AppTab.REVIEW && <ReviewView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
             人生矩阵 (Life Matrix) © {new Date().getFullYear()} | 让每一天都有迹可循
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