Deno.serve(async () => {
  const PIXEL = Deno.env.get("TIKTOK_PIXEL_ID");
  const TOKEN = (Deno.env.get("TIKTOK_EVENTS_API_TOKEN") ?? "").trim();
  const mobileUA = "Mozilla/5.0 (Linux; Android 13; V2207) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36";
  const base = (over: Record<string, unknown>, props: Record<string, unknown> = {}) => ({
    event_source: "web",
    event_source_id: PIXEL,
    test_event_code: "TEST59153",
    data: [{
      event: "CompletePayment",
      event_time: Math.floor(Date.now() / 1000),
      event_id: "diag-" + crypto.randomUUID(),
      user: { ip: "103.4.145.10", user_agent: "Mozilla/5.0", ...over },
      page: { url: "https://bismillahhomeochamber.org/checkout" },
      properties: { currency: "BDT", value: 600, order_id: "diag", ...props },
    }],
  });
  const variants: Record<string, unknown> = {
    mobileUA: base({ user_agent: mobileUA }),
    ipv6: base({ ip: "2405:8100:8000:5ca1::1" }),
    bengaliContents: base({}, { content_type: "product", contents: [{ content_id: "abc", content_name: "হোমিও ঔষধ কম্বো", quantity: 1, price: 600 }] }),
    hashedPhone: base({ phone: "a".repeat(64), ttp: "01JABCDEF_ttp_value" }),
    withoutTestCode: (() => { const b = base({ user_agent: mobileUA }) as Record<string, unknown>; delete b.test_event_code; return b; })(),
  };
  const out: Record<string, unknown> = { testCodeSecret: Deno.env.get("TIKTOK_TEST_EVENT_CODE") ?? null };
  for (const [k, payload] of Object.entries(variants)) {
    const r = await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
      method: "POST", headers: { "Content-Type": "application/json", "Access-Token": TOKEN }, body: JSON.stringify(payload),
    });
    out[k] = { status: r.status, body: (await r.text()).slice(0, 200) };
  }
  return new Response(JSON.stringify(out, null, 2), { headers: { "Content-Type": "application/json" } });
});
