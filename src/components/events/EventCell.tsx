import { BookmarkIcon as BookmarkIconOutline } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkIconSoild } from "@heroicons/react/24/solid";

import Link from "next/link";
import { useEffect, useState } from "react";
import { timeDisplayParts } from "../../lib/utils/dates";
import { addBookmark, removeBookmark } from "../../lib/utils/storage";
import { Button } from "../ui/button";

export default function EventCell({
  confCode,
  event,
  bookmarked,
}: {
  confCode: string;
  event: EventData;
  bookmarked: boolean;
}) {
  const [bookmark, setBookmark] = useState(false);

  useEffect(() => {
    setBookmark(bookmarked);
  }, [bookmarked]);

  const eventBookmark = () => {
    if (!bookmark) {
      setBookmark(true);
      addBookmark(event.id);
    } else {
      setBookmark(false);
      removeBookmark(event.id);
    }
  };

  return (
    <div className="my-3 ml-2 mr-3" id={event.id.toString()}>
      <div className="items-center h-min-36 table">
        <div
          className={`table-cell w-0/12 px-1 bg-[${event.color}] rounded-sm`}
        />
        <div className="text-center items-center table-cell w-1/12 px-3 align-middle">
          {timeDisplayParts(event.begin).map((part) => (
            <p
              key={part}
              className="text-xs sm:text-sm md:text-sm lg:text-base font-bold"
            >
              {part}
            </p>
          ))}
        </div>
        <div className="w-10/12 table-cell pr-1">
          <Link
            href={`/event?c=${confCode.toLowerCase()}&e=${event.id}`}
            prefetch={false}
          >
            <button type="button" className="text-left">
              <h1
                className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-left break-words hover:text-[${event.color}]`}
              >
                {event.title}
              </h1>

              <p className="text-xs sm:text-sm md:text-sm lg:text-base ">
                {event.speakers}
              </p>

              <p className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-400">
                {event.location}
              </p>
            </button>
          </Link>
        </div>

        <div className="mx-1 sm:mx-2 md:mx-3 lg:mx-4 table-cell w-1/12 items-end ">
          <Button
            variant="ghost"
            className="w-10 align-middle mx-2 sm:mx-3 md:mx-4 lg:mx-5"
            onClick={() => {
              eventBookmark();
            }}
          >
            <div>
              {bookmark ? (
                <BookmarkIconSoild className="h-4 sm:h-5 md:h-6 lg:h-7" />
              ) : (
                <BookmarkIconOutline className="h-4 sm:h-5 md:h-6 lg:h-7" />
              )}
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
