Deno.serve(async () => {
  const PIXEL = Deno.env.get("TIKTOK_PIXEL_ID");
  const TOKEN = Deno.env.get("TIKTOK_EVENTS_API_TOKEN") ?? "";
  const payload = {
    event_source: "web",
    event_source_id: PIXEL,
    test_event_code: "TEST59153",
    data: [{
      event: "CompletePayment",
      event_time: Math.floor(Date.now() / 1000),
      event_id: "diag-" + Date.now(),
      user: { ip: "103.4.145.10", user_agent: "Mozilla/5.0" },
      page: { url: "https://bismillahhomeochamber.org/checkout" },
      properties: { currency: "BDT", value: 1, order_id: "diag" },
    }],
  };
  const out: Record<string, unknown> = {
    pixel: PIXEL, tokenLen: TOKEN.length, tokenTrimmedLen: TOKEN.trim().length,
  };
  for (const ua of ["default", "Mozilla/5.0 (compatible; BismillahServer/1.0)"]) {
    const headers: Record<string, string> = { "Content-Type": "application/json", "Access-Token": TOKEN.trim() };
    if (ua !== "default") headers["User-Agent"] = ua;
    const r = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST", headers, body: JSON.stringify(payload),
    });
    out[ua] = { status: r.status, body: (await r.text()).slice(0, 300) };
  }
  return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json" } });
});
