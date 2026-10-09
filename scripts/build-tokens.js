#!/usr/bin/env node
// Generates, from tokens/tokens.json (`npm run build:tokens`, part of `npm run build`):
//   scss/_tokens.scss      Sass variables + Bootstrap overrides (light and dark)
//   scss/_properties.scss  --cam-* custom properties for the Bootstrap build
//   css/cambridge-tokens.css   the token blocks (light, dark) in the vanilla build
// Edit tokens.json and re-run; don't edit the generated files or blocks.
//
// A token's "dark" value is its dark-mode override. "aliases" maps a
// deprecated token name to its replacement.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, "tokens/tokens.json"), "utf8"));

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// Flat scalar tokens only (skips $comment and nested objects like categoricalPalette).
const entries = Object.entries(tokens).filter(
  ([key, val]) => key !== "$comment" && val && typeof val === "object" && "value" in val
);
const aliases = Object.entries(tokens.aliases || {}).filter(([key]) => key !== "$comment");
const darkEntries = entries.filter(([, val]) => "dark" in val);

// --- scss/_tokens.scss --------------------------------------------------
const scss = [
  "// GENERATED FILE — do not edit. Source: tokens/tokens.json (`npm run build:tokens`).",
  "//",
  "// Bootstrap variable overrides. @import before \"bootstrap/scss/bootstrap\":",
  "// Bootstrap only takes a variable it hasn't already seen (`!default`).",
  "",
];
for (const [key, val] of entries) scss.push(`$cam-${kebab(key)}: ${val.value};`);
for (const [key, val] of darkEntries) scss.push(`$cam-${kebab(key)}-dark: ${val.dark};`);
if (aliases.length) {
  scss.push("", "// Deprecated names (\"aliases\" in tokens.json).");
  for (const [oldKey, newKey] of aliases) scss.push(`$cam-${kebab(oldKey)}: $cam-${kebab(newKey)};`);
}
scss.push(
  "",
  "// Bootstrap variables that drive its component styles.",
  "$body-color:              $cam-ink;",
  "$body-bg:                 $cam-bg;",
  "$primary:                 $cam-ink;",
  "$secondary:               $cam-muted;",
  "$danger:                  $cam-danger;",
  "$info:                    $cam-accent-ink;",
  "$border-color:            $cam-line;",
  "$link-color:              $cam-ink;",
  "$link-hover-color:        $cam-accent-ink;",
  "$font-family-sans-serif:  $cam-font-sans;",
  "$font-family-base:        $cam-font-sans;",
  "$headings-font-family:    $cam-font-serif;",
  "$headings-font-weight:    600;",
  "$headings-color:          $cam-ink;",
  "$border-radius:           $cam-radius-md;",
  "$border-radius-sm:        $cam-radius-sm;",
  "$border-radius-lg:        $cam-radius-md;",
  "$border-radius-pill:      $cam-radius-pill;",
  "$btn-border-radius:       $cam-radius-pill;",
  "$btn-border-radius-sm:    $cam-radius-pill;",
  "$btn-border-radius-lg:    $cam-radius-pill;",
  "$focus-ring-color:        rgba($cam-focus, 0.35);",
  "// One gutter for both builds.",
  "$container-padding-x:     $cam-gutter;",
  "$grid-gutter-width:       $cam-gutter * 2;",
  "$enable-negative-margins: true;",
  "",
  "// Bootstrap's own dark mode ([data-bs-theme=\"dark\"]), on our palette.",
  "$body-color-dark:           $cam-ink-dark;",
  "$body-bg-dark:              $cam-bg-dark;",
  "$body-emphasis-color-dark:  $cam-ink-deep-dark;",
  "$body-secondary-color-dark: $cam-muted-dark;",
  "$body-secondary-bg-dark:    $cam-fill-dark;",
  "$body-tertiary-bg-dark:     $cam-surface-dark;",
  "$border-color-dark:         $cam-line-dark;",
  "$link-color-dark:           $cam-ink-dark;",
  "$link-hover-color-dark:     $cam-accent-ink-dark;",
  ""
);
fs.writeFileSync(path.join(ROOT, "scss/_tokens.scss"), scss.join("\n") + "\n");

// Declarations shared by the CSS outputs below.
const lightDecls = (indent) => [
  ...entries.map(([key, val]) => `${indent}--cam-${kebab(key)}: ${val.value};`),
  ...aliases.map(([o, n]) => `${indent}--cam-${kebab(o)}: var(--cam-${kebab(n)}); /* deprecated */`),
];
const darkDecls = (indent) =>
  darkEntries.map(([key, val]) => `${indent}--cam-${kebab(key)}: ${val.dark};`);

// --- scss/_properties.scss (Bootstrap build) ------------------------------
// Keyed on Bootstrap's own switch, data-bs-theme.
fs.writeFileSync(
  path.join(ROOT, "scss/_properties.scss"),
  [
    "// GENERATED FILE — do not edit. Source: tokens/tokens.json (`npm run build:tokens`).",
    "",
    ":root {",
    ...lightDecls("  "),
    "}",
    "",
    "[data-bs-theme=\"dark\"] {",
    ...darkDecls("  "),
    "}",
    "",
  ].join("\n")
);

// --- css/cambridge-tokens.css (vanilla build): light and dark blocks -------
const light = [
  "  /* --- GENERATED TOKENS: start (see tokens/tokens.json) --- */",
  ...lightDecls("  "),
  "  /* --- GENERATED TOKENS: end --- */",
];

// Dark is declared twice because CSS can't OR a media query with an attribute:
// the OS asks for it and the page hasn't said light, or the page says dark.
const dark = [
  "/* --- GENERATED DARK TOKENS: start (see tokens/tokens.json) --- */",
  "@media (prefers-color-scheme: dark) {",
  "  :root:not([data-theme=\"light\"]) {",
  "    color-scheme: dark;",
  ...darkDecls("    "),
  "  }",
  "}",
  "",
  ":root[data-theme=\"dark\"] {",
  "  color-scheme: dark;",
  ...darkDecls("  "),
  "}",
  "/* --- GENERATED DARK TOKENS: end --- */",
];

const cssPath = path.join(ROOT, "css/cambridge-tokens.css");
let css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";

// The match includes each marker's leading whitespace so re-runs don't compound indentation.
const blockRe = (name) =>
  new RegExp(
    `[ \\t]*\\/\\* --- GENERATED ${name}: start \\(see tokens\\/tokens\\.json\\) --- \\*\\/[\\s\\S]*?\\/\\* --- GENERATED ${name}: end --- \\*\\/`
  );

for (const [name, lines] of [["TOKENS", light], ["DARK TOKENS", dark]]) {
  const re = blockRe(name);
  if (!re.test(css)) {
    console.error(`css/cambridge-tokens.css is missing the GENERATED ${name} markers.`);
    process.exit(1);
  }
  css = css.replace(re, () => lines.join("\n"));
}
fs.writeFileSync(cssPath, css);

console.log("Generated scss/_tokens.scss, scss/_properties.scss and css/cambridge-tokens.css blocks");
