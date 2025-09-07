import { useSearchParams } from "react-router";

export function useNormalizedParams() {
  const [sp] = useSearchParams();
  const confCode = sp.get("conf")?.trim().toUpperCase(); // case-insensitive conf
  const event = sp.get("event");
  const person = sp.get("person");
  const eventId = event && /^\d+$/.test(event) ? Number(event) : undefined;
  const personId = person && /^\d+$/.test(person) ? Number(person) : undefined;
  return { confCode, eventId, personId };
}
