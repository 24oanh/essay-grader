import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = async (response) => {
    setError("");
    try {
      await loginWithGoogle(response.credential);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin) {
      if (username.trim().length < 3) return setError("Tên đăng nhập tối thiểu 3 ký tự.");
      if (password.length < 6) return setError("Mật khẩu tối thiểu 6 ký tự.");
      if (password !== confirm) return setError("Mật khẩu nhập lại không khớp.");
    }

    setLoading(true);
    try {
      if (isLogin) await login(username.trim(), password);
      else await register(username.trim(), password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="mx-auto max-w-sm space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">{isLogin ? "Đăng nhập" : "Đăng ký"}</h2>

      {/* Đăng nhập / đăng ký bằng Google */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogle}
          onError={() => setError("Không đăng nhập được bằng Google.")}
          text={isLogin ? "signin_with" : "signup_with"}
          locale="vi"
        />
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        hoặc dùng tài khoản thường
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm text-gray-600">Tên đăng nhập</label>
          <input
            className={inputClass}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-600">Mật khẩu</label>
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {!isLogin && (
          <div>
            <label className="mb-1 block text-sm text-gray-600">Nhập lại mật khẩu</label>
            <input
              type="password"
              className={inputClass}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : isLogin ? "Đăng nhập" : "Tạo tài khoản"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-center text-sm text-gray-500">
        {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
        <Link to={isLogin ? "/register" : "/login"} className="text-blue-600 hover:underline">
          {isLogin ? "Đăng ký" : "Đăng nhập"}
        </Link>
      </p>
    </div>
  );
}