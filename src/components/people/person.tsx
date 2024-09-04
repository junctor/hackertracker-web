import Link from "next/link";
import { eventTime } from "../../lib/utils/dates";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Markdown from "../markdown/Markdown";

function Person({
  person,
  events,
  conf,
}: {
  person: HTSpeaker;
  events: HTEvent[];
  conf: HTConference;
}) {
  const speakerEvents = events.filter((event) =>
    person.event_ids.includes(event.id)
  );

  return (
    <div className="mx-5">
      <div className="my-2 justify-start flex-auto">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={`/people?conf=${conf.code}`}>People</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </BreadcrumbList>
        </Breadcrumb>
        <div className="my-3">
          <h1 className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-5 mr-3">
            {person.name}
          </h1>
        </div>
      </div>
      <div>
        {person.affiliations.length > 0 && (
          <div>
            {person.affiliations.map((a) => (
              <div
                key={a.organization}
                className="text-sm md:text-base lg:text-lg"
              >
                <p>{a.organization}</p>
                <p>{a.title}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-8">
        <div className="text-sm md:text-base lg:text-lg w-11/12">
          <Markdown content={person.description} />
        </div>
      </div>
      {person.links.length > 0 && (
        <div className="mt-8 text-left">
          <h2 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
            Links
          </h2>
          <ul className="list-disc text-xs sm:text-sm md:text-base lg:text-lg ml-5 mt-2">
            {person.links
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((l) => (
                <li key={l.url}>
                  <a href={l.url}>{l.title}</a>
                </li>
              ))}
          </ul>
        </div>
      )}
      {speakerEvents.length > 0 && (
        <div className="mt-8 text-left">
          <h2 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
            Events
          </h2>
          <div className="items-center w-11/12 mt-2 rounded-lg mb-10 pt-2 pb-2">
            {speakerEvents.map((e) => (
              <div
                key={e.id}
                className="ml-3 table mt-2 mb-2 align-middle items-center"
              >
                <div
                  style={{ backgroundColor: e?.type?.color }}
                  className="table-cell h-full w-1 md:w-2 rounded-md"
                />
                <div className="text-left ml-2">
                  <Link href={`/event?conf=${conf.code}&event=${e.id}`}>
                    <button type="button" className="text-left">
                      <p className="font-bold text-xs sm:text-sm md:text-base lg:text-lg">
                        {e.title}
                      </p>

                      <p className="text-xs sm:text-sm md:text-sm lg:text-base">
                        {`${eventTime(new Date(e.begin), false)} - ${eventTime(
                          new Date(e.end)
                        )}`}
                      </p>
                      <p className="text-xs sm:text-sm md:text-sm lg:text-base">
                        {e.location.name}
                      </p>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Person;
