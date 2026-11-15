import { useState } from "react";
import { batchScoreEssays } from "../api/teacherApi";
import ScoreCard from "../components/ScoreCard";
import WordHighlight from "../components/WordHighlight";

const MAX_FILES = 50; // khớp @Size(max = 50) ở backend
const ACCEPT = [".txt", ".docx", ".pdf"];
const CRITERIA = [
    { key: "content", label: "Nội dung" },
    { key: "organization", label: "Bố cục" },
    { key: "language", label: "Ngôn ngữ" },
];

const isAccepted = (f) => ACCEPT.some((ext) => f.name.toLowerCase().endsWith(ext));

export default function BatchScorePage() {
    const [files, setFiles] = useState([]);
    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);

    const addFiles = (list) => {
        const picked = Array.from(list);
        const valid = picked.filter(isAccepted);
        const notes = [];
        if (valid.length < picked.length) notes.push("Đã bỏ qua file không hỗ trợ (chỉ nhận .txt, .docx, .pdf).");
        if (valid.length > MAX_FILES) notes.push(`Chỉ chấm tối đa ${MAX_FILES} file mỗi lần.`);
        setError(notes.join(" "));
        setFiles(valid.slice(0, MAX_FILES));
        setRows([]);
        setSelected(null);
    };

    const handleSubmit = async () => {
        if (!files.length || loading) return;
        setLoading(true);
        setError("");
        setRows([]);
        setSelected(null);
        try {
            setRows(await batchScoreEssays(files));
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setFiles([]);
        setRows([]);
        setSelected(null);
        setError("");
    };

    const detail = selected !== null ? rows[selected] : null;
    const okCount = rows.filter((r) => r.success).length;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Chấm hàng loạt</h2>

            <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white p-8 text-center ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
                    }`}
            >
                <span className="font-medium text-gray-700">Kéo thả hoặc bấm để chọn nhiều file</span>
                <span className="mt-1 text-sm text-gray-400">
                    Hỗ trợ .txt, .docx, .pdf (tối đa {MAX_FILES} file)
                </span>
                <input
                    type="file"
                    multiple
                    accept={ACCEPT.join(",")}
                    className="hidden"
                    onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
                />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {files.length > 0 && (
                <div className="rounded-lg border bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm text-gray-600">Đã chọn {files.length} file</p>
                        <div className="space-x-2">
                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={loading}
                                className="rounded-lg border px-4 py-1 text-sm text-gray-600 disabled:opacity-50"
                            >
                                Xóa
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="rounded-lg bg-blue-600 px-4 py-1 text-sm text-white disabled:opacity-50"
                            >
                                {loading ? "Đang chấm..." : "Chấm điểm"}
                            </button>
                        </div>
                    </div>
                    <ul className="mt-2 max-h-32 overflow-y-auto text-sm text-gray-500">
                        {files.map((f, i) => (
                            <li key={i} className="truncate">{f.name}</li>
                        ))}
                    </ul>
                </div>
            )}

            {rows.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        Thành công {okCount}/{rows.length} bài. Bấm vào dòng để xem chi tiết.
                    </p>
                    <div className="overflow-x-auto rounded-lg border bg-white">
                        <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="border-b bg-gray-50 text-gray-500">
                                <tr>
                                    <th className="p-3">Tên bài</th>
                                    <th className="p-3">Điểm tổng</th>
                                    {CRITERIA.map((c) => (
                                        <th key={c.key} className="p-3">{c.label}</th>
                                    ))}
                                    <th className="p-3">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr
                                        key={i}
                                        onClick={() => r.success && setSelected(i)}
                                        className={`border-b last:border-0 ${r.success ? "cursor-pointer hover:bg-blue-50" : ""
                                            } ${selected === i ? "bg-blue-50" : ""}`}
                                    >
                                        <td className="max-w-[200px] truncate p-3">{r.name}</td>
                                        <td className="p-3 font-semibold text-blue-600">
                                            {r.success ? r.result.score : "-"}
                                        </td>
                                        {CRITERIA.map((c) => (
                                            <td key={c.key} className="p-3">
                                                {r.success ? r.result.criteria[c.key] ?? "-" : "-"}
                                            </td>
                                        ))}
                                        <td className="p-3">
                                            {r.success ? (
                                                <span className="text-green-600">Đã chấm</span>
                                            ) : (
                                                <span className="text-red-600">{r.error || "Lỗi"}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {detail?.success && (
                <div className="space-y-4">
                    <p className="font-semibold text-gray-700">Chi tiết: {detail.name}</p>
                    <ScoreCard score={detail.result.score} />
                    <WordHighlight explanation={detail.result.explanation} />
                </div>
            )}
        </div>
    );
}