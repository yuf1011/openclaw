const fs = require("fs");
const { execSync } = require("child_process");

// Fix package.json name
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.name = "@yuf1011/openclaw";
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log("Set package name to @yuf1011/openclaw");

// Fix CORE_PACKAGE_NAMES in dist
const files = execSync('find dist -name "*.js"').toString().trim().split("\n");
let patched = 0;
const search = 'new Set(["openclaw"])';
const replace = 'new Set(["openclaw","@yuf1011/openclaw"])';
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  if (src.includes(search)) {
    fs.writeFileSync(f, src.split(search).join(replace));
    patched++;
    console.log("Patched: " + f);
  }
}
console.log("Total patched: " + patched);
if (patched === 0) {
  console.error("WARNING: No files were patched!");
  process.exit(1);
}
