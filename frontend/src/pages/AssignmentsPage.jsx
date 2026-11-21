import { useEffect, useState } from "react";
import {
    getMyAssignments, createAssignment, updateAssignment, deleteAssignment,
} from "../api/assignmentApi";
import RubricView from "../components/RubricView";
import { CRITERIA_KEYS, CRITERIA_LABELS, DEFAULT_WEIGHT } from "../utils/criteria";

const defaultRubric = () =>
    Object.fromEntries(CRITERIA_KEYS.map((k) => [k, { weight: String(DEFAULT_WEIGHT), description: "" }]));

export default function AssignmentsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editing, setEditing] = useState(null); // null | "new" | assignment

    const load = () => {
        setLoading(true);
        setError("");
        getMyAssignments()
            .then(setItems)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    const handleDelete = async (a) => {
        if (!window.confirm(`Xóa đề "${a.title}"? Các bài đã nộp vẫn được giữ lại.`)) return;
        try {
            await deleteAssignment(a.id);
            load();
        } catch (e) {
            setError(e.message);
        }
    };

    const handleSaved = () => {
        setEditing(null);
        load();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Đề bài của tôi ({items.length})</h2>
                {!editing && (
                    <button
                        type="button"
                        onClick={() => setEditing("new")}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white"
                    >
                        Tạo đề mới
                    </button>
                )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {editing && (
                <AssignmentForm
                    initial={editing === "new" ? null : editing}
                    onSaved={handleSaved}
                    onCancel={() => setEditing(null)}
                />
            )}

            {loading && <p className="text-gray-500">Đang tải...</p>}
            {!loading && items.length === 0 && !editing && (
                <div className="rounded-lg border bg-white p-8 text-center text-gray-500">Chưa có đề bài nào.</div>
            )}

            <ul className="space-y-3">
                {items.map((a) => (
                    <li key={a.id} className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800">{a.title}</p>
                                <p className="text-xs text-gray-400">{new Date(a.createdAt).toLocaleString("vi-VN")}</p>
                                {a.description && (
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{a.description}</p>
                                )}
                            </div>
                            <div className="shrink-0 space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setEditing(a)}
                                    className="rounded-lg border px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                                >
                                    Sửa
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDelete(a)}
                                    className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                        <div className="mt-3">
                            <RubricView rubric={a.rubric} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function AssignmentForm({ initial, onSaved, onCancel }) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [rubric, setRubric] = useState(
        initial
            ? Object.fromEntries(
                CRITERIA_KEYS.map((k) => [
                    k,
                    { weight: String(initial.rubric[k]?.weight ?? 0), description: initial.rubric[k]?.description ?? "" },
                ])
            )
            : defaultRubric()
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const total = CRITERIA_KEYS.reduce((s, k) => s + (Number(rubric[k].weight) || 0), 0);

    const setField = (k, field, value) =>
        setRubric((r) => ({ ...r, [k]: { ...r[k], [field]: value } }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) return setError("Vui lòng nhập tiêu đề.");
        for (const k of CRITERIA_KEYS) {
            const w = rubric[k].weight;
            if (w === "" || Number.isNaN(Number(w)) || Number(w) < 0 || Number(w) > 100) {
                return setError(`Trọng số "${CRITERIA_LABELS[k]}" phải từ 0 đến 100.`);
            }
        }
        if (Math.abs(total - 100) > 0.01) return setError("Tổng trọng số phải bằng 100.");

        const payload = {
            title: title.trim(),
            description: description.trim(),
            rubric: Object.fromEntries(
                CRITERIA_KEYS.map((k) => [
                    k,
                    { weight: Number(rubric[k].weight), description: rubric[k].description.trim() },
                ])
            ),
        };

        setLoading(true);
        try {
            if (initial) await updateAssignment(initial.id, payload);
            else await createAssignment(payload);
            onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full rounded-lg border border-gray-300 p-2 text-sm";

    return (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <p className="font-semibold text-indigo-800">{initial ? "Sửa đề bài" : "Tạo đề bài mới"}</p>

            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="Tiêu đề đề bài"
                className={inputClass}
            />
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="Mô tả, yêu cầu của đề bài..."
                className={inputClass}
            />

            <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-700">
                    Rubric{" "}
                    <span className={Math.abs(total - 100) > 0.01 ? "text-red-600" : "text-green-600"}>
                        (tổng trọng số: {total}/100)
                    </span>
                </p>
                {CRITERIA_KEYS.map((k) => (
                    <div key={k} className="flex flex-wrap items-center gap-2">
                        <span className="w-32 text-sm text-gray-700">{CRITERIA_LABELS[k]}</span>
                        <input
                            type="number" min="0" max="100" step="1"
                            value={rubric[k].weight}
                            onChange={(e) => setField(k, "weight", e.target.value)}
                            className="w-20 rounded-lg border border-gray-300 p-1 text-sm"
                        />
                        <span className="text-sm text-gray-500">%</span>
                        <input
                            value={rubric[k].description}
                            onChange={(e) => setField(k, "description", e.target.value)}
                            maxLength={500}
                            placeholder="Mô tả tiêu chí (không bắt buộc)"
                            className="min-w-0 flex-1 rounded-lg border border-gray-300 p-1 text-sm"
                        />
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between">
                {error ? <p className="text-sm text-red-600">{error}</p> : <span />}
                <div className="space-x-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border px-4 py-1 text-sm text-gray-600 disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-lg bg-indigo-600 px-4 py-1 text-sm text-white disabled:opacity-50"
                    >
                        {loading ? "Đang lưu..." : "Lưu đề bài"}
                    </button>
                </div>
            </div>
        </form>
    );
}