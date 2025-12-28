import React, { useState, useEffect, useRef } from 'react';
import { DashboardData, ZoneItem } from '../types';
import { Plus, X, Calendar, BookOpen, Sparkles, Lightbulb, Archive, Layout, Circle, Wand2, FileText, Briefcase } from 'lucide-react';
import { generateActionPlan } from '../services/geminiService';

const STORAGE_KEY = 'life_matrix_db_v4';

const INITIAL_DATA: DashboardData = {
  matrix_tasks: [],
  zone1_inspiration: [{ id: '1', content: '思考下季度产品方向', createdAt: Date.now(), isCompleted: false }],
  zone2_work: [{ id: '2', content: '每日复盘', createdAt: Date.now(), isCompleted: false }],
  zone3_birthdate: '2005-06-23',
  zone4_knowledge: [{ id: '3', content: '阅读《纳瓦尔宝典》第三章', createdAt: Date.now(), isCompleted: false }],
  zone5_misc: [{ id: '4', content: '预约牙医', createdAt: Date.now(), isCompleted: false }],
  zone6_thinking: [{ id: '5', content: '最近是否在低价值事务上消耗了太多时间？', createdAt: Date.now(), isCompleted: false }]
};

const DashboardView = () => {
  const [data, setData] = useState<DashboardData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return INITIAL_DATA;
  });

  const [modalContent, setModalContent] = useState<{title: string, content: string} | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addZoneItem = (zoneKey: keyof DashboardData, content: string) => {
    if (!content.trim()) return;
    setData(prev => ({
      ...prev,
      [zoneKey]: [...(prev[zoneKey] as ZoneItem[]), { 
        id: Date.now().toString(), 
        content, 
        createdAt: Date.now(),
        isCompleted: false 
      }]
    }));
  };

  const removeZoneItem = (zoneKey: keyof DashboardData, id: string) => {
    setData(prev => ({
      ...prev,
      [zoneKey]: (prev[zoneKey] as ZoneItem[]).filter(i => i.id !== id)
    }));
  };

  const toggleComplete = (zoneKey: keyof DashboardData, id: string) => {
    setData(prev => {
      const updatedZone = (prev[zoneKey] as ZoneItem[]).map(item => {
        if (item.id === id) {
          return {
            ...item,
            isCompleted: !item.isCompleted,
            completedAt: !item.isCompleted ? Date.now() : undefined
          };
        }
        return item;
      });

      // Also try to update matrix task if linked
      const targetItem = updatedZone.find(i => i.id === id);
      let updatedMatrix = prev.matrix_tasks;
      if (targetItem && targetItem.sourceMatrixId) {
        updatedMatrix = prev.matrix_tasks.map(t => 
            t.id === targetItem.sourceMatrixId ? { ...t, isCompleted: targetItem.isCompleted } : t
        );
      }

      return {
          ...prev,
          [zoneKey]: updatedZone,
          matrix_tasks: updatedMatrix
      };
    });
  };

  const updateBirthdate = (date: string) => {
    setData(prev => ({ ...prev, zone3_birthdate: date }));
  };

  const handleGeneratePlan = async (id: string, content: string) => {
    // Find item
    const item = data.zone1_inspiration.find(i => i.id === id);
    if (!item) return;

    // Trigger AI
    const plan = await generateActionPlan(content);
    
    // Update item
    setData(prev => ({
      ...prev,
      zone1_inspiration: prev.zone1_inspiration.map(i => i.id === id ? { ...i, aiActionPlan: plan } : i)
    }));

    // Open Modal
    setModalContent({ title: `执行方案: ${content}`, content: plan });
  };

  const openPlan = (content: string, plan: string) => {
     setModalContent({ title: `执行方案: ${content}`, content: plan });
  }

  return (
    <div className="relative h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
        {/* Zone 1: Inspiration */}
        <ZoneCard title="1. 灵感区" icon={<Sparkles size={18} />} color="border-blue-500" bgColor="bg-blue-50">
          <ZoneList 
            items={data.zone1_inspiration} 
            onAdd={(text) => addZoneItem('zone1_inspiration', text)} 
            onRemove={(id) => removeZoneItem('zone1_inspiration', id)}
            onToggle={(id) => toggleComplete('zone1_inspiration', id)}
            onGenerateAI={(id, content) => handleGeneratePlan(id, content)}
            onViewAI={(id, content, plan) => openPlan(content, plan)}
            placeholder="捕捉稍纵即逝的灵感..."
            allowAI={true}
          />
        </ZoneCard>

        {/* Zone 2: Work Area (Now a List) */}
        <ZoneCard title="2. 工作区" icon={<Briefcase size={18} />} color="border-purple-500" bgColor="bg-purple-50">
          <ZoneList 
            items={data.zone2_work} 
            onAdd={(text) => addZoneItem('zone2_work', text)} 
            onRemove={(id) => removeZoneItem('zone2_work', id)}
            onToggle={(id) => toggleComplete('zone2_work', id)}
            placeholder="添加具体工作任务..."
          />
        </ZoneCard>

        {/* Zone 3: Life Calendar (Weeks) */}
        <ZoneCard title="3. 生命日历 (Weeks)" icon={<Calendar size={18} />} color="border-gray-800" bgColor="bg-gray-100">
          <WeeklyLifeCalendar birthdate={data.zone3_birthdate} onChange={updateBirthdate} />
        </ZoneCard>

        {/* Zone 4: Knowledge Grocery */}
        <ZoneCard title="4. 知识杂货铺" icon={<BookOpen size={18} />} color="border-green-500" bgColor="bg-green-50">
          <ZoneList 
            items={data.zone4_knowledge} 
            onAdd={(text) => addZoneItem('zone4_knowledge', text)} 
            onRemove={(id) => removeZoneItem('zone4_knowledge', id)}
            onToggle={(id) => toggleComplete('zone4_knowledge', id)}
            placeholder="想读的书、待查的概念..."
          />
        </ZoneCard>

        {/* Zone 5: Miscellaneous */}
        <ZoneCard title="5. 杂事区" icon={<Archive size={18} />} color="border-orange-500" bgColor="bg-orange-50">
          <ZoneList 
            items={data.zone5_misc} 
            onAdd={(text) => addZoneItem('zone5_misc', text)} 
            onRemove={(id) => removeZoneItem('zone5_misc', id)}
            onToggle={(id) => toggleComplete('zone5_misc', id)}
            placeholder="待办杂事、购物清单..."
          />
        </ZoneCard>

        {/* Zone 6: Thinking Prompts */}
        <ZoneCard title="6. 思维提示区" icon={<Lightbulb size={18} />} color="border-yellow-500" bgColor="bg-yellow-50">
          <ZoneList 
            items={data.zone6_thinking} 
            onAdd={(text) => addZoneItem('zone6_thinking', text)} 
            onRemove={(id) => removeZoneItem('zone6_thinking', id)}
            onToggle={(id) => {/* No-op */}}
            placeholder="写下困惑、反思或自我提问..."
            showCheckbox={false}
          />
        </ZoneCard>
      </div>

      {/* Modal for AI Plan */}
      {modalContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
               <h3 className="font-bold text-gray-800 truncate pr-4">{modalContent.title}</h3>
               <button onClick={() => setModalContent(null)} className="text-gray-400 hover:text-gray-600">
                 <X size={20} />
               </button>
            </div>
            <div className="p-6 overflow-y-auto prose prose-sm prose-indigo">
               <div className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                  {modalContent.content}
               </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
               <button 
                 onClick={() => setModalContent(null)}
                 className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
               >
                 关闭
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---

interface ZoneCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  color: string;
  bgColor: string;
}

const ZoneCard = ({ title, icon, children, color, bgColor }: ZoneCardProps) => (
  <div className={`rounded-xl border-t-4 ${color} ${bgColor} shadow-sm flex flex-col overflow-hidden h-full min-h-[300px]`}>
    <div className="px-4 py-3 flex items-center gap-2 font-bold text-gray-800 border-b border-black/5 bg-white/30 backdrop-blur-sm">
      {icon} {title}
    </div>
    <div className="p-4 flex-1 overflow-y-auto relative flex flex-col">
      {children}
    </div>
  </div>
);

interface ZoneListProps {
  items: ZoneItem[];
  onAdd: (t: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  onGenerateAI?: (id: string, content: string) => Promise<void>;
  onViewAI?: (id: string, content: string, plan: string) => void;
  placeholder: string;
  showCheckbox?: boolean;
  allowAI?: boolean;
}

const ZoneList = ({ items, onAdd, onRemove, onToggle, onGenerateAI, onViewAI, placeholder, showCheckbox = true, allowAI = false }: ZoneListProps) => {
  const [input, setInput] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const activeItems = showCheckbox ? items.filter(i => !i.isCompleted) : items;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(input);
    setInput('');
  };

  const handleAI = async (id: string, content: string) => {
    setLoadingId(id);
    await onGenerateAI?.(id, content);
    setLoadingId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <ul className="flex-1 space-y-2 mb-4">
        {activeItems.map(item => (
          <li key={item.id} className="bg-white p-2.5 rounded-lg shadow-sm text-sm flex items-start gap-2 group hover:shadow-md transition-all border border-transparent hover:border-gray-200">
            {showCheckbox ? (
               <button 
               onClick={() => onToggle(item.id)}
               className="mt-0.5 text-gray-400 hover:text-green-500 transition-colors shrink-0"
               title="完成"
             >
               <Circle size={18} />
             </button>
            ) : (
               <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0 self-start opacity-70" />
            )}
           
            <div className="flex-1 pt-0.5 break-words">
              <span className="text-gray-700 leading-tight block">{item.content}</span>
              {/* AI Buttons */}
              {allowAI && (
                <div className="flex gap-2 mt-2">
                   {!item.aiActionPlan ? (
                     <button 
                       onClick={() => handleAI(item.id, item.content)}
                       disabled={loadingId === item.id}
                       className="text-xs flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors border border-indigo-100"
                     >
                        {loadingId === item.id ? (
                           <span className="animate-spin h-3 w-3 border-2 border-indigo-600 border-t-transparent rounded-full"></span>
                        ) : (
                           <Wand2 size={12} />
                        )}
                        生成落地方向
                     </button>
                   ) : (
                     <button 
                        onClick={() => onViewAI?.(item.id, item.content, item.aiActionPlan!)}
                        className="text-xs flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded hover:bg-green-100 transition-colors border border-green-100"
                     >
                        <FileText size={12} />
                        查看执行方案
                     </button>
                   )}
                </div>
              )}
            </div>

            <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
              <X size={16} />
            </button>
          </li>
        ))}
        {activeItems.length === 0 && (
          <div className="flex flex-col items-center justify-center h-20 text-gray-400 opacity-60">
             <span className="text-xs italic">
               {showCheckbox ? "当前无待办，去“复盘”看看成就吧" : "空空如也"}
             </span>
          </div>
        )}
      </ul>
      <form onSubmit={handleSubmit} className="mt-auto relative group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-3 pr-9 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm shadow-sm transition-all"
        />
        <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-indigo-500 hover:bg-indigo-50 p-1.5 rounded-md transition-colors">
          <Plus size={18} />
        </button>
      </form>
    </div>
  );
};

interface WeeklyLifeCalendarProps {
  birthdate: string;
  onChange: (d: string) => void;
}

const WeeklyLifeCalendar = ({ birthdate, onChange }: WeeklyLifeCalendarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Life in Weeks
  const totalYears = 85;
  const weeksPerYear = 52; 
  const totalWeeks = totalYears * weeksPerYear;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate lived weeks
    const birth = new Date(birthdate);
    const now = new Date();
    const diffTime = now.getTime() - birth.getTime();
    const weeksLived = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)));
    
    // Canvas config
    const boxSize = 4;
    const gap = 2;
    const cols = weeksPerYear; // One row per year roughly
    const rows = totalYears;

    const canvasWidth = cols * (boxSize + gap);
    const canvasHeight = rows * (boxSize + gap);

    // Set canvas actual size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < totalWeeks; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        
        const x = col * (boxSize + gap);
        const y = row * (boxSize + gap);
        
        if (i < weeksLived) {
            ctx.fillStyle = '#374151'; // Dark (Lived)
        } else {
            ctx.fillStyle = '#e5e7eb'; // Light (Future)
        }
        
        ctx.fillRect(x, y, boxSize, boxSize);
    }

  }, [birthdate]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-2 shrink-0">
        <label className="text-xs font-semibold text-gray-500">出生日期:</label>
        <input 
          type="date" 
          value={birthdate} 
          onChange={(e) => onChange(e.target.value)} 
          className="text-xs border rounded p-1 bg-white"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white border border-gray-100 rounded-lg p-2 flex justify-center">
         <canvas ref={canvasRef} className="block" style={{ width: '100%', height: 'auto', maxWidth: '320px' }} />
      </div>
      
      <p className="mt-2 text-[10px] text-gray-400 italic text-center shrink-0">
         每一格代表一周。一行一年。
      </p>
    </div>
  );
};

export default DashboardView;