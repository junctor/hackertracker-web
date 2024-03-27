"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Navigation({
  conferences,
}: {
  conferences: HTConference[];
}) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Conferences</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ScrollArea className="h-96 w-48 rounded-md border">
              <ul className="p-4">
                {conferences
                  .sort(
                    (a, b) =>
                      b.start_timestamp.seconds - a.start_timestamp.seconds
                  )
                  .map((conference) => (
                    <ListItem
                      href={`/events?c=${conference.code.toLowerCase()}`}
                      title={conference.name}
                      key={conference.code}
                    >
                      {conference.start_date}
                    </ListItem>
                  ))}
              </ul>
            </ScrollArea>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Mobile</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 w-36">
              <ListItemTitleOnly
                href="https://play.google.com/store/apps/details?id=com.shortstack.hackertracker&hl=en_US"
                title="Android"
                target="_blank"
                rel="noopener noreferrer"
              />
              <ListItemTitleOnly
                href="https://itunes.apple.com/us/app/hackertracker/id1021141595?mt=8"
                title="iOS"
                target="_blank"
                rel="noopener noreferrer"
              />
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = "ListItem";

const ListItemTitleOnly = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItemTitleOnly.displayName = "ListItemTitleOnly";
