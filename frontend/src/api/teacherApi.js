import { http } from "./http";

export const getTeacherEssays = (reviewed) =>
  http(reviewed === undefined ? "/api/teacher/essays" : `/api/teacher/essays?reviewed=${reviewed}`);

export const reviewEssay = (id, payload) =>
  http(`/api/teacher/essays/${id}/review`, { method: "PUT", body: JSON.stringify(payload) });