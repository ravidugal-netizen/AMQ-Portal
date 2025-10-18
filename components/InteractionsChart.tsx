import React from 'react';
import * as Recharts from 'recharts';
import type { InteractionsChartData, Theme } from '../types';

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-brand-black border border-slate-200 dark:border-brand-dark p-2 rounded-md shadow-lg">
        <p className="label text-slate-900 dark:text-white font-bold">{`${label}`}</p>
        <p className="intro text-brand-primary">{`Interactions : ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const InteractionsChart: React.FC<{ data: InteractionsChartData[], theme: Theme }> = ({ data, theme }) => {
  // Stage 1: Verify that the library loaded as a valid object.
  if (typeof Recharts !== 'object' || Recharts === null) {
      return <div className="flex items-center justify-center h-full text-slate-400">Chart library did not load correctly.</div>;
  }

  // Stage 2: Handle potential module format inconsistencies (e.g., a 'default' export).
  const RechartsModule = (Recharts as any).default || Recharts;
  if (typeof RechartsModule !== 'object' || RechartsModule === null) {
      return <div className="flex items-center justify-center h-full text-slate-400">Chart components could not be found.</div>;
  }
  
  const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = RechartsModule;

  // Stage 3: Final safeguard. Verify that the necessary components are valid functions before rendering.
  // This is the most direct fix for the "Element type is invalid" error.
  if (typeof ResponsiveContainer !== 'function' || typeof BarChart !== 'function') {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Chart is unavailable.
      </div>
    );
  }
  
  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const brandColors = ['#F76F8E', '#f5537a'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <XAxis dataKey="name" stroke={axisColor} tickLine={false} axisLine={false} />
        <YAxis stroke={axisColor} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
        <Bar dataKey="Interactions" radius={[4, 4, 0, 0]}>
           {data.map((entry, index) => (
             <Cell key={`cell-${index}`} fill={brandColors[index % brandColors.length]} />
           ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default InteractionsChart;