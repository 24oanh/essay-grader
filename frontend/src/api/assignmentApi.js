import { http, download } from "./http";

export const getAssignments = () => http("/api/assignments");
export const getMyAssignments = () => http("/api/teacher/assignments");
export const createAssignment = (payload) =>
    http("/api/teacher/assignments", { method: "POST", body: JSON.stringify(payload) });
export const updateAssignment = (id, payload) =>
    http(`/api/teacher/assignments/${id}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteAssignment = (id) => http(`/api/teacher/assignments/${id}`, { method: "DELETE" });

export const getClassStats = (assignmentId) => http(`/api/teacher/assignments/${assignmentId}/stats`);

export const downloadClassReport = (assignmentId) =>
    download(`/api/teacher/assignments/${assignmentId}/report/excel`);