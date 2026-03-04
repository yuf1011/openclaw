#!/bin/bash
set -euo pipefail

DIST="${OPENCLAW_DIST:-$(npm -g prefix)/lib/node_modules/openclaw/dist}"
SKIP_VERIFY="${SKIP_VERIFY:-false}"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; }

FORWARD_COMPAT_FILES=$(grep -rl 'function cloneFirstTemplateModel' "$DIST"/*.js 2>/dev/null || true)
REGISTRY_FILES=$(grep -rl 'synthesizedForwardCompat.*hasAvailableTemplate' "$DIST"/*.js 2>/dev/null || true)

if [ -z "$FORWARD_COMPAT_FILES" ]; then
  err "Cannot find forward-compat files in $DIST"; exit 1
fi

if [[ "${1:-}" == "--check" ]]; then
  needs_patch=false
  for f in $FORWARD_COMPAT_FILES; do
    if ! grep -q 'resolveGitHubCopilotForwardCompatModel' "$f"; then
      warn "Needs patch (forward-compat): $(basename "$f")"
      needs_patch=true
    fi
  done
  for f in $REGISTRY_FILES; do
    if ! grep -q 'Copilot 1M' "$f"; then
      warn "Needs patch (registry): $(basename "$f")"
      needs_patch=true
    fi
  done
  if $needs_patch; then
    echo ""; warn "Run: bash $0"; exit 1
  else
    log "All files already patched."; exit 0
  fi
fi

echo "=== Patching forward-compat files ==="
for f in $FORWARD_COMPAT_FILES; do
  fname=$(basename "$f")
  has_func=$(grep -c 'function resolveGitHubCopilotForwardCompatModel' "$f" || true)
  has_chain=$(grep -c 'resolveGitHubCopilotForwardCompatModel(provider, modelId, modelRegistry)' "$f" || true)
  if [ "$has_func" -ge 1 ] && [ "$has_chain" -ge 2 ]; then
    log "$fname — already patched"; continue
  fi
  python3 - "$f" "$fname" << 'PYEOF'
import sys, re
filepath = sys.argv[1]
fname = sys.argv[2]
with open(filepath, "r") as fh:
    content = fh.read()
original = content
changes = []
copilot_code = """const COPILOT_1M_FORWARD_COMPAT_CANDIDATES = [{\n\tkey: "github-copilot/claude-opus-4-6-1m",\n\ttemplatePrefixes: ["github-copilot/claude-opus-4-6", "github-copilot/claude-opus-4.6"]\n}, {\n\tkey: "github-copilot/claude-opus-4.6-1m",\n\ttemplatePrefixes: ["github-copilot/claude-opus-4.6", "github-copilot/claude-opus-4-6"]\n}];\nconst COPILOT_CLAUDE_PREFIXES = ["claude-opus-", "claude-sonnet-", "claude-haiku-"];\nconst COPILOT_1M_CONTEXT_WINDOW = 936000;\nfunction deriveCopilotBaseModelIds(modelId) {\n\tconst lower = modelId.toLowerCase();\n\tif (!lower.endsWith("-1m")) return [];\n\tconst base = lower.slice(0, -3);\n\tconst candidates = [base];\n\tif (base.includes(".")) candidates.push(base.replace(/\\./g, "-"));\n\telse candidates.push(base.replace(/(\\d+)$/, ".$1"));\n\treturn candidates;\n}\nfunction resolveGitHubCopilotForwardCompatModel(provider, modelId, modelRegistry) {\n\tconst normalizedProvider = normalizeProviderId(provider);\n\tif (normalizedProvider !== "github-copilot" && normalizedProvider !== "copilot-proxy") return;\n\tconst trimmedModelId = modelId.trim();\n\tconst lower = trimmedModelId.toLowerCase();\n\tconst isClaude = COPILOT_CLAUDE_PREFIXES.some((prefix) => lower.startsWith(prefix));\n\tif (!isClaude) return;\n\tconst baseCandidates = deriveCopilotBaseModelIds(trimmedModelId);\n\tif (baseCandidates.length > 0) {\n\t\treturn cloneFirstTemplateModel({\n\t\t\tnormalizedProvider,\n\t\t\ttrimmedModelId,\n\t\t\ttemplateIds: baseCandidates,\n\t\t\tmodelRegistry,\n\t\t\tpatch: { contextWindow: COPILOT_1M_CONTEXT_WINDOW }\n\t\t});\n\t}\n\tconst templateIds = [];\n\tif (lower.includes(".")) templateIds.push(lower.replace(/\\./g, "-"));\n\telse templateIds.push(lower.replace(/(\\d+)$/, ".$1"));\n\treturn cloneFirstTemplateModel({ normalizedProvider, trimmedModelId, templateIds, modelRegistry });\n}\n"""
if "function resolveGitHubCopilotForwardCompatModel" not in content:
    marker = "function cloneFirstTemplateModel("
    idx = content.find(marker)
    if idx == -1:
        print(f"ERROR: cannot find cloneFirstTemplateModel in {fname}", file=sys.stderr)
        sys.exit(1)
    content = content[:idx] + copilot_code + content[idx:]
    changes.append("added function definition")
chain_pattern = re.compile(
    r"(return\s+resolve\w+\(provider,\s*modelId,\s*modelRegistry\)"
    r"(?:\s*\?\?\s*resolve\w+\(provider,\s*modelId,\s*modelRegistry\))*)"
    r";"
)
match = chain_pattern.search(content)
if match:
    chain = match.group(1)
    if "resolveGitHubCopilotForwardCompatModel" not in chain:
        new_chain = chain + " ?? resolveGitHubCopilotForwardCompatModel(provider, modelId, modelRegistry);"
        content = content[:match.start()] + new_chain + content[match.end():]
        changes.append("added to forward-compat chain")
else:
    print(f"ERROR: cannot find resolveForwardCompatModel chain in {fname}", file=sys.stderr)
    sys.exit(1)
if fname.startswith("model-") and not fname.startswith("model-catalog") and not fname.startswith("model-selection") and not fname.startswith("model-param"):
    if "COPILOT_1M_FORWARD_COMPAT_CANDIDATES as c" not in content:
        export_pattern = re.compile(r"(ANTIGRAVITY_GEMINI_31_FORWARD_COMPAT_CANDIDATES as \w+)")
        m = export_pattern.search(content)
        if m:
            content = content[:m.end()] + ", COPILOT_1M_FORWARD_COMPAT_CANDIDATES as c" + content[m.end():]
            changes.append("added export alias")
        else:
            export_pattern2 = re.compile(r"(ANTIGRAVITY_\w+_FORWARD_COMPAT_CANDIDATES as \w+)(?=[,\s}])")
            m2 = export_pattern2.search(content)
            if m2:
                content = content[:m2.end()] + ", COPILOT_1M_FORWARD_COMPAT_CANDIDATES as c" + content[m2.end():]
                changes.append("added export alias (fallback)")
if content != original:
    with open(filepath, "w") as fh:
        fh.write(content)
    print(f"{fname} — patched: {', '.join(changes)}")
else:
    print(f"{fname} — no changes needed")
PYEOF
  log "$fname — done"
done

if [ -n "$REGISTRY_FILES" ]; then
  echo ""
  echo "=== Patching registry files ==="
  for f in $REGISTRY_FILES; do
    fname=$(basename "$f")
    if grep -q 'Copilot 1M' "$f"; then
      log "$fname — already patched"; continue
    fi
    python3 - "$f" "$fname" << 'PYEOF'
import sys, re
filepath = sys.argv[1]
fname = sys.argv[2]
with open(filepath, "r") as fh:
    content = fh.read()
original = content
copilot_available_keys = """\n\t\t// Copilot 1M: if base model is available, mark 1m variant available too\n\t\tfor (const suffix of ['-1m']) {\n\t\t\tfor (const base of ['github-copilot/claude-opus-4.6', 'github-copilot/claude-opus-4-6']) {\n\t\t\t\tif (availableKeys.has(base)) {\n\t\t\t\t\tavailableKeys.add(base + suffix);\n\t\t\t\t}\n\t\t\t}\n\t\t}"""
inject_pattern = re.compile(
    r"(for \(const aliasKey of synthesized\.availabilityAliasKeys\) availableKeys\.add\(aliasKey\);\s*\})"
    r"(\s*\}\s*catch)"
)
match = inject_pattern.search(content)
if match:
    content = content[:match.end(1)] + copilot_available_keys + content[match.start(2):]
    print(f"{fname} — patched: added availableKeys injection")
else:
    inject_pattern2 = re.compile(
        r"(availableKeys\.add\(aliasKey\);\s*\})"
        r"(\s*\}\s*catch\s*\()"
    )
    match2 = inject_pattern2.search(content)
    if match2:
        content = content[:match2.end(1)] + copilot_available_keys + content[match2.start(2):]
        print(f"{fname} — patched: added availableKeys injection (alt)")
    else:
        print(f"ERROR: cannot find injection point in {fname}", file=sys.stderr)
        sys.exit(1)
if content != original:
    with open(filepath, "w") as fh:
        fh.write(content)
else:
    print(f"ERROR: no changes made to {fname}", file=sys.stderr)
    sys.exit(1)
PYEOF
    log "$fname — done"
  done
fi

echo ""
if [ "$SKIP_VERIFY" = "true" ]; then
  echo "=== Patch complete (skipping runtime verification) ==="
else
  echo "=== Verification ==="
  result=$(openclaw models list 2>&1 | grep 'opus-4.6-1m' || true)
  if echo "$result" | grep -q 'yes'; then
    log "claude-opus-4.6-1m: Auth ✓"
    echo "  $result"
    echo ""
    log "Patch applied successfully! Restart gateway to activate:"
    echo "  openclaw gateway restart"
  else
    err "claude-opus-4.6-1m not showing Auth: yes"
    echo "  $result"
    echo ""
    err "Patch may have failed. Check dist files manually."
    exit 1
  fi
fi
