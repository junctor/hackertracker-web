<script setup lang="ts">
import { computed } from "vue";

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
  try {
    const decoded = rawUrl.replace(/&amp;/g, "&");
    const url = new URL(decoded, window.location.origin);
    return ["http:", "https:", "mailto:"].includes(url.protocol) ? escapeHtml(decoded) : null;
  } catch {
    return null;
  }
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
