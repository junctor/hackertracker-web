export function normalizeConfCodeParam(confCode: string | undefined): string | undefined {
  const normalized = confCode?.trim();
  return normalized ? normalized.toUpperCase() : undefined;
}

function confSegment(confCode: string): string {
  return encodeURIComponent(confCode.trim().toLowerCase());
}

export function conferencePath(confCode: string): string {
  return `/${confSegment(confCode)}`;
}

export function schedulePath(confCode: string): string {
  return `${conferencePath(confCode)}/schedule`;
}

export function bookmarksPath(confCode: string): string {
  return `${conferencePath(confCode)}/bookmarks`;
}

export function peoplePath(confCode: string): string {
  return `${conferencePath(confCode)}/people`;
}

export function personPath(confCode: string, personId: number): string {
  return `${peoplePath(confCode)}/${encodeURIComponent(String(personId))}`;
}

export function contentPath(confCode: string, contentId: number): string {
  return `${conferencePath(confCode)}/content/${encodeURIComponent(String(contentId))}`;
}
