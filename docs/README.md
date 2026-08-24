# Docs

`zdp-auth-ui` docs separate reusable UI package boundaries from identity authority.

## Contracts

- `contracts/package-surface.md`: package exports, files allowlist, dist surface
- `contracts/auth-boundary.md`: UI-only authentication boundary
- `contracts/auth-feedback.md`: closed feedback codes, localized presentation, and focus behavior
- `contracts/auth-handoff-registry.md`: generated closed product and return-path registry
- `contracts/auth-surface-model.md`: trusted feature configuration to shared AuthShell props
- `contracts/locale-messages.md`: active and planned locale contract
- `contracts/passkey-provider.md`: passkey and provider UI limits

## Operations

- `ops/release-readiness.md`: package release evidence and manual gates

상위 실행 기준은 `VALIDATION.md`를 따른다.
