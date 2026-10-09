#!/usr/bin/env node
// Generates scss/_tokens.scss and the two token blocks in
// css/cambridge-tokens.css (light, then dark) from tokens/tokens.json.
// Run via `npm run build:tokens` (part of `npm run build`).
//
// tokens.json is hand-edited; these files are generated. Don't edit
// _tokens.scss or the "GENERATED ... TOKENS" blocks in cambridge-tokens.css
// directly — edit tokens.json and re-run.
//
// A token may carry a "dark" value next to its "value". Those are emitted
// only into the CSS build (the Bootstrap build has no dark mode yet).
// Top-level "aliases" maps a deprecated token name onto its replacement.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, "tokens/tokens.json"), "utf8"));

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// Flat scalar tokens only (skip $comment and nested objects like categoricalPalette).
const entries = Object.entries(tokens).filter(
  ([key, val]) => key !== "$comment" && val && typeof val === "object" && "value" in val
);

const aliases = Object.entries(tokens.aliases || {}).filter(([key]) => key !== "$comment");
const darkEntries = entries.filter(([, val]) => "dark" in val);

// --- scss/_tokens.scss -------------------------------------------------
const scssLines = [
  "// GENERATED FILE — do not edit directly.",
  "// Source: tokens/tokens.json. Regenerate with `npm run build:tokens`.",
  "//",
  "// Bootstrap variable overrides. This file must be @imported BEFORE",
  "// \"bootstrap/scss/bootstrap\" — Bootstrap only picks up a variable if it",
  "// isn't already set (`!default`), so order matters.",
  "//",
  "// Light values only: the Bootstrap build has no dark mode yet, so the",
  "// \"dark\" values in tokens.json are emitted into the CSS build alone.",
  "",
];
for (const [key, val] of entries) {
  scssLines.push(`$cam-${kebab(key)}: ${val.value};`);
}
if (aliases.length) {
  scssLines.push("");
  scssLines.push("// Deprecated names — see \"aliases\" in tokens.json.");
  for (const [oldKey, newKey] of aliases) {
    scssLines.push(`$cam-${kebab(oldKey)}: $cam-${kebab(newKey)};`);
  }
}
scssLines.push("");
scssLines.push("// Map onto the Bootstrap variables that drive its component styles.");
scssLines.push("$body-color:              $cam-ink;");
scssLines.push("$body-bg:                 $cam-bg;");
scssLines.push("$primary:                 $cam-ink;");
scssLines.push("$secondary:               $cam-muted;");
scssLines.push("$danger:                  $cam-danger;");
scssLines.push("$info:                    $cam-accent-ink;");
scssLines.push("$border-color:            $cam-line;");
scssLines.push("$link-color:              $cam-ink;");
scssLines.push("$link-hover-color:        $cam-accent-ink;");
scssLines.push("$font-family-sans-serif:  $cam-font-sans;");
scssLines.push("$font-family-base:        $cam-font-sans;");
scssLines.push("$headings-font-family:    $cam-font-serif;");
scssLines.push("$headings-font-weight:    600;");
scssLines.push("$headings-color:          $cam-ink;");
scssLines.push("$border-radius:           $cam-radius-md;");
scssLines.push("$border-radius-sm:        $cam-radius-sm;");
scssLines.push("$border-radius-lg:        $cam-radius-md;");
scssLines.push("$border-radius-pill:      $cam-radius-pill;");
scssLines.push("$btn-border-radius:       $cam-radius-pill;");
scssLines.push("$btn-border-radius-sm:    $cam-radius-pill;");
scssLines.push("$btn-border-radius-lg:    $cam-radius-pill;");
scssLines.push("$focus-ring-color:        rgba($cam-focus, 0.35);");
scssLines.push("// One gutter across both flavours: Bootstrap's .container picks this up,");
scssLines.push("// the vanilla build's containers read --cam-gutter.");
scssLines.push("$container-padding-x:     $cam-gutter;");
scssLines.push("$grid-gutter-width:       $cam-gutter * 2;");
scssLines.push("$enable-negative-margins: true;");
scssLines.push("");
fs.writeFileSync(
  path.join(ROOT, "scss/_tokens.scss"),
  scssLines.join("\n") + "\n"
);

// --- css/cambridge-tokens.css (two generated blocks) --------------------
const light = ["  /* --- GENERATED TOKENS: start (see tokens/tokens.json) --- */"];
for (const [key, val] of entries) {
  light.push(`  --cam-${kebab(key)}: ${val.value};`);
}
if (aliases.length) {
  light.push("  /* Deprecated names — see \"aliases\" in tokens.json. var() so they follow dark mode. */");
  for (const [oldKey, newKey] of aliases) {
    light.push(`  --cam-${kebab(oldKey)}: var(--cam-${kebab(newKey)});`);
  }
}
light.push("  /* --- GENERATED TOKENS: end --- */");

// The dark values appear twice, because there are two ways to be in dark
// mode and CSS can't OR a media query with an attribute selector:
//   - the OS asks for it and the page hasn't said otherwise (no JS needed);
//   - the page says so, via data-theme="dark" (what the toggle sets).
// data-theme="light" beats an OS preference for dark; that is what lets the
// toggle override the OS in either direction.
const darkDecls = (indent) => [
  `${indent}color-scheme: dark;`,
  ...darkEntries.map(([key, val]) => `${indent}--cam-${kebab(key)}: ${val.dark};`),
];
const dark = [
  "/* --- GENERATED DARK TOKENS: start (see tokens/tokens.json) --- */",
  "@media (prefers-color-scheme: dark) {",
  "  :root:not([data-theme=\"light\"]) {",
  ...darkDecls("    "),
  "  }",
  "}",
  "",
  ":root[data-theme=\"dark\"] {",
  ...darkDecls("  "),
  "}",
  "/* --- GENERATED DARK TOKENS: end --- */",
];

const cssPath = path.join(ROOT, "css/cambridge-tokens.css");
let css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";

// Each marker pair's own leading whitespace is part of the match, so a
// re-run can't compound indentation each time it replaces a block.
const blockRe = (name) =>
  new RegExp(
    `[ \\t]*\\/\\* --- GENERATED ${name}: start \\(see tokens\\/tokens\\.json\\) --- \\*\\/[\\s\\S]*?\\/\\* --- GENERATED ${name}: end --- \\*\\/`
  );

for (const [name, lines] of [["TOKENS", light], ["DARK TOKENS", dark]]) {
  const re = blockRe(name);
  if (!re.test(css)) {
    console.error(
      `css/cambridge-tokens.css is missing the GENERATED ${name} markers — ` +
        "run this after creating the file with those markers in place, not before."
    );
    process.exit(1);
  }
  css = css.replace(re, () => lines.join("\n"));
}
fs.writeFileSync(cssPath, css);

console.log("Generated scss/_tokens.scss and updated css/cambridge-tokens.css");
