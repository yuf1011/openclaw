const fs = require("fs");
const { execSync } = require("child_process");

// Fix package.json name
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.name = "@yuf1011/openclaw";
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
console.log("Set package name to @yuf1011/openclaw");

// Fix CORE_PACKAGE_NAMES in dist
const files = execSync('find dist -name "*.js" -type f').toString().trim().split("\n");
console.log("Found " + files.length + " JS files in dist/");

let patched = 0;
const search = 'new Set(["openclaw"])';
const replace = 'new Set(["openclaw","@yuf1011/openclaw"])';

for (const f of files) {
  if (!f) continue;
  const src = fs.readFileSync(f, "utf8");
  if (src.includes(search)) {
    fs.writeFileSync(f, src.split(search).join(replace));
    patched++;
    console.log("Patched: " + f);
  }
}
console.log("Total patched: " + patched);

// Also check with grep for debug
if (patched === 0) {
  console.log("DEBUG: searching for openclaw in dist...");
  try {
    const out = execSync('grep -rl "openclaw" dist/ | head -10').toString();
    console.log(out);
    const sample = execSync('grep -o "new Set.\\{0,40\\}" dist/*.js dist/**/*.js 2>/dev/null | head -10').toString();
    console.log("Sample Set patterns: " + sample);
  } catch(e) { console.log("grep failed: " + e.message); }
  process.exit(1);
}
