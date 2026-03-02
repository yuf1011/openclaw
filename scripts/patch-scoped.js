const fs = require("fs");
const path = require("path");

// When run as postinstall: fix package.json name back to "openclaw"
// so CORE_PACKAGE_NAMES detection works
const pkgPath = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
if (pkg.name !== "openclaw") {
  pkg.name = "openclaw";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log("[patch-scoped] Reverted package.json name to 'openclaw' for path resolution");
}
