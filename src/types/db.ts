// ---------- Shared primitives ----------
export type ID = number;
export type UUID = string;

export interface HTTimestamp {
  seconds: number;
  nanoseconds: number;
}

export type HTDateTimeString = string;

// ---------- Media / Links ----------
export interface HTMedia {
  name: string;
  url: string;
  filetype: string;
  filesize: number;
  hash_md5: string;
  hash_crc32c: string;
  hash_sha256: string;
  person_id?: ID; // appears on people media
  asset_id?: ID; // appears on people media
  sort_order?: number;
}

export interface HTAvatar {
  asset_uuid: UUID;
  name: string;
  url: string;
  filetype: string;
  filesize: number;
  hash_md5: string;
  hash_crc32c: string;
  hash_sha256: string;
}

export interface HTEventLink {
  label: string; // e.g., "More Info"
  url: string;
  type: string; // e.g., "link"
}

export interface HTPersonLink {
  url: string;
  sort_order: number;
  title: string;
  description: string;
}

// ---------- TagTypes root (array of tag groups) ----------
export type HTTagCategory =
  | "content"
  | "content-person"
  | "orga"
  | "orga-person";

export interface HTTag {
  id: ID;
  label: string;
  description: string;
  sort_order: number;
  color_background: string; // hex
  color_foreground: string; // hex
}

export interface HTTagGroup {
  id: ID;
  uuid: UUID;
  well_known_uuid: UUID;

  label: string;
  category: HTTagCategory;
  conference_id: ID;
  conference: string; // e.g., "DEFCON33"

  is_browsable: boolean;
  is_single_valued: boolean;
  sort_order: number;

  tags: HTTag[];
}

/** Root: TagTypes.json */
export type TagTypes = HTTagGroup[];

// ---------- Speakers root (people array) ----------
export interface HTAffiliation {
  organization: string;
  title: string;
}

export interface HTPerson {
  id: ID;
  name: string;

  conference_id: ID;
  conference: string;

  title: string; // may be ""
  pronouns: string | null;
  twitter: string; // often ""
  description: string;

  avatar: HTAvatar | null; // may be null
  media: HTMedia[];

  link: string; // often ""
  links: HTPersonLink[];

  affiliations: HTAffiliation[];
  event_ids: ID[];
  content_ids: ID[];

  updated_at: HTDateTimeString; // e.g., "2024-07-21T18:01+0000"
  updated_tsz: HTDateTimeString; // e.g., "2024-07-21T18:01:02Z"
  updated_timestamp: HTTimestamp;
}

/** Root: speakers.json */
export type Speaker = HTPerson[];

// ---------- Events root (events array) ----------
export interface HTEventLocation {
  id: ID;
  name: string;
  short_name: string;
  parent_id: ID; // sometimes 0
  hotel: string; // often ""
}

export interface HTEventType {
  id: ID; // corresponds to a tag id under "Event Category"
  name: string; // e.g., "DEF CON Training (Paid)"
  color: string; // hex
  conference_id: ID;
  conference: string;
  updated_at: HTDateTimeString;
  updated_tsz: HTDateTimeString;
}

export interface HTEventPersonRole {
  person_id: ID;
  sort_order: number;
  tag_id: ID; // maps to a "Content-Person Role" tag id (e.g., Speaker/Trainer/etc)
}

export interface HTEventEmbeddedSpeaker {
  id: ID;
  name: string;

  conference_id: ID;
  content_ids: ID[];
  event_ids: ID[];

  title: string; // may be ""
  pronouns: string | null;

  avatar: HTAvatar | null; // may be null
  media: HTMedia[];

  links: HTPersonLink[];
  affiliations: HTAffiliation[];

  updated_tsz: HTDateTimeString;
}

export type HTSpansTimebands = "Y" | "N";

export interface HTEvent {
  id: ID;
  content_id: ID;

  conference_id: ID;
  conference: string;
  timezone: string; // IANA TZ

  title: string;
  description: string;
  android_description: string;

  // Strings and normalized timestamp objects provided together
  begin: HTDateTimeString; // e.g., "2025-08-08T17:00:00.000-0000"
  end: HTDateTimeString; // e.g., "2025-08-13T00:00:00.000-0000"
  begin_tsz: HTDateTimeString; // Zulu
  end_tsz: HTDateTimeString; // Zulu
  begin_timestamp: HTTimestamp;
  end_timestamp: HTTimestamp;

  updated: HTDateTimeString; // e.g., "2025-04-02T05:37:00.000-0000"
  updated_tsz: HTDateTimeString; // e.g., "2025-04-02T05:37:58Z"
  updated_timestamp: HTTimestamp;

  type: HTEventType;
  tag_ids: ID[];
  tags: string; // present as "", kept for parity

  speakers: HTEventEmbeddedSpeaker[];
  people: HTEventPersonRole[];

  location: HTEventLocation;

  timeband_id: ID;
  village_id: ID | null;
  logo: string | null;

  media: HTMedia[];
  links: HTEventLink[];

  spans_timebands: HTSpansTimebands;

  includes: string; // often ""
  link: string; // often ""
}

/** Root: events.json */
export type Events = HTEvent[];

// ---------- Conference root (single object) ----------

export interface HTMap {
  id: number;
  name: string; // e.g., "LVCC West Hall - Level 1"
  name_text: string; // duplicates name
  description: string; // e.g., "LVCC West Hall - Level 1"
  filename: string; // e.g., "map-w1-public-v2.pdf"
  file: string; // same as filename in sample
  url: string; // PDF URL (sometimes firebase storage)
  svg_url: string; // optimized SVG URL
  svg_filename: string; // e.g., "map-w1-public-v2-optimal.svg"
  sort_order: number;
}

export interface HTConference {
  id: number; // 190
  conference_id: number; // 190 (duplicated)
  code: string; // "DEFCON33"
  name: string; // "DEF CON 33"
  timezone: string; // "America/Los_Angeles"
  hidden: boolean; // false

  // Copy / marketing
  tagline_text: string; // "Welcome to DEF CON - the largest hacker..."
  description: string; // ""
  supportdoc: string; // ""
  codeofconduct: string; // ""
  merch_tax_statement: string; // ""
  merch_mandatory_acknowledgement: string; // ""

  // Links & menu
  link: string; // ""
  home_menu_id: number; // 175

  // Feature flags
  enable_merch: boolean; // true
  enable_merch_cart: boolean; // true

  // Dates (strings)
  start_date: string; // "2025-08-07"
  end_date: string; // "2025-08-10"
  begin_tsz: string; // "2025-08-07T07:00:00Z"
  end_tsz: string; // "2025-08-11T06:59:59Z"
  start_timestamp_str: string; // "2025-08-07T07:00:00+00:00"
  end_timestamp_str: string; // "2025-08-11T06:59:59+00:00"
  kickoff_tsz: string; // "2025-08-08T17:00:00Z"
  kickoff_timestamp_str: string; // "2025-08-08T17:00:00+00:00"

  // Dates (timestamp objects)
  start_timestamp: { seconds: number; nanoseconds: number };
  end_timestamp: { seconds: number; nanoseconds: number };
  kickoff_timestamp: { seconds: number; nanoseconds: number };

  // Misc
  feedbackform_ratelimit_seconds: number; // 60
  emergency_document_id: number | null; // null

  // Maps
  maps: HTMap[];

  // Updated-at (server timestamp object)
  updated_at: { seconds: number; nanoseconds: number };
}

/** Root: conference.json */
export type Conference = HTConference;
