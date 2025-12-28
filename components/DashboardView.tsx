import React, { useState, useEffect } from 'react';
import { DashboardData, ZoneItem } from '../types';
import { Plus, X, Skull, BookOpen, Briefcase, Lightbulb, Archive, Layout } from 'lucide-react';

const STORAGE_KEY = 'strategist_dashboard_data';

const INITIAL_DATA: DashboardData = {
  zone1_work: [{ id: '1', content: 'Draft the intro for Q3 report', createdAt: Date.now() }],
  zone2_strategy: 'Macro Strategy:\n1. Focus on high-leverage coding tasks.\n2. Dedicate mornings to deep work.\n3. Review "The Art of Learning" for block-clearing techniques.',
  zone3_birthdate: '1990-01-01',
  zone4_knowledge: [{ id: '2', content: 'Read "Atomic Habits"', createdAt: Date.now() }],
  zone5_misc: [{ id: '3', content: 'Buy new monitor stand', createdAt: Date.now() }],
  zone6_thinking: [{ id: '4', content: 'Why am I avoiding the API integration task?', createdAt: Date.now() }]
};

const DashboardView = () => {
  const [data, setData] = useState<DashboardData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addZoneItem = (zoneKey: keyof DashboardData, content: string) => {
    if (!content.trim()) return;
    setData(prev => ({
      ...prev,
      [zoneKey]: [...(prev[zoneKey] as ZoneItem[]), { id: Date.now().toString(), content, createdAt: Date.now() }]
    }));
  };

  const removeZoneItem = (zoneKey: keyof DashboardData, id: string) => {
    setData(prev => ({
      ...prev,
      [zoneKey]: (prev[zoneKey] as ZoneItem[]).filter(i => i.id !== id)
    }));
  };

  const updateStrategy = (text: string) => {
    setData(prev => ({ ...prev, zone2_strategy: text }));
  };

  const updateBirthdate = (date: string) => {
    setData(prev => ({ ...prev, zone3_birthdate: date }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
      {/* Zone 1: Work Area */}
      <ZoneCard title="1. Work Area" icon={<Briefcase size={18} />} color="border-blue-500" bgColor="bg-blue-50">
        <ZoneList 
          items={data.zone1_work} 
          onAdd={(text) => addZoneItem('zone1_work', text)} 
          onRemove={(id) => removeZoneItem('zone1_work', id)}
          placeholder="Quick idea for current task..."
        />
      </ZoneCard>

      {/* Zone 2: Strategy Area */}
      <ZoneCard title="2. Strategy Heaven" icon={<Layout size={18} />} color="border-purple-500" bgColor="bg-purple-50">
         <textarea 
            className="w-full h-full min-h-[150px] p-2 bg-white/50 border border-purple-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-purple-400 text-sm"
            value={data.zone2_strategy}
            onChange={(e) => updateStrategy(e.target.value)}
            placeholder="Macro strategies and principles..."
         />
      </ZoneCard>

      {/* Zone 3: Life Calendar */}
      <ZoneCard title="3. Life Monitor" icon={<Skull size={18} />} color="border-gray-800" bgColor="bg-gray-100">
        <LifeCalendar birthdate={data.zone3_birthdate} onChange={updateBirthdate} />
      </ZoneCard>

      {/* Zone 4: Knowledge Grocery */}
      <ZoneCard title="4. Knowledge Grocery" icon={<BookOpen size={18} />} color="border-green-500" bgColor="bg-green-50">
        <ZoneList 
          items={data.zone4_knowledge} 
          onAdd={(text) => addZoneItem('zone4_knowledge', text)} 
          onRemove={(id) => removeZoneItem('zone4_knowledge', id)}
          placeholder="Book to read, concept to check..."
        />
      </ZoneCard>

      {/* Zone 5: Miscellaneous */}
      <ZoneCard title="5. Misc & Chores" icon={<Archive size={18} />} color="border-orange-500" bgColor="bg-orange-50">
        <ZoneList 
          items={data.zone5_misc} 
          onAdd={(text) => addZoneItem('zone5_misc', text)} 
          onRemove={(id) => removeZoneItem('zone5_misc', id)}
          placeholder="Email to send, thing to buy..."
        />
      </ZoneCard>

      {/* Zone 6: Thinking Prompts */}
      <ZoneCard title="6. Thinking Prompts" icon={<Lightbulb size={18} />} color="border-yellow-500" bgColor="bg-yellow-50">
        <ZoneList 
          items={data.zone6_thinking} 
          onAdd={(text) => addZoneItem('zone6_thinking', text)} 
          onRemove={(id) => removeZoneItem('zone6_thinking', id)}
          placeholder="Reflection question or weakness reminder..."
        />
      </ZoneCard>
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
    <div className="px-4 py-3 flex items-center gap-2 font-bold text-gray-800 border-b border-black/5">
      {icon} {title}
    </div>
    <div className="p-4 flex-1 overflow-y-auto">
      {children}
    </div>
  </div>
);

interface ZoneListProps {
  items: ZoneItem[];
  onAdd: (t: string) => void;
  onRemove: (id: string) => void;
  placeholder: string;
}

const ZoneList = ({ items, onAdd, onRemove, placeholder }: ZoneListProps) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full">
      <ul className="flex-1 space-y-2 mb-4">
        {items.map(item => (
          <li key={item.id} className="bg-white p-2 rounded shadow-sm text-sm flex justify-between group">
            <span className="break-words w-full">{item.content}</span>
            <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </li>
        ))}
        {items.length === 0 && <li className="text-gray-400 text-xs italic">Empty list</li>}
      </ul>
      <form onSubmit={handleSubmit} className="mt-auto relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-3 pr-8 py-2 rounded border border-gray-300 focus:outline-none focus:border-indigo-500 text-sm"
        />
        <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 text-indigo-500 hover:bg-indigo-50 p-1 rounded">
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
};

interface LifeCalendarProps {
  birthdate: string;
  onChange: (d: string) => void;
}

const LifeCalendar = ({ birthdate, onChange }: LifeCalendarProps) => {
  // Assume 80 years lifespan
  const years = 80;
  
  const calculateLived = () => {
    const birth = new Date(birthdate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears);
  };
  
  const livedYears = calculateLived();
  
  // Create an array for the grid
  const grid = Array.from({ length: years }, (_, i) => i < livedYears);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <label className="text-xs font-semibold text-gray-500">Birth Date:</label>
        <input 
          type="date" 
          value={birthdate} 
          onChange={(e) => onChange(e.target.value)} 
          className="text-xs border rounded p-1"
        />
      </div>
      
      <div className="flex-1">
        <div className="text-xs text-center mb-2 font-medium text-gray-600">
           {livedYears} years lived / {years - livedYears} years left (est)
        </div>
        <div className="grid grid-cols-10 gap-1 content-start">
          {grid.map((lived, idx) => (
            <div 
              key={idx} 
              title={`Year ${idx + 1}`}
              className={`aspect-square rounded-sm ${lived ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}
            ></div>
          ))}
        </div>
        <p className="mt-4 text-[10px] text-gray-500 italic text-center">
          "Make every remaining square count."
        </p>
      </div>
    </div>
  );
};

export default DashboardView;