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
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { useState } from "react";
import Link from "next/link";

export default function Search({
  confCode,
  dateGroup,
}: {
  confCode: string;
  dateGroup: Map<string, EventData[]>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button variant="ghost" size="icon">
        <MagnifyingGlassIcon
          className="h-6"
          onClick={() => {
            setOpen(!open);
          }}
        />
      </Button>
      <Command>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              {Array.from(dateGroup.values())
                .flatMap((e) => e)
                .sort((a, b) =>
                  a.title.toLowerCase().localeCompare(b.title.toLowerCase())
                )
                .map((e) => (
                  <CommandItem key={e.id} value={e.title}>
                    <Link
                      href={`/event?c=${confCode}&e=${e.id}`}
                      prefetch={false}
                      className={`hover:text-[${e.color}] font-bold`}
                    >
                      {e.title}
                    </Link>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </Command>
    </div>
  );
}
