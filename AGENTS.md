# Project rules

- Site visibility is controlled by `LANDING_ONLY` in `src/config/siteMode.ts`; keep both full-site and landing-only routes intact and keep the public sitemap aligned with the active routes. Why: the saved full website must remain restorable without undoing order security or tracking fixes.
- Any edge-function call that sends to TikTok's Events API must be invoked with `region: FunctionRegion.ApSoutheast1`. Why: Bangladesh visitors otherwise route to the India region, whose IPs TikTok rejects ("banned Country list").
- Meta (Facebook) events are server-side only and must build custom_data via `supabase/functions/_shared/metaSafe.ts` with the neutral source URL; do not re-add the browser Pixel. Why: the browser Pixel auto-sends page URLs/titles containing health details.
