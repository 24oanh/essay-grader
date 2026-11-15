import { useEffect, useState } from "react";
import AppealStatusBadge from "../components/AppealStatusBadge";
import CriteriaChart from "../components/CriteriaChart";
import { getAdminAppeals, resolveAppeal } from "../api/appealApi";
import { getHistoryDetail } from "../api/essayApi";
import { useAuth } from "../context/AuthContext";
import { CRITERIA_KEYS, CRITERIA_LABELS } from "../utils/criteria";

const MAX_SCORE = 10; // phải khớp với MAX_SCORE trong ScoreCard và với @DecimalMax ở backend

const FILTERS = [
  { key: "PENDING", label: "Chờ xử lý" },
  { key: "APPROVED", label: "Đã chấm lại" },
  { key: "REJECTED", label: "Đã từ chối" },
  { key: "ALL", label: "Tất cả" },
];

function formatDate(iso) {
  return new Date(iso).toLocaleString("vi-VN");
}

export default function AdminAppealsPage() {
  const [filter, setFilter] = useState("PENDING");
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getAdminAppeals(filter === "ALL" ? undefined : filter)
      .then(setAppeals)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleResolved = (updated) => {
    setAppeals((list) =>
      filter === "ALL"
        ? list.map((a) => (a.id === updated.id ? updated : a))
        : list.filter((a) => a.id !== updated.id)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Xử lý khiếu nại ({appeals.length})</h2>
        <div className="flex gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1 text-sm ${filter === f.key ? "bg-blue-600 text-white" : "border text-gray-600 hover:bg-gray-100"
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading && <p className="text-gray-500">Đang tải...</p>}

      {!loading && !error && appeals.length === 0 && (
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
          Không có khiếu nại nào.
        </div>
      )}

      <ul className="space-y-3">
        {appeals.map((a) => (
          <AppealCard key={a.id} appeal={a} onResolved={handleResolved} />
        ))}
      </ul>
    </div>
  );
}

function AppealCard({ appeal, onResolved }) {
  const { user } = useAuth();
  const [showEssay, setShowEssay] = useState(false);
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  const isOwn = appeal.student === user.username;

  const toggleEssay = async () => {
    if (showEssay) return setShowEssay(false);
    setShowEssay(true);
    if (detail) return;
    try {
      setDetail(await getHistoryDetail(appeal.essayId));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <li className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400">{formatDate(appeal.createdAt)}</p>
          <p className="text-sm font-medium text-blue-600">
            {appeal.student} · Bài #{appeal.essayId}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <AppealStatusBadge status={appeal.status} />
          <p className="mt-1 text-xs text-gray-500">Điểm AI: {appeal.originalScore}</p>
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
        <span className="text-gray-400">Lý do khiếu nại: </span>
        {appeal.reason}
      </p>

      <button
        type="button"
        onClick={toggleEssay}
        className="mt-3 rounded-lg border px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
      >
        {showEssay ? "Ẩn bài luận" : "Xem bài luận"}
      </button>

      {showEssay && (
        <div className="mt-3 space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!detail && !error && <p className="text-sm text-gray-500">Đang tải bài luận...</p>}
          {detail && (
            <>
              <p className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border p-3 text-sm text-gray-700">
                {detail.text}
              </p>
              <CriteriaChart criteria={detail.result.criteria} />
            </>
          )}
        </div>
      )}

      {appeal.status === "PENDING" ? (
        isOwn ? (
          <p className="mt-3 text-sm text-gray-500">
            Đây là khiếu nại của chính bạn, cần một người chấm khác xử lý.
          </p>
        ) : (
          <ResolveForm appeal={appeal} aiCriteria={detail?.result.criteria} onResolved={onResolved} />
        )
      ) : (
        <div className="mt-3 rounded-lg border bg-gray-50 p-3 text-sm text-gray-600">
          {appeal.status === "APPROVED" && (
            <p>
              Điểm: {appeal.originalScore} →{" "}
              <strong className="text-green-700">{appeal.newScore}</strong>
            </p>
          )}
          <p>
            <span className="text-gray-400">Ghi chú của {appeal.reviewer}: </span>
            {appeal.reviewerNote}
          </p>
          <p className="text-xs text-gray-400">
            Xử lý lúc {appeal.resolvedAt && formatDate(appeal.resolvedAt)}
          </p>
        </div>
      )}
    </li>
  );
}

function ResolveForm({ appeal, aiCriteria, onResolved }) {
  const [decision, setDecision] = useState("APPROVED");
  const [criteria, setCriteria] = useState(Object.fromEntries(CRITERIA_KEYS.map((k) => [k, ""])));

  useEffect(() => {
    if (!aiCriteria) return;
    setCriteria((c) =>
      Object.fromEntries(CRITERIA_KEYS.map((k) => [k, c[k] !== "" ? c[k] : String(aiCriteria[k] ?? "")]))
    );
  }, [aiCriteria]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!note.trim()) return setError("Vui lòng ghi chú lý do quyết định.");

    let payloadCriteria = null;
    if (decision === "APPROVED") {
      payloadCriteria = {};
      for (const k of CRITERIA_KEYS) {
        const v = criteria[k];
        const n = Number(v);
        if (v === "" || Number.isNaN(n) || n < 0 || n > MAX_SCORE) {
          return setError(`Điểm "${CRITERIA_LABELS[k]}" phải từ 0 đến ${MAX_SCORE}.`);
        }
        payloadCriteria[k] = n;
      }
    }

    setLoading(true);
    try {
      const updated = await resolveAppeal(appeal.id, {
        status: decision,
        criteria: payloadCriteria,
        note: note.trim(),
      });
      onResolved(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
      <p className="text-sm font-semibold text-indigo-800">Quyết định của người chấm</p>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`decision-${appeal.id}`}
            checked={decision === "APPROVED"}
            onChange={() => setDecision("APPROVED")}
          />
          Chấp nhận và chấm lại
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={`decision-${appeal.id}`}
            checked={decision === "REJECTED"}
            onChange={() => setDecision("REJECTED")}
          />
          Từ chối (giữ điểm cũ)
        </label>
      </div>

      {decision === "APPROVED" && (
        <div className="space-y-2">
          <p className="text-sm text-gray-700">Điểm từng tiêu chí (0 – {MAX_SCORE})</p>
          <div className="flex flex-wrap gap-4">
            {CRITERIA_KEYS.map((k) => (
              <label key={k} className="text-sm text-gray-700">
                {CRITERIA_LABELS[k]}
                {aiCriteria && <span className="text-gray-400"> (AI: {aiCriteria[k]})</span>}
                <input
                  type="number"
                  min="0"
                  max={MAX_SCORE}
                  step="0.1"
                  value={criteria[k]}
                  onChange={(e) => setCriteria((c) => ({ ...c, [k]: e.target.value }))}
                  className="ml-2 w-20 rounded-lg border border-gray-300 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Điểm tổng do hệ thống tự tính khi lưu (theo trọng số của đề bài, hoặc trung bình cộng nếu bài nộp tự do).
          </p>
          {!aiCriteria && (
            <p className="text-xs text-gray-500">
              Bấm "Xem bài luận" để xem điểm AI và nội dung bài trước khi chấm.
            </p>
          )}
        </div>
      )}

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="Ghi chú giải thích quyết định (học sinh sẽ thấy nội dung này)..."
        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <div className="flex items-center justify-between">
        {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-4 py-1 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : "Xác nhận quyết định"}
        </button>
      </div>
    </form>
  );
}