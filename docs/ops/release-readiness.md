# Release Readiness

Release preparation requires current evidence from package build, package check, npm pack dry-run, and clean consumer smoke when package behavior or package metadata changes.

Manual publish dry-run and public publish intents remain gated by explicit release approval and network access. Their fallback wrapper uses a caller-provided `NODE_AUTH_TOKEN` through a temporary npm user config, while the tag-triggered GitHub Actions release uses OIDC trusted publishing without a token. Token values must never be written into this repository.

CI startup failures caused by account billing or private-runner spending limits are environment gates. They are not package validation failures, so use current workspace-root mustflow receipts until Actions can run again.
