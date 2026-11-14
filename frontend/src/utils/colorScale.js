// Chuyển trọng số -> màu nền. Xanh = tăng điểm, đỏ = giảm điểm.
export function weightToColor(weight, maxAbs) {
  if (!maxAbs) return "transparent";
  // Chuẩn hóa theo trọng số lớn nhất để màu luôn nổi bật
  const intensity = Math.min(1, Math.abs(weight) / maxAbs);
  const alpha = (intensity * 0.75).toFixed(2);
  return weight >= 0
    ? `rgba(34, 197, 94, ${alpha})`
    : `rgba(239, 68, 68, ${alpha})`;
}