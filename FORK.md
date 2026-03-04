# @yuf1011/openclaw

This is a maintained fork of [OpenClaw](https://github.com/openclaw/openclaw) with additional model support and customizations.

## What's different?

- **Extended model catalog**: `claude-opus-4.6-1m` (936k context), `claude-opus-4.6-fast`, `gpt-5.3-codex`
- **Scoped npm package**: Published as `@yuf1011/openclaw` for easy installation
- **Daily sync**: Automatically merges upstream changes via GitHub Actions

## Install

```bash
npm i -g @yuf1011/openclaw
```

## Branch strategy

- `main` — Tracks upstream + fork customizations. Daily auto-sync.
- `fix/*` — Individual fix branches for upstream PRs.

## Automation

| Workflow       | Trigger        | Purpose                             |
| -------------- | -------------- | ----------------------------------- |
| Fork Sync      | Daily / manual | Merge upstream/main into main       |
| Auto Tag       | Push to main   | Create date-based version tag       |
| Publish to npm | Tag push       | Build and publish @yuf1011/openclaw |
| CI             | Push / PR      | Code quality checks                 |

<!-- test publish pipeline -->
