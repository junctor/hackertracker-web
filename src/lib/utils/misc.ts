export const fetcher = async (...args: Parameters<typeof fetch>) =>
  await fetch(...args).then(async (res) => await res.json());

export const toEventsData = (events: HTEvent[]): EventData[] => {
  const formatter = new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  });

  return events.map((e) => ({
    id: e.id,
    begin: e.begin,
    beginTimestampSeconds: e.begin_timestamp.seconds,
    end: e.end,
    title: e.title,
    location: e.location.name,
    color: e.type.color,
    category: e.type.name,
    speakers: formatter.format(e.speakers.map((s) => s.name)),
  }));
};
