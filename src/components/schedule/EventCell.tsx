import { eventTimeTable } from "../../lib/utils/dates";
import { TableCell, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import React from "react";

export default function EventCell({
  conf,
  event,
}: {
  conf: string;
  event: EventData;
}) {
  const router = useRouter();
  const eventUrl = `../event?conf=${conf}&event=${event.id}`;

  return (
    <TableRow
      id={`e-${event.id}`}
      className="cursor-pointer"
      onClick={() => router.push(eventUrl)}
    >
      <TableCell className="relative align-middle">
        <div
          className="absolute top-1 bottom-1 left-1 w-1 md:w-2 lg:w-3 rounded"
          style={{ background: event.color }}
        />
      </TableCell>
      <TableCell className="align-middle">
        <p className="text-xs md:text-sm">{eventTimeTable(event.begin)}</p>
      </TableCell>
      <TableCell className="align-middle hidden md:table-cell">
        <p className="text-xs md:text-sm">{eventTimeTable(event.end)}</p>
      </TableCell>
      <TableCell className="align-middle">
        <div>
          <a href={eventUrl}>
            <h1 className="text-sm md:text-base font-bold break-words max-w-96 drop-shadow-sm	">
              {event.title}
            </h1>
            <p className="text-xs md:text-sm mt-1 italic">{event.speakers}</p>
          </a>
        </div>
      </TableCell>
      <TableCell className="align-middle">
        <p className="text-xs md:text-sm">{event.location}</p>
      </TableCell>
      <TableCell className="align-middle">
        <div>
          {event.tags
            ?.sort((a, b) => (a.sort_order > b.sort_order ? 1 : -1))
            ?.map((tag) => (
              <div className="flex items-center mr-2" key={tag.id}>
                <span
                  style={{ backgroundColor: tag.color_background }}
                  className="rounded-full h-2 w-2 green inline-flex flex-none m-1"
                />
                <p className="text-xs">{tag.label}</p>
              </div>
            ))}
        </div>
      </TableCell>
    </TableRow>
  );
}
