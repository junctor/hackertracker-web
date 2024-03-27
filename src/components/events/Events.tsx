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
      <div className="items-center flex bg-background py-3">
        <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mr-5 md:mr-7 lg:mr-10 ml-2">
          {conf.name}
        </h1>
        <div>
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
        <div className="flex flex-grow justify-end pr-5 items-center">
          <Search confCode={conf.code.toLowerCase()} dateGroup={dateGroup} />
        </div>
      </div>
      <div className="mx-2">
        <EventDisplay
          htEvents={dateGroup.get(day) ?? []}
          confCode={conf.code}
        />
      </div>
    </div>
  );
}
