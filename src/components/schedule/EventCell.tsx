import Link from "next/link";
import { timeDisplayParts } from "../../lib/utils/dates";
import { TableCell } from "@/components/ui/table";

export default function EventCell({
  confCode,
  event,
}: {
  confCode: string;
  event: EventData;
}) {
  return (
    <div>
      <Link href={`../event?id=${event.id}`} prefetch={false}>
        <TableCell className="text-center align-middle">
          {timeDisplayParts(event.begin).map((part) => (
            <p
              key={part}
              className="text-xs sm:text-sm md:text-sm lg:text-base font-bold"
            >
              {part}
            </p>
          ))}
        </TableCell>
        <TableCell>
          <h1
            className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-left break-words hover:text-[${event.color}]`}
          >
            {event.title}
          </h1>
          <p className="text-xs md:text-sm lg:text-base font-bold">
            {event.speakers}
          </p>
          <div className="flex items-center">
            <p className="text-xs md:text-sm lg:text-base text-gray-400">
              {event.location}
            </p>
            <p className="text-xs md:text-sm lg:text-base text-gray-400 mx-2">
              /
            </p>
            <p
              className={`text-xs md:text-sm lg:text-base text-[${event.color}]`}
            >
              {event.category}
            </p>
          </div>
        </TableCell>
      </Link>
    </div>
  );
}
