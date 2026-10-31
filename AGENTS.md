# Project rules

- Landing-only mode is controlled by `LANDING_ONLY` in `src/config/siteMode.ts`; full-site pages/products stay in the codebase untouched so the site can be restored by flipping the flag (full sitemap saved in `backup/sitemap.full.xml`). Why: owner wants only one ad landing page publicly visible to Meta/TikTok, with the full site restorable later.
