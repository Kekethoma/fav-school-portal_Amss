'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartData {
    name: string
    score: number
}

export function PerformanceChart({ data }: { data: ChartData[] }) {
    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                        dataKey="name"
                        stroke="#999"
                        fontSize={12}
                    />
                    <YAxis
                        stroke="#999"
                        fontSize={12}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        itemStyle={{ color: '#facc15' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#facc15"
                        strokeWidth={2}
                        dot={{ fill: '#16a34a', stroke: '#facc15', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

