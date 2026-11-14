import AppealStatusBadge from "./AppealStatusBadge";

export default function AppealSummary({ appeal }) {
  return (
    <div className="mt-3 space-y-1 rounded-lg border bg-gray-50 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-gray-700">Khiếu nại điểm</span>
        <AppealStatusBadge status={appeal.status} />
      </div>

      <p className="text-gray-600">
        <span className="text-gray-400">Lý do của bạn: </span>
        {appeal.reason}
      </p>

      {appeal.status === "APPROVED" && (
        <p className="text-gray-600">
          <span className="text-gray-400">Điểm: </span>
          {appeal.originalScore} →{" "}
          <strong className="text-green-700">{appeal.newScore}</strong>
        </p>
      )}

      {appeal.status !== "PENDING" && (
        <p className="text-gray-600">
          <span className="text-gray-400">Phản hồi từ {appeal.reviewer}: </span>
          {appeal.reviewerNote}
        </p>
      )}

      <p className="text-xs text-gray-400">
        Gửi lúc {new Date(appeal.createdAt).toLocaleString("vi-VN")}
      </p>
    </div>
  );
}