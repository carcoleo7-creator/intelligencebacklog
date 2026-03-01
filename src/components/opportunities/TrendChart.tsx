"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { FeedbackItem } from "@/types";
import { format, startOfWeek, addDays } from "date-fns";

interface TrendChartProps {
  items: FeedbackItem[];
}

export function TrendChart({ items }: TrendChartProps) {
  // Build weekly theme frequency data
  const themeWeekMap: Record<string, Record<string, number>> = {};
  const themes = new Set<string>();

  items.forEach((item) => {
    if (!item.theme) return;
    const weekStart = format(
      startOfWeek(new Date(item.createdAt)),
      "MMM d"
    );
    themes.add(item.theme);
    if (!themeWeekMap[weekStart]) themeWeekMap[weekStart] = {};
    themeWeekMap[weekStart][item.theme] =
      (themeWeekMap[weekStart][item.theme] ?? 0) + 1;
  });

  const weeks = Object.keys(themeWeekMap).sort();
  if (weeks.length === 0) return null;

  const chartData = weeks.map((week) => ({
    week,
    ...themeWeekMap[week],
  }));

  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#8b5cf6",
    "#22c55e",
    "#f59e0b",
    "#06b6d4",
  ];

  const topThemes = Array.from(themes).slice(0, 6);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Theme Frequency by Week
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
          {topThemes.map((theme, i) => (
            <Line
              key={theme}
              type="monotone"
              dataKey={theme}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
