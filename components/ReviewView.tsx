import React, { useState, useEffect } from 'react';
import { DashboardData, ZoneItem } from '../types';
import { CheckCircle2, CalendarDays, History, Trophy } from 'lucide-react';

const STORAGE_KEY = 'life_matrix_db_v4';

const ReviewView = () => {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">正在加载数据...</div>;

  // Aggregate all items from relevant zones
  // We need to be careful not to duplicate matrix tasks if they are also in zones.
  // The logic maps zones to display names.
  const allItems: { item: ZoneItem; source: string }[] = [
    ...data.zone1_inspiration.map(i => ({ item: i, source: '灵感区' })),
    ...data.zone2_work.map(i => ({ item: i, source: '工作区' })),
    ...data.zone4_knowledge.map(i => ({ item: i, source: '知识杂货' })),
    ...data.zone5_misc.map(i => ({ item: i, source: '杂事' })),
    ...data.zone6_thinking.map(i => ({ item: i, source: '思维提示' })),
  ];

  // Filter completed items
  const completedItems = allItems
    .filter(entry => entry.item.isCompleted && entry.item.completedAt)
    .sort((a, b) => (b.item.completedAt || 0) - (a.item.completedAt || 0));

  // Group by Date
  const groupedItems: Record<string, typeof completedItems> = {};
  
  completedItems.forEach(entry => {
    const date = new Date(entry.item.completedAt!).toLocaleDateString('zh-CN', {
        month: 'long', day: 'numeric', weekday: 'long'
    });
    if (!groupedItems[date]) {
        groupedItems[date] = [];
    }
    groupedItems[date].push(entry);
  });

  const dates = Object.keys(groupedItems);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
             <History size={28} /> 复盘回顾
           </h2>
           <p className="text-indigo-100 opacity-90">
             "未经审视的人生不值得过。" —— 苏格拉底
           </p>
        </div>
        <div className="text-center bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-3xl font-bold">{completedItems.length}</div>
            <div className="text-xs font-medium uppercase tracking-wider opacity-80">已完成事项</div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {dates.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">暂无已完成的任务。</p>
              <p className="text-sm text-gray-400 mt-2">去仪表盘完成几件事吧！</p>
           </div>
        ) : (
            dates.map(date => (
                <div key={date} className="relative">
                    {/* Date Header */}
                    <div className="sticky top-20 z-0 flex items-center gap-4 mb-4">
                        <div className="bg-indigo-100 text-indigo-700 font-bold px-4 py-1.5 rounded-full text-sm flex items-center gap-2">
                           <CalendarDays size={16} /> {date}
                        </div>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    {/* Task List */}
                    <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-indigo-100 ml-4">
                        {groupedItems[date].map((entry, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between group hover:border-indigo-200 transition-all">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 text-green-500">
                                        <CheckCircle2 size={20} className="fill-green-50" />
                                    </div>
                                    <div>
                                        <div className="text-gray-800 font-medium line-through decoration-gray-300 decoration-2 decoration-slice">
                                            {entry.item.content}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                                                {entry.source}
                                            </span>
                                            <span>
                                                {new Date(entry.item.completedAt!).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ReviewView;