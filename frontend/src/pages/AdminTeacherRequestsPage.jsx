import { useEffect, useState } from "react";
import { getAdminTeacherRequests, resolveTeacherRequest } from "../api/teacherRequestApi";

const FILTERS = [
  { key: "PENDING", label: "Chờ duyệt" },
  { key: "APPROVED", label: "Đã duyệt" },
  { key: "REJECTED", label: "Đã từ chối" },
  { key: "ALL", label: "Tất cả" },
];

const BADGE = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};
const LABEL = { PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Đã từ chối" };

const formatDate = (iso) => new Date(iso).toLocaleString("vi-VN");

export default function AdminTeacherRequestsPage() {
  const [filter, setFilter] = useState("PENDING");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getAdminTeacherRequests(filter === "ALL" ? undefined : filter)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  const handleResolved = (updated) => {
    setItems((list) =>
      filter === "ALL"
        ? list.map((i) => (i.id === updated.id ? updated : i))
        : list.filter((i) => i.id !== updated.id)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">Duyệt đơn giáo viên ({items.length})</h2>
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
        <div className="rounded-lg border bg-white p-8 text-center text-gray-500">Không có đơn nào.</div>
      )}

      <ul className="space-y-3">
        {items.map((r) => (
          <RequestCard key={r.id} request={r} onResolved={handleResolved} />
        ))}
      </ul>
    </div>
  );
}

function RequestCard({ request, onResolved }) {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const decide = async (status) => {
    setError("");
    if (status === "REJECTED" && !note.trim()) return setError("Vui lòng ghi lý do từ chối.");
    setLoading(true);
    try {
      onResolved(await resolveTeacherRequest(request.id, { status, note: note.trim() || null }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <li className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-400">{formatDate(request.createdAt)}</p>
          <p className="font-medium text-blue-600">
            {request.fullName} <span className="text-gray-400">(tài khoản: {request.username})</span>
          </p>
          <p className="text-sm text-gray-600">{request.organization}</p>
        </div>
        <span className={`rounded px-2 py-0.5 text-xs ${BADGE[request.status]}`}>{LABEL[request.status]}</span>
      </div>

      <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
        <span className="text-gray-400">Lý do: </span>
        {request.reason}
      </p>

      {request.status === "PENDING" ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={2000}
            placeholder="Ghi chú (bắt buộc khi từ chối)..."
            className="w-full rounded-lg border border-gray-300 p-2 text-sm"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => decide("APPROVED")}
              className="rounded-lg bg-green-600 px-3 py-1 text-sm text-white disabled:opacity-50"
            >
              Chấp nhận
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => decide("REJECTED")}
              className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600 disabled:opacity-50"
            >
              Từ chối
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-gray-400">
          {request.reviewer && `Xử lý bởi ${request.reviewer}`}
          {request.resolvedAt && ` lúc ${formatDate(request.resolvedAt)}`}
          {request.adminNote && ` · Ghi chú: ${request.adminNote}`}
        </p>
      )}
    </li>
  );
}