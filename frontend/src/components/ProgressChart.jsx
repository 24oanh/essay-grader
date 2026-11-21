import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";

import { CRITERIA_KEYS, CRITERIA_LABELS } from "../utils/criteria";

const COLORS = [
  "#22c55e", "#eab308", "#ef4444", "#a855f7", "#06b6d4",
  "#f97316", "#84cc16", "#ec4899", "#14b8a6", "#6366f1",
];

const LINES = [
  { key: "score", name: "Tổng điểm", color: "#2563eb", width: 3 },
  ...CRITERIA_KEYS.map((k, i) => ({ key: k, name: CRITERIA_LABELS[k], color: COLORS[i], width: 1.5 })),
];

export default function ProgressChart({ points }) {
  const data = points.map((p) => ({
    name: `Lần ${p.attemptNo}`,
    score: p.score,
    ...p.criteria,
  }));

  if (points.length < 2) {
    return (
      <p className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-500">
        Bài này mới nộp 1 lần. Hãy nộp lại để xem biểu đồ tiến bộ.
      </p>
    );
  }

  const first = points[0].score;
  const last = points[points.length - 1].score;
  const diff = (last - first).toFixed(1);

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <p className="mb-1 text-sm text-gray-500">Tiến bộ qua {points.length} lần nộp</p>
      <p className={`mb-3 text-sm font-medium ${last >= first ? "text-green-600" : "text-red-600"}`}>
        {last >= first ? "▲" : "▼"} {diff > 0 ? `+${diff}` : diff} điểm so với lần đầu
      </p>
      <div style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            {LINES.map((l) => (
              <Line key={l.key} type="monotone" dataKey={l.key} name={l.name}
                stroke={l.color} strokeWidth={l.width} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}