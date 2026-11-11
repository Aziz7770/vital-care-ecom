# Project rules

- Site visibility is controlled by `LANDING_ONLY` in `src/config/siteMode.ts`; keep both full-site and landing-only routes intact and keep the public sitemap aligned with the active routes. Why: the saved full website must remain restorable without undoing order security or tracking fixes.
- Any edge-function call that sends to TikTok's Events API must be invoked with `region: FunctionRegion.ApSoutheast1`. Why: Bangladesh visitors otherwise route to the India region, whose IPs TikTok rejects ("banned Country list").
- Meta (Facebook) events go browser + server with a shared event ID; browser events must use `fbqSafe` (`src/lib/metaPrivacy.ts`, safe-path allowlist, no auto PageView/autoConfig) and server events must use `supabase/functions/_shared/metaSafe.ts`. Why: the browser Pixel always reports the page address, which can contain health details.
