const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizePhone(p: string): string {
  const digits = (p || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return "88" + digits;
  return digits;
}

async function sendLeadCapi(params: {
  eventId: string;
  eventSourceUrl?: string;
  userAgent?: string;
  clientIp?: string;
  fbp?: string;
  fbc?: string;
  phone?: string;
  name?: string;
  email?: string;
  contentName: string;
}) {
  const PIXEL_ID = Deno.env.get("META_PIXEL_ID");
  const TOKEN = Deno.env.get("META_CONVERSIONS_API_TOKEN");
  if (!PIXEL_ID || !TOKEN) return { ok: false, error: "not_configured" };

  const user_data: Record<string, unknown> = {};
  if (params.phone) user_data.ph = [await sha256(normalizePhone(params.phone))];
  if (params.email) user_data.em = [await sha256(params.email)];
  if (params.name) {
    const parts = params.name.trim().split(/\s+/);
    user_data.fn = [await sha256(parts[0] || "")];
    if (parts.length > 1) user_data.ln = [await sha256(parts.slice(1).join(" "))];
  }
  if (params.clientIp) user_data.client_ip_address = params.clientIp;
  if (params.userAgent) user_data.client_user_agent = params.userAgent;
  if (params.fbp) user_data.fbp = params.fbp;
  if (params.fbc) user_data.fbc = params.fbc;

  const event = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: params.eventId,
    action_source: "website",
    event_source_url: params.eventSourceUrl,
    user_data,
    custom_data: { content_name: params.contentName },
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${TOKEN}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [event] }),
    });
    const json = await res.json();
    console.log("Meta CAPI Lead:", res.ok ? "ok" : "fail", JSON.stringify(json));
    return { ok: res.ok, data: json };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, fields, capi } = await req.json();

    if (!type || !fields || typeof fields !== 'object') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid payload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const title =
      type === 'consultation'
        ? '🩺 *নতুন পরামর্শের আবেদন*'
        : type === 'contact'
        ? '✉️ *নতুন যোগাযোগ মেসেজ*'
        : '📩 *নতুন ফর্ম সাবমিশন*';

    const labels: Record<string, string> = {
      name: '👤 নাম', phone: '📞 ফোন', email: '✉️ ইমেইল', age: '🎂 বয়স',
      problem: '📝 সমস্যা', duration: '⏳ সময়কাল', message: '💬 মেসেজ', address: '📍 ঠিকানা',
    };

    let message = `${title}\n\n`;
    for (const [key, val] of Object.entries(fields)) {
      if (val === undefined || val === null || val === '') continue;
      const label = labels[key] || key;
      message += `${label}: ${val}\n`;
    }

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return new Response(JSON.stringify({ success: false, error: 'Telegram not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' }),
    });
    const tgData = await tgRes.json();

    if (!tgRes.ok) {
      console.error('Telegram error:', tgData);
      return new Response(JSON.stringify({ success: false, error: tgData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Meta CAPI — Lead
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined;
    const capiRes = await sendLeadCapi({
      eventId: capi?.event_id || `lead_${Date.now()}`,
      eventSourceUrl: capi?.event_source_url,
      userAgent: capi?.user_agent,
      clientIp,
      fbp: capi?.fbp,
      fbc: capi?.fbc,
      phone: (fields as Record<string, string>).phone,
      name: (fields as Record<string, string>).name,
      email: (fields as Record<string, string>).email,
      contentName: type === 'consultation' ? 'Consultation' : type === 'contact' ? 'Contact' : 'Form',
    });

    return new Response(JSON.stringify({ success: true, capi: capiRes }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('notify-form error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
