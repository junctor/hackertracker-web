"use client";

import React from "react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import EventCell from "../schedule/EventCell";

export default function Upcoming({
  conf,
  onNowEvents,
  upcomingEvents,
  tags,
}: {
  conf: HTConference;
  onNowEvents: EventData[];
  upcomingEvents: EventData[];
  tags: HTTag[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagId = searchParams.get("tag") ?? "0";

  const [selectedTag, setSelectedTag] = useState(parseInt(tagId));

  const selectedTagDetails = tags
    .flatMap((t) => t.tags)
    .find((e) => e.id === parseInt(tagId));

  const filteredOnNowEvents = (
    tagId !== "0"
      ? onNowEvents.filter((e) => e.tags?.some((t) => t.id == selectedTag))
      : onNowEvents
  ).sort((a, b) => a.beginTimestampSeconds - b.beginTimestampSeconds);

  const filteredUpcomingEvents = (
    tagId !== "0"
      ? upcomingEvents.filter((e) => e.tags?.some((t) => t.id == selectedTag))
      : upcomingEvents
  ).sort((a, b) => a.beginTimestampSeconds - b.beginTimestampSeconds);

  const tabs = new Map([
    ["On Now", filteredOnNowEvents],
    ["Upcoming", filteredUpcomingEvents],
  ]);

  const [tab, setTab] = useState("On Now");

  return (
    <>
      <div>
        <div className="ml-2 md:ml-5 items-center grid bg-background mx-2 my-5 align-middle grid-cols-2 gap-1">
          <div>
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold font-mono ml-2">
              On Now and Upcoming
            </h1>
          </div>

          <div className="justify-self-end align-middle flex">
            <span className="mr-5">
              <Select
                onValueChange={(e) => {
                  setSelectedTag(parseInt(e) ?? 0);
                  router.push(`/upcoming?conf=${conf.code}&tag=${e}`);
                }}
              >
                <SelectTrigger className="w-44 md:w-48">
                  <SelectValue
                    placeholder={selectedTagDetails?.label ?? "Select a tag"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="0">All events</SelectItem>
                  </SelectGroup>
                  {tags
                    .filter(
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
            </span>
          </div>
        </div>

        <div className="mb-5 place-content-center flex ">
          <Tabs
            value={tab}
            defaultValue={tab}
            onValueChange={(value) => {
              setTab(value);
            }}
          >
            <TabsList>
              {Array.from(tabs.keys()).map((t) => (
                <TabsTrigger value={t} key={t}>
                  <p className="text-xs md:text-sm">{t}</p>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="mb-10">
          <Table className="w-full">
            <TableCaption>{`${tab} Events for ${conf.name}`}</TableCaption>
            <TableBody>
              {(tabs.get(tab) ?? []).map((htEvent) => (
                <EventCell conf={conf.code} key={htEvent.id} event={htEvent} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
