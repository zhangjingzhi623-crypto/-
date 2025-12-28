import React, { useState } from 'react';
import { Task } from '../types';
import MatrixChart from './MatrixChart';
import { analyzeTasks } from '../services/geminiService';
import { Sparkles, Plus, Trash2, ArrowUpRight } from 'lucide-react';

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Finish Quarterly Report', benefit: 9, impact: 8, diffusion: 7, timeEfficiency: 3, simplicity: 4, importanceScore: 8, easeScore: 3.5 },
  { id: '2', title: 'Reply to Emails', benefit: 4, impact: 3, diffusion: 2, timeEfficiency: 9, simplicity: 9, importanceScore: 3, easeScore: 9 },
  { id: '3', title: 'Fix Critical Bug', benefit: 10, impact: 9, diffusion: 10, timeEfficiency: 6, simplicity: 5, importanceScore: 9.6, easeScore: 5.5 }
];

interface RangeInputProps {
  label: string;
  value: number;
  setValue: (v: number) => void;
  low: string;
  high: string;
}

const MatrixView = () => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [showAdvice, setShowAdvice] = useState(false);
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [benefit, setBenefit] = useState(5);
  const [impact, setImpact] = useState(5);
  const [diffusion, setDiffusion] = useState(5);
  const [timeEff, setTimeEff] = useState(5);
  const [simplicity, setSimplicity] = useState(5);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const importanceScore = (benefit + impact + diffusion) / 3;
    const easeScore = (timeEff + simplicity) / 2;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      benefit,
      impact,
      diffusion,
      timeEfficiency: timeEff,
      simplicity,
      importanceScore,
      easeScore
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    // Reset sliders to middle
    setBenefit(5); setImpact(5); setDiffusion(5); setTimeEff(5); setSimplicity(5);
  };

  const removeTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAIAnalysis = async () => {
    setLoadingAdvice(true);
    setShowAdvice(true);
    const result = await analyzeTasks(tasks);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  // Sort tasks by "Do First" score (Importance * Ease approx)
  const sortedTasks = [...tasks].sort((a, b) => {
    const scoreA = a.importanceScore + a.easeScore; // Simple heuristic
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
            <Plus size={20} /> Add New Task
          </h2>
          <form onSubmit={addTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
              <input 
                type="text" 
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g., Write Strategy Document"
              />
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Importance Factors</p>
              <RangeInput label="Benefit (Profit/Gain)" value={benefit} setValue={setBenefit} low="Low" high="High" />
              <RangeInput label="Impact Scope (Who is affected?)" value={impact} setValue={setImpact} low="Narrow" high="Wide" />
              <RangeInput label="Diffusion (Ripple Effect)" value={diffusion} setValue={setDiffusion} low="None" high="Domino" />
            </div>

            <div className="space-y-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Easiness Factors</p>
              <RangeInput label="Time Required" value={timeEff} setValue={setTimeEff} low="Long" high="Quick" />
              <RangeInput label="Technical Difficulty" value={simplicity} setValue={setSimplicity} low="Hard" high="Easy" />
            </div>

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md transition-colors shadow-sm">
              Add to Matrix
            </button>
          </form>
        </div>

        {/* Task List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Priority Queue</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedTasks.map(task => (
              <div key={task.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                <div>
                  <div className="font-medium text-gray-800">{task.title}</div>
                  <div className="text-xs text-gray-500 mt-1 flex gap-2">
                    <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Imp: {task.importanceScore.toFixed(1)}</span>
                    <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Ease: {task.easeScore.toFixed(1)}</span>
                  </div>
                </div>
                <button onClick={() => removeTask(task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {sortedTasks.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No tasks yet.</p>}
          </div>
        </div>
      </div>

      {/* Right Column: Chart & AI */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">Strategist Time Matrix</h2>
          <button 
            onClick={handleAIAnalysis}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all"
          >
            <Sparkles size={16} />
            AI Strategist Advice
          </button>
        </div>

        <MatrixChart tasks={tasks} />

        {showAdvice && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm animate-fade-in">
            <h3 className="text-indigo-900 font-bold mb-3 flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600" /> 
              Strategist Analysis
            </h3>
            {loadingAdvice ? (
              <div className="flex items-center gap-2 text-indigo-600">
                <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                Thinking...
              </div>
            ) : (
              <div className="prose prose-sm text-indigo-800 max-w-none whitespace-pre-wrap">
                {advice}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Matrix Philosophy</h4>
                <p className="text-sm text-gray-600 mb-2">
                    Unlike the Eisenhower Matrix, this tool fights procrastination by adding the <strong>"Ease"</strong> dimension.
                </p>
                <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
                    <li><strong>Do First:</strong> High Importance + High Ease. Gives momentum.</li>
                    <li><strong>Plan/Breakdown:</strong> High Importance + Low Ease. Use the 5-min rule to start.</li>
                </ul>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-2">Procrastination Hacks</h4>
                 <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex gap-2 items-start">
                        <ArrowUpRight size={16} className="mt-1 text-green-500 shrink-0"/>
                        <span><strong>2-Minute Rule:</strong> If it takes &lt; 2 mins, do it immediately.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                        <ArrowUpRight size={16} className="mt-1 text-green-500 shrink-0"/>
                        <span><strong>5-Minute Start:</strong> For hard tasks, commit to just 5 mins of work to break inertia.</span>
                    </li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

const RangeInput = ({ label, value, setValue, low, high }: RangeInputProps) => (
  <div>
    <div className="flex justify-between text-xs text-gray-500 mb-1">
      <span>{label}</span>
      <span className="font-semibold text-indigo-600">{value}</span>
    </div>
    <input 
      type="range" 
      min="1" 
      max="10" 
      value={value} 
      onChange={(e) => setValue(Number(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
    <div className="flex justify-between text-[10px] text-gray-400 mt-1">
      <span>{low}</span>
      <span>{high}</span>
    </div>
  </div>
);

export default MatrixView;