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
  conferences,
}: {
  conferences: HTConference[];
}) {
  return (
    <div className="ml-2">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Conferences</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ScrollArea className="h-52 rounded-md border">
                <ul>
                  {sortConferences(conferences).map((conference) => (
                    <li key={conference.code}>
                      <Link
                        href={`../../${conference.code}/schedule`}
                        legacyBehavior
                        passHref
                      >
                        <NavigationMenuLink
                          className={navigationMenuTriggerStyle()}
                        >
                          {conference.name}
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
              <ul className="grid grid-cols-2 w-56">
                <li>
                  <Link
                    href="https://play.google.com/store/apps/details?id=com.shortstack.hackertracker&hl=en_US"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Android
                    </NavigationMenuLink>
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://itunes.apple.com/us/app/hackertracker/id1021141595?mt=8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      iOS
                    </NavigationMenuLink>
                  </Link>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
