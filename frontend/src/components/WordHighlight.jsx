import { useState } from "react";
import { weightToColor } from "../utils/colorScale";

const MIN_VISIBLE = 0.05; // trọng số nhỏ hơn mức này coi như không đáng kể

export default function WordHighlight({ explanation }) {
  const [filter, setFilter] = useState("all"); // all | positive | negative

  const maxAbs = Math.max(...explanation.map((w) => Math.abs(w.weight)), 0);

  const topPositive = [...explanation]
    .filter((w) => w.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  const topNegative = [...explanation]
    .filter((w) => w.weight < 0)
    .sort((a, b) => a.weight - b.weight)
    .slice(0, 5);

  const isShown = (w) => {
    if (filter === "positive") return w.weight >= MIN_VISIBLE;
    if (filter === "negative") return w.weight <= -MIN_VISIBLE;
    return true;
  };

  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "positive", label: "Tăng điểm" },
    { key: "negative", label: "Giảm điểm" },
  ];

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-500">Giải thích: từ nào ảnh hưởng đến điểm</p>

        <div className="flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFilter(t.key)}
              className={`rounded-full px-3 py-1 text-sm ${
                filter === t.key
                  ? "bg-blue-600 text-white"
                  : "border text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chú thích màu */}
      <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
        <span>Giảm điểm</span>
        <div
          className="h-2 w-32 rounded-full"
          style={{
            background:
              "linear-gradient(to right, rgba(239,68,68,0.75), rgba(255,255,255,1), rgba(34,197,94,0.75))",
            border: "1px solid #e5e7eb",
          }}
        />
        <span>Tăng điểm</span>
      </div>

      {/* Văn bản được tô màu */}
      <p className="leading-9">
        {explanation.map((w, i) => (
          <span
            key={i}
            title={`Đóng góp: ${w.weight > 0 ? "+" : ""}${w.weight.toFixed(2)}`}
            className="cursor-help rounded px-0.5"
            style={{
              backgroundColor: isShown(w)
                ? weightToColor(w.weight, maxAbs)
                : "transparent",
              opacity: isShown(w) ? 1 : 0.45,
            }}
          >
            {w.word}{" "}
          </span>
        ))}
      </p>

      {/* Top từ ảnh hưởng nhất */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TopList title="Từ làm tăng điểm nhiều nhất" items={topPositive} positive />
        <TopList title="Từ làm giảm điểm nhiều nhất" items={topNegative} />
      </div>
    </div>
  );
}

function TopList({ title, items, positive = false }) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-gray-700">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Không có</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((w, i) => (
            <li key={i} className="flex justify-between">
              <span>{w.word}</span>
              <span className={positive ? "text-green-600" : "text-red-600"}>
                {w.weight > 0 ? "+" : ""}
                {w.weight.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}