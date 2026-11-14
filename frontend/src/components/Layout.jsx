import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1 text-sm ${
    isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
  }`;

export default function Layout({ children }) {
  const { user, isAdmin, isStaff, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 p-4">
          <h1 className="text-lg font-bold text-blue-600">Chấm điểm bài luận</h1>

          <nav className="flex flex-wrap items-center gap-2">
            {user ? (
              <>
                <NavLink to="/" end className={linkClass}>Chấm bài</NavLink>
                <NavLink to="/history" className={linkClass}>Lịch sử</NavLink>
                {isStaff && <NavLink to="/teacher" className={linkClass}>Chấm lại bài</NavLink>}
                {isAdmin && <NavLink to="/admin" className={linkClass}>Quản trị</NavLink>}
                {/* [MỚI] ADMIN duyệt đơn giáo viên */}
                {isAdmin && <NavLink to="/admin/teacher-requests" className={linkClass}>Duyệt giáo viên</NavLink>}
                <NavLink to="/appeals" className={linkClass}>Khiếu nại</NavLink>
                {isStaff && <NavLink to="/admin/appeals" className={linkClass}>Xử lý khiếu nại</NavLink>}
                {/* [MỚI] nút đăng ký giáo viên, chỉ hiện với tài khoản USER */}
                {user.role === "USER" && (
                  <NavLink to="/teacher-request" className={linkClass}>Đăng ký giáo viên</NavLink>
                )}

                <span className="ml-2 text-sm text-gray-600">
                  {user.username}
                  <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                    {user.role}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg border px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-3 py-1 text-sm text-white"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6">{children}</main>

      <footer className="py-6 text-center text-sm text-gray-400">Đồ án TLCN</footer>
    </div>
  );
}