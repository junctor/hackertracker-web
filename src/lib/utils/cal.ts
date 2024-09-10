import { BASEURL } from "./const";

const escapeICalText = (text: string) => {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
};

const iCalDesc = (event: HTEvent) => {
  const speakers = event.speakers.map((s) => s.name).join(", ");
  return `${event.description} - ${speakers}`;
};

const iCalDate = (eDate: Date) => {
  const day = `0${eDate.getUTCDate()}`.slice(-2);
  const month = `0${eDate.getUTCMonth() + 1}`.slice(-2);
  const hour = `0${eDate.getUTCHours()}`.slice(-2);
  const min = `0${eDate.getUTCMinutes()}`.slice(-2);
  const secs = `0${eDate.getUTCSeconds()}`.slice(-2);
  return `${eDate.getUTCFullYear()}${month}${day}T${hour}${min}${secs}Z`;
};

const foldLine = (line: string) => {
  const maxLength = 75;
  if (line.length <= maxLength) return line;
  let result = "";
  for (let i = 0; i < line.length; i += maxLength) {
    result += line.slice(i, i + maxLength) + "\r\n ";
  }
  return result.trim();
};

export const generateCal = (event: HTEvent) => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//hackertracker//${event.conference} Calendar 1.0//EN`,
    "BEGIN:VEVENT",
    `DTSTAMP:${iCalDate(new Date())}`,
    `UID:${event.id}`,
    `DTSTART:${iCalDate(new Date(event.begin))}`,
    `DTEND:${iCalDate(new Date(event.end))}`,
    "STATUS:CONFIRMED",
    "CATEGORIES:CONFERENCE",
    `SUMMARY:${escapeICalText(event.title)}`,
    `URL:${BASEURL}/event?conf=${event.conference}&event=${event.id}`,
    `LOCATION:${escapeICalText(event.location.name)}`,
    `DESCRIPTION:${escapeICalText(iCalDesc(event))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.map(foldLine).join("\r\n").trim();
};

export default generateCal;
