import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import TeacherRequestPage from "./pages/TeacherRequestPage"; // [MỚI]
import AdminTeacherRequestsPage from "./pages/AdminTeacherRequestsPage"; // [MỚI]

const STAFF = ["TEACHER", "ADMIN"];

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />

              <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminPage /></ProtectedRoute>} />
              <Route path="/teacher" element={<ProtectedRoute role={STAFF}><TeacherPage /></ProtectedRoute>} />

              {/* [MỚI] USER gửi đơn xin làm giáo viên; ADMIN duyệt */}
              <Route path="/teacher-request" element={<ProtectedRoute><TeacherRequestPage /></ProtectedRoute>} />
              <Route path="/admin/teacher-requests" element={<ProtectedRoute role="ADMIN"><AdminTeacherRequestsPage /></ProtectedRoute>} />

              <Route path="/appeals" element={<ProtectedRoute><MyAppealsPage /></ProtectedRoute>} />
              <Route path="/admin/appeals" element={<ProtectedRoute role={STAFF}><AdminAppealsPage /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}