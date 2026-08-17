<script setup lang="ts">
import { computed } from "vue";

import { safeMarkdownUrl } from "../lib/urls";

const props = defineProps<{ content: string }>();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(rawUrl: string): string | null {
  const href = safeMarkdownUrl(rawUrl.replace(/&amp;/g, "&"));
  return href ? escapeHtml(href) : null;
}

function inlineMarkdown(value: string): string {
  let output = escapeHtml(value);
  output = output.replace(
    /\[([^\]]+)\]\(([^\s)]+)(?:\s+&quot;[^&]*&quot;)?\)/g,
    (_match, label: string, rawUrl: string) => {
      const href = safeUrl(rawUrl);
      return href
        ? `<a class="text-link focus-ring" href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
        : label;
    },
  );
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/(^|\s)\*([^*]+)\*(?=\s|$)/g, "$1<em>$2</em>");
  return output;
}

function renderMarkdown(markdown: string): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list.length)
      blocks.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (code) {
        blocks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = null;
      } else {
        flushParagraph();
        flushList();
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1]?.length ?? 2;
      blocks.push(`<h${level}>${inlineMarkdown(heading[2] ?? "")}</h${level}>`);
      continue;
    }
    const listItem = /^[-*]\s+(.+)$/.exec(line);
    if (listItem) {
      flushParagraph();
      list.push(listItem[1] ?? "");
      continue;
    }
    if (/^---+$/.test(line.trim())) {
      flushParagraph();
      flushList();
      blocks.push("<hr>");
      continue;
    }
    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`);
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  if (code) blocks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  return blocks.join("");
}

const rendered = computed(() => renderMarkdown(props.content));
</script>

<template>
  <!-- Input HTML is always escaped before supported Markdown syntax is added. -->
  <div class="markdown" v-html="rendered" />
</template>

<style scoped>
.markdown {
  color: #cbd5e1;
  overflow-wrap: anywhere;
}

.markdown :deep(* + *) {
  margin-top: 1rem;
}

.markdown :deep(:is(h1, h2, h3, h4)) {
  color: #f1f5f9;
  line-height: 1.25;
}

.markdown :deep(ul) {
  padding-left: 1.25rem;
}

.markdown :deep(li + li) {
  margin-top: 0.35rem;
}

.markdown :deep(a) {
  color: var(--accent-success);
  text-decoration: underline;
  text-decoration-color: color-mix(in oklab, var(--accent-success), transparent 50%);
  text-underline-offset: 0.18em;
}

.markdown :deep(a:hover) {
  color: white;
}

.markdown :deep(code) {
  border-radius: 0.25rem;
  background: #334155;
  padding: 0.1rem 0.25rem;
  color: #f1f5f9;
}

.markdown :deep(pre) {
  overflow-x: auto;
  border-radius: 0.5rem;
  background: #0f172a;
  padding: 1rem;
}

.markdown :deep(pre code) {
  padding: 0;
  background: transparent;
}

.markdown :deep(blockquote) {
  border-left: 4px solid var(--brand-cyan);
  padding-left: 1rem;
  font-style: italic;
}

.markdown :deep(hr) {
  border: 0;
  border-top: 1px solid #334155;
}
</style>
