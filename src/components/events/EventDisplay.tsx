import { getBookmarks } from "../../lib/utils/storage";
import EventCell from "./EventCell";

export default function EventDisplay({
  confCode,
  htEvents,
}: {
  confCode: string;
  htEvents: EventData[];
}) {
  const bookmarks = getBookmarks();

  const isBookMarked = (id: number) => bookmarks.includes(id);

  return (
    <div>
      {htEvents.map((htEvent) => (
        <div key={htEvent.id} id={`e-${htEvent.id}`}>
          <EventCell
            event={htEvent}
            bookmarked={isBookMarked(htEvent.id)}
            confCode={confCode}
          />
        </div>
      ))}
    </div>
  );
}
