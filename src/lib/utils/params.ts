import { useParams } from "react-router";

import { normalizeConfCodeParam } from "./routes";

function parseNumericParam(value: string | undefined): number | undefined {
  return value && /^\d+$/.test(value) ? Number(value) : undefined;
}

export function useNormalizedParams() {
  const { confCode, contentId, personId } = useParams();
  return {
    confCode: normalizeConfCodeParam(confCode),
    contentId: parseNumericParam(contentId),
    personId: parseNumericParam(personId),
  };
}
