const namespace = "ht:bmk:v1";
const keyFor = (conferenceCode: string) => `${namespace}:${conferenceCode}`;

export function loadBookmarks(conferenceCode: string): Set<number> {
  try {
    const raw = localStorage.getItem(keyFor(conferenceCode));
    const value: unknown = raw ? JSON.parse(raw) : [];
    return new Set(
      Array.isArray(value) ? value.filter((item): item is number => typeof item === "number") : [],
    );
  } catch {
    return new Set();
  }
}

export function toggleBookmark(conferenceCode: string, contentId: number): Set<number> {
  const bookmarks = loadBookmarks(conferenceCode);
  if (bookmarks.has(contentId)) bookmarks.delete(contentId);
  else bookmarks.add(contentId);
  try {
    localStorage.setItem(keyFor(conferenceCode), JSON.stringify([...bookmarks]));
  } catch {
    // Bookmarks still work for this interaction if storage is unavailable.
  }
  return bookmarks;
}
