/**
 * fix-fork-package.cjs
 *
 * Applies fork-specific patches to package.json after merging official main.
 * Idempotent — safe to run multiple times.
 *
 * Usage: node scripts/fix-fork-package.cjs
 */

const fs = require("fs");
const path = require("path");

const pkgPath = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const changes = [];

// 1. Name
if (pkg.name !== "@yuf1011/openclaw") {
  pkg.name = "@yuf1011/openclaw";
  changes.push("name → @yuf1011/openclaw");
}

// 2. files: ensure scripts/ is included
if (Array.isArray(pkg.files) && !pkg.files.includes("scripts/")) {
  pkg.files.push("scripts/");
  changes.push('files += "scripts/"');
}

// 3. postinstall
if (!pkg.scripts) {
  pkg.scripts = {};
}
if (!pkg.scripts.postinstall || !pkg.scripts.postinstall.includes("patch-scoped")) {
  pkg.scripts.postinstall = "node scripts/patch-scoped.cjs";
  changes.push("postinstall → node scripts/patch-scoped.cjs");
}

if (changes.length === 0) {
  console.log("✅ package.json already has all fork customizations.");
} else {
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log("🔧 Applied fork patches to package.json:");
  changes.forEach((c) => console.log(`   - ${c}`));
}
