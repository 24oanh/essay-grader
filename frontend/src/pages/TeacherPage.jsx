import { useEffect, useState } from "react";
import { getTeacherEssays, reviewEssay } from "../api/teacherApi";
import { useAuth } from "../context/AuthContext";

const MAX_SCORE = 10; // phải khớp với backend

const LABELS = { content: "Nội dung", organization: "Bố cục", language: "Ngôn ngữ" };

const FILTERS = [
  { key: "false", label: "Chưa xem lại" },
  { key: "true", label: "Đã xem lại" },
  { key: "all", label: "Tất cả" },
];

const formatDate = (iso) => new Date(iso).toLocaleString("vi-VN");

export default function TeacherPage() {
  const [filter, setFilter] = useState("false");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getTeacherEssays(filter === "all" ? undefined : filter === "true")
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleReviewed = (updated) => {
    setItems((list) =>
      filter === "false"
        ? list.filter((i) => i.id !== updated.id)
        : list.map((i) => (i.id === updated.id ? updated : i))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Chấm lại bài ({items.length})</h2>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === f.key ? "bg-blue-600 text-white" : "border text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-gray-500">Đang tải...</p>}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          Không có bài nào.
        </div>
      )}

      <ul className="space-y-3">
        {items.map((item) => (
          <EssayCard key={item.id} item={item} onReviewed={handleReviewed} />
        ))}
      </ul>
    </div>
  );
}

function EssayCard({ item, onReviewed }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const isOwn = item.owner === user.username;

  return (
    <li className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400">{formatDate(item.createdAt)}</p>
          <p className="text-sm font-medium text-blue-600">
            {item.owner ?? "(không rõ)"} · Bài #{item.id}
          </p>
          <p className="mt-1 line-clamp-2 text-gray-700">{item.text}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold text-blue-600">{item.score}</p>
          <p className="text-xs text-gray-400">
            {item.humanReviewed ? `giáo viên (AI: ${item.aiScore})` : "điểm (AI)"}
          </p>
        </div>
      </div>

      {item.humanReviewed && item.teacherNote && (
        <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          <span className="text-green-600">Nhận xét của {item.reviewer}: </span>
          {item.teacherNote}
        </p>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-3 rounded-lg bg-blue-600 px-3 py-1 text-sm text-white"
      >
        {open ? "Thu gọn" : item.humanReviewed ? "Chỉnh lại" : "Xem và chấm lại"}
      </button>

      {open &&
        (isOwn ? (
          <p className="mt-3 text-sm text-gray-500">
            Đây là bài của chính bạn, cần một giáo viên khác chấm lại.
          </p>
        ) : (
          <ReviewForm item={item} onReviewed={onReviewed} />
        ))}
    </li>
  );
}

function ReviewForm({ item, onReviewed }) {
  const [score, setScore] = useState(String(item.score));
  const [criteria, setCriteria] = useState(
    Object.fromEntries(Object.entries(item.criteria).map(([k, v]) => [k, String(v)]))
  );
  const [note, setNote] = useState(item.teacherNote ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validScore = (s) => s !== "" && !Number.isNaN(Number(s)) && Number(s) >= 0 && Number(s) <= MAX_SCORE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validScore(score)) return setError(`Điểm tổng phải từ 0 đến ${MAX_SCORE}.`);
    for (const [k, v] of Object.entries(criteria)) {
      if (!validScore(v)) return setError(`Điểm "${LABELS[k] ?? k}" phải từ 0 đến ${MAX_SCORE}.`);
    }
    if (!note.trim()) return setError("Vui lòng ghi nhận xét.");

    setLoading(true);
    try {
      const updated = await reviewEssay(item.id, {
        score: Number(score),
        criteria: Object.fromEntries(Object.entries(criteria).map(([k, v]) => [k, Number(v)])),
        note: note.trim(),
      });
      onReviewed(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <p className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border p-3 text-sm text-gray-700">
        {item.text}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
        <p className="text-sm font-semibold text-indigo-800">
          Điểm của giáo viên (điểm AI: {item.aiScore})
        </p>

        <label className="block text-sm text-gray-700">
          Điểm tổng (0 – {MAX_SCORE})
          <input
            type="number" min="0" max={MAX_SCORE} step="0.1"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="ml-2 w-24 rounded-lg border border-gray-300 p-1 text-sm"
          />
        </label>

        <div className="flex flex-wrap gap-4">
          {Object.keys(criteria).map((k) => (
            <label key={k} className="text-sm text-gray-700">
              {LABELS[k] ?? k} <span className="text-gray-400">(AI: {item.aiCriteria[k]})</span>
              <input
                type="number" min="0" max={MAX_SCORE} step="0.1"
                value={criteria[k]}
                onChange={(e) => setCriteria((c) => ({ ...c, [k]: e.target.value }))}
                className="ml-2 w-20 rounded-lg border border-gray-300 p-1 text-sm"
              />
            </label>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={2000}
          rows={3}
          placeholder="Nhận xét cho học sinh (học sinh sẽ thấy nội dung này)..."
          className="w-full rounded-lg border border-gray-300 p-3 text-sm"
        />

        <div className="flex items-center justify-between">
          {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-1 text-sm text-white disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu điểm của giáo viên"}
          </button>
        </div>
      </form>
    </div>
  );
}