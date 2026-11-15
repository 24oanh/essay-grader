import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
} from "recharts";

const LINES = [
  { key: "score", name: "Tổng điểm", color: "#2563eb", width: 3 },
  { key: "content", name: "Nội dung", color: "#22c55e", width: 1.5 },
  { key: "organization", name: "Cấu trúc", color: "#eab308", width: 1.5 },
  { key: "grammar", name: "Ngữ pháp", color: "#ef4444", width: 1.5 },
  { key: "vocabulary", name: "Từ vựng", color: "#a855f7", width: 1.5 },
  { key: "coherence", name: "Mạch lạc", color: "#06b6d4", width: 1.5 },
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