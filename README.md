# cms-web-theme

A shared University of Cambridge–identity theme for anything hosted
alongside [mf-service](https://github.com/cms-cambridge/mf-service): colour,
type, and components for an app or tool (a form, a dashboard, an API's
docs) *and* for an ordinary content page (a homepage, an about page, a
project site) — worked out on mf-service, then broadened once it was
clear "a site" covers more shapes than the one mf-service is.

**This is not an official University design system** — see
[Provenance](#provenance) before you rely on it for anything public-facing.

Live style guide: `docs/style-guide.html` (open locally, or see the linked
Artifact if one was shared with you).

## Install

```
npm install github:cms-cambridge/cms-web-theme
```

or just download `dist/cambridge-theme.css` / `css/cambridge-tokens.css` —
there's no registry package yet, both are plain files you can vendor.

## Which header?

Two compositions ship, because an app and a content page want different
things from their header:

- **`.cam-header`** — one row: wordmark, nav, actions. For a tool whose
  header is pure navigation and the real content — a form, a dashboard —
  starts right under it. This is what mf-service uses.
- **`.cam-masthead` + `.cam-hero`** — an identity band, then a title band.
  For a page that has something to introduce before its content: a
  homepage, an about page, a project site. Modelled on how
  [phy.cam.ac.uk](https://www.phy.cam.ac.uk/) and
  [mus.cam.ac.uk](https://www.mus.cam.ac.uk/) open their own pages.

Pick one per page, not both — see `examples/content-page.html` for the
masthead+hero pattern and `examples/bootstrap-example.html` /
`vanilla-example.html` for `.cam-header`.

## Quickstart

If you just want to have a look at some examples using this theme, then use `quickstart.sh` like so:

```bash
# run from repo root
chmod +x quickstart.sh
./quickstart.sh
```

Pick one framework track. Don't load both `dist/cambridge-theme.css` and
`css/cambridge-tokens.css` on the same page — the class names don't
collide, but you don't need two copies of the same tokens.

### Already using Bootstrap 5

Link the precompiled build **instead of** `bootstrap.css`:

```html
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:opsz,wght@8..60,560;8..60,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="node_modules/cms-web-theme/dist/cambridge-theme.css">
```

Every stock Bootstrap class (`.btn`, `.navbar`, `.card`, `.table`,
`.form-control`, `.alert`…) already carries the palette. A handful of
additions cover what Bootstrap has no variable for — see
`scss/_components.scss` or the style guide:

- `.cam-brand` — italic serif wordmark
- `.navbar-cambridge` — the header accent rule + underline nav, add
  alongside `.navbar`
- `.alert-cambridge` — a quiet status line (not a saturated `.alert-*`)
- `.cam-float` — one panel over a blurred page, built on `<dialog>`;
  Bootstrap's own `.modal` when you want its JS API or its full-width
  sheet on small screens
- `.badge-cam-info` / `-success` / `-warning` / `-accent` — categorical
  badges, AA-safe

`.cam-masthead`, `.cam-hero`, `.cam-hero-deep`, `.cam-prose` and
`.cam-footer` cover the content-page composition and long-form content;
see the style guide for all of them together.

If you're compiling from source instead of using the precompiled CSS:

```scss
// your own entry .scss, before anything else
@import "cms-web-theme/scss/cambridge-theme";
```

### No Bootstrap

```html
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:opsz,wght@8..60,560;8..60,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="node_modules/cms-web-theme/css/cambridge-tokens.css">
```

Use the `.cam-*` classes documented in the style guide — `.cam-header` or
`.cam-masthead`/`.cam-hero` for the header, `.cam-btn`, `.cam-card`,
`.cam-notice`, `.cam-float` for a welcome or first-run panel,
`.cam-table`, `.cam-badge-*`, `.cam-prose` for long-form content,
`.cam-footer` — or just the `--cam-*` custom properties directly
in your own CSS.

## What's in here

```
tokens/tokens.json          single source of truth — colour, type, radii
scripts/build-tokens.js     generates scss/_tokens.scss and the token
                             block in css/cambridge-tokens.css from it
scss/                       Bootstrap 5 build (source)
css/cambridge-tokens.css    framework-agnostic build (hand-written, but
                             its token block is generated — see above)
dist/                       precompiled Bootstrap build — commit this,
                             it's what most consumers actually link
examples/                   one working page per flavour
docs/style-guide.html       the living reference — palette with real
                             contrast ratios, type scale, every component
                             (both headers, prose, footer included),
                             do/don't notes
```

## Changing a token

Edit `tokens/tokens.json`, then:

```
npm install
npm run build
```

That regenerates `scss/_tokens.scss` and the token block in
`css/cambridge-tokens.css`, then rebuilds `dist/cambridge-theme.css` and
`dist/cambridge-theme.min.css`. Commit all of it — `dist/` is checked in,
not built on install, so consumers who just download the CSS get a working
file without a Node toolchain.

Don't hand-edit `scss/_tokens.scss` or the generated block inside
`css/cambridge-tokens.css` — the next `npm run build` overwrites them.

## Colour, briefly

Pantone 547 (`--cam-ink`, `#133844`) is the dominant colour — text,
headings, buttons, nav — not a bright blue. Pantone 326 (`--cam-teal`,
`#00bdb6`) is the *one* accent, used thin: a header rule, an active
underline, a notice's edge. It's never a text or fill colour by itself —
it fails WCAG AA contrast both directions (2.2:1 as text, 2.35:1 white on
it). This is a deliberate departure from applying the brand's full primary
palette broadly: it's how the two Cambridge departmental sites this was
checked against actually use colour, not how the brand guidelines' colour
chips might suggest doing it in isolation.

The six-colour primary palette (Red Ribbon, Science Blue, Tango, Vida Loca,
Purple Heart, Pacific Blue) is held back for categorical data — status
badges, chart series — the one place colour needs to carry meaning rather
than accent the page. Three of the six are too light for white text at AA;
darkened companion shades ship for those. Full numbers, and which shades to
use where, are in `docs/style-guide.html`.

## Layout and margins

One gutter, three widths, one formula. Every centred container in the theme
is built the same way, so the header, the hero, the body and the footer line
up at every viewport width:

```css
width: min(var(--cam-width-page), calc(100% - 2 * var(--cam-gutter)));
margin-inline: auto;
```

| Token | Default | For |
| --- | --- | --- |
| `--cam-gutter` | `1.5rem` | Space between content and the viewport edge, everywhere |
| `--cam-width-page` | `76rem` | Full-width bands: header, masthead, footer |
| `--cam-width-wide` | `60rem` | Wide content: hero, dashboards, tables (`.cam-container-wide`) |
| `--cam-width-text` | `40rem` | Reading measure: prose, forms (`.cam-container`, `.cam-prose`) |

`width: min()` rather than `max-width` + padding is deliberate. With
`box-sizing: border-box`, padding eats into the content area once a
container hits its max-width, so two containers with the same `max-width`
but different padding end up different widths — which is exactly how the
header and masthead drifted 1.5rem out of line before this was unified.
Bands that wrap an `-inner` (`.cam-footer`) therefore carry vertical
padding only; the gutter belongs to the container, once.

On the Bootstrap build, `$container-padding-x` is set from `$cam-gutter`,
so Bootstrap's own `.container-*` share the same gutter, and
`.cam-container` / `.cam-container-wide` exist there too with identical
geometry to the vanilla build.

## Typography

Open Sans (body, UI) + Source Serif 4 (headings, wordmark), per the brand
guidelines' sans/serif pairing. Source Serif 4 stands in for Feijoa, the
guidelines' actual display serif — a commercial face from the
[Klim Type Foundry](https://klim.co.nz/fonts/feijoa/).

### On using Feijoa itself

The University licenses Feijoa and makes it available to staff: the
[typography guidance](https://www.cam.ac.uk/brand-resources/guidelines/typography)
points at the font downloads under
[brand resources](https://www.cam.ac.uk/brand-resources), and University
Managed Devices generally have it installed already. There is no public
licence document to link to — the terms come with the download, behind
Raven.

That matters because a licence to *use* a font on your machine is not the
same as a licence to *serve* it as a webfont. Before putting Feijoa on a
public site, read the terms attached to the University's download and
check with the brand team whether web embedding is covered by the
University's agreement with Klim. This theme ships a free substitute
precisely so nobody has to resolve that question to get started.

If web embedding is covered for your site, change `fontSerif` in
`tokens/tokens.json`, add your own `@font-face` block, and rebuild;
nothing else in the theme names the face.

## Provenance

This theme did not come from reading the brand guidelines alone. The first
pass at applying them (on mf-service) took the guidelines' colour and type
facts and over-produced: a decorative six-colour bar across the top of
every page, Science Blue as the dominant interactive colour, coloured rules
under section headings. None of that is in the guidelines *or* in how
Cambridge actually builds pages with them — it's what "apply this palette"
turns into without a reference.

A second pass, checked against screenshots of
[phy.cam.ac.uk](https://www.phy.cam.ac.uk/) and
[mus.cam.ac.uk](https://www.mus.cam.ac.uk/) supplied during review (direct
fetches to those domains were blocked in the environment this was built
in — this was never a systematic crawl of either site), corrected toward
what's actually here: close to monochrome, ink-dominant, one thin accent.
A third and fourth pass then pulled back a full masthead band and a
full-bleed hero band — both modelled on real elements of those sites (the
Cavendish's dark hero, the Music faculty's masthead) — once they read as
over-branded in the context of an actual small internal tool rather than a
departmental homepage.

Two things follow from that history:

1. **Verify before you rely on it.** This is a considered, iterated
   approximation of the identity, arrived at through review and correction
   — not a specification pulled from an authoritative source. If a site
   using this theme needs to match Cambridge's identity precisely (an
   official or public-facing page, say), look at the live guidelines and
   department sites yourself rather than trusting this package's reading
   of them.
2. **Say what a site is, if it isn't official.** None of the services this
   theme is meant for are official University of Cambridge pages. Whether
   that needs stating on the page itself is a per-site judgement — put it
   in a footer, an About page, wherever fits — but don't let a page that
   now looks the part imply an affiliation it doesn't have.

A third pass ported mf-service's actual, by-then-settled page onto this
package to check the two matched — not by eye, by diffing rendered pixels
and computed styles between the app on its own bespoke CSS and the app on
the theme. They didn't match on the first attempt: `p { line-height:
1.55 }` fought the app's own `1.5` and produced a slow drift down the
page; `h1` had no margin reset, so the browser's default (em-relative to
`h1`'s own font-size) leaked back in once the theme changed that size;
and the wordmark link was a few pixels short because the original had
picked up padding and a transparent border incidentally, being a plain
`<a>` that also matched a broader nav-link selector. All three are fixed
here — they're the reason `.cam-header` looks the way it does now, not a
guess. A fourth pass then broadened the theme past mf-service's own
shape: `.cam-masthead` + `.cam-hero` and `.cam-prose` exist because a
single-row nav-only header and no content typography at all were fine
for mf-service specifically, but not a reasonable ceiling for "a site."

## Licence

MIT. No University of Cambridge shield, crest, or other reserved mark is
included or should be added — those stay reserved for official use.
