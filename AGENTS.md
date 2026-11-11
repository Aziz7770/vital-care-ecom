# Project rules

- Site visibility is controlled by `LANDING_ONLY` in `src/config/siteMode.ts`; keep both full-site and landing-only routes intact and keep the public sitemap aligned with the active routes. Why: the saved full website must remain restorable without undoing order security or tracking fixes.
- Any edge-function call that sends to TikTok's Events API must be invoked with `region: FunctionRegion.ApSoutheast1`. Why: Bangladesh visitors otherwise route to the India region, whose IPs TikTok rejects ("banned Country list").
- App-owned Meta tracking is retired: keep browser dispatch, identifier capture and all three server senders disabled through `isLegacyMetaEnabled` in the shared Meta guard; no replacement GTM tracking is installed. Why: removing the old pixel must also stop its server events and must not duplicate an externally managed replacement.
