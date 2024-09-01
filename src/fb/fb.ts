import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
  getDoc,
  doc,
} from "firebase/firestore/lite";

import { type Firestore } from "firebase/firestore";

export async function getConferences(
  db: Firestore,
  count = 10
): Promise<HTConference[]> {
  const docRef = collection(db, "conferences");
  const q = query(docRef, orderBy("updated_at", "desc"), limit(count));
  const docSnap = await getDocs(q);
  const firebaseData = docSnap.docs.map((eventsDoc) => eventsDoc.data());

  return firebaseData as HTConference[];
}

export async function getEvents(db: Firestore, conference: string) {
  const docRef = collection(db, "conferences", conference, "events");
  const q = query(docRef, orderBy("begin_timestamp", "desc"));
  const docSnap = await getDocs(q);
  const firebaseData = docSnap.docs.map((eventsDoc) => eventsDoc.data());

  return firebaseData as HTEvent[];
}

export async function getOnNowEvents(db: Firestore, conference: string) {
  const currentTime = Timestamp.now();

  const docRef = collection(db, "conferences", conference, "events");
  const q = query(
    docRef,
    where("begin_timestamp", "<=", currentTime),
    where("end_timestamp", ">=", currentTime),
    orderBy("begin_timestamp", "desc")
  );

  const docSnap = await getDocs(q);
  const ongoingEvents = docSnap.docs.map((eventsDoc) => eventsDoc.data());

  return ongoingEvents as HTEvent[];
}

export async function getUpcomingEvents(db: Firestore, conference: string) {
  const currentTime = Timestamp.now();
  const twoHoursLater = new Timestamp(
    currentTime.seconds + 2 * 60 * 60,
    currentTime.nanoseconds
  );

  const docRef = collection(db, "conferences", conference, "events");
  const q = query(
    docRef,
    where("begin_timestamp", ">", currentTime),
    where("begin_timestamp", "<=", twoHoursLater),
    orderBy("begin_timestamp", "asc"),
    limit(10)
  );

  const docSnap = await getDocs(q);
  const upcomingEvents = docSnap.docs.map((eventsDoc) => eventsDoc.data());

  return upcomingEvents as HTEvent[];
}

export async function getEventById(
  db: Firestore,
  conference: string,
  eventId: string
) {
  try {
    const docRef = doc(db, "conferences", conference, "events", eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as HTEvent;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    return null;
  }
}

export async function getTags(db: Firestore, conference: string) {
  const docRef = collection(db, "conferences", conference, "tagtypes");
  const docSnap = await getDocs(docRef);
  const firebaseData = docSnap.docs.flatMap((tagsDoc) => tagsDoc.data()) ?? [];

  return firebaseData as HTTag[];
}

export async function getSpeakers(db: Firestore, conference: string) {
  const docRef = collection(db, "conferences", conference, "speakers");
  const docSnap = await getDocs(docRef);
  const firebaseData = docSnap.docs.map((speakerDoc) => speakerDoc.data());

  return firebaseData as HTSpeaker[];
}

export async function getSpeakerById(
  db: Firestore,
  conference: string,
  speakerId: string
): Promise<HTSpeaker | null> {
  try {
    const docRef = doc(db, "conferences", conference, "speakers", speakerId);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as HTSpeaker;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching speaker by ID:", error);
    return null;
  }
}

export async function getClosestUpcomingConference(
  db: Firestore
): Promise<HTConference | null> {
  try {
    const currentTime = Timestamp.now();

    const docRef = collection(db, "conferences");

    const futureQuery = query(
      docRef,
      where("start_date", ">=", currentTime),
      orderBy("start_date", "asc"),
      limit(1)
    );

    const futureSnap = await getDocs(futureQuery);

    if (!futureSnap.empty) {
      const closestUpcomingConference =
        futureSnap.docs[0].data() as HTConference;
      return closestUpcomingConference;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching the closest upcoming conference:", error);
    return null;
  }
}

export async function getMostRecentPastConference(
  db: Firestore
): Promise<HTConference | null> {
  try {
    const currentTime = Timestamp.now();

    const docRef = collection(db, "conferences");

    const pastQuery = query(
      docRef,
      where("start_date", "<", currentTime),
      orderBy("start_date", "desc"),
      limit(1)
    );

    const pastSnap = await getDocs(pastQuery);

    if (!pastSnap.empty) {
      const mostRecentPastConference = pastSnap.docs[0].data() as HTConference;
      return mostRecentPastConference;
    } else {
      return null; // No past conference found
    }
  } catch (error) {
    console.error("Error fetching the most recent past conference:", error);
    return null;
  }
}
