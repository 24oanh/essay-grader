import { useEffect, useState } from "react";
import { getAssignments } from "../api/assignmentApi";

export default function EssayInput({ onSubmit, loading }) {
  const [text, setText] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");

  useEffect(() => {
    getAssignments().then(setAssignments).catch(() => { });
  }, []);

  const selected = assignments.find((a) => String(a.id) === assignmentId);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || loading) return;
    onSubmit(text, assignmentId ? Number(assignmentId) : null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="assignment" className="mb-1 block font-semibold text-gray-700">
          Đề bài (không bắt buộc)
        </label>
        <select
          id="assignment"
          value={assignmentId}
          onChange={(e) => setAssignmentId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2"
        >
          <option value="">Không chọn đề, nộp tự do</option>
          {assignments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title} (GV: {a.owner})
            </option>
          ))}
        </select>
        {selected?.description && (
          <div className="mt-2 rounded-lg border bg-gray-50 p-3">
            <p className="whitespace-pre-wrap text-sm text-gray-700">{selected.description}</p>
          </div>
        )}
      </div>
      <label htmlFor="essay" className="block font-semibold text-gray-700">
        Dán hoặc nhập bài luận
      </label>

      <textarea
        id="essay"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        placeholder="Dán bài luận của bạn vào đây..."
        className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{wordCount} từ</span>

        <div className="space-x-2">
          <button
            type="button"
            onClick={() => setText("")}
            disabled={!text || loading}
            className="rounded-lg border px-4 py-2 text-gray-600 disabled:opacity-50"
          >
            Xóa
          </button>
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Đang chấm..." : "Chấm điểm"}
          </button>
        </div>
      </div>
    </form>
  );
}