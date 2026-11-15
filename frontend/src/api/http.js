const API_URL = import.meta.env.VITE_API_URL;
export const AUTH_KEY = "auth";

export function loadAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

export async function http(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";

  const auth = loadAuth();
  if (auth?.token) headers.Authorization = `Bearer ${auth.token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  // Token hết hạn/không hợp lệ (trừ lúc đang đăng nhập/đăng ký)
  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    localStorage.removeItem(AUTH_KEY);
    window.location.assign("/login");
    throw new Error("Phiên đăng nhập đã hết hạn");
  }

  if (!res.ok) {
    let message = "Có lỗi xảy ra, vui lòng thử lại.";
    try {
      const body = await res.json();
      if (body.message) message = body.message;
    } catch {
      // không có body JSON
    }
    throw new Error(message);
  }

  return res.status === 204 ? null : res.json();
}

export async function download(path) {
  const auth = loadAuth();
  const res = await fetch(`${API_URL}${path}`, {
    headers: auth?.token ? { Authorization: `Bearer ${auth.token}` } : {},
  });

  if (res.status === 401) {
    localStorage.removeItem(AUTH_KEY);
    window.location.assign("/login");
    throw new Error("Phiên đăng nhập đã hết hạn");
  }

  if (!res.ok) {
    let message = "Không tải được file, vui lòng thử lại.";
    try {
      const body = await res.json();
      if (body.message) message = body.message;
    } catch {
      // không có body JSON
    }
    throw new Error(message);
  }

  return res.blob();
}