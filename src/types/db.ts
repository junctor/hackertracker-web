import type { Timestamp } from "firebase/firestore";

export interface HTConference {
  id: string;
  code: string;
  name: string;
  description?: string;
  timezone: string;
  start_date?: string;
  end_date?: string;
  start_timestamp?: Timestamp;
  end_timestamp?: Timestamp;
  updated_at?: Timestamp;
  codeofconduct?: string | null;
  link?: string | null;
  tagline_text?: string | null;
}

export interface HTEvent {
  id: string;
  title: string;
  type: string;
  description?: string;
  location?: HTLocation | null;
  begin_timestamp: Timestamp;
  end_timestamp: Timestamp;
  updated_at?: Timestamp;
  tag_ids?: number[];
  tags_text?: string[];
  speaker_ids?: string[];
  speakers?: HTSpeaker[];
  links?: HTLink[];
}

export interface HTSpeaker {
  id: string;
  name: string;
  bio?: string;
  title?: string;
  company?: string;
  links?: HTLink[];
  media?: HTMedia[];
}

export interface HTTag {
  id: number;
  label: string;
  category?: string;
  color?: string;
  sort_order?: number;
}

export interface HTLocation {
  id?: number | string;
  name: string;
  room?: string | null;
  building?: string | null;
}

export interface HTLink {
  label: string;
  url: string;
  type?: string;
  sort_order?: number;
}

export interface HTMedia {
  url: string;
  filetype?: string;
  hash_md5?: string;
  hash_sha256?: string;
  width?: number;
  height?: number;
}
