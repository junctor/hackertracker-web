export interface ProcessedEvent {
  id: number;
  content_id?: number;
  title: string;
  begin: string | number | Date;
  end?: string | number | Date | null;
  beginTimestampSeconds: number | null;
  endTimestampSeconds: number | null;
  location: string | null;
  color: string | null;
  tags: ProcessedTag[];
  speakers: string | null;
}

export interface ProcessedTag {
  id: number;
  label: string;
  color_background: string | null;
  color_foreground: string | null;
  sort_order: number;
}

export type GroupedSchedule = Record<string, ProcessedEvent[]>;

export interface Bookmark {
  confCode: string;
  eventId: number;
}
