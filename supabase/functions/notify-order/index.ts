const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OWNER_WHATSAPP = "8801767678562";

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { orderId, customerName, phone, address, note, items, subtotal, deliveryCharge, total } = await req.json();

    // Build message
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

    // Send Telegram notification
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
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
        results.telegram = { ok: tgRes.ok, data: tgData };
        console.log('Telegram notification:', tgRes.ok ? 'sent' : 'failed', JSON.stringify(tgData));
      } catch (e) {
        console.error('Telegram error:', e);
        results.telegram = { ok: false, error: String(e) };
      }
    } else {
      results.telegram = { ok: false, error: 'Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID' };
    }

    // Build WhatsApp URL (returned to client to open)
    const whatsappMessage = message.replace(/\*/g, ''); // strip markdown for WhatsApp plain text
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
