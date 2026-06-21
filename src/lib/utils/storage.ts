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

export const isBookmarked = (confCode: string, contentId: number) =>
  loadConfBookmarks(confCode).has(contentId);

export const toggleBookmark = (
  confCode: string,
  contentId: number,
  setState: React.Dispatch<React.SetStateAction<Set<number>>>,
) => {
  setState((prev) => {
    const next = new Set(prev);
    if (next.has(contentId)) next.delete(contentId);
    else next.add(contentId);
    saveConfBookmarks(confCode, next);
    return next;
  });
};

export const clearConferenceBookmarks = (confCode: string) =>
  localStorage.removeItem(keyFor(confCode));
