export function normalizeConferenceCode(value: unknown): string | undefined {
  const code = typeof value === "string" ? value.trim() : "";
  return code ? code.toUpperCase() : undefined;
}

export function parseNumericParam(value: unknown): number | undefined {
  return typeof value === "string" && /^\d+$/.test(value) ? Number(value) : undefined;
}

const conferenceSegment = (code: string) => encodeURIComponent(code.trim().toLowerCase());

export const conferencePath = (code: string) => `/${conferenceSegment(code)}`;
export const conferenceMenuPath = (code: string) => `${conferencePath(code)}/menu`;
export const schedulePath = (code: string) => `${conferencePath(code)}/schedule`;
export const bookmarksPath = (code: string) => `${conferencePath(code)}/bookmarks`;
export const contentListPath = (code: string) => `${conferencePath(code)}/content`;
export const peoplePath = (code: string) => `${conferencePath(code)}/people`;
export const personPath = (code: string, id: number) => `${peoplePath(code)}/${id}`;
export const contentPath = (code: string, id: number) => `${conferencePath(code)}/content/${id}`;
export const documentPath = (code: string, id: number) => `${conferencePath(code)}/documents/${id}`;
export const nestedMenuPath = (code: string, id: number) => `${conferencePath(code)}/menu/${id}`;
export const conferenceSectionPath = (code: string, section: string) =>
  `${conferencePath(code)}/${encodeURIComponent(section)}`;

export function filteredScheduleRoute(
  code: string,
  filters: { tagIds?: readonly number[]; locationId?: number },
) {
  const tagIds = [...new Set(filters.tagIds ?? [])].filter(Number.isFinite);
  const locationId = filters.locationId;
  return {
    path: schedulePath(code),
    query: {
      ...(tagIds.length ? { tag_group: tagIds.join(",") } : {}),
      ...(locationId !== undefined && Number.isFinite(locationId)
        ? { location: String(locationId) }
        : {}),
    },
  };
}
