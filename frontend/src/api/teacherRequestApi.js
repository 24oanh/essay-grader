import { http } from "./http";

export const createTeacherRequest = (payload) =>
  http("/api/teacher-requests", { method: "POST", body: JSON.stringify(payload) });

export const getMyTeacherRequests = () => http("/api/teacher-requests/mine");

export const getAdminTeacherRequests = (status) =>
  http(status ? `/api/admin/teacher-requests?status=${status}` : "/api/admin/teacher-requests");

export const resolveTeacherRequest = (id, payload) =>
  http(`/api/admin/teacher-requests/${id}/resolve`, { method: "PUT", body: JSON.stringify(payload) });