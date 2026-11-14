import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

const MAX_SCORE = 10; // phải khớp với MAX_SCORE trong ScoreCard

// Đổi tên tiêu chí từ backend sang tiếng Việt
const LABELS = {
  content: "Nội dung",
  organization: "Bố cục",
  language: "Ngôn ngữ",
};

function barColor(score) {
  const percent = (score / MAX_SCORE) * 100;
  if (percent >= 80) return "#22c55e"; // xanh lá
  if (percent >= 65) return "#3b82f6"; // xanh dương
  if (percent >= 50) return "#eab308"; // vàng
  return "#ef4444"; // đỏ
}

export default function CriteriaChart({ criteria }) {
  const data = Object.entries(criteria).map(([key, value]) => ({
    name: LABELS[key] ?? key,
    score: value,
  }));

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <p className="mb-3 text-sm text-gray-500">Điểm theo tiêu chí</p>

      <div style={{ height: data.length * 60 + 30 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 30, bottom: 0, left: 10 }}
          >
            <XAxis type="number" domain={[0, MAX_SCORE]} />
            <YAxis type="category" dataKey="name" width={90} />
            <Tooltip formatter={(value) => [`${value} / ${MAX_SCORE}`, "Điểm"]} />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={28}>
              {data.map((item) => (
                <Cell key={item.name} fill={barColor(item.score)} />
              ))}
              <LabelList dataKey="score" position="right" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}