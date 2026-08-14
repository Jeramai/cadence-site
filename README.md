# Cadence marketing site

Static landing page for the HR buyer, served by GitHub Pages from the `main` branch root at
<https://jeramai.github.io/cadence-site/>.

**This repository is public and holds the site only.** The app lives in the private
`Jeramai/cadence` repository, and its `docs/` folder holds pricing bands, the backlog and
competitor notes. None of that may ever be copied here.

## Local preview

```
python3 -m http.server 8817
```

No build step. No dependencies. No third party requests at runtime: the typeface is
self hosted and every icon is inline SVG.

## Before launch

| Item | Where | Why |
| --- | --- | --- |
| `DEMO_EMAIL` | `assets/js/main.js` line 4 | The demo form composes a mail to this address. It is a placeholder. |
| `privacy@cadence.example` | `privacy.html` | Placeholder contact address. |
| `legal@cadence.example` | `terms.html` | Placeholder contact address. |
| Legal review | `privacy.html`, `terms.html` | Both are honest drafts, not reviewed by counsel. |
| Pricing numbers | `index.html`, pricing section | Tiers ship without PEPM figures. `docs/PLAN.md` calls the bands directional. |
| `noindex` | `index.html`, `privacy.html`, `terms.html` | The page is live and shareable but kept out of search while the contact address is a placeholder and the legal text is unreviewed. Delete the tag to be indexed. |
| Canonical URL | `index.html`, `sitemap.xml`, `robots.txt` | Set to `jeramai.github.io/cadence-site`. Change if a custom domain lands. |
| `/cadence-site/` paths | `404.html` | Absolute, because Pages serves 404 from the root for any depth. A custom domain makes these `/`. |

## Screenshot strip

`index.html` carries a commented section for three app screenshots. Drop `home.png`,
`camera.png` and `library.png` into `assets/img/shots/` and delete the two comment markers.
It is commented rather than `hidden` because a hidden section still fetches its images.

## Social card

`assets/img/og.png` is generated from `_og.html`. To regenerate, serve the site and screenshot
that page at 1200x630. `_og.html` is `noindex` and disallowed in `robots.txt`.

## Design notes

**Light is the default.** Dark follows the reader's OS setting through
`prefers-color-scheme`. Both palettes are the app's own, read from `src/theme/themeVars.ts`
and `src/config/brand.ts`: light is the `#f2f6f5` ground with white cards, dark is Teal Ink
`#0e1b19`. Ring category accents carry over (amber for Break, indigo for Recover, rose for box
breathing). Keep them in step with the app.

Every colour goes through a token in `:root`, with the dark set overriding only what changes.
Nothing themeable is hardcoded in the HTML.

Two things the light ground forced, both worth keeping:

- **Brand teal splits in two.** `#0fa596` is only 3.07:1 on white, so it fails AA as text. The
  fill stays the brand value (`--brand`, used for the ring, dots and tints) and text uses a
  darkened `--brand-text` `#0b766c`. The same split applies to amber and indigo.
- **The mark has a light sibling.** `logo.svg` here is the aqua mark, built for the Teal Ink
  ground, and it washes out on white. Light uses `logo-ink.svg`. Both come from the app repo
  (`assets/logo-aqua.svg` and `assets/logo-aqua-ink.svg`).

Every text and background pair in both themes clears WCAG AA for small text (4.5:1). The worst
pair in light is 4.65:1.

## Theme toggle

The floating button at the bottom right sets `data-theme` on `<html>` and stores the choice
under `cadence-theme`. With nothing stored the page follows the operating system. It sits
below the mobile menu overlay so an open menu covers it.

The dark palette is written twice on purpose: once under `@media (prefers-color-scheme: dark)`
for readers with no JavaScript, and once under `:root[data-theme='dark']` so the toggle can
override the OS in both directions. **The two lists are identical and must stay in sync.**

An inline script in each `<head>` applies the stored choice before first paint, so there is no
flash. The brand mark and the sun and moon icons are swapped in CSS rather than with
`<picture media>`, because a media attribute cannot see the toggle.

## Claims to keep true

The numbers on the page are counted from the app repo's
`src/features/library/lib/moves.ts`: **34 workout moves, 12 stretch holds, 46 total**, across
three detection tiers. If that catalog changes, change the stat strip and the "Everyone can
close it" card with it. Nothing on the page is a customer name, a testimonial or a metric we
cannot show.
