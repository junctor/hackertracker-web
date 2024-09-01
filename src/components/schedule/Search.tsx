import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "../ui/button";
import { useState } from "react";
import React from "react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import Link from "next/link";

export default function Search({
  dateGroup,
  confCode,
}: {
  dateGroup: Map<string, EventData[]>;
  confCode: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon">
        <MagnifyingGlassIcon
          className="h-6"
          onClick={() => {
            setOpen(!open);
          }}
        />
      </Button>
      <Command className="rounded-lg  shadow-md">
        <CommandDialog open={open} onOpenChange={setOpen}>
          <VisuallyHidden>
            <DialogTitle>Search Dialog</DialogTitle>
          </VisuallyHidden>
          <VisuallyHidden>
            <DialogDescription>Search for events</DialogDescription>
          </VisuallyHidden>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Events">
              {Array.from(dateGroup.values())
                .flatMap((e) => e)
                .sort((a, b) =>
                  a.title.toLowerCase().localeCompare(b.title.toLowerCase())
                )
                .map((e) => (
                  <CommandItem key={e.id} value={e.title}>
                    <Link
                      href={`../event?conf=${confCode}&event=${e.id}`}
                      prefetch={false}
                      className="font-bold"
                    >
                      {e.title}
                    </Link>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </Command>
    </>
  );
}
