#!/usr/bin/env node
// Generates scss/_tokens.scss and the token block in css/cambridge-tokens.css
// from tokens/tokens.json. Run via `npm run build:tokens` (part of `npm run build`).
//
// tokens.json is hand-edited; these two files are generated. Don't edit
// _tokens.scss or the "GENERATED TOKENS" block in cambridge-tokens.css
// directly — edit tokens.json and re-run.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const tokens = JSON.parse(fs.readFileSync(path.join(ROOT, "tokens/tokens.json"), "utf8"));

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// Flat scalar tokens only (skip $comment and nested objects like categoricalPalette).
const entries = Object.entries(tokens).filter(
  ([key, val]) => key !== "$comment" && val && typeof val === "object" && "value" in val
);

// --- scss/_tokens.scss -------------------------------------------------
const scssLines = [
  "// GENERATED FILE — do not edit directly.",
  "// Source: tokens/tokens.json. Regenerate with `npm run build:tokens`.",
  "//",
  "// Bootstrap variable overrides. This file must be @imported BEFORE",
  "// \"bootstrap/scss/bootstrap\" — Bootstrap only picks up a variable if it",
  "// isn't already set (`!default`), so order matters.",
  "",
];
for (const [key, val] of entries) {
  scssLines.push(`$cam-${kebab(key)}: ${val.value};`);
}
scssLines.push("");
scssLines.push("// Map onto the Bootstrap variables that drive its component styles.");
scssLines.push("$body-color:              $cam-ink;");
scssLines.push("$body-bg:                 $cam-bg;");
scssLines.push("$primary:                 $cam-ink;");
scssLines.push("$secondary:               $cam-muted;");
scssLines.push("$danger:                  $cam-danger;");
scssLines.push("$info:                    $cam-teal-ink;");
scssLines.push("$border-color:            $cam-line;");
scssLines.push("$link-color:              $cam-ink;");
scssLines.push("$link-hover-color:        $cam-teal-ink;");
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
scssLines.push("$enable-negative-margins: true;");
scssLines.push("");
fs.writeFileSync(
  path.join(ROOT, "scss/_tokens.scss"),
  scssLines.join("\n") + "\n"
);

// --- css/cambridge-tokens.css (token block only) ------------------------
const cssLines = ["  /* --- GENERATED TOKENS: start (see tokens/tokens.json) --- */"];
for (const [key, val] of entries) {
  cssLines.push(`  --cam-${kebab(key)}: ${val.value};`);
}
cssLines.push("  /* --- GENERATED TOKENS: end --- */");
const generatedBlock = cssLines.join("\n");

const cssPath = path.join(ROOT, "css/cambridge-tokens.css");
const existing = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : null;
// Includes any leading whitespace on the marker's own line, so a
// re-run can't compound indentation each time it replaces the block.
const markerRe =
  /[ \t]*\/\* --- GENERATED TOKENS: start \(see tokens\/tokens\.json\) --- \*\/[\s\S]*?\/\* --- GENERATED TOKENS: end --- \*\//;

if (existing && markerRe.test(existing)) {
  fs.writeFileSync(cssPath, existing.replace(markerRe, generatedBlock));
} else {
  console.error(
    "css/cambridge-tokens.css is missing the GENERATED TOKENS markers — " +
      "run this after creating the file with those markers in place, not before."
  );
  process.exit(1);
}

console.log("Generated scss/_tokens.scss and updated css/cambridge-tokens.css");
