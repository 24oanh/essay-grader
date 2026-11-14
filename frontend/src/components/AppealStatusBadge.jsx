const STYLES = {
  PENDING: { label: "Đang chờ xử lý", cls: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Đã chấm lại", cls: "bg-green-100 text-green-700" },
  REJECTED: { label: "Giữ nguyên điểm", cls: "bg-red-100 text-red-700" },
};

export default function AppealStatusBadge({ status }) {
  const s = STYLES[status] ?? { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}>{s.label}</span>
  );
}