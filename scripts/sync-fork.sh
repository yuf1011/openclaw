#!/bin/bash
# Sync OpenClaw fork: fetch upstream, merge into topic branch, push
# Runs via openclaw cron on Windows-Work node
set -euo pipefail

REPO_DIR="/mnt/q/src/openclaw"
TOPIC_BRANCH="fix/copilot-claude-1m-context"
FORK_REMOTE="myfork"
UPSTREAM_REMOTE="origin"
GIT_WIN="/mnt/c/Program Files/Git/cmd/git.exe"

cd "$REPO_DIR"

echo "=== Step 1: Fetch upstream ==="
"$GIT_WIN" fetch "$UPSTREAM_REMOTE" --quiet 2>&1
"$GIT_WIN" fetch "$FORK_REMOTE" --quiet 2>&1

echo "=== Step 2: Update fork's main (fast-forward) ==="
git checkout main --quiet 2>/dev/null
git merge "$UPSTREAM_REMOTE/main" --ff-only --quiet 2>&1 || {
  echo "WARNING: main cannot fast-forward, skipping main update"
  git checkout "$TOPIC_BRANCH" --quiet
}
# Push updated main to fork
"$GIT_WIN" push "$FORK_REMOTE" main 2>&1 || echo "WARNING: could not push main"

echo "=== Step 3: Switch to topic branch and merge main ==="
git checkout "$TOPIC_BRANCH" --quiet

MERGE_OUTPUT=$(git merge main --no-edit 2>&1) || {
  echo "CONFLICT detected!"
  echo "$MERGE_OUTPUT"
  git merge --abort 2>/dev/null || true
  echo "MERGE_CONFLICT"
  exit 1
}

echo "$MERGE_OUTPUT"

if echo "$MERGE_OUTPUT" | grep -q "Already up to date"; then
  echo "ALREADY_UP_TO_DATE"
  exit 0
fi

echo "=== Step 4: Push merged topic branch ==="
"$GIT_WIN" push "$FORK_REMOTE" "$TOPIC_BRANCH" 2>&1

echo "MERGE_SUCCESS"
