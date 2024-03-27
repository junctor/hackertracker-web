import EventCell from "./EventCell";
import {
  Table,
  TableBody,
  TableCaption,
  TableRow,
} from "@/components/ui/table";

export default function EventDisplay({
  conf,
  htEvents,
}: {
  conf: HTConference;
  htEvents: EventData[];
}) {
  return (
    <div className="mb-10">
      <Table>
        <TableCaption>Events for {conf.name}</TableCaption>
        <TableBody>
          {htEvents.map((htEvent) => (
            <TableRow key={htEvent.id} id={`e-${htEvent.id}`}>
              <EventCell event={htEvent} confCode={conf.code} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
