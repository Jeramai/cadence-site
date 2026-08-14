# Cadence marketing site

Static landing page for the HR buyer, served by GitHub Pages from the `main` branch root.

| Taal | URL | Files |
| --- | --- | --- |
| **Nederlands (root)** | <https://jeramai.github.io/cadence-site/> | `index.html`, `privacy.html`, `voorwaarden.html` |
| English | <https://jeramai.github.io/cadence-site/en/> | `en/index.html`, `en/privacy.html`, `en/terms.html` |

**Dutch owns the root** because the first market is the Netherlands. English sits under `/en/`.
`hreflang="x-default"` points at the English page, since that is the better fallback for a
visitor whose language is neither.

Both share one stylesheet, one script and one set of assets. There is no build step and no
translation tooling: the two page sets are maintained side by side, so **a copy change in one
language needs the same change in the other**. The `hreflang` alternates and `sitemap.xml` list
both, and the language switch sits next to the theme toggle at the bottom right.

`404.html` leads in Dutch with an English line under it, because Pages serves that one file
for any missing path, including paths under `/en/`.

Social cards are per language: `assets/img/og.png` (Dutch, built from `_og.html`) and
`assets/img/og-en.png` (English, from `_og-en.html`).

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
| Canonical URLs | every page, `sitemap.xml`, `robots.txt` | Set to `jeramai.github.io/cadence-site`. Change if a custom domain lands. |
| `/cadence-site/` paths | `404.html` | Absolute, because Pages serves 404 from the root for any depth. A custom domain makes these `/`. |

## Screenshots

`assets/img/shots/` holds real captures from the app, not mockups. WebP, 720px wide, 612KB for
the twelve.

**Four sets: `{en,nl}/{light,dark}/`.** The app has its own `nl` catalogue and its own light and
dark themes, so each page shows the app in the reader's language *and* the page's theme. Switch
both in the app under You (Language / Theme), and **restart the app after a language change** so
the native tab bar re-renders too.

| File | Screen |
| --- | --- |
| `today.webp` | Home, all three rings live: move 24/30, water 6/8, steps 6,248/8,000 |
| `library.webp` | Move library with detection labels |
| `detail.webp` | Push-up detail: how-to, phone placement, on-device line |
| `en/privacy.webp` | The iOS camera permission dialog with the app's purpose string. **Unused**, light only, English only (the string comes from `Info.plist` and is not localised). |

The pairs swap in CSS (`.shot img.shot__light` / `.shot__dark`), not with `<picture media>`,
because a media attribute cannot see the theme toggle. **Qualify those selectors with `img`** —
`.shot img` sets `display: block` at 0,1,1 and outranks a bare `.shot__dark` at 0,1,0, which
renders both images at once.

### Staging the data

A fresh install has empty rings, and points can only be earned through the camera or a 2 and 30
minute timer, so the day was seeded through the app's own `logTask` / `addGlass` actions plus the
health store. The seed lived in a temporary `src/features/ring/lib/__screenshotSeed.ts` in the app
repo and **was removed afterwards**; the app repo is clean.

Staging the ring numbers is fine and normal. Staging the **pose overlay** is not: the skeleton is
the evidence for the claim this whole site rests on, so it only ever comes from a real device.

The captions quote the app's own labels, so they must be re-checked against the screenshots if
either the app copy or the shots change. English says *counted / approximate / beta*; Dutch says
*WORDT GETELD / ONGEVEER / BETA*, and the tiers are *GEVERIFIEERD* and *ONDERSTEUND*, which are
the same words the Dutch page uses for its trust tiers.

`privacy.webp` is the strongest privacy evidence on hand, because iOS renders the sentence and
it cannot be faked: *"Cadence uses your camera to count workout reps on-device. No video is
recorded or uploaded."* Slot it into the privacy card or the Arbo section when you want it.

### How to regenerate

Captured on an iPhone 17 Pro simulator with
[`@swmansion/argent`](https://github.com/software-mansion/argent), driven from the CLI so no MCP
setup is needed:

```
npx --yes @swmansion/argent@latest run describe    --udid <udid>
npx --yes @swmansion/argent@latest run gesture-tap --udid <udid> --x 0.5 --y 0.44
npx --yes @swmansion/argent@latest run screenshot  --udid <udid> --scale 1.0 \
  --includeImageInContext false --out shot.png
```

Three things that bit, worth knowing before you try:

- **Build Release, not Debug.** A Debug simulator build fails to link with
  `cannot link directly with 'SwiftUICore'`, an Xcode issue in the debug dylib it builds for
  SwiftUI previews. Release skips that path and embeds the JS bundle, so it needs no Metro.
- **The camera screen cannot be captured on a simulator.** It reports *"No front camera
  available."* There is no preview to composite a room behind, and no skeleton or rep count. A
  real camera screenshot needs a physical iPhone.
- **Set the status bar first**, the way store screenshots do:
  `xcrun simctl status_bar <udid> override --time 9:41 --batteryState charged --batteryLevel 100`

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

## Dutch copy

The Dutch is not a literal translation. It uses the vocabulary a Dutch HR buyer and
preventiemedewerker actually use, taken from the market research: verzuim, beeldschermwerk,
klachten aan nek en schouder, RI&E, werkkostenregeling, gerichte arbovoorziening, vrije ruimte,
ondernemingsraad, verwerkersovereenkomst. Keep those terms if you edit it. The research is
explicit that an American wellness tone does not land here.

Note that the Arbo and tax section and its FAQ entry are written for Dutch law, so the English
page carries the same Dutch terms rather than translating them into something that does not
exist.

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

## Positioning

The page leads on **screen work and the neck, shoulder and arm complaints that follow it**, not
on wellness in general. Verification is the proof, not the promise. This follows the Netherlands
market research (August 2026), which is explicit about what may and may not be claimed:

- **Say** less absence from screen work and sitting, and more energy in the working day.
- **Do not say** less sickness, less burnout, or lower staff turnover. The chain is too long,
  HR sees through it, and the medical framing carries GDPR risk.
- **Do not promise** a per company App Store listing as standard. Near identical white label
  apps hit Apple's rules on duplicate apps. Branding is standard, a separate listing is a paid
  upgrade. The FAQ is worded to match.
- **First market** is desk heavy organisations of 25 to 200 staff in IT, finance, government and
  professional services. The four presets in the Configure section reflect that. Care and heavy
  physical work are deliberately absent.

## Claims to keep true

Every figure on the page is listed with its source in the Sources section, and the page links
to it from the stat strip. Two kinds of number appear:

- **Third party**, from TNO and CBS. Update the Sources section if a newer factsheet lands.
- **Our own**: 34 workout moves, 12 stretch holds, 46 total, three detection tiers, counted
  from the app repo's `src/features/library/lib/moves.ts`. If that catalogue changes, change
  the Sources entry and the "Everyone can close it" card with it.

Nothing on the page is a customer name, a testimonial, or a metric we cannot show. The Sources
section also states plainly that the evidence for reduced absence is weaker than the evidence
for reduced pain, which is deliberate: overclaiming loses the serious buyer.
