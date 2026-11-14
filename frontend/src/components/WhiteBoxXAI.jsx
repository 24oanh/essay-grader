import { useState } from "react";

// Trọng số của từng tiêu chí trong mô hình (white-box: công khai, cố định)
const CRITERIA_WEIGHTS = {
  content: 0.5,       // Nội dung chiếm 50%
  organization: 0.3,  // Bố cục chiếm 30%
  language: 0.2,      // Ngôn ngữ chiếm 20%
};

const CRITERIA_LABELS = {
  content: "Nội dung",
  organization: "Bố cục",
  language: "Ngôn ngữ",
};

const CRITERIA_DESCRIPTIONS = {
  content:
    "Đánh giá mức độ phát triển ý tưởng, luận điểm rõ ràng, dẫn chứng phù hợp và sự liên quan đến chủ đề.",
  organization:
    "Đánh giá cấu trúc bài gồm mở bài, thân bài, kết bài; sự mạch lạc và liên kết giữa các đoạn.",
  language:
    "Đánh giá từ vựng phong phú, ngữ pháp chính xác, câu văn đa dạng và ít lỗi chính tả.",
};

const MAX_SCORE = 10;

function getRatingLabel(score) {
  const pct = (score / MAX_SCORE) * 100;
  if (pct >= 80) return { label: "Giỏi", color: "text-green-600", bg: "bg-green-100" };
  if (pct >= 65) return { label: "Khá", color: "text-blue-600", bg: "bg-blue-100" };
  if (pct >= 50) return { label: "Trung bình", color: "text-yellow-600", bg: "bg-yellow-100" };
  return { label: "Yếu", color: "text-red-600", bg: "bg-red-100" };
}

function barColor(score) {
  const pct = (score / MAX_SCORE) * 100;
  if (pct >= 80) return "bg-green-500";
  if (pct >= 65) return "bg-blue-500";
  if (pct >= 50) return "bg-yellow-500";
  return "bg-red-500";
}

export default function WhiteBoxXAI({ criteria, score }) {
  const [open, setOpen] = useState(false);

  if (!criteria) return null;

  // Tính điểm đóng góp từng tiêu chí: điểm_tiêu_chí × trọng_số
  const breakdown = Object.entries(CRITERIA_WEIGHTS).map(([key, weight]) => {
    const rawScore = criteria[key] ?? 0;
    const contribution = rawScore * weight;
    return { key, weight, rawScore, contribution };
  });

  const computedTotal = breakdown.reduce((sum, r) => sum + r.contribution, 0);

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      {/* Header + nút toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">
            🔍 Giải thích White-Box (XAI)
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Mô hình tính điểm theo công thức tuyến tính có trọng số cố định
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 transition-colors"
        >
          {open ? "Ẩn giải thích" : "Giải thích White-Box"}
        </button>
      </div>

      {/* Nội dung giải thích */}
      {open && (
        <div className="mt-4 space-y-5 animate-fade-in">

          {/* Công thức */}
          <div className="rounded-md bg-indigo-50 border border-indigo-200 p-3">
            <p className="text-xs font-semibold text-indigo-700 mb-1">📐 Công thức tính điểm</p>
            <p className="text-sm font-mono text-indigo-900">
              Điểm = {Object.entries(CRITERIA_WEIGHTS)
                .map(([k, w]) => `${w} × ${CRITERIA_LABELS[k]}`)
                .join(" + ")}
            </p>
          </div>

          {/* Chi tiết từng tiêu chí */}
          <div className="space-y-3">
            {breakdown.map(({ key, weight, rawScore, contribution }) => {
              const pct = Math.min(100, (rawScore / MAX_SCORE) * 100);
              const rating = getRatingLabel(rawScore);
              return (
                <div key={key} className="rounded-md border p-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-gray-800">
                          {CRITERIA_LABELS[key]}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${rating.bg} ${rating.color}`}
                        >
                          {rating.label}
                        </span>
                        <span className="ml-auto text-xs text-gray-400">
                          Trọng số: {(weight * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        {CRITERIA_DESCRIPTIONS[key]}
                      </p>
                      {/* Progress bar */}
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barColor(rawScore)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right min-w-[90px]">
                      <p className="text-xs text-gray-400">Điểm thô</p>
                      <p className="font-bold text-gray-800">
                        {rawScore.toFixed(1)} / {MAX_SCORE}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Đóng góp</p>
                      <p className="font-semibold text-indigo-700">
                        +{contribution.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tổng kết */}
          <div className="rounded-md border border-indigo-300 bg-indigo-50 p-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-800">Tổng điểm tính theo công thức</p>
              <p className="text-xs text-indigo-500 mt-0.5">
                {breakdown
                  .map((r) => `${r.weight} × ${r.rawScore.toFixed(1)}`)
                  .join(" + ")}
                {" = "}
                <strong>{computedTotal.toFixed(2)}</strong>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-indigo-700">
                {computedTotal.toFixed(2)}
              </p>
              <p className="text-xs text-indigo-400">/ {MAX_SCORE}</p>
            </div>
          </div>

          {/* Chú thích độ minh bạch */}
          <div className="rounded-md bg-gray-100 p-3 text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-700">ℹ️ Về phương pháp White-Box:</span>{" "}
            Mô hình sử dụng hồi quy tuyến tính có trọng số cố định và công khai. Toàn bộ
            quá trình tính điểm có thể kiểm tra và tái tạo lại — không có thành phần ẩn hay
            hộp đen. Điểm cuối cùng là tổng có trọng số của điểm các tiêu chí thành phần.
          </div>
        </div>
      )}
    </div>
  );
}
