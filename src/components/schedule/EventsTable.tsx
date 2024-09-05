import { eventDayTable, tabDateTitle } from "@/lib/utils/dates";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import EventCell from "./EventCell";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "../ui/button";

const DayButton = ({
  day,
  isActive,
  onClick,
}: {
  day: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <Button
    className="mx-1"
    variant={isActive ? "default" : "outline"}
    onClick={onClick}
  >
    {tabDateTitle(day)}
  </Button>
);

export default function EventsTable({
  dateGroup,
  conf,
  tagId: selectedTag,
}: {
  dateGroup: Map<string, EventData[]>;
  conf: HTConference;
  tagId: number;
}) {
  const dayRefs = useRef(new Map<string, HTMLDivElement>());
  const [activeDay, setActiveDay] = useState<string | null>(null);

  const filteredDateGroup = useMemo(() => {
    return Array.from(dateGroup)
      .map(([day, events]) => {
        const filteredEvents = events.filter(
          (e) => selectedTag === 0 || e.tags?.some((t) => t.id === selectedTag)
        );
        return { day, filteredEvents };
      })
      .filter(({ filteredEvents }) => filteredEvents.length > 0);
  }, [dateGroup, selectedTag]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveDay(entry.target.getAttribute("data-day"));
          }
        });
      },
      { threshold: 0.5 }
    );

    dayRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [filteredDateGroup]);

  const scrollToDay = (day: string) => {
    const dayRow = dayRefs.current.get(day);
    if (!dayRow) return; // Ensure dayRow exists

    const headerOffset = 120;
    const elementPosition = dayRow.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  return (
    <div>
      {/* Day buttons */}
      <div
        className="py-2 flex justify-center sticky top-[60px] bg-background z-10"
        style={{ height: "60px" }}
      >
        {filteredDateGroup.map(({ day }) => (
          <DayButton
            key={day}
            day={day}
            isActive={activeDay === day}
            onClick={() => scrollToDay(day)}
          />
        ))}
      </div>

      {/* Event day sections */}
      {filteredDateGroup.map(({ day, filteredEvents }) => (
        <React.Fragment key={day}>
          <div
            ref={(el) => {
              if (el) {
                dayRefs.current.set(day, el);
              }
            }}
            data-day={day}
          >
            <h2 className="font-bold text-lg md:text-xl ml-5 mt-2 mb-1">
              {eventDayTable(day)}
            </h2>
          </div>

          {/* Event table */}
          {filteredEvents.length > 0 && (
            <Table className="w-full mb-10">
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>Start</TableHead>
                  <TableHead className="md:table-cell hidden">End</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((htEvent) => (
                  <EventCell
                    key={htEvent.id}
                    conf={conf.code}
                    event={htEvent}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
