# Package Surface Checklist

- Root export, `./styles.css`, `./i18n`, and `./contract` stay public.
- No export points at `src/**`.
- `files` allowlist includes only intended package artifacts.
- Build output contains JavaScript, declaration files, and CSS expected by package checks.
- Clean consumer fixture uses package imports only.
- Package version impact is evaluated when packaged files change.
