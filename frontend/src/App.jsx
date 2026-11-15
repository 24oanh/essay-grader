import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import HistoryPage from "./pages/HistoryPage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import MyAppealsPage from "./pages/MyAppealsPage";
import AdminAppealsPage from "./pages/AdminAppealsPage";
import TeacherPage from "./pages/TeacherPage";
import BatchScorePage from "./pages/BatchScorePage";
import TeacherRequestPage from "./pages/TeacherRequestPage";
import AdminTeacherRequestsPage from "./pages/AdminTeacherRequestsPage";
import AssignmentsPage from "./pages/AssignmentsPage";
import StatsPage from "./pages/StatsPage";

const STAFF = ["TEACHER", "ADMIN"];
const HOME_BY_ROLE = { ADMIN: "/admin", TEACHER: "/teacher/assignments" };

function Home() {
  const { user } = useAuth();
  const target = HOME_BY_ROLE[user?.role];
  return target ? <Navigate to={target} replace /> : <HomePage />;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />

              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminPage /></ProtectedRoute>} />
              <Route path="/teacher" element={<ProtectedRoute role={STAFF}><TeacherPage /></ProtectedRoute>} />
              <Route path="/teacher/batch" element={<ProtectedRoute role={STAFF}><BatchScorePage /></ProtectedRoute>} />

              {/* [MỚI] USER gửi đơn xin làm giáo viên; ADMIN duyệt */}
              <Route path="/teacher-request" element={<ProtectedRoute><TeacherRequestPage /></ProtectedRoute>} />
              <Route path="/admin/teacher-requests" element={<ProtectedRoute role="ADMIN"><AdminTeacherRequestsPage /></ProtectedRoute>} />

              <Route path="/appeals" element={<ProtectedRoute><MyAppealsPage /></ProtectedRoute>} />
              <Route path="/teacher/appeals" element={<ProtectedRoute role={STAFF}><AdminAppealsPage /></ProtectedRoute>} />
              <Route path="/teacher/assignments" element={<ProtectedRoute role="TEACHER"><AssignmentsPage /></ProtectedRoute>} />
              <Route path="/teacher/stats" element={<ProtectedRoute role="TEACHER"><StatsPage /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}