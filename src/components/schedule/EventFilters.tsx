import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { useRouter } from "next/navigation";

export function TagsFilter({
  tagId,
  tags,
  conf,
}: {
  tagId: number;
  tags: HTTag[];
  conf: HTConference;
}) {
  const router = useRouter();

  const selectedTagDetails = tags
    ?.flatMap((t) => t.tags)
    ?.find((e) => e.id === tagId);

  return (
    <Select
      onValueChange={(e) => {
        router.push(`/schedule?conf=${conf.code}&tag=${e}`);
      }}
    >
      <SelectTrigger className="w-40 md:w-48 lg:w-56">
        <SelectValue
          placeholder={selectedTagDetails?.label ?? "Select a tag"}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="0">All events</SelectItem>
        </SelectGroup>
        {tags
          ?.filter(
            (tag) =>
              tag.is_browsable &&
              tag.tags.length > 0 &&
              tag.category == "content"
          )
          .sort((a, b) => (a.sort_order > b.sort_order ? 1 : -1))
          .map((tag) => (
            <SelectGroup key={tag.id}>
              <SelectLabel>{tag.label}</SelectLabel>
              {tag.tags.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
      </SelectContent>
    </Select>
  );
}
