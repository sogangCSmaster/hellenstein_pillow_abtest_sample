#!/usr/bin/env node

const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const sourcePath = path.join(rootDir, "gtm", "hellenstein-pillow-abtest.source.html");
const outputPath = path.join(rootDir, "gtm", "hellenstein-pillow-abtest.custom-html.html");
const tempSourcePath = path.join(os.tmpdir(), "hst-gtm-source.js");
const tempCompiledPath = path.join(os.tmpdir(), "hst-gtm-compiled.js");

function extractScript(html) {
  const match = html.match(/<script>([\s\S]*)<\/script>/);
  if (!match) {
    throw new Error("source html must contain one <script>...</script> block");
  }
  return match[1];
}

function assertCompiledScript(script) {
  const unsupportedPatterns = [
    ["template literal", /`/],
    ["const keyword", /\bconst\b/],
    ["let keyword", /\blet\b/],
    ["arrow function", /=>/],
    ["spread syntax", /\.\.\./],
    ["URLSearchParams", /URLSearchParams/],
    ["Object.assign", /Object\.assign/],
  ];

  unsupportedPatterns.forEach(function ([label, pattern]) {
    if (pattern.test(script)) {
      throw new Error("compiled GTM script still contains unsupported syntax: " + label);
    }
  });

  new Function(script);
}

function main() {
  const html = fs.readFileSync(sourcePath, "utf8");
  const script = extractScript(html);
  const npxBin = process.platform === "win32" ? "npx.cmd" : "npx";

  fs.writeFileSync(tempSourcePath, script);
  execFileSync(
    npxBin,
    [
      "--yes",
      "google-closure-compiler",
      "--language_in",
      "ECMASCRIPT3",
      "--language_out",
      "ECMASCRIPT3",
      "--compilation_level",
      "SIMPLE",
      "--js",
      tempSourcePath,
      "--js_output_file",
      tempCompiledPath,
    ],
    { stdio: "inherit" }
  );

  const compiled = fs.readFileSync(tempCompiledPath, "utf8").trim();
  assertCompiledScript(compiled);
  fs.writeFileSync(outputPath, "<script>\n" + compiled + "\n</script>\n");
  console.log("compiled GTM Custom HTML:", path.relative(rootDir, outputPath));
}

main();
