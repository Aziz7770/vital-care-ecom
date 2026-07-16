const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { type, fields } = await req.json();

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
      name: '👤 নাম',
      phone: '📞 ফোন',
      email: '✉️ ইমেইল',
      age: '🎂 বয়স',
      problem: '📝 সমস্যা',
      duration: '⏳ সময়কাল',
      message: '💬 মেসেজ',
      address: '📍 ঠিকানা',
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
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
    const tgData = await tgRes.json();

    if (!tgRes.ok) {
      console.error('Telegram error:', tgData);
      return new Response(JSON.stringify({ success: false, error: tgData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
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
