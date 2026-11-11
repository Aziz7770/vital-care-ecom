import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { genEventId, sendServerEvent } from "@/lib/capi";
import { fbqSafe } from "@/lib/metaPrivacy";

// Sends PageView to Meta on each page change (browser + server, same event ID for dedup).
// No page path or title is forwarded (see meta-capi-event).
const MetaPageViewTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return;
    const eventId = genEventId();
    fbqSafe("PageView", {}, eventId); // browser: safe pages only
    sendServerEvent({ eventName: "PageView", eventId }); // server: every page, neutral URL
  }, [pathname]);
  return null;
};

export default MetaPageViewTracker;
