"use client";

import React from "react";
import Search from "./Search";
import { useSearchParams } from "next/navigation";
import { PersonIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import Link from "next/link";
import { toEventsData } from "@/lib/utils/misc";
import EventsTable from "./EventsTable";
import { TagsFilter } from "./EventFilters";
import { createDateGroup } from "@/lib/utils/dates";

export default function Events({
  events,
  conf,
  tags,
}: {
  events: HTEvent[];
  conf: HTConference;
  tags: HTTag[];
}) {
  const searchParams = useSearchParams();
  const tagId = parseInt(searchParams.get("tag") ?? "0") ?? 0;

  const eventData = toEventsData(events, tags);

  const dateGroup = createDateGroup(eventData);

  return (
    <>
      <div>
        <div className="ml-2 md:ml-5 items-center grid bg-background mx-2 my-5 align-middle grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold font-mono ml-2">
              {conf.name}
            </h1>
          </div>

          <div className="justify-self-end align-middle flex">
            <span className="mr-5">
              <TagsFilter tagId={tagId} tags={tags} conf={conf} />
            </span>
            <div className="flex items-center">
              <Button variant="ghost" size="icon">
                <Link href={`/people?conf=${conf.code}`}>
                  <PersonIcon className="h-6" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center">
              <Search dateGroup={dateGroup} confCode={conf.code} />
            </div>
          </div>
        </div>

        <div className="w-full mb-5">
          <EventsTable dateGroup={dateGroup} conf={conf} tagId={tagId} />
        </div>
      </div>
    </>
  );
}
