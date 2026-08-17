import type { Sortable } from "../types/hackertracker";

export function sortOrderOf(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  const sortable = value as Sortable;
  const order = sortable.sortOrder ?? sortable.sort_order;
  return typeof order === "number" && Number.isFinite(order) ? order : null;
}

export function compareBySortOrder(left: unknown, right: unknown): number {
  const leftOrder = sortOrderOf(left);
  const rightOrder = sortOrderOf(right);
  if (leftOrder === null && rightOrder === null) return 0;
  if (leftOrder === null) return 1;
  if (rightOrder === null) return -1;
  return leftOrder - rightOrder;
}
