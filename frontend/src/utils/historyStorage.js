const KEY = "essay-history";

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // bộ nhớ đầy hoặc bị chặn: bỏ qua
  }
}

export function addHistory(text, result) {
  const item = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    text,
    result,
  };
  // Giữ tối đa 50 bài gần nhất
  save([item, ...getHistory()].slice(0, 50));
}

export function removeHistory(id) {
  save(getHistory().filter((h) => h.id !== id));
}

export function clearHistory() {
  save([]);
}