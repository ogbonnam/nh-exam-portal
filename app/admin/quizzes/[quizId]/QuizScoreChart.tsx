// app/admin/quizzes/[quizId]/QuizScoreChart.tsx
"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

type DataPoint = { name: string; score: number };

export default function QuizScoreChart({ data, maxScore }: { data: DataPoint[]; maxScore?: number }) {
  // Sort by score descending (optional)
  const sorted = [...data].sort((a, b) => b.score - a.score);

  // Recharts expects numbers for Y axis; ensure numeric values
  const chartData = sorted.map((d) => ({ ...d, score: Number(d.score ?? 0) }));

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={70} />
          <YAxis domain={[0, maxScore ?? "dataMax"]} allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="score" barSize={40}>
            <LabelList dataKey="score" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
