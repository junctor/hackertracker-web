<!--VITE PLUS START-->

# Vite+ Agent Notes

This project uses Vite+ through the `vp` CLI. Use `vp` for package management and project tooling; do not run `npm`, `pnpm`, or Yarn directly unless the user explicitly asks.

## Commands

- `vp install` - install dependencies and configure Vite+ hooks.
- `vp dev` - start the Vite development server.
- `vp check` - run Oxfmt formatting checks, Oxlint, and TypeScript checks.
- `vp lint` / `vp fmt` - run focused lint or format commands when a full check is not needed.
- `vp test` - run Vitest through Vite+ when tests are present.
- `vp build` - build the app with Vite+.
- `vp preview` - preview a production build locally.
- `vp run <script>` - run a `package.json` script when its name collides with a Vite+ built-in command. For example, use `vp run build` if you need the full `build` script plus `postbuild`.

## Tooling Rules

- Import Vite/Vitest utilities from `vite-plus` where applicable, for example `import { defineConfig } from "vite-plus";` and test utilities from `vite-plus/test`.
- Do not install ESLint, Prettier, Vitest, Oxlint, Oxfmt, or tsdown directly; Vite+ provides the active lint, format, test, and build tooling.
- Use Vite+ dependency commands such as `vp add`, `vp remove`, `vp update`, and `vp why` instead of package-manager equivalents.
- Use `vp dlx` for one-off package binaries instead of `npx`, `pnpm dlx`, or `yarn dlx`.
- Do not call wrapped tools as fake subcommands such as `vp vitest` or `vp oxlint`; use `vp test`, `vp lint`, and `vp fmt`.
- Use `vp help`, `vp <command> --help`, or `vp --version` to confirm command options and bundled tool versions.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` to validate formatting, linting, and types.
- [ ] Run `vp test` only when test files exist or the change adds tests.
- [ ] Run `vp build` for production-build validation.
<!--VITE PLUS END-->
