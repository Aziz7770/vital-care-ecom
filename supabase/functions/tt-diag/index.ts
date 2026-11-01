// TEMPORARY diagnostic — delete after use
Deno.serve(async (req) => {
  const PIXEL = Deno.env.get("TIKTOK_PIXEL_ID")!;
  const TOKEN = Deno.env.get("TIKTOK_EVENTS_API_TOKEN")!.trim();
  const reqIp = req.headers.get("x-forwarded-for");
  const out: Record<string, unknown> = { reqIp, pixelLen: PIXEL?.length, pixelStart: PIXEL?.slice(0, 4) };
  const cases: Record<string, string | undefined> = {
    noIp: undefined,
    bdIp: "103.108.140.10",
    reqIp: reqIp?.split(",")[0].trim(),
  };
  for (const [k, ip] of Object.entries(cases)) {
    const user: Record<string, unknown> = { user_agent: "Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile" };
    if (ip) user.ip = ip;
    const payload = {
      event_source: "web",
      event_source_id: PIXEL,
      test_event_code: "TEST99999",
      data: [{
        event: "CompletePayment",
        event_time: Math.floor(Date.now() / 1000),
        event_id: "DIAG-" + k + "-" + Date.now(),
        user,
        page: { url: "https://bismillahhomeochamber.org/checkout" },
        properties: { currency: "BDT", value: 1, order_id: "DIAG", content_type: "product" },
      }],
    };
    const r = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Access-Token": TOKEN },
      body: JSON.stringify(payload),
    });
    out[k] = { ip, status: r.status, body: (await r.text()).slice(0, 400) };
  }
  return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json" } });
});
