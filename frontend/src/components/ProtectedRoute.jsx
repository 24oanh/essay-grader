import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// role có thể là một chuỗi ("ADMIN") hoặc mảng (["TEACHER", "ADMIN"])
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && ![].concat(role).includes(user.role)) return <Navigate to="/" replace />;

  return children;
}