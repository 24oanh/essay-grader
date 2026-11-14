import { http } from "./http";

export const createAppeal = (essayId, reason) =>
  http(`/api/essays/${essayId}/appeals`, { method: "POST", body: JSON.stringify({ reason }) });

export const getMyAppeals = () => http("/api/appeals/mine");

export const getAdminAppeals = (status) =>
  http(status ? `/api/admin/appeals?status=${status}` : "/api/admin/appeals");

export const resolveAppeal = (id, payload) =>
  http(`/api/admin/appeals/${id}/resolve`, { method: "PUT", body: JSON.stringify(payload) });