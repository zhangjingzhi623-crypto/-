import React, { useState, useEffect } from 'react';
import { Task, DashboardData, ZoneItem } from '../types';
import MatrixChart from './MatrixChart';
import { analyzeTasks, evaluateTaskAttributes, classifyTaskCategory } from '../services/geminiService';
import { Sparkles, Plus, Trash2, ArrowUpRight, Wand2, CheckSquare, Square } from 'lucide-react';

const STORAGE_KEY = 'life_matrix_db_v4';

// Helper to get DB
const getDB = (): DashboardData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    // Ensure matrix_tasks exists
    if (!parsed.matrix_tasks) parsed.matrix_tasks = [];
    return parsed;
  }
  // Fallback initial state if empty
  return {
    matrix_tasks: [],
    zone1_inspiration: [],
    zone2_work: [],
    zone3_birthdate: '2005-06-23',
    zone4_knowledge: [],
    zone5_misc: [],
    zone6_thinking: []
  };
};

interface RangeInputProps {
  label: string;
  value: number;
  setValue: (v: number) => void;
  low: string;
  high: string;
}

const MatrixView = () => {
  // Load tasks from LS to persist them
  const [tasks, setTasks] = useState<Task[]>(() => getDB().matrix_tasks);
  
  const [showAdvice, setShowAdvice] = useState(false);
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [isRating, setIsRating] = useState(false);

  // Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [benefit, setBenefit] = useState(5);
  const [impact, setImpact] = useState(5);
  const [diffusion, setDiffusion] = useState(5);
  const [timeEff, setTimeEff] = useState(5);
  const [simplicity, setSimplicity] = useState(5);

  // Sync tasks to LS whenever they change
  useEffect(() => {
    const db = getDB();
    db.matrix_tasks = tasks;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [tasks]);

  const handleAutoRate = async () => {
    if (!newTaskTitle.trim()) return;
    setIsRating(true);
    const scores = await evaluateTaskAttributes(newTaskTitle);
    if (scores.benefit) setBenefit(scores.benefit);
    if (scores.impact) setImpact(scores.impact);
    if (scores.diffusion) setDiffusion(scores.diffusion);
    if (scores.timeEfficiency) setTimeEff(scores.timeEfficiency);
    if (scores.simplicity) setSimplicity(scores.simplicity);
    setIsRating(false);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const importanceScore = (benefit + impact + diffusion) / 3;
    const easeScore = (timeEff + simplicity) / 2;
    const taskId = Date.now().toString();

    const newTask: Task = {
      id: taskId,
      title: newTaskTitle,
      benefit,
      impact,
      diffusion,
      timeEfficiency: timeEff,
      simplicity,
      importanceScore,
      easeScore,
      isCompleted: false
    };

    // 1. Add to Matrix State
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);

    // 2. Classify and Add to Dashboard (localStorage)
    // We need to read fresh DB here to avoid race conditions roughly (though sync effect handles tasks)
    const db = getDB();
    db.matrix_tasks = updatedTasks; // Update matrix tasks immediately
    
    // Classify
    const zoneKey = await classifyTaskCategory(newTaskTitle) as keyof DashboardData;
    
    if (Array.isArray(db[zoneKey])) {
      const newZoneItem: ZoneItem = {
        id: taskId, // Share ID for linkage
        content: newTaskTitle,
        createdAt: Date.now(),
        isCompleted: false,
        sourceMatrixId: taskId
      };
      (db[zoneKey] as ZoneItem[]).push(newZoneItem);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }

    // Reset Form
    setNewTaskTitle('');
    setBenefit(5); setImpact(5); setDiffusion(5); setTimeEff(5); setSimplicity(5);
  };

  const removeTask = (id: string) => {
    // Remove from matrix list
    setTasks(tasks.filter(t => t.id !== id));
    
    // Optional: We could remove from dashboard too, but maybe user wants to keep it there?
    // For now, let's just remove from matrix view.
  };

  const toggleTaskCompletion = (id: string) => {
    // 1. Update Matrix Task
    const updatedTasks = tasks.map(t => 
      t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
    );
    setTasks(updatedTasks);

    // 2. Update Dashboard Item
    const db = getDB();
    db.matrix_tasks = updatedTasks;
    
    // Find in zones and toggle
    // We check all list-based zones
    const zones: (keyof DashboardData)[] = ['zone1_inspiration', 'zone2_work', 'zone4_knowledge', 'zone5_misc'];
    zones.forEach(key => {
        const list = db[key] as ZoneItem[];
        const idx = list.findIndex(i => i.id === id || i.sourceMatrixId === id);
        if (idx !== -1) {
            const wasCompleted = list[idx].isCompleted;
            list[idx].isCompleted = !wasCompleted;
            list[idx].completedAt = !wasCompleted ? Date.now() : undefined;
        }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  };

  const handleAIAnalysis = async () => {
    setLoadingAdvice(true);
    setShowAdvice(true);
    const result = await analyzeTasks(tasks);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  // Filter active tasks for chart and list
  const activeTasks = tasks.filter(t => !t.isCompleted);

  // Sort tasks by "Do First" score (Importance * Ease approx)
  const sortedTasks = [...activeTasks].sort((a, b) => {
    const scoreA = a.importanceScore + a.easeScore; 
    const scoreB = b.importanceScore + b.easeScore;
    return scoreB - scoreA;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Input & List */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Plus size={20} /> 添加新任务
          </h2>
          <form onSubmit={addTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
              <div className="flex gap-2">
                <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="例如：撰写策略文档"
                />
                <button 
                    type="button" 
                    onClick={handleAutoRate}
                    disabled={isRating || !newTaskTitle}
                    className="bg-purple-100 text-purple-700 p-2 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50"
                    title="AI 自动评分"
                >
                    {isRating ? <span className="animate-spin block w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full"/> : <Wand2 size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">重要性维度</p>
              <RangeInput label="损益程度" value={benefit} setValue={setBenefit} low="低" high="高" />
              <RangeInput label="影响广度" value={impact} setValue={setImpact} low="窄" high="广" />
              <RangeInput label="扩散度" value={diffusion} setValue={setDiffusion} low="无" high="强" />
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">容易度维度</p>
              <RangeInput label="耗时度 (效率)" value={timeEff} setValue={setTimeEff} low="长" high="快" />
              <RangeInput label="技术难度 (简易)" value={simplicity} setValue={setSimplicity} low="难" high="易" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition-colors shadow-sm">
              加入矩阵 & 自动归类
            </button>
          </form>
        </div>

        {/* Task List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">优先队列 (建议执行顺序)</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedTasks.map(task => (
              <div key={task.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                <div className="flex items-start gap-3 flex-1">
                   <button 
                     onClick={() => toggleTaskCompletion(task.id)}
                     className="mt-1 text-gray-400 hover:text-green-600 transition-colors"
                   >
                     <Square size={18} />
                   </button>
                   <div>
                    <div className="font-medium text-gray-800 leading-tight">{task.title}</div>
                    <div className="text-xs text-gray-500 mt-1 flex gap-2">
                       <span className="text-blue-600">重要 {task.importanceScore.toFixed(1)}</span>
                       <span className="text-gray-300">|</span>
                       <span className="text-green-600">容易 {task.easeScore.toFixed(1)}</span>
                    </div>
                   </div>
                </div>
                <button onClick={() => removeTask(task.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {sortedTasks.length === 0 && (
              <p className="text-center text-gray-400 py-8 text-sm">矩阵为空，请在上方添加任务。</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Chart & AI Analysis */}
      <div className="lg:col-span-2 space-y-6">
        <MatrixChart tasks={activeTasks} />

        {/* AI Analysis Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
              <Sparkles size={100} />
           </div>
           
           <div className="relative z-10">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                  <Sparkles className="text-indigo-600" size={20} />
                  AI 策略顾问
                </h3>
                <button 
                  onClick={handleAIAnalysis}
                  disabled={loadingAdvice}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loadingAdvice ? '分析中...' : '生成策略分析'}
                </button>
             </div>

             {showAdvice && (
               <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-white/50 text-gray-800 text-sm leading-relaxed whitespace-pre-line animate-in fade-in slide-in-from-bottom-2">
                 {advice || "点击按钮获取分析..."}
               </div>
             )}
             {!showAdvice && (
               <p className="text-indigo-800/60 text-sm">
                 AI 将根据当前任务分布，为您提供针对性的执行建议。
               </p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

const RangeInput = ({ label, value, setValue, low, high }: RangeInputProps) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-gray-500 w-16 text-right shrink-0">{label}</span>
    <span className="text-[10px] text-gray-400">{low}</span>
    <input 
      type="range" 
      min="1" 
      max="10" 
      value={value} 
      onChange={(e) => setValue(Number(e.target.value))}
      className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
    <span className="text-[10px] text-gray-400">{high}</span>
    <span className="text-xs font-mono font-medium text-indigo-600 w-4 text-center">{value}</span>
  </div>
);

export default MatrixView;