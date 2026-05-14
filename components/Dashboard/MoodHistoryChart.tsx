"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MoodHistoryPoint } from "@/data/mockMoodData";

type MoodHistoryChartProps = {
  data: MoodHistoryPoint[];
};

export function MoodHistoryChart({ data }: MoodHistoryChartProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-cyan-300">Mood History</h2>

        <p className="mt-2 text-sm text-slate-400">
          Simulated emotional trend signals across the internet throughout the
          day.
        </p>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
            />

            <YAxis
              stroke="#94a3b8"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              domain={[0, 100]}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "#020617",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "#ffffff",
              }}
            />

            <Line
              type="monotone"
              dataKey="happy"
              stroke="#34d399"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="stressed"
              stroke="#fbbf24"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="excited"
              stroke="#e879f9"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="hopeful"
              stroke="#22d3ee"
              strokeWidth={3}
              dot={false}
            />

            <Line
              type="monotone"
              dataKey="chaotic"
              stroke="#a78bfa"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
