import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppealSummary from "../components/AppealSummary";
import { getMyAppeals } from "../api/appealApi";

export default function MyAppealsPage() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyAppeals()
      .then(setAppeals)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Đang tải...</p>;

  if (!error && appeals.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-8 text-center text-gray-500">
        <p>Bạn chưa gửi khiếu nại nào.</p>
        <Link to="/history" className="mt-3 inline-block text-blue-600 hover:underline">
          Vào lịch sử chấm để khiếu nại một bài
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Khiếu nại của tôi ({appeals.length})</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="space-y-3">
        {appeals.map((a) => (
          <li key={a.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-700">Bài #{a.essayId}</p>
              <Link to="/history" className="text-sm text-blue-600 hover:underline">
                Xem trong lịch sử
              </Link>
            </div>
            <AppealSummary appeal={a} />
          </li>
        ))}
      </ul>
    </div>
  );
}