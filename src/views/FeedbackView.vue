<script setup lang="ts">
import { CheckCircle2, MessageSquarePlus } from "@lucide/vue";
import { computed, reactive, ref, shallowRef, watch, watchEffect } from "vue";

import type { FeedbackForm, FeedbackItem } from "../types/hackertracker";

import MarkdownContent from "../components/MarkdownContent.vue";
import PageHeading from "../components/PageHeading.vue";
import PageState from "../components/PageState.vue";
import { useConferenceContext } from "../composables/useConferenceContext";
import { getFeedbackForms } from "../firebase/data";
import { friendlyLoadError } from "../lib/errors";
import { safeWebUrl } from "../lib/urls";

interface Answer {
  options: number[];
  text: string;
}

const { conference } = useConferenceContext();
const forms = shallowRef<FeedbackForm[]>([]);
const answers = reactive<Record<number, Answer>>({});
const loading = ref(true);
const error = ref("");
const submitting = ref(false);
const submitted = ref(false);
const submitError = ref("");
const deviceId = globalThis.crypto?.randomUUID?.() ?? `web-${Date.now()}`;
let request = 0;

const form = computed(
  () =>
    forms.value.find((item) => item.nameText.trim().toLowerCase() === "general feedback") ??
    forms.value[0] ??
    null,
);

function answerFor(item: FeedbackItem): Answer {
  return (answers[item.id] ??= { options: [], text: "" });
}

function toggleOption(item: FeedbackItem, optionId: number, checked: boolean): void {
  const answer = answerFor(item);
  if (!checked) {
    answer.options = answer.options.filter((id) => id !== optionId);
    return;
  }
  if (item.selectMaximum > 0 && answer.options.length >= item.selectMaximum) return;
  answer.options = [...answer.options, optionId];
}

function isComplete(item: FeedbackItem): boolean {
  if (item.type === "display_only") return true;
  const answer = answerFor(item);
  if (item.type === "text") return item.selectMinimum === 0 || Boolean(answer.text.trim());
  return answer.options.length >= item.selectMinimum;
}

async function submit(): Promise<void> {
  const currentForm = form.value;
  const currentConference = conference.value;
  if (!currentForm || !currentConference || !currentForm.items.every(isComplete)) return;
  const endpoint = safeWebUrl(currentForm.submissionUrl);
  if (!endpoint) {
    submitError.value = "This feedback form has an invalid submission address.";
    return;
  }
  submitting.value = true;
  submitError.value = "";
  try {
    const payload = {
      feedback_form_id: currentForm.id,
      conference_id: currentForm.conferenceId || currentConference.id,
      client: "Hacker Tracker Web",
      device_id: deviceId,
      timestamp: new Date().toISOString(),
      items: currentForm.items
        .filter((item) => item.type !== "display_only")
        .map((item) => ({
          item_id: item.id,
          options: answerFor(item).options,
          text: answerFor(item).text.trim(),
        })),
    };
    // The conference feedback service accepts JSON but does not expose browser CORS headers.
    // text/plain keeps this a safe, write-only request without weakening the endpoint.
    await fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(payload),
    });
    submitted.value = true;
  } catch (reason) {
    submitError.value = friendlyLoadError(reason, "feedback submission");
  } finally {
    submitting.value = false;
  }
}

watch(
  conference,
  async (current) => {
    const currentRequest = ++request;
    if (!current) {
      forms.value = [];
      loading.value = false;
      return;
    }
    loading.value = true;
    error.value = "";
    try {
      const loaded = await getFeedbackForms(current.code);
      if (currentRequest === request) forms.value = loaded;
    } catch (reason) {
      if (currentRequest === request) error.value = friendlyLoadError(reason, "feedback form");
    } finally {
      if (currentRequest === request) loading.value = false;
    }
  },
  { immediate: true },
);

watchEffect(() => {
  if (conference.value)
    document.title = `General Feedback · ${conference.value.name} | Hacker Tracker`;
});
</script>

<template>
  <section v-if="conference" class="container page-content feedback-page">
    <PageHeading title="General Feedback" intro="Send feedback to the conference organizers." />
    <PageState
      v-if="loading"
      kind="loading"
      heading-level="h2"
      message="Getting the feedback form…"
    />
    <PageState
      v-else-if="error"
      kind="error"
      heading-level="h2"
      title="Feedback unavailable"
      :message="error"
      retry
    />
    <PageState
      v-else-if="!form"
      kind="empty"
      heading-level="h2"
      title="No feedback form"
      message="The organizers have not published a general feedback form."
      :icon="MessageSquarePlus"
    />
    <div v-else-if="submitted" class="feedback-success" role="status">
      <CheckCircle2 aria-hidden="true" />
      <h2>Feedback sent</h2>
      <p>Thank you for helping improve the conference.</p>
    </div>
    <form v-else class="feedback-form" @submit.prevent="submit">
      <template v-for="item in form.items" :key="item.id">
        <div v-if="item.type === 'display_only'" class="feedback-note">
          <MarkdownContent :content="item.captionText" :heading-start="2" />
        </div>
        <label v-else-if="item.type === 'text'" class="text-question">
          <span>{{ item.captionText }}</span>
          <textarea
            v-model="answerFor(item).text"
            class="input focus-ring"
            :maxlength="item.textMaxLength ?? undefined"
            :required="item.selectMinimum > 0"
            rows="7"
          />
        </label>
        <fieldset v-else class="choice-question">
          <legend>{{ item.captionText }}</legend>
          <p v-if="item.type === 'multi_select' && item.selectMaximum > 0" class="choice-help">
            Choose up to {{ item.selectMaximum }}.
          </p>
          <label v-for="option in item.options" :key="option.id" class="choice-row">
            <input
              v-if="item.type === 'select_one'"
              v-model="answerFor(item).options[0]"
              type="radio"
              :name="`feedback-${item.id}`"
              :value="option.id"
              :required="item.selectMinimum > 0"
            />
            <input
              v-else
              type="checkbox"
              :checked="answerFor(item).options.includes(option.id)"
              :disabled="
                !answerFor(item).options.includes(option.id) &&
                item.selectMaximum > 0 &&
                answerFor(item).options.length >= item.selectMaximum
              "
              @change="toggleOption(item, option.id, ($event.target as HTMLInputElement).checked)"
            />
            <span>{{ option.captionText }}</span>
          </label>
        </fieldset>
      </template>
      <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>
      <button type="submit" class="button focus-ring" :disabled="submitting">
        {{ submitting ? "Sending…" : "Send feedback" }}
      </button>
      <p class="privacy-note">
        Your response is sent directly to the conference feedback service. This site does not store
        it.
      </p>
    </form>
  </section>
</template>

<style scoped>
.feedback-page {
  max-width: 54rem;
}
.feedback-form {
  display: grid;
  gap: var(--space-6);
  margin-top: var(--space-7);
}
.feedback-note {
  border-left: 3px solid var(--brand-cyan);
  padding-left: var(--space-4);
}
.text-question {
  display: grid;
  gap: var(--space-2);
  font-weight: 650;
}
.text-question textarea {
  width: 100%;
  resize: vertical;
  font: inherit;
  font-weight: 400;
  line-height: 1.5;
}
.choice-question {
  display: grid;
  gap: var(--space-2);
  border: 0;
}
legend {
  margin-bottom: var(--space-2);
  color: var(--text-primary);
  font-weight: 650;
}
.choice-help,
.privacy-note {
  color: var(--text-subtle);
  font-size: 0.8rem;
}
.choice-row {
  display: flex;
  min-height: 2.75rem;
  align-items: center;
  gap: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-2);
  padding: var(--space-3);
  background: var(--surface-muted);
  cursor: pointer;
}
.choice-row:has(input:checked) {
  border-color: var(--accent);
  background: color-mix(in oklab, var(--accent), transparent 90%);
}
.choice-row input {
  width: 1.15rem;
  height: 1.15rem;
  flex: 0 0 auto;
  accent-color: var(--accent);
}
.submit-error {
  color: var(--critical-soft);
}
.feedback-form > .button {
  justify-self: start;
}
.feedback-form > .button:disabled {
  cursor: wait;
  opacity: 0.65;
}
.feedback-success {
  display: grid;
  min-height: 18rem;
  place-items: center;
  align-content: center;
  gap: var(--space-3);
  text-align: center;
}
.feedback-success svg {
  width: 2.5rem;
  height: 2.5rem;
  color: var(--accent-success);
}
.feedback-success h2 {
  font-size: 1.75rem;
}
.feedback-success p {
  color: var(--text-muted);
}
</style>
