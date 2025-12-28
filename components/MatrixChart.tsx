import React from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Task } from '../types';

interface MatrixChartProps {
  tasks: Task[];
}

const MatrixChart = ({ tasks }: MatrixChartProps) => {
  const data = tasks.map(t => ({
    ...t,
    x: t.easeScore,
    y: t.importanceScore,
    z: 1
  }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md text-sm">
          <p className="font-bold text-gray-800">{d.title}</p>
          <p className="text-blue-600">重要性: {d.y.toFixed(1)}</p>
          <p className="text-green-600">容易度: {d.x.toFixed(1)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px] bg-white rounded-xl shadow-sm border border-gray-200 p-4 relative">
      <div className="absolute top-2 right-2 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">
        立即做 (重要且容易)
      </div>
       <div className="absolute top-2 left-2 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded">
        需拆解/规划 (重要但难)
      </div>
       <div className="absolute bottom-2 right-2 text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded">
        填充琐事 (不重要但容易)
      </div>
       <div className="absolute bottom-2 left-2 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
        忽略/搁置 (不重要且难)
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Ease" 
            domain={[0, 10]} 
            tickCount={6}
            label={{ value: '容易度 (难 → 易)', position: 'bottom', offset: 0 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Importance" 
            domain={[0, 10]} 
            tickCount={6}
            label={{ value: '重要性 (低 → 高)', angle: -90, position: 'left' }}
          />
          <ZAxis type="number" dataKey="z" range={[60, 400]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <ReferenceLine x={5} stroke="#cbd5e1" strokeDasharray="3 3" />
          <ReferenceLine y={5} stroke="#cbd5e1" strokeDasharray="3 3" />
          <Scatter name="Tasks" data={data} fill="#8884d8">
            {data.map((entry, index) => {
              // Color coding based on quadrant
              let color = '#94a3b8'; // gray default
              if (entry.x >= 5 && entry.y >= 5) color = '#16a34a'; // Green - Do First
              else if (entry.x < 5 && entry.y >= 5) color = '#ea580c'; // Orange - Plan
              else if (entry.x >= 5 && entry.y < 5) color = '#3b82f6'; // Blue - Filler
              
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MatrixChart;