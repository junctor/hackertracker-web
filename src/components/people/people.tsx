import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

export default function People({
  people,
  conf,
}: {
  people: HTSpeaker[];
  conf: HTConference;
}) {
  const router = useRouter();

  return (
    <>
      <div className="mx-5 bg-background">
        <h1 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl">
          {`${conf.name} People`}
        </h1>
        <Table>
          <TableCaption>People</TableCaption>
          <TableBody>
            {people
              .sort((a, b) =>
                a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
              )
              .map((s) => (
                <TableRow
                  key={s.id}
                  onClick={() =>
                    router.push(`/person?conf=${conf.code}&person=${s.id}`)
                  }
                >
                  <TableCell>{s.name}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
