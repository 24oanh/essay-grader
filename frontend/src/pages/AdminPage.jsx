import { useEffect, useState } from "react";
import { getUsers, changeRole } from "../api/authApi";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getUsers().then(setUsers).catch((e) => setError(e.message));
  }, []);

  const handleChange = async (id, role) => {
    setError("");
    try {
      const updated = await changeRole(id, role);
      setUsers((list) => list.map((u) => (u.id === id ? updated : u)));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Quản lý người dùng ({users.length})</h2>
      {error && <p className="text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="p-3">Tên đăng nhập</th>
              <th className="p-3">Ngày tạo</th>
              <th className="p-3">Vai trò</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-medium">{u.username}</td>
                <td className="p-3 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                </td>
                <td className="p-3">
                  <select
                    value={u.role}
                    disabled={u.username === me.username}
                    onChange={(e) => handleChange(u.id, e.target.value)}
                    className="rounded border px-2 py-1 disabled:opacity-50"
                  >
                    <option value="USER">USER</option>
                    <option value="TEACHER">TEACHER</option> {/* [MỚI] */}
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}