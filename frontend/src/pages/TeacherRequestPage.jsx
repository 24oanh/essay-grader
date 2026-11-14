import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTeacherRequest, getMyTeacherRequests } from "../api/teacherRequestApi";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function TeacherRequestPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getMyTeacherRequests()
      .then((list) => setLatest(list[0] ?? null))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !organization.trim() || !reason.trim()) {
      return setError("Vui lòng điền đầy đủ các ô.");
    }
    setSending(true);
    try {
      setLatest(
        await createTeacherRequest({
          fullName: fullName.trim(),
          organization: organization.trim(),
          reason: reason.trim(),
        })
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const relogin = () => {
    logout();
    navigate("/login");
  };

  if (loading) return <p className="text-gray-500">Đang tải...</p>;

  if (user.role !== "USER") {
    return (
      <div className="rounded-lg border bg-white p-6 text-gray-600">
        Tài khoản của bạn đã có vai trò <strong>{user.role}</strong>.
      </div>
    );
  }

  // Đã được duyệt nhưng token/vai trò ở máy vẫn là USER -> cần đăng nhập lại
  if (latest?.status === "APPROVED") {
    return (
      <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="font-semibold text-green-800">Đơn của bạn đã được duyệt!</p>
        {latest.adminNote && <p className="text-sm text-green-700">Ghi chú: {latest.adminNote}</p>}
        <p className="text-sm text-green-700">
          Hãy đăng xuất rồi đăng nhập lại để dùng quyền giáo viên.
        </p>
        <button type="button" onClick={relogin} className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white">
          Đăng xuất và đăng nhập lại
        </button>
      </div>
    );
  }

  if (latest?.status === "PENDING") {
    return (
      <div className="space-y-2 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <p className="font-semibold text-yellow-800">Đơn đang chờ quản trị viên duyệt</p>
        <p className="text-sm text-yellow-700">
          {latest.fullName} · {latest.organization}
        </p>
        <p className="text-sm text-yellow-700">Lý do: {latest.reason}</p>
        <p className="text-xs text-yellow-600">
          Gửi lúc {new Date(latest.createdAt).toLocaleString("vi-VN")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold">Đăng ký làm giáo viên</h2>
        <p className="text-sm text-gray-500">
          Gửi thông tin để quản trị viên xét duyệt. Khi được duyệt, bạn có thể xem và chấm lại điểm AI cho học sinh.
        </p>
      </div>

      {latest?.status === "REJECTED" && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Đơn trước của bạn đã bị từ chối{latest.adminNote ? `: ${latest.adminNote}` : "."} Bạn có thể gửi lại.
        </p>
      )}

      <div>
        <label className="mb-1 block text-sm text-gray-600">Họ và tên</label>
        <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-600">Trường / đơn vị công tác</label>
        <input className={inputClass} value={organization} onChange={(e) => setOrganization(e.target.value)} />
      </div>
      <div>
        <label className="mb-1 block text-sm text-gray-600">Lý do / kinh nghiệm giảng dạy</label>
        <textarea
          className={inputClass}
          rows={4}
          maxLength={2000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {sending ? "Đang gửi..." : "Gửi đơn đăng ký giáo viên"}
      </button>
    </form>
  );
}
