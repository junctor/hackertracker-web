import {
  Bookmark,
  Building,
  Building2,
  Calendar,
  BookOpenText,
  FileText,
  FolderOpen,
  Handshake,
  LayoutList,
  Map,
  MapPin,
  Megaphone,
  MessageSquarePlus,
  Search,
  Shirt,
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
  content: LayoutList,
  contests: Trophy,
  departments: Building2,
  document: FileText,
  exhibitors: Building,
  feedback: MessageSquarePlus,
  locations: MapPin,
  maps: Map,
  menu: FolderOpen,
  merch: Shirt,
  people: Users,
  readme: BookOpenText,
  schedule: Calendar,
  search: Search,
  vendors: Store,
  villages: TentTree,
};

export const menuIcon = (key: MenuRouteKey): Component => icons[key];
