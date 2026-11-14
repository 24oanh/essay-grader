import { http } from "./http";

export const scoreEssay = (text) =>
  http("/api/essays/score", { method: "POST", body: JSON.stringify({ text }) });

export const getHistory = () => http("/api/essays");
export const getHistoryDetail = (id) => http(`/api/essays/${id}`);
export const deleteHistory = (id) => http(`/api/essays/${id}`, { method: "DELETE" });
export const clearHistory = () => http("/api/essays", { method: "DELETE" });
export const resubmitEssay = (id, text) => http(`/api/essays/${id}/resubmit`, { method: "POST", body: JSON.stringify({ text }) });
export const getProgress = (id) => http(`/api/essays/${id}/progress`);