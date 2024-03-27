import EventCell from "./EventCell";
import {
  Table,
  TableBody,
  TableCaption,
  TableRow,
} from "@/components/ui/table";

export default function EventDisplay({
  confCode,
  htEvents,
}: {
  confCode: string;
  htEvents: EventData[];
}) {
  return (
    <div className="mb-10">
      <Table>
        <TableCaption>Events for {confCode}</TableCaption>
        <TableBody>
          {htEvents.map((htEvent) => (
            <TableRow key={htEvent.id} id={`e-${htEvent.id}`}>
              <EventCell event={htEvent} confCode={confCode} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
