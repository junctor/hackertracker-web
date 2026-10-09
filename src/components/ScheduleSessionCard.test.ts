// @vitest-environment happy-dom

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vite-plus/test";
import { createMemoryHistory, createRouter } from "vue-router";

import type { Conference, ScheduledContent } from "../types/hackertracker";

import ScheduleSessionCard from "./ScheduleSessionCard.vue";

const conference = {
  id: 34,
  code: "DEFCON34",
  name: "DEF CON 34",
  timezone: "America/Los_Angeles",
} as Conference;

const session: ScheduledContent = {
  contentId: 123,
  sessionId: 456,
  timeZone: "America/Los_Angeles",
  description: "",
  title: "A clickable session",
  begin: "2026-08-07T16:00:00Z",
  end: "2026-08-07T17:00:00Z",
  beginTimestampSeconds: 1_786_118_400,
  endTimestampSeconds: 1_786_122_000,
  locationId: 1,
  location: "Track 1",
  color: null,
  tags: [],
  speakers: "Speaker",
  sortOrder: 1,
};

function mountCard(link?: boolean) {
  const router = createRouter({ history: createMemoryHistory(), routes: [] });
  return mount(ScheduleSessionCard, {
    props: { conference, session, ...(link === undefined ? {} : { link }) },
    global: { plugins: [router] },
  });
}

describe("ScheduleSessionCard", () => {
  it("links the row to content by default", () => {
    const wrapper = mountCard();

    expect(wrapper.get(".session-link").element.tagName).toBe("A");
    expect(wrapper.get(".session-link").attributes("href")).toBe("/defcon34/content/123");
  });

  it("can render a non-linked row on the content detail page", () => {
    const wrapper = mountCard(false);

    expect(wrapper.get(".session-link").element.tagName).toBe("DIV");
    expect(wrapper.find(".session-link").attributes("href")).toBeUndefined();
  });
});
