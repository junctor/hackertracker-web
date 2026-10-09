// @vitest-environment happy-dom

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vite-plus/test";

import MarkdownContent from "./MarkdownContent.vue";

describe("MarkdownContent", () => {
  it("nests source headings below the surrounding section", () => {
    const wrapper = mount(MarkdownContent, { props: { content: "# First\n## Second" } });

    expect(wrapper.find("h1").exists()).toBe(false);
    expect(wrapper.get("h3").text()).toBe("First");
    expect(wrapper.get("h4").text()).toBe("Second");
  });

  it("can begin at h2 for content placed directly below a page heading", () => {
    const wrapper = mount(MarkdownContent, {
      props: { content: "# Section", headingStart: 2 },
    });

    expect(wrapper.get("h2").text()).toBe("Section");
  });
});
