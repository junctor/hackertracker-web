import {
  ClockIcon,
  CalendarIcon,
  SewingPinIcon,
  Share2Icon,
} from "@radix-ui/react-icons";

import cal from "../../lib/utils/cal";
import { eventTime } from "../../lib/utils/dates";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { BASEURL } from "@/lib/utils/const";
import React from "react";
import Markdown from "../markdown/Markdown";

function Event({
  conf,
  event,
  tags,
}: {
  conf: HTConference;
  event: HTEvent;
  tags: HTTag[];
}) {
  const allTags = tags?.flatMap((t) => t.tags) ?? [];

  const eventTags =
    event?.tag_ids
      ?.map((t) => allTags.find((a) => a.id === t))
      ?.filter((tag) => tag !== undefined) ?? [];

  return (
    <div className="mx-5">
      <div className="flex">
        <div className="my-2 justify-start flex-auto">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`../schedule?conf=${conf.code}`}>
                    {conf.name} Schedule
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </BreadcrumbList>
          </Breadcrumb>
          <div className="my-3">
            <h1
              style={{ color: event?.type?.color }}
              className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-5 mr-3"
            >
              {event.title}
            </h1>
          </div>
        </div>
        <div className="mr-10 ml-5 content-center justify-end flex-none hidden md:block">
          <div className="flex">
            <a
              href={`data:text/calendar;charset=utf8,${encodeURIComponent(
                cal(event)
              )}`}
              download={`${event.conference}-${event.id}.ics`}
            >
              <CalendarIcon className="h-5 w-5 md:h-7 md:w-7 lg:w-8 lg:h-8 mr-2" />
            </a>
            {typeof navigator.share === "function" && (
              <Share2Icon
                className="h-5 w-5 md:h-7 md:w-7 lg:w-8 lg:h-8 mr-2"
                onClick={async (): Promise<void> => {
                  try {
                    await navigator.share({
                      title: event.title,
                      url: `${BASEURL}/event/?id=${event.id}`,
                    });
                  } catch (e) {
                    console.error(e);
                    return;
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
      <div className="font-bold">
        <div className="flex items-center my-2 cursor-pointer">
          <a
            className="flex"
            href={`data:text/calendar;charset=utf8,${encodeURIComponent(
              cal(event)
            )}`}
            download={`${event.conference}-${event.id}.ics`}
          >
            <ClockIcon className="h-5 w-5 md:h-7 md:w-7 lg:w-8 lg:h-8 mr-2" />
            <p className="md:text-sm lg:text-base text-xs">
              {event.end_timestamp.seconds !== event.begin_timestamp.seconds
                ? `${eventTime(new Date(event.begin), false)} - ${eventTime(
                    new Date(event.end),
                    true
                  )}`
                : `${eventTime(new Date(event.begin), true)}`}
            </p>
          </a>
        </div>
        <div className="flex items-center my-2">
          <SewingPinIcon className="h-5 w-5 md:h-7 md:w-7 lg:w-8 lg:h-8 mr-2" />
          <p className="md:text-sm lg:text-base text-xs">
            {event.location.name}
          </p>
        </div>
        <div className="inline-grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 md:gap-1 gap-y-2 md:gap-y-3 w-10/12">
          {eventTags
            .sort((a, b) =>
              a.sort_order !== b.sort_order
                ? a.sort_order - b.sort_order
                : a.label.localeCompare(b.label)
            )
            ?.map((tag) => (
              <div
                className="flex items-center mr-3 md:mr-4 lg:mr-5"
                key={tag.id}
              >
                <span
                  style={{ backgroundColor: tag.color_background }}
                  className="rounded-full h-3 w-3 md:h-4 md:w-4 mr-2 green inline-flex flex-none"
                />
                <p className="text-xs md:text-sm">{tag.label}</p>
              </div>
            ))}
        </div>
      </div>
      <div className="mt-10">
        <div className="text-sm md:text-base">
          <Markdown content={event.description} />
          {(event.links ?? []).length > 0 && (
            <div className="mt-5 text-left">
              <h2 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
                Links
              </h2>
              <ul className="list-disc text-xs sm:text-sm md:text-base lg:text-lg ml-5 mt-2">
                {(event.links ?? []).map((l) => (
                  <li key={l.url}>
                    <a href={l.url}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {event.speakers.length > 0 && (
        <div className="mt-10 text-left">
          <h2 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
            People
          </h2>
          <div className="items-center mt-1 mb-2 pt-2 pb-2">
            {event.speakers
              .sort(
                (a) =>
                  (findSortOrder(event.people, a.id) ?? 0) -
                  (findSortOrder(event.people, a.id) ?? 0)
              )
              .map((s) => (
                <div
                  key={s.id}
                  className="ml-3 table mt-2 mb-2 align-middle items-center"
                >
                  <div
                    className={`ml-1 table-cell h-full w-1 sm:w-2 mr-3 rounded-md`}
                  />
                  <Link href={`/person?conf=${conf.code}&person=${s.id}`}>
                    <div className="inline-block text-left ml-2">
                      <p className="font-bold text-sm sm:text-md md:text-base lg:text-lg">
                        {s.name}
                      </p>

                      {s.title != null && (
                        <p className="text-xs sm:text-xs md:text-xs lg:text-sm">
                          {s.title}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function findSortOrder(people: HTPeople[], id: number) {
  return people.find((p) => p.person_id === id)?.sort_order;
}

export default Event;
