import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ScoreCard from "../components/ScoreCard";
import CriteriaChart from "../components/CriteriaChart";
import WordHighlight from "../components/WordHighlight";
import AppealForm from "../components/AppealForm";
import AppealSummary from "../components/AppealSummary";
import ProgressChart from "../components/ProgressChart";
import ResubmitForm from "../components/ResubmitForm";
import {
  getHistory,
  getHistoryDetail,
  getProgress,
  deleteHistory,
  clearHistory,
} from "../api/essayApi";
import { getMyAppeals } from "../api/appealApi";
import { useAuth } from "../context/AuthContext";

function formatDate(iso) {
  return new Date(iso).toLocaleString("vi-VN");
}

export default function HistoryPage() {
  const { user, isAdmin, isStaff } = useAuth(); // [SỬA] thêm isStaff
  const [items, setItems] = useState([]);
  const [appeals, setAppeals] = useState({}); // essayId -> appeal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [appealFormId, setAppealFormId] = useState(null);
  const [resubmitId, setResubmitId] = useState(null);
  const [progressId, setProgressId] = useState(null);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    Promise.all([getHistory(), getMyAppeals()])
      .then(([list, mine]) => {
        setItems(list);
        setAppeals(Object.fromEntries(mine.map((a) => [a.essayId, a])));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    if (openId === id) {
      setOpenId(null);
      setDetail(null);
      return;
    }
    setOpenId(id);
    setDetail(null);
    setError("");
    try {
      setDetail(await getHistoryDetail(id));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRemove = async (id) => {
    if (appeals[id] && !window.confirm("Bài này có khiếu nại, xóa bài sẽ xóa luôn khiếu nại. Tiếp tục?")) {
      return;
    }
    try {
      await deleteHistory(id);
      setItems((list) => list.filter((i) => i.id !== id));
      setAppeals((prev) => {
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
      if (openId === id) {
        setOpenId(null);
        setDetail(null);
      }
      if (progressId === id) {
        setProgressId(null);
        setProgress(null);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Xóa toàn bộ lịch sử chấm (kèm các khiếu nại)?")) return;
    try {
      await clearHistory();
      setItems([]);
      setAppeals({});
      setOpenId(null);
      setDetail(null);
      setProgressId(null);
      setProgress(null);
      setResubmitId(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAppealCreated = (appeal) => {
    setAppeals((prev) => ({ ...prev, [appeal.essayId]: appeal }));
    setAppealFormId(null);
  };

  // bật/tắt biểu đồ tiến bộ của một bài
  const handleProgress = async (id) => {
    if (progressId === id) {
      setProgressId(null);
      setProgress(null);
      return;
    }
    setProgressId(id);
    setProgress(null);
    setError("");
    try {
      setProgress(await getProgress(id));
    } catch (e) {
      setError(e.message);
    }
  };

  // sau khi nộp lại xong: tải lại danh sách và mở luôn biểu đồ
  const handleResubmitted = async (id) => {
    setResubmitId(null);
    setError("");
    try {
      setItems(await getHistory());
      setProgressId(id);
      setProgress(await getProgress(id));
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <p className="text-gray-500">Đang tải...</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
        <p>Chưa có bài nào được chấm.</p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <Link to="/" className="mt-3 inline-block text-blue-600 hover:underline">
          Chấm bài đầu tiên
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Lịch sử chấm ({items.length})</h2>
        {/* Backend: deleteAll của ADMIN xóa bài của tất cả người dùng nên ẩn nút này cho ADMIN */}
        {!isAdmin && (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border px-3 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="space-y-3">
        {items.map((item) => {
          const isOpen = openId === item.id;
          const appeal = appeals[item.id];
          const isMine = item.owner === user.username;
          const canAppeal = isMine && !appeal;

          return (
            <li key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                    {item.rootId && (
                      <span className="ml-2 rounded bg-purple-100 px-1.5 py-0.5 text-purple-700">
                        Nộp lại
                      </span>
                    )}
                  </p>
                  {/* [SỬA] giáo viên cũng thấy tên người nộp bài */}
                  {isStaff && (
                    <p className="text-xs text-blue-500">Người chấm: {item.owner ?? "(không rõ)"}</p>
                  )}
                  <p className="mt-1 line-clamp-2 text-gray-700">{item.text}</p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold text-blue-600">{item.score}</p>
                  <p className="text-xs text-gray-400">
                    {item.humanReviewed ? "điểm (đã chấm lại)" : "điểm (AI)"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white"
                >
                  {isOpen ? "Thu gọn" : "Xem chi tiết"}
                </button>

                {/* nút nộp lại: chỉ chủ bài mới thấy */}
                {isMine && (
                  <button
                    type="button"
                    onClick={() => setResubmitId(resubmitId === item.id ? null : item.id)}
                    className="rounded-lg border border-purple-300 px-3 py-1 text-sm text-purple-700 hover:bg-purple-50"
                  >
                    Nộp lại
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleProgress(item.id)}
                  className="rounded-lg border px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {progressId === item.id ? "Ẩn tiến bộ" : "Xem tiến bộ"}
                </button>

                {canAppeal && appealFormId !== item.id && (
                  <button
                    type="button"
                    onClick={() => setAppealFormId(item.id)}
                    className="rounded-lg border border-blue-300 px-3 py-1 text-sm text-blue-700 hover:bg-blue-50"
                  >
                    Khiếu nại điểm
                  </button>
                )}

                {/* [SỬA] giáo viên xem được bài của học sinh nhưng không được xóa */}
                {(isMine || isAdmin) && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="rounded-lg border px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {appealFormId === item.id && (
                <AppealForm
                  essayId={item.id}
                  onCreated={handleAppealCreated}
                  onCancel={() => setAppealFormId(null)}
                />
              )}

              {resubmitId === item.id && (
                <ResubmitForm
                  essay={item}
                  onDone={() => handleResubmitted(item.id)}
                  onCancel={() => setResubmitId(null)}
                />
              )}

              {progressId === item.id && (
                <div className="mt-3">
                  {progress ? (
                    <ProgressChart points={progress} />
                  ) : (
                    <p className="text-sm text-gray-500">Đang tải biểu đồ...</p>
                  )}
                </div>
              )}

              {appeal && <AppealSummary appeal={appeal} />}

              {isOpen && detail?.id === item.id && (
                <div className="mt-4 space-y-4">
                  {/* [SỬA] hiện nhận xét của giáo viên và dùng điểm tiêu chí giáo viên đã chỉnh */}
                  {detail.humanReviewed && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                      <p>
                        Điểm này đã được giáo viên xem xét lại. Điểm AI ban đầu:{" "}
                        <strong>{detail.result.score}</strong>.
                      </p>
                      {detail.teacherNote && (
                        <p className="mt-1">
                          <span className="text-green-600">
                            Nhận xét{detail.reviewer ? ` của ${detail.reviewer}` : ""}:{" "}
                          </span>
                          {detail.teacherNote}
                        </p>
                      )}
                      {!detail.teacherCriteria && (
                        <p className="mt-1">Biểu đồ bên dưới là phân tích gốc của AI.</p>
                      )}
                    </div>
                  )}
                  <ScoreCard score={detail.score} />
                  <CriteriaChart criteria={detail.teacherCriteria ?? detail.result.criteria} />
                  <WordHighlight explanation={detail.result.explanation} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}