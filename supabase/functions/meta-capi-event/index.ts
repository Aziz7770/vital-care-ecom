// Generic Meta Conversions API event forwarder for ViewContent / AddToCart / InitiateCheckout.
// Purchase & Lead stay in their dedicated functions (notify-order / notify-form) because they carry PII.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type EventBody = {
  eventName: "ViewContent" | "AddToCart" | "InitiateCheckout";
  eventId: string;
  eventSourceUrl?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
  value?: number;
  currency?: string;
  contents?: { id: string; quantity: number; item_price: number }[];
  contentIds?: string[];
  contentName?: string;
  contentCategory?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as EventBody;
    const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
    const TOKEN = Deno.env.get("META_CONVERSIONS_API_TOKEN");

    if (!PIXEL_ID || !TOKEN) {
      return new Response(JSON.stringify({ success: false, error: "not_configured" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      });
    }

    if (!body?.eventName || !body?.eventId) {
      return new Response(JSON.stringify({ success: false, error: "invalid_payload" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
      });
    }

    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;

    const user_data: Record<string, unknown> = {};
    if (clientIp) user_data.client_ip_address = clientIp;
    if (body.userAgent) user_data.client_user_agent = body.userAgent;
    if (body.fbp) user_data.fbp = body.fbp;
    if (body.fbc) user_data.fbc = body.fbc;

    const custom_data: Record<string, unknown> = {};
    if (body.value !== undefined) custom_data.value = body.value;
    if (body.currency) custom_data.currency = body.currency;
    if (body.contents?.length) {
      custom_data.contents = body.contents;
      custom_data.content_ids = body.contents.map((c) => c.id);
      custom_data.content_type = "product";
      custom_data.num_items = body.contents.reduce((s, c) => s + c.quantity, 0);
    } else if (body.contentIds?.length) {
      custom_data.content_ids = body.contentIds;
      custom_data.content_type = "product";
    }
    if (body.contentName) custom_data.content_name = body.contentName;
    if (body.contentCategory) custom_data.content_category = body.contentCategory;

    const event = {
      event_name: body.eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: body.eventId,
      action_source: "website",
      event_source_url: body.eventSourceUrl,
      user_data,
      custom_data,
    };

    const res = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });
    const json = await res.json();
    return new Response(JSON.stringify({ success: res.ok, data: json }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});
