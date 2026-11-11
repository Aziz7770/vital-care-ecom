// Facebook "Test Events" support: when the owner opens the site with
// ?test_event_code=TEST12345 (code shown in Events Manager → Test Events),
// the code is kept for this browser tab and sent with the server Purchase,
// so test orders appear instantly in Test Events. Real visitors never have it.
const KEY = "meta_test_event_code";
const VALID = /^TEST[A-Z0-9]{3,20}$/i;

export function captureMetaTestCode(search: string = typeof window !== "undefined" ? window.location.search : ""): void {
  try {
    const code = new URLSearchParams(search).get("test_event_code")?.trim();
    if (code && VALID.test(code)) sessionStorage.setItem(KEY, code.toUpperCase());
    else if (code === "off") sessionStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}

export function getMetaTestCode(): string | undefined {
  try {
    const code = sessionStorage.getItem(KEY) || undefined;
    return code && VALID.test(code) ? code : undefined;
  } catch {
    return undefined;
  }
}
