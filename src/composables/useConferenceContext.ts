import { inject, type ComputedRef, type InjectionKey, type Ref } from "vue";

import type { Conference, ConferenceMenu } from "../types/hackertracker";
import type { SupportedMenuItem } from "../lib/menuRoutes";

export interface ConferenceContext {
  conference: Ref<Conference | null>;
  menus: Ref<ConferenceMenu[]>;
  menu: ComputedRef<ConferenceMenu | null>;
  menuItems: ComputedRef<SupportedMenuItem[]>;
  loading: Ref<boolean>;
  menuLoading: Ref<boolean>;
  error: Ref<string>;
  menuError: Ref<string>;
}

export const conferenceContextKey: InjectionKey<ConferenceContext> = Symbol("conference-context");

export function useConferenceContext(): ConferenceContext {
  const context = inject(conferenceContextKey);
  if (!context) throw new Error("useConferenceContext must be used inside ConferenceLayout");
  return context;
}
