import { useState } from "react";
import { createAppeal } from "../api/appealApi";

const MAX_LENGTH = 2000;

export default function AppealForm({ essayId, onCreated, onCancel }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const appeal = await createAppeal(essayId, reason.trim());
      onCreated(appeal);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div>
        <p className="text-sm font-semibold text-blue-800">Yêu cầu chấm lại bởi con người</p>
        <p className="text-xs text-blue-700">
          Điểm hiện tại do AI chấm. Người chấm sẽ xem xét bài của bạn và quyết định điểm cuối cùng.
          Mỗi bài chỉ được khiếu nại 1 lần.
        </p>
      </div>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        maxLength={MAX_LENGTH}
        rows={4}
        placeholder="Nêu lý do bạn cho rằng điểm chưa hợp lý..."
        className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {reason.length}/{MAX_LENGTH}
        </span>
        <div className="space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-3 py-1 text-sm text-gray-600 hover:bg-white"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={!reason.trim() || loading}
            className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
          >
            {loading ? "Đang gửi..." : "Gửi khiếu nại"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}