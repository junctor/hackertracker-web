import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

export default function People({
  people,
  conf,
}: {
  people: HTSpeaker[];
  conf: HTConference;
}) {
  const router = useRouter();

  const handleCardClick = (speakerId: string) => {
    router.push(`/person?conf=${conf.code}&person=${speakerId}`);
  };

  return (
    <div className="mx-5 bg-background">
      <h1 className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl mb-6 my-5">
        {`${conf.name} People`}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {people
          .sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          )
          .map((s) => (
            <Card
              key={s.id}
              className="hover:shadow-lg transition-shadow cursor-pointer p-4 flex items-center justify-center text-center"
              onClick={() => handleCardClick(s.id)}
            >
              <h2 className="text-lg font-semibold">{s.name}</h2>
            </Card>
          ))}
      </div>
    </div>
  );
}