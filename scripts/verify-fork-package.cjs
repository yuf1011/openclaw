/**
 * verify-fork-package.cjs
 *
 * Validates that package.json has all fork-specific fields intact.
 * Run after merging official main into dev, before publishing.
 *
 * Usage: node scripts/verify-fork-package.cjs
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const pkgPath = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const errors = [];
const warnings = [];

// 1. Check name
if (pkg.name !== "@yuf1011/openclaw") {
  errors.push(`name is "${pkg.name}", expected "@yuf1011/openclaw"`);
}

// 2. Check files array includes scripts/
if (!Array.isArray(pkg.files)) {
  errors.push("files array is missing");
} else {
  if (!pkg.files.includes("scripts/")) {
    errors.push('files array missing "scripts/" (needed for patch-scoped.cjs)');
  }
  const required = ["dist/", "docs/", "assets/", "skills/", "extensions/"];
  for (const f of required) {
    if (!pkg.files.includes(f)) {
      errors.push(`files array missing "${f}"`);
    }
  }
}

// 3. Check postinstall
if (!pkg.scripts?.postinstall) {
  errors.push("scripts.postinstall is missing (need: node scripts/patch-scoped.cjs)");
} else if (!pkg.scripts.postinstall.includes("patch-scoped")) {
  warnings.push(`postinstall is "${pkg.scripts.postinstall}", expected to contain "patch-scoped"`);
}

// 4. Check patch-scoped.cjs exists
const patchPath = path.join(__dirname, "patch-scoped.cjs");
if (!fs.existsSync(patchPath)) {
  errors.push("scripts/patch-scoped.cjs does not exist");
}

// 5. Check docs/reference/templates exists
const templatesDir = path.join(__dirname, "..", "docs", "reference", "templates");
if (!fs.existsSync(templatesDir)) {
  warnings.push("docs/reference/templates/ directory not found");
}

// 6. npm pack dry-run check
console.log("\nRunning npm pack --dry-run...\n");
try {
  const packOutput = execSync("npm pack --dry-run 2>&1", {
    cwd: path.join(__dirname, ".."),
    encoding: "utf8",
    timeout: 30000,
  });

  const mustInclude = ["scripts/patch-scoped.cjs"];
  for (const f of mustInclude) {
    if (!packOutput.includes(f)) {
      errors.push(`npm pack output missing "${f}"`);
    }
  }

  // Show summary
  const lines = packOutput.split("\n");
  const sizeLine = lines.find((l) => l.includes("total files:") || l.includes("Tarball"));
  if (sizeLine) {
    console.log(sizeLine.trim());
  }
} catch (e) {
  warnings.push("npm pack --dry-run failed: " + e.message.slice(0, 100));
}

// Report
console.log("");
if (errors.length === 0 && warnings.length === 0) {
  console.log("All fork-specific checks passed!\n");
  process.exit(0);
} else {
  if (warnings.length > 0) {
    console.log("Warnings:");
    warnings.forEach((w) => console.log(`   - ${w}`));
    console.log("");
  }
  if (errors.length > 0) {
    console.log("Errors:");
    errors.forEach((e) => console.log(`   - ${e}`));
    console.log("");
    process.exit(1);
  }
}
