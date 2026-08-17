import { computed, ref, toValue, type MaybeRefOrGetter, type Ref } from "vue";

import { loadBookmarks, toggleBookmark } from "../lib/bookmarks";

const bookmarkSets = new Map<string, Ref<Set<number>>>();
let listeningForStorage = false;

function stateFor(conferenceCode: string): Ref<Set<number>> {
  let bookmarks = bookmarkSets.get(conferenceCode);
  if (!bookmarks) {
    bookmarks = ref(loadBookmarks(conferenceCode));
    bookmarkSets.set(conferenceCode, bookmarks);
  }
  return bookmarks;
}

export function useBookmarks(conferenceCode: MaybeRefOrGetter<string>) {
  if (!listeningForStorage && typeof window !== "undefined") {
    listeningForStorage = true;
    window.addEventListener("storage", () => {
      for (const [code, bookmarks] of bookmarkSets) bookmarks.value = loadBookmarks(code);
    });
  }

  const bookmarks = computed(() => stateFor(toValue(conferenceCode)).value);

  const toggle = (contentId: number) => {
    const code = toValue(conferenceCode);
    stateFor(code).value = toggleBookmark(code, contentId);
  };

  return { bookmarks, toggle };
}
