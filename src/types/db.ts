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

export interface HTContentLink {
  label: string;
  url: string;
  type: string;
}

export interface HTPersonLink {
  url: string;
  sort_order: number;
  title: string;
  description: string;
}

// ---------- TagTypes root (array of tag groups) ----------
export type HTTagCategory = "content" | "content-person" | "orga" | "orga-person";

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

// ---------- Content root (content array) ----------

export interface HTFirestoreTimestamp {
  type: "firestore/timestamp/1.0";
  seconds: number;
  nanoseconds: number;
}

export interface HTContentPersonRole {
  person_id: ID;
  sort_order: number;
  tag_ids: ID[];
}

export interface HTContentSession {
  session_id: ID;

  begin_timestamp: HTFirestoreTimestamp;
  begin_tsz: HTDateTimeString;

  end_timestamp: HTFirestoreTimestamp;
  end_tsz: HTDateTimeString;

  timezone_name: string;

  location_id: ID;
  channel_id: ID | null;
  recordingpolicy_id: ID;
}

export interface HTContent {
  id: ID;
  title: string;
  description: string;

  tag_ids: ID[];
  people: HTContentPersonRole[];
  sessions: HTContentSession[];

  links: HTContentLink[];

  /**
   * Empty object in the current content.json.
   * Kept loose in case the upstream API starts filling it.
   */
  logo: Record<string, unknown>;

  /**
   * Empty array in the current content.json.
   * Use HTMedia[] if future content media matches the existing media shape.
   */
  media: HTMedia[];

  related_content_ids: ID[] | null;

  feedback_form_id: ID | null;
  feedback_enable_timestamp: HTFirestoreTimestamp | null;
  feedback_enable_tsz: HTDateTimeString | null;
  feedback_disable_timestamp: HTFirestoreTimestamp | null;
  feedback_disable_tsz: HTDateTimeString | null;

  updated_timestamp: HTFirestoreTimestamp;
  updated_tsz: HTDateTimeString;
}

/** Root: content.json */
export type Content = HTContent[];

// ---------- Locations root (locations array) ----------

export interface HTLocation {
  id: ID;
  name: string;
  short_name: string;
  parent_id: ID;
  hotel: string;
}

/** Root: locations.json */
export type Locations = HTLocation[];

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
