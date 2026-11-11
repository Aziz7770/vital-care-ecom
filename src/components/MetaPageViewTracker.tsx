import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { genEventId, sendServerEvent } from "@/lib/capi";

// Sends a neutral server-side PageView to Meta on each page change.
// No page path or title is forwarded (see meta-capi-event).
const MetaPageViewTracker = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/auth")) return;
    sendServerEvent({ eventName: "PageView", eventId: genEventId() });
  }, [pathname]);
  return null;
};

export default MetaPageViewTracker;
