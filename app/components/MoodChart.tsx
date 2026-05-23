"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface MoodChartProps {
    data: {
        day: string;
        mood: number;
    }[];
}

export default function MoodChart({
    data,
}: MoodChartProps) {
    return (
        <div className="w-full h-[300px] bg-white p-4 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">
                Mood Tracker
            </h2>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="day" />

                    <YAxis domain={[1, 5]} />

                    <Tooltip />

                    <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="#8884d8"
                        strokeWidth={3}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}