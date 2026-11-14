import { http } from "./http";

export const login = (username, password) =>
  http("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) });

export const register = (username, password) =>
  http("/api/auth/register", { method: "POST", body: JSON.stringify({ username, password }) });

export const getUsers = () => http("/api/admin/users");

export const changeRole = (id, role) =>
  http(`/api/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) });

export const googleLogin = (credential) =>
  http("/api/auth/google", { method: "POST", body: JSON.stringify({ credential }) });