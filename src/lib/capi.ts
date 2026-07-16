// Helpers for Meta Conversions API deduplication with the browser Pixel.

export const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : undefined;
};

export const genEventId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

export const getCapiContext = () => ({
  event_id: genEventId(),
  event_source_url: typeof window !== "undefined" ? window.location.href : "",
  user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
  fbp: getCookie("_fbp"),
  fbc: getCookie("_fbc"),
});
