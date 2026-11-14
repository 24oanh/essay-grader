const MAX_SCORE = 10; // đổi nếu thang điểm của bạn khác (ví dụ 100)

function getLevel(score) {
  const percent = (score / MAX_SCORE) * 100;
  if (percent >= 80) return { label: "Giỏi", color: "text-green-600", bar: "bg-green-500" };
  if (percent >= 65) return { label: "Khá", color: "text-blue-600", bar: "bg-blue-500" };
  if (percent >= 50) return { label: "Trung bình", color: "text-yellow-600", bar: "bg-yellow-500" };
  return { label: "Yếu", color: "text-red-600", bar: "bg-red-500" };
}

export default function ScoreCard({ score }) {
  const level = getLevel(score);
  const percent = Math.min(100, Math.max(0, (score / MAX_SCORE) * 100));

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <p className="text-sm text-gray-500">Điểm tổng</p>

      <div className="mt-1 flex items-end gap-2">
        <span className={`text-5xl font-bold ${level.color}`}>{score}</span>
        <span className="pb-1 text-xl text-gray-400">/ {MAX_SCORE}</span>
        <span className={`ml-auto pb-1 font-semibold ${level.color}`}>{level.label}</span>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${level.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}