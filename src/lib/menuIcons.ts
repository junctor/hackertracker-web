import {
  Bookmark,
  Building,
  Building2,
  Calendar,
  ClipboardList,
  FileText,
  FolderOpen,
  Handshake,
  Map,
  MapPin,
  Megaphone,
  Search,
  Store,
  TentTree,
  Trophy,
  Users,
} from "@lucide/vue";
import type { Component } from "vue";

import type { MenuRouteKey } from "./menuRoutes";

const icons: Record<MenuRouteKey, Component> = {
  announcements: Megaphone,
  bookmarks: Bookmark,
  communities: Handshake,
  content: ClipboardList,
  contests: Trophy,
  departments: Building2,
  document: FileText,
  exhibitors: Building,
  locations: MapPin,
  maps: Map,
  menu: FolderOpen,
  people: Users,
  readme: FileText,
  schedule: Calendar,
  search: Search,
  vendors: Store,
  villages: TentTree,
};

export const menuIcon = (key: MenuRouteKey): Component => icons[key];
