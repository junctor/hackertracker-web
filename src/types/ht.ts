import type { HTContent, HTContentSession } from "./db";

export type ScheduledContent = {
  content: HTContent;
  session: HTContentSession;
};

export interface ProcessedScheduledContent {
  contentId: number;
  sessionId: number;
  timeZone: string;
  description: string;
  title: string;
  begin: string | number | Date;
  end?: string | number | Date | null;
  beginTimestampSeconds: number | null;
  endTimestampSeconds: number | null;
  location: string | null;
  color: string | null;
  tags: ProcessedTag[];
  speakers: string | null;
  links: { label: string; url: string }[];
  locationId: number | null;
}

export interface ProcessedTag {
  id: number;
  label: string;
  color_background: string | null;
  color_foreground: string | null;
  sort_order: number;
}

export type GroupedSchedule = Record<string, ProcessedScheduledContent[]>;

export interface Bookmark {
  confCode: string;
  contentId: number;
}
