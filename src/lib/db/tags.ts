import { collection, getDocs } from "firebase/firestore/lite";
import { db } from "../firebase";
import type { HTTag } from "@/types/db";

export async function getTags(conf: string): Promise<HTTag[]> {
  const ref = collection(db, "conferences", conf, "tagtypes");
  const snap = await getDocs(ref);
  const flattened =
    snap.docs.flatMap((d) => d.data() as unknown as HTTag[]) ?? [];
  return flattened;
}
