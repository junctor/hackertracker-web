"use client";

import * as React from "react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { sortConferences } from "@/lib/utils/misc";

export default function Navigation({
  conf,
  conferences,
}: {
  conf: HTConference;
  conferences: HTConference[];
}) {
  return (
    <div className="ml-2">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem className="md:block hidden">
            <NavigationMenuLink
              className={navigationMenuTriggerStyle()}
              href={`/schedule?conf=${conf.code}`}
            >
              {conf.name}
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Conferences</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ScrollArea className="h-60 rounded-md border w-80">
                <ul>
                  {sortConferences(conferences).map((conference) => (
                    <li key={conference.code} className="my-3">
                      <Link
                        href={`/schedule?conf=${conference.code}`}
                        legacyBehavior
                        passHref
                      >
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          <div>
                            <h4 className="text-base font-bold">
                              {conference.name}
                            </h4>
                            <p className="text-xs">{`${conference.start_date} - ${conference.end_date}`}</p>
                          </div>
                        </NavigationMenuLink>
                      </Link>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Mobile</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid grid-cols-2 w-80">
                <li>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    href="https://play.google.com/store/apps/details?id=com.shortstack.hackertracker&hl=en_US"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Android
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    href="https://itunes.apple.com/us/app/hackertracker/id1021141595?mt=8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    iOS
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
