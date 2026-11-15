import { useEffect, useState } from "react";
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getMyAssignments, getClassStats, downloadClassReport } from "../api/assignmentApi";
import CriteriaChart from "../components/CriteriaChart";

export default function StatsPage() {
    const [assignments, setAssignments] = useState([]);
    const [assignmentId, setAssignmentId] = useState("");
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        getMyAssignments().then(setAssignments).catch((e) => setError(e.message));
    }, []);

    useEffect(() => {
        if (!assignmentId) {
            setStats(null);
            return;
        }
        setLoading(true);
        setError("");
        getClassStats(assignmentId)
            .then(setStats)
            .catch((e) => {
                setStats(null);
                setError(e.message);
            })
            .finally(() => setLoading(false));
    }, [assignmentId]);

    const handleExport = async () => {
        setExporting(true);
        setError("");
        try {
            const blob = await downloadClassReport(assignmentId);
            const title = assignments.find((a) => String(a.id) === assignmentId)?.title ?? "de-bai";
            const safe = title.replace(/[\\/:*?"<>|]/g, "").trim().slice(0, 50) || "de-bai";

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `bao-cao-diem-${safe}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            setError(e.message);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Thống kê điểm của lớp</h2>

            <div>
                <label htmlFor="stats-assignment" className="mb-1 block text-sm font-semibold text-gray-700">
                    Chọn đề bài
                </label>
                <select
                    id="stats-assignment"
                    value={assignmentId}
                    onChange={(e) => setAssignmentId(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2"
                >
                    <option value="">-- Chọn đề bài --</option>
                    {assignments.map((a) => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                </select>
                {assignments.length === 0 && (
                    <p className="mt-1 text-sm text-gray-500">Bạn chưa có đề bài nào. Hãy tạo đề ở mục "Đề bài".</p>
                )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {loading && <p className="text-gray-500">Đang tải...</p>}

            {stats && !loading && stats.count > 0 && (
                <button
                    type="button"
                    onClick={handleExport}
                    disabled={exporting}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                    {exporting ? "Đang xuất..." : "Xuất Excel"}
                </button>
            )}

            {stats && !loading && <StatsView stats={stats} />}
        </div>
    );
}

function StatsView({ stats }) {
    if (stats.count === 0) {
        return (
            <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
                Chưa có học sinh nào nộp bài cho đề này.
            </div>
        );
    }

    const summary = [
        { label: "Số học sinh", value: stats.count },
        { label: "Điểm trung bình", value: stats.average },
        { label: "Trung vị", value: stats.median },
        { label: "Cao nhất", value: stats.max },
        { label: "Thấp nhất", value: stats.min },
        { label: "Độ lệch chuẩn", value: stats.stdDev },
    ];

    const data = stats.distribution.map((count, i) => ({
        range: `${i}-${i + 1}`,
        count,
    }));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {summary.map((s) => (
                    <div key={s.label} className="rounded-lg border bg-white p-3 shadow-sm">
                        <p className="text-xs text-gray-500">{s.label}</p>
                        <p className="text-2xl font-bold text-blue-600">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-lg border p-4 shadow-sm">
                <p className="mb-3 text-sm text-gray-500">Phân bố điểm (số học sinh theo khoảng điểm)</p>
                <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
                            <XAxis dataKey="range" />
                            <YAxis allowDecimals={false} />
                            <Tooltip formatter={(v) => [`${v} bài`, "Số bài"]} />
                            <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                                <LabelList dataKey="count" position="top" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <CriteriaChart criteria={stats.criteriaAverage} />

            <div className="space-y-2">
                <p className="font-semibold text-gray-700">Bài bất thường ({stats.outliers.length})</p>
                <p className="text-sm text-gray-500">
                    Điểm lệch hơn {stats.outlierSd} độ lệch chuẩn so với trung bình lớp (cần ít nhất{" "}
                    {stats.minForOutliers} học sinh).
                </p>

                {stats.count < stats.minForOutliers ? (
                    <p className="text-sm text-gray-500">
                        Hiện có {stats.count} học sinh, chưa đủ để phát hiện bài bất thường.
                    </p>
                ) : stats.outliers.length === 0 ? (
                    <p className="text-sm text-gray-500">Không có bài bất thường.</p>
                ) : (
                    <ul className="space-y-2">
                        {stats.outliers.map((o) => (
                            <OutlierItem key={o.essayId} o={o} />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function OutlierItem({ o }) {
    const [open, setOpen] = useState(false);
    const high = o.deviation > 0;

    return (
        <li className="rounded-lg border bg-white p-3 shadow-sm">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-3 text-left"
            >
                <span className="font-medium text-gray-800">
                    {o.student} · Bài #{o.essayId}
                    {o.humanReviewed && (
                        <span className="ml-2 rounded bg-green-50 px-1.5 py-0.5 text-xs text-green-700">đã chấm lại</span>
                    )}
                </span>
                <span className="shrink-0 text-sm">
                    <span className={`text-lg font-bold ${high ? "text-green-600" : "text-red-600"}`}>{o.score}</span>
                    <span className="ml-2 text-gray-400">
                        ({high ? "+" : ""}{o.deviation} độ lệch chuẩn)
                    </span>
                </span>
            </button>

            {open && (
                <p className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border p-3 text-sm text-gray-700">
                    {o.text}
                </p>
            )}
        </li>
    );
}