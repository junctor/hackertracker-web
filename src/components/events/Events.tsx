"use client";

import { useState } from "react";
import { tabDateTitle } from "../../lib/utils/dates";
import EventDisplay from "./EventDisplay";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Search from "./Search";

export default function Events({
  conf,
  dateGroup,
}: {
  conf: HTConference;
  dateGroup: Map<string, EventData[]>;
}) {
  const [day, setDay] = useState(
    (dateGroup.keys().next().value as string) ?? ""
  );

  return (
    <div>
      <div className="items-center grid bg-background py-3 align-middle grid-cols-1 md:grid-cols-4 gap-1">
        <div>
          <h1 className="text-base sm:text-base md:text-lg lg:text-xl font-bold">
            {conf.name}
          </h1>
        </div>
        <div className="col-span-2 order-last md:order-none">
          <Tabs
            value={day}
            defaultValue={day}
            onValueChange={(value) => {
              setDay(value);
            }}
          >
            <TabsList>
              {Array.from(dateGroup).map(([tabDay]) => (
                <TabsTrigger value={tabDay} key={tabDay}>
                  <p className="text-xs md:text-sm">{tabDateTitle(tabDay)}</p>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="justify-self-end pr-5 items-center align-middle">
          <Search confCode={conf.code.toLowerCase()} dateGroup={dateGroup} />
        </div>
      </div>
      <div className="mx-2">
        <EventDisplay htEvents={dateGroup.get(day) ?? []} conf={conf} />
      </div>
    </div>
  );
}
