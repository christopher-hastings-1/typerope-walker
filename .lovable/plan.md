## Root cause

All three warnings trace back to one thing: the published site's visibility is set to **private**. That's why:

- The gallery crawler hits `https://typerope-walker.lovable.app/` and gets redirected to `lovable.dev/auth-bridge?...` (the "extra hop" warning).
- The auth-bridge page sets login/session cookies without `SameSite=None; Secure`, so 5 cookies are flagged as iframe-unsafe.
- The `og:image` we already declare in `src/routes/__root.tsx` is never seen — the crawler only ever reaches the auth-bridge HTML, which has no OG tags.

Flipping visibility to **public** removes the redirect, which in turn removes the auth cookies from the response entirely, and lets the crawler read our real `<head>`. That single change resolves warnings 2, 3, and the visibility half of 1.

## Plan

1. **Change publish visibility to public** via `publish_settings--update_visibility` (`public`). This eliminates the auth-bridge redirect and the associated cookies. No republish required — visibility flips server-side.

2. **Move `og:image` (and `twitter:image`) from `__root.tsx` to the leaf route `src/routes/index.tsx`.** Per the head-metadata rules, `og:image` on the root gets concatenated into every route and can be overridden by leaf routes; the leaf `index.tsx` currently has no `head()`, so we'll add one that inherits title/description defaults and adds the image tags plus `twitter:card: summary_large_image`. We'll keep the existing screenshot URL that's already in `__root.tsx` (1200×630-ish auto-generated preview) — no new image generation, since the user said the auto-screenshot is acceptable.

3. **Do not touch game logic, styles, i18n, or components.** No new headers or hosting config are needed — Lovable already serves HTTPS, doesn't send `X-Frame-Options`, and has no `frame-ancestors` CSP.

## Verification

After the changes, re-run the gallery's self-check. Expected: no redirect, `og:image` detected, no cookies set on the initial response.

## Files touched

- `src/routes/__root.tsx` — remove `og:image` and `twitter:image` meta entries.
- `src/routes/index.tsx` — add a `head()` returning those two meta entries plus `twitter:card`.
- Publish visibility setting (via tool, not code).
