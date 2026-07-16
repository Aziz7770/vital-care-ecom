const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OWNER_WHATSAPP = "8801767678562";

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizePhone(p: string): string {
  const digits = (p || "").replace(/\D/g, "");
  if (!digits) return "";
  // BD numbers: 01XXXXXXXXX -> 8801XXXXXXXXX
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return "88" + digits;
  return digits;
}

async function sendMetaCapi(params: {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  userAgent?: string;
  clientIp?: string;
  fbp?: string;
  fbc?: string;
  phone?: string;
  name?: string;
  value?: number;
  currency?: string;
  contents?: { id: string; quantity: number; item_price: number }[];
  orderId?: string;
}) {
  const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
  const TOKEN = Deno.env.get("META_CONVERSIONS_API_TOKEN");
  if (!PIXEL_ID || !TOKEN) {
    console.warn("Meta CAPI not configured");
    return { ok: false, error: "not_configured" };
  }

  const user_data: Record<string, unknown> = {};
  if (params.phone) user_data.ph = [await sha256(normalizePhone(params.phone))];
  if (params.name) {
    const parts = params.name.trim().split(/\s+/);
    user_data.fn = [await sha256(parts[0] || "")];
    if (parts.length > 1) user_data.ln = [await sha256(parts.slice(1).join(" "))];
  }
  if (params.clientIp) user_data.client_ip_address = params.clientIp;
  if (params.userAgent) user_data.client_user_agent = params.userAgent;
  if (params.fbp) user_data.fbp = params.fbp;
  if (params.fbc) user_data.fbc = params.fbc;

  const custom_data: Record<string, unknown> = {};
  if (params.value !== undefined) custom_data.value = params.value;
  if (params.currency) custom_data.currency = params.currency;
  if (params.contents && params.contents.length) {
    custom_data.contents = params.contents;
    custom_data.content_ids = params.contents.map((c) => c.id);
    custom_data.content_type = "product";
    custom_data.num_items = params.contents.reduce((s, c) => s + c.quantity, 0);
  }
  if (params.orderId) custom_data.order_id = params.orderId;

  const event = {
    event_name: params.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    action_source: "website",
    event_source_url: params.eventSourceUrl,
    user_data,
    custom_data,
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });
    const json = await res.json();
    console.log("Meta CAPI:", res.ok ? "ok" : "fail", JSON.stringify(json));
    return { ok: res.ok, data: json };
  } catch (e) {
    console.error("Meta CAPI error:", e);
    return { ok: false, error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      orderId, customerName, phone, address, note, items, subtotal, deliveryCharge, total,
      capi,
    } = body;

    let message = `🛒 *নতুন অর্ডার!*\n\n`;
    message += `🆔 *অর্ডার:* ${orderId}\n`;
    message += `👤 *নাম:* ${customerName}\n`;
    message += `📞 *ফোন:* ${phone}\n`;
    message += `📍 *ঠিকানা:* ${address}\n`;
    if (note) message += `📝 *নোট:* ${note}\n`;
    message += `\n📦 *পণ্যসমূহ:*\n`;
    for (const item of items) {
      message += `• ${item.name} × ${item.quantity} = ৳${item.price * item.quantity}\n`;
    }
    message += `\n💰 *সাবটোটাল:* ৳${subtotal}\n`;
    message += `🚚 *ডেলিভারি:* ${deliveryCharge === 0 ? "ফ্রি" : `৳${deliveryCharge}`}\n`;
    message += `✅ *মোট:* ৳${total}\n`;
    message += `💳 *পেমেন্ট:* ক্যাশ অন ডেলিভারি`;

    const results: Record<string, unknown> = {};

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' }),
        });
        const tgData = await tgRes.json();
        results.telegram = { ok: tgRes.ok, data: tgData };
      } catch (e) {
        results.telegram = { ok: false, error: String(e) };
      }
    }

    // Meta Conversions API — Purchase
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;
    results.capi = await sendMetaCapi({
      eventName: "Purchase",
      eventId: capi?.event_id || orderId,
      eventSourceUrl: capi?.event_source_url,
      userAgent: capi?.user_agent,
      clientIp,
      fbp: capi?.fbp,
      fbc: capi?.fbc,
      phone,
      name: customerName,
      value: total,
      currency: "BDT",
      orderId,
      contents: items.map((i: { name: string; quantity: number; price: number }, idx: number) => ({
        id: String(idx),
        quantity: i.quantity,
        item_price: i.price,
      })),
    });

    const whatsappUrl = `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(message)}`;
    results.whatsappUrl = whatsappUrl;

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Notify error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
