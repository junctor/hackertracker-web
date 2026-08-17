export function friendlyLoadError(reason: unknown, subject: string): string {
  if (reason instanceof Error && /(?:not found|no .+ was found)/i.test(reason.message)) {
    const message = reason.message.trim();
    return /[.!?]$/.test(message) ? message : `${message}.`;
  }

  return `We couldn’t load ${subject}. Check your connection and try again.`;
}
