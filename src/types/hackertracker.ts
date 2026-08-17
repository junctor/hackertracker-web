export type Id = number;
export type DateTimeString = string;

export interface TimestampParts {
  seconds: number;
  nanoseconds?: number;
}

export interface Sortable {
  sort_order?: number;
  sortOrder?: number;
}

export interface Media extends Sortable {
  name: string;
  url: string;
  filetype: string;
  filesize: number;
  hash_md5: string;
  hash_crc32c: string;
  hash_sha256: string;
  person_id?: Id;
  asset_id?: Id;
}

export interface Avatar extends Media {
  asset_uuid: string;
}

export interface ContentLink extends Sortable {
  label: string;
  url: string;
  type: string;
}

export interface PersonLink extends Sortable {
  url: string;
  sort_order: number;
  title: string;
  description: string;
}

export type TagCategory = "content" | "content-person" | "orga" | "orga-person";

export interface Tag extends Sortable {
  id: Id;
  label: string;
  description: string;
  sort_order: number;
  color_background: string;
  color_foreground: string;
}

export interface TagGroup extends Sortable {
  id: Id;
  uuid: string;
  well_known_uuid: string;
  label: string;
  category: TagCategory;
  conference_id: Id;
  conference: string;
  is_browsable: boolean;
  is_single_valued: boolean;
  sort_order: number;
  tags: Tag[];
}

export interface Affiliation {
  organization: string;
  title: string;
}

export interface Person extends Sortable {
  id: Id;
  name: string;
  conference_id: Id;
  conference: string;
  title: string;
  pronouns: string | null;
  twitter: string;
  description: string;
  avatar: Avatar | null;
  media: Media[];
  link: string;
  links: PersonLink[];
  affiliations: Affiliation[];
  event_ids: Id[];
  content_ids: Id[];
  updated_at: DateTimeString;
  updated_tsz: DateTimeString;
  updated_timestamp: TimestampParts;
}

export interface ContentPersonRole extends Sortable {
  person_id: Id;
  sort_order: number;
  tag_ids: Id[];
}

export interface ContentSession extends Sortable {
  session_id: Id;
  begin_timestamp: TimestampParts;
  begin_tsz: DateTimeString;
  end_timestamp: TimestampParts;
  end_tsz: DateTimeString;
  timezone_name: string;
  location_id: Id;
  channel_id: Id | null;
  recordingpolicy_id: Id;
}

export interface Content extends Sortable {
  id: Id;
  title: string;
  description: string;
  tag_ids: Id[];
  people: ContentPersonRole[];
  sessions: ContentSession[];
  links: ContentLink[];
  logo: Record<string, unknown>;
  media: Media[];
  related_content_ids: Id[] | null;
  feedback_form_id: Id | null;
  feedback_enable_timestamp: TimestampParts | null;
  feedback_enable_tsz: DateTimeString | null;
  feedback_disable_timestamp: TimestampParts | null;
  feedback_disable_tsz: DateTimeString | null;
  updated_timestamp: TimestampParts;
  updated_tsz: DateTimeString;
}

export interface Location extends Sortable {
  id: Id;
  name: string;
  short_name: string;
  parent_id: Id;
  hotel: string;
}

export interface ConferenceMap extends Sortable {
  id: number;
  name: string;
  name_text: string;
  description: string;
  filename: string;
  file: string;
  url: string;
  svg_url: string;
  svg_filename: string;
  sort_order: number;
}

export interface Conference extends Sortable {
  id: number;
  conference_id: number;
  code: string;
  name: string;
  timezone: string;
  hidden: boolean;
  tagline_text: string;
  description: string;
  supportdoc: string;
  codeofconduct: string;
  merch_tax_statement: string;
  merch_mandatory_acknowledgement: string;
  link: string;
  home_menu_id: number;
  enable_merch: boolean;
  enable_merch_cart: boolean;
  start_date: string;
  end_date: string;
  begin_tsz: string;
  end_tsz: string;
  start_timestamp_str: string;
  end_timestamp_str: string;
  kickoff_tsz: string;
  kickoff_timestamp_str: string;
  start_timestamp: TimestampParts;
  end_timestamp: TimestampParts;
  kickoff_timestamp: TimestampParts;
  feedbackform_ratelimit_seconds: number;
  emergency_document_id: number | null;
  maps: ConferenceMap[];
  updated_at: TimestampParts;
}

/** Normalized UI model for the snake_case Firestore menu documents. */
export interface ConferenceMenu {
  id: number;
  conference: string;
  conferenceId: number;
  titleText: string;
  items: ConferenceMenuItem[];
}

export interface ConferenceMenuItem {
  id: number;
  titleText: string;
  function: string;
  sortOrder: number;
  appleSfSymbol: string;
  googleMaterialSymbol: string;
  appliedTagIds: number[];
  documentId: number | null;
  menuId: number | null;
  prohibitTagFilter: boolean;
}

export interface Organization extends Sortable {
  id: number;
  name: string;
  description: string;
  tag_ids: number[];
  tag_id_as_organizer: number | null;
  people: ContentPersonRole[];
  locations: number[];
  documents: number[];
  links: ContentLink[];
  logo: Media | Record<string, unknown> | null;
  media: Media[];
}

export interface ConferenceDocument {
  id: number;
  titleText: string;
  bodyText: string;
  updatedAt: DateTimeString | TimestampParts | null;
}

export interface ConferenceArticle extends Sortable {
  id: number;
  name: string;
  text: string;
  updatedAt: DateTimeString | TimestampParts | null;
}

export interface ProcessedTag extends Sortable {
  id: number;
  label: string;
  color_background: string | null;
  color_foreground: string | null;
  sort_order: number;
}

export interface ScheduledContent {
  contentId: number;
  sessionId: number;
  timeZone: string;
  description: string;
  title: string;
  begin: string;
  end: string | null;
  beginTimestampSeconds: number | null;
  endTimestampSeconds: number | null;
  locationId: number | null;
  location: string | null;
  color: string | null;
  tags: ProcessedTag[];
  speakers: string | null;
  sortOrder: number | null;
}

export type GroupedSchedule = Record<string, ScheduledContent[]>;

export interface ConferenceSchedule {
  conference: Conference;
  grouped: GroupedSchedule;
}
