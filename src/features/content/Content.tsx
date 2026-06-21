import { useEffect, useState } from "react";

import type { HTConference, HTContent, HTLocation, HTPerson, HTTagGroup } from "@/types/db";

import { ConferenceHeader } from "@/components/ConferenceHeader";
import ErrorPage from "@/components/ErrorPage";
import { HTFooter } from "@/components/HTFooter";
import LoadingPage from "@/components/LoadingPage";
import {
  getCachedConferenceByCode,
  getCachedContentById,
  getCachedLocations,
  getCachedTags,
  getConferenceByCode,
  getContentById,
  getLocations,
  getSpeakersByIds,
  getTags,
} from "@/lib/db";
import { useNormalizedParams } from "@/lib/utils/params";
import { getContentPersonIds } from "@/lib/utils/schedule";

import ContentDetails from "./ContentDetails";

function getCachedContentDetails(confCode: string, contentId: number) {
  const conference = getCachedConferenceByCode(confCode);
  const content = getCachedContentById(confCode, contentId);
  const tags = getCachedTags(confCode);
  const locations = getCachedLocations(confCode);
  if (!conference || !content || !tags) return null;

  return {
    conference,
    content,
    tags,
    locations: locations ?? [],
  };
}

export function ContentDetailPage() {
  const { confCode, contentId } = useNormalizedParams();
  const [initial] = useState(() =>
    confCode && contentId ? getCachedContentDetails(confCode, contentId) : null,
  );

  const [content, setContent] = useState<HTContent | null>(initial?.content ?? null);
  const [people, setPeople] = useState<HTPerson[]>([]);
  const [tagGroups, setTagGroups] = useState<HTTagGroup[]>(initial?.tags ?? []);
  const [locations, setLocations] = useState<HTLocation[]>(initial?.locations ?? []);
  const [conference, setConference] = useState<HTConference | null>(initial?.conference ?? null);
  const [loading, setLoading] = useState(!initial);
  const [error, setError] = useState<string | null>(null);

  // Title reflects state
  useEffect(() => {
    if (error && !conference) {
      document.title = "Error · Content | Hacker Tracker";
    } else if (loading) {
      document.title = "Loading content… | Hacker Tracker";
    } else if (conference && content) {
      document.title = `${content.title} · ${conference.name} | Hacker Tracker`;
    } else {
      document.title = "Content | Hacker Tracker";
    }
  }, [loading, conference, content, error]);

  // Validate required params early
  useEffect(() => {
    if (!confCode || !contentId) {
      setError("Missing required URL parameters.");
      setLoading(false);
    } else {
      setError(null);
    }
  }, [confCode, contentId]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!confCode || !contentId) return;

      setError(null);

      const cachedDetails = getCachedContentDetails(confCode, contentId);

      if (cachedDetails) {
        setConference(cachedDetails.conference);
        setContent(cachedDetails.content);
        setTagGroups(cachedDetails.tags);
        setLocations(cachedDetails.locations);
        setPeople([]);
        setLoading(false);
      } else {
        setLoading(true);
        setContent(null);
        setPeople([]);
        setTagGroups([]);
        setLocations([]);
        setConference(null);
      }

      try {
        const conf = await getConferenceByCode(confCode);
        if (cancelled) return;
        if (!conf) {
          setError("Conference not found");
          return;
        }
        setConference(conf);

        const content = await getContentById(confCode, contentId);
        if (cancelled) return;
        if (!content) {
          setError("Content not found");
          return;
        }

        const personIds = getContentPersonIds(content);
        const [tags, speakers, contentLocations] = await Promise.all([
          getTags(confCode),
          personIds.length ? getSpeakersByIds(confCode, personIds) : Promise.resolve([]),
          getLocations(confCode),
        ]);
        if (cancelled) return;

        setPeople(speakers);
        setTagGroups(tags);
        setLocations(contentLocations);
        setContent(content);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to load content";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [confCode, contentId]);

  if (loading && !conference && !content) {
    return (
      <div className="ui-page flex flex-col">
        <main className="flex-1">
          <LoadingPage message="Loading content..." />
        </main>
        <HTFooter />
      </div>
    );
  }

  if (error && !conference) {
    return (
      <div className="ui-page flex flex-col">
        <main className="flex-1">
          <ErrorPage msg={error} />
        </main>
        <HTFooter />
      </div>
    );
  }

  return (
    <div className="ui-page flex flex-col">
      <main className="flex-1">
        {conference && <ConferenceHeader conference={conference} />}
        {conference && content ? (
          <ContentDetails
            content={content}
            conference={conference}
            people={people}
            tagGroups={tagGroups}
            locations={locations}
          />
        ) : error ? (
          <ErrorPage msg={error} />
        ) : null}
      </main>
      <HTFooter />
    </div>
  );
}
