import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EngagementChart = ({ data, height = 400 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm font-medium">O ano letivo começou!</p>
                <p className="text-xs mt-1">Incentive os professores a registrarem a primeira memória.</p>
            </div>
        );
    }

    return (
        <div className="w-full" style={{ height }}>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Ranking de Engajamento (Top Escolas)</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        width={150}
                        tick={{ fontSize: 12, fill: '#4b5563' }}
                        interval={0}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar
                        dataKey="totalMemories"
                        fill="#2563eb" // Maceió Blue
                        radius={[0, 4, 4, 0]}
                        barSize={24}
                        name="Memórias"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EngagementChart;
