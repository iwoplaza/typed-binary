# Contributing

Pull requests are welcome! For bigger changes, consider opening an issue first to discuss the approach.

Before opening a PR, run:

```sh
pnpm install
pnpm fix    # lint & format
pnpm check  # lint, tests, build and bundle size budgets
```

Browser compatibility tests (`*.browser.test.ts`) run in Chromium, Firefox and WebKit via
[Vitest browser mode](https://vitest.dev/guide/browser/). To run them locally:

```sh
pnpm exec playwright install chromium firefox webkit  # once
pnpm test:browser
```

If your change affects users, add an entry to the `Unreleased` section of
[`packages/typed-binary/CHANGELOG.md`](./packages/typed-binary/CHANGELOG.md).

## Release workflow

1. Bump `version` in both `packages/typed-binary/package.json` and `packages/typed-binary/jsr.json`,
   and rename the changelog's `Unreleased` section to that version. Commit it as `⬆️: vX.Y.Z`.
2. Create a GitHub release with a `vX.Y.Z` tag. Publishing it triggers the
   [npm](./.github/workflows/publish-to-npm.yml) and [JSR](./.github/workflows/publish-to-jsr.yml) workflows.
   Versions containing `alpha` (e.g. `4.4.0-alpha.0`) are published to npm under the `alpha` tag.
