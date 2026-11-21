import { useState } from "react";
import { CRITERIA_KEYS, CRITERIA_LABELS, CRITERIA_GROUPS } from "../utils/criteria";

const CRITERIA_DESCRIPTIONS = {
  intelligibility: "Mức độ người đọc hiểu được bài viết mà không bị cản trở bởi lỗi ngôn ngữ.",
  complexity: "Độ đa dạng và phức tạp của cấu trúc câu, từ vựng.",
  accuracy: "Độ chính xác về ngữ pháp, dùng từ và chính tả.",
  fluency: "Sự trôi chảy, tự nhiên khi diễn đạt.",
  comprehensibility: "Mức độ ý tưởng, nội dung bài viết dễ nắm bắt.",
  logicality: "Tính chặt chẽ, hợp lý trong lập luận và liên kết ý.",
  sophistication: "Chiều sâu, sự tinh tế và độc đáo của nội dung.",
  purposefulness: "Bài viết có mục đích rõ ràng, bám sát yêu cầu đề bài.",
  willingness: "Thái độ sẵn sàng, nghiêm túc đầu tư cho bài viết.",
  involvement: "Mức độ tham gia, gắn kết của người viết với chủ đề.",
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

  // Chỉ hiển thị điểm thật do model trả về, theo đúng 10 tiêu chí
  const rows = CRITERIA_KEYS.filter((k) => criteria[k] != null).map((key) => ({
    key,
    value: criteria[key],
  }));
  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700">🔍 Giải thích điểm (Concept Bottleneck)</p>
          <p className="mt-0.5 text-xs text-gray-400">
            Model dự đoán 10 tiêu chí trung gian rồi mới suy ra điểm tổng
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-700"
        >
          {open ? "Ẩn giải thích" : "Xem giải thích"}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="space-y-3">
            {rows.map(({ key, value }) => {
              const pct = Math.min(100, Math.max(0, (value / MAX_SCORE) * 100));
              const rating = getRatingLabel(value);
              return (
                <div key={key} className="rounded-md border bg-gray-50 p-3">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{CRITERIA_LABELS[key]}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${rating.bg} ${rating.color}`}>
                      {rating.label}
                    </span>
                    <span className="text-xs text-gray-400">Nhóm: {CRITERIA_GROUPS[key]}</span>
                    <span className="ml-auto font-bold text-gray-800">
                      {value.toFixed(1)} / {MAX_SCORE}
                    </span>
                  </div>
                  <p className="mb-2 text-xs text-gray-500">{CRITERIA_DESCRIPTIONS[key]}</p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor(value)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-md border border-indigo-300 bg-indigo-50 p-3">
            <p className="text-sm font-semibold text-indigo-800">Điểm tổng</p>
            <p className="text-2xl font-bold text-indigo-700">
              {score} <span className="text-sm text-indigo-400">/ {MAX_SCORE}</span>
            </p>
          </div>

          <div className="rounded-md bg-gray-100 p-3 text-xs leading-relaxed text-gray-500">
            Điểm các tiêu chí và điểm tổng đều do model (RoBERTa + LoRA, 5 fold) dự đoán, đã hiệu chỉnh.
            Nếu bài thuộc một đề có rubric, điểm tổng được tính lại theo trọng số rubric của giáo viên.
          </div>
        </div>
      )}
    </div>
  );
}
