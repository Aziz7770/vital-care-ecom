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
  email?: string;
  city?: string;
  country?: string;
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
  if (params.email) user_data.em = [await sha256(params.email)];
  if (params.name) {
    const parts = params.name.trim().split(/\s+/);
    user_data.fn = [await sha256(parts[0] || "")];
    if (parts.length > 1) user_data.ln = [await sha256(parts.slice(1).join(" "))];
  }
  if (params.city) user_data.ct = [await sha256(params.city.replace(/\s+/g, ""))];
  if (params.country) user_data.country = [await sha256(params.country)];
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

interface HistoryRow { dt: string | null; total: number; items: string; src: "online" | "legacy" }

function bnNum(n: number): string {
  return n.toLocaleString("en-US");
}

function fmtDate(iso: string | null): string {
  if (!iso) return "অজানা";
  try {
    return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

async function buildHistoryBlock(phone: string, currentOrderId: string): Promise<string> {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_KEY) return "";

  const ph = normalizePhone(phone);
  if (!ph) return "";

  const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };

  try {
    const [onlineRes, legacyRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/orders?select=order_id,created_at,total,items,status,phone&status=neq.cancelled&order=created_at.desc&limit=200`, { headers }),
      fetch(`${SUPABASE_URL}/rest/v1/legacy_orders?select=order_date,created_at,total,items_text,phone_normalized&phone_normalized=eq.${encodeURIComponent(ph)}&order=order_date.desc&limit=200`, { headers }),
    ]);

    const onlineAll = onlineRes.ok ? await onlineRes.json() : [];
    const legacyAll = legacyRes.ok ? await legacyRes.json() : [];

    const rows: HistoryRow[] = [];

    for (const o of onlineAll) {
      if (normalizePhone(o.phone) !== ph) continue;
      if (o.order_id === currentOrderId) continue;
      const items = Array.isArray(o.items)
        ? o.items.map((i: { name: string; quantity: number }) => `${i.name} ×${i.quantity}`).join(", ")
        : "";
      rows.push({ dt: o.created_at, total: Number(o.total) || 0, items, src: "online" });
    }

    for (const l of legacyAll) {
      rows.push({
        dt: l.order_date || l.created_at,
        total: Number(l.total) || 0,
        items: l.items_text || "",
        src: "legacy",
      });
    }

    if (rows.length === 0) {
      return `\n🆕 *নতুন কাস্টমার* — এটি তার প্রথম অর্ডার\n`;
    }

    rows.sort((a, b) => new Date(b.dt || 0).getTime() - new Date(a.dt || 0).getTime());
    const spent = rows.reduce((s, r) => s + r.total, 0);
    const last = rows[0];
    const first = rows[rows.length - 1];
    const legacyCount = rows.filter((r) => r.src === "legacy").length;

    let block = `\n🔁 *রিপিট কাস্টমার* — এটি তার ${bnNum(rows.length + 1)} নম্বর অর্ডার\n`;
    block += `📊 *আগের অর্ডার:* ${bnNum(rows.length)} টি (নোটবুক: ${bnNum(legacyCount)}, অনলাইন: ${bnNum(rows.length - legacyCount)})\n`;
    block += `💵 *আগে মোট খরচ:* ৳${bnNum(spent)}\n`;
    block += `🕐 *শেষ অর্ডার:* ${fmtDate(last.dt)}${last.items ? ` — ${last.items}` : ""}\n`;
    block += `📅 *প্রথম অর্ডার:* ${fmtDate(first.dt)}\n`;

    const recent = rows.slice(0, 3);
    block += `\n📚 *সাম্প্রতিক হিস্টোরি:*\n`;
    for (const r of recent) {
      block += `  • ${fmtDate(r.dt)} — ${r.items || "বিবরণ নেই"} — ৳${bnNum(r.total)}\n`;
    }
    if (rows.length > 3) block += `  … আরও ${bnNum(rows.length - 3)} টি অর্ডার\n`;

    return block;
  } catch (e) {
    console.error("history lookup failed:", e);
    return "";
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      orderId, customerName, phone, email, district, address, note, items, subtotal, deliveryCharge, total,
      capi,
    } = body;

    const historyBlock = await buildHistoryBlock(phone, orderId);

    let message = `🛒 *নতুন অর্ডার!*\n\n`;
    message += `🆔 *অর্ডার:* ${orderId}\n`;
    message += `👤 *নাম:* ${customerName}\n`;
    message += `📞 *ফোন:* ${phone}\n`;
    if (email) message += `✉️ *ইমেইল:* ${email}\n`;
    if (district) message += `🏙️ *জেলা:* ${district}\n`;
    message += `📍 *ঠিকানা:* ${address}\n`;
    if (note) message += `📝 *নোট:* ${note}\n`;
    message += historyBlock;
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
      email,
      city: district,
      country: "bd",
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
