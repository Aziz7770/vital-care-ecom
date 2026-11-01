# Project rules

- Landing-only mode is controlled by `LANDING_ONLY` in `src/config/siteMode.ts`; full-site pages/products stay in the codebase untouched so the site can be restored by flipping the flag (full sitemap saved in `backup/sitemap.full.xml`). Why: owner wants only one ad landing page publicly visible to Meta/TikTok, with the full site restorable later.
- Any edge-function call that sends to TikTok's Events API must be invoked with `region: FunctionRegion.ApSoutheast1`. Why: Bangladesh visitors otherwise route to the India region, whose IPs TikTok rejects ("banned Country list").
