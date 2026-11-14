import { useState } from "react";
import { resubmitEssay } from "../api/essayApi";

export default function ResubmitForm({ essay, onDone, onCancel }) {
  const [text, setText] = useState(essay.text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await resubmitEssay(essay.id, text);
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
      <p className="text-sm text-blue-700">Chỉnh sửa bài rồi nộp lại để chấm điểm mới:</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full rounded-lg border p-2 text-sm"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={submit} disabled={loading || !text.trim()}
                className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50">
          {loading ? "Đang chấm..." : "Nộp lại"}
        </button>
        <button type="button" onClick={onCancel}
                className="rounded-lg border px-3 py-1 text-sm text-gray-600">
          Hủy
        </button>
      </div>
    </div>
  );
}