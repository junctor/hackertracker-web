const NS = "ht:bmk:v1";
const keyFor = (confCode: string) => `${NS}:${confCode}`;

export const loadConfBookmarks = (confCode: string): Set<number> => {
  try {
    const raw = localStorage.getItem(keyFor(confCode));
    const arr: number[] = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
};

const saveConfBookmarks = (confCode: string, ids: Set<number>) => {
  localStorage.setItem(keyFor(confCode), JSON.stringify([...ids]));
};

export const isBookmarked = (confCode: string, eventId: number) =>
  loadConfBookmarks(confCode).has(eventId);

export const toggleBookmark = (
  confCode: string,
  eventId: number,
  setState: React.Dispatch<React.SetStateAction<Set<number>>>
) => {
  setState((prev) => {
    const next = new Set(prev);
    if (next.has(eventId)) next.delete(eventId);
    else next.add(eventId);
    saveConfBookmarks(confCode, next);
    return next;
  });
};

export const clearConferenceBookmarks = (confCode: string) =>
  localStorage.removeItem(keyFor(confCode));
