# cms-web-theme

University of Cambridge–identity styling for services hosted alongside
[mf-service](https://github.com/cms-cambridge/mf-service): colour, type and
components for apps and tools, and for ordinary content pages. Ships as a
Bootstrap 5 theme and as framework-agnostic CSS, from one token file.

**Not an official University design system** — see [Provenance](#provenance).

Style guide: `docs/style-guide.html`.

## Install

```
npm install github:cms-cambridge/cms-web-theme
```

Or vendor `dist/cambridge-theme.css` / `css/cambridge-tokens.css`: plain
files, no registry package yet.

## Which header?

- **`.cam-header`**: one row of wordmark, nav and actions. For a tool whose
  header is pure navigation. What mf-service uses.
- **`.cam-masthead` + `.cam-hero`**: an identity band, then a title band.
  For a page with something to introduce (homepage, about page, project
  site), modelled on [phy.cam.ac.uk](https://www.phy.cam.ac.uk/) and
  [mus.cam.ac.uk](https://www.mus.cam.ac.uk/).

One per page. Working pages are in `examples/`; `./quickstart.sh` serves
them.

## Quickstart

Pick one track. Both define `.cam-modal`, `.cam-hero` and others, and you
don't need two copies of the tokens.

### Bootstrap 5

Link the build **instead of** `bootstrap.css`:

```html
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:opsz,wght@8..60,560;8..60,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="node_modules/cms-web-theme/dist/cambridge-theme.css">
```

Stock Bootstrap classes already carry the palette. Additions for what
Bootstrap has no variable for (`scss/_components.scss`):

- `.cam-brand`: italic serif wordmark
- `.navbar-cambridge`: accent rule and underline nav, alongside `.navbar`
- `.alert-cambridge`: a quiet status line
- `.cam-modal`: one panel over a blurred page, on `<dialog>`. Bootstrap's
  `.modal` is better when you want its JS API or a full-width sheet on
  small screens.
- `.badge-cam-info` / `-success` / `-warning` / `-accent`: AA-safe
  categorical badges
- `.cam-masthead`, `.cam-hero`, `.cam-hero-deep`, `.cam-prose`: content pages

To compile from source:

```scss
@import "cms-web-theme/scss/cambridge-theme";
```

### No Bootstrap

```html
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:opsz,wght@8..60,560;8..60,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="node_modules/cms-web-theme/css/cambridge-tokens.css">
```

Use the `.cam-*` classes in the style guide (`.cam-header`, `.cam-masthead`,
`.cam-hero`, `.cam-btn`, `.cam-card`, `.cam-notice`, `.cam-modal`,
`.cam-table`, `.cam-badge-*`, `.cam-prose`, `.cam-footer`), or just the
`--cam-*` custom properties in your own CSS.

## What's in here

```
tokens/tokens.json          source of truth: colour (light and dark), type, radii
scripts/build-tokens.js     generates scss/_tokens.scss, scss/_properties.scss
                             and the token blocks in css/cambridge-tokens.css
scss/                       Bootstrap build (source)
css/cambridge-tokens.css    framework-agnostic build (hand-written apart
                             from its generated token blocks)
dist/                       precompiled Bootstrap build; committed, it's
                             what most consumers link
js/cambridge-theme.js       the optional light/dark toggle, the only script
assets/                     logo mark (light and dark), favicon
examples/                   one page per flavour
docs/style-guide.html       palette with contrast ratios, type, every component
```

## Changing a token

Edit `tokens/tokens.json`, then:

```
npm install
npm run build
```

This regenerates the token files and rebuilds `dist/`. Commit all of it:
`dist/` is checked in so consumers need no Node toolchain. Don't hand-edit
`scss/_tokens.scss`, `scss/_properties.scss` or the generated blocks in
`css/cambridge-tokens.css`.

A token with a `"dark"` value is re-declared in dark mode; one without keeps
its light value. `"aliases"` lists deprecated names (`--cam-teal`,
`--cam-teal-ink`) pointing at their replacements; delete an entry once
nothing uses it.

## Colour

Pantone 547 (`--cam-ink`, `#133844`) is the dominant colour: text, headings,
buttons, nav. The light blue from the Centre's logo (`--cam-accent`,
`#72adde`, from `assets/cms-mark.svg`) is the *one* accent, used thin: a
header rule, an active underline, a notice's edge. On a light page it is
never a text or fill colour on its own; it fails WCAG AA both ways (2.3:1 as
text on `--cam-bg`, 2.4:1 white on it). For accent-coloured text use
`--cam-accent-ink` (`#215a8c`, 6.8:1).

This is deliberate: it's how the two departmental sites checked against
actually use colour (near-monochrome), not how the guidelines' colour chips
suggest. The accent was Pantone 326 teal until it moved to the logo blue;
`--cam-teal`, `--cam-teal-ink` and `$cam-teal*` remain as deprecated
aliases.

The six-colour primary palette (Red Ribbon, Science Blue, Tango, Vida Loca,
Purple Heart, Pacific Blue) is kept for data where colour carries meaning:
status badges, chart series. Three are too light for white text at AA, so
darkened shades ship for them. Numbers are in the style guide.

## Dark mode

*Prototype.* The vanilla build follows the OS setting with no JavaScript.
To let people override it, add the toggle:

```html
<!-- in <head>, not deferred: applies a saved choice before first paint -->
<script src="node_modules/cms-web-theme/js/cambridge-theme.js"></script>

<!-- in your header; the script un-hides it -->
<button type="button" class="cam-theme-toggle" data-cam-theme-toggle
        aria-label="Dark mode" aria-pressed="false" hidden>
  <svg class="cam-only-light" …moon… /> <svg class="cam-only-dark" …sun… />
</button>
```

Full icon markup is in the style guide and examples. A click sets
`<html data-theme="light|dark">` and saves it in `localStorage`; with no
saved choice the page follows the OS, live. `data-theme` is all the CSS
reads, so a toggle of your own can set it. The script also fires
`cam-theme-change` on `document` (`detail.theme`) for anything that needs to
redraw.

**How it works.** Tokens with a `"dark"` value are re-declared under
`@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]`, so
components don't know which mode they're in. `--cam-ink` is the text colour
and goes pale; the navy moves to the surfaces. Where a token flip isn't
enough:

- The primary button inverts (pale pill, dark text) via `--cam-on-ink`.
- `.cam-hero-deep` keeps its navy via `--cam-deep`.
- Baked-in colours (select chevron, checkbox tick, the logo's black path)
  have dark twins. `.cam-only-light` / `.cam-only-dark` show one element per
  mode; `assets/cms-mark-dark.svg` is the white-ink logo.

Overriding a token yourself? Do it under both dark selectors too: the dark
block is more specific than a plain `:root`.

**Bootstrap build.** Uses Bootstrap 5.3's `data-bs-theme="dark"`, with our
palette in place of its greys; the script sets it. It doesn't read the OS
setting, so without the script or the attribute the page stays light. It
defines the same `--cam-*` properties, flipped under
`[data-bs-theme="dark"]`, which the `.cam-*` components read. The toggle
markup and `.cam-only-*` work the same (add `ms-2` to the toggle in a
navbar). Components used in this repo are themed (buttons, forms, cards,
tables, alerts, navbar); others get Bootstrap's dark defaults on our palette
and may need tuning.

## Layout

One gutter, three widths, one formula for every centred container, so
header, hero, body and footer line up at every width:

```css
width: min(var(--cam-width-page), calc(100% - 2 * var(--cam-gutter)));
margin-inline: auto;
```

| Token | Default | For |
| --- | --- | --- |
| `--cam-gutter` | `1.5rem` | Space between content and the viewport edge |
| `--cam-width-page` | `76rem` | Full-width bands: header, masthead, footer |
| `--cam-width-wide` | `60rem` | Wide content: hero, dashboards, tables (`.cam-container-wide`) |
| `--cam-width-text` | `40rem` | Reading measure: prose, forms (`.cam-container`, `.cam-prose`) |

`min()` rather than `max-width` plus padding: under `border-box`, padding
eats into the content once a container hits its max, so equal max-widths
with different padding come out different widths. Bands that wrap an
`-inner` (`.cam-footer`) take vertical padding only.

The Bootstrap build sets `$container-padding-x` from `$cam-gutter`, and has
`.cam-container` / `.cam-container-wide` with the same geometry.

## Typography

Open Sans (body, UI) and Source Serif 4 (headings, wordmark), per the
guidelines' sans/serif pairing. Source Serif 4 stands in for Feijoa, the
guidelines' display serif: a commercial face from the
[Klim Type Foundry](https://klim.co.nz/fonts/feijoa/).

**Using Feijoa.** The University licenses it for staff: see the
[typography guidance](https://www.cam.ac.uk/brand-resources/guidelines/typography)
and [brand resources](https://www.cam.ac.uk/brand-resources); Managed
Devices usually have it. The terms come with the download, behind Raven. A
licence to *use* a font isn't necessarily one to *serve* it as a webfont, so
before using it on a public site, read the terms and check with the brand
team. If cleared, change `fontSerif` in `tokens/tokens.json`, add your
`@font-face`, and rebuild.

## Provenance

Not derived from the guidelines alone. A first pass applied their colour and
type facts directly and over-produced: a six-colour bar on every page,
Science Blue as the dominant colour, coloured rules under headings. A second,
checked against screenshots of [phy.cam.ac.uk](https://www.phy.cam.ac.uk/)
and [mus.cam.ac.uk](https://www.mus.cam.ac.uk/), corrected to what those
sites do: near-monochrome, ink-dominant, one thin accent. (Direct fetches
were blocked where this was built, so it was never a systematic survey.)
Later passes added the masthead, hero and prose for content pages, and fixed
spacing drift in `.cam-header` found by diffing rendered pixels against
mf-service.

1. **Verify before relying on it.** This is a considered approximation, not
   a specification. If a site must match Cambridge's identity precisely,
   check the live guidelines and department sites.
2. **Say what a site is, if it isn't official.** None of the services this
   is for are official University pages. Whether the page needs to say so is
   a per-site call, but don't let it imply an affiliation it doesn't have.

## Licence

MIT. No University of Cambridge shield, crest or other reserved mark is
included or should be added.
