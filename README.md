# grokbotai

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

This project replaces its workspace TypeScript package with [typescript-native-bridge](https://github.com/johnsoncodehk/typescript-native-bridge). Command-line tools use the bridge automatically. To use it in VS Code after installing dependencies, accept the prompt to use the workspace TypeScript version. If the prompt does not appear, run **TypeScript: Select TypeScript Version** and choose **Use Workspace Version**.

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

## Prerendered production build

The production build uses `vite-ssg` to prerender `/`, every real category from
`src/content/articles.ts`, and every article route. Each route is emitted as a deep-link HTML file
with its page-specific SEO head and rendered Vue content.

The production origin is fixed to `https://grokbotai.fun`; canonical URLs, Open Graph URLs,
JSON-LD, `robots.txt`, and `sitemap.xml` all use this value. The sitemap is generated from
`src/content/articles.ts` during every build, so new category and article routes do not need to be
maintained separately.

The SSG build uses nested output so both article and category deep links have a physical
`index.html`. Vercel serves these generated files directly and redirects the two legacy category
paths in `vercel.json`. Unknown paths return the hosting platform's 404 response.

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
yarn build

# Runs the end-to-end tests
# Outside CI, this builds and starts the production preview automatically.
yarn test:e2e
# Runs the tests only on Chromium
yarn test:e2e --project=chromium
# Runs the tests of a specific file
yarn test:e2e tests/example.spec.ts
# Runs the tests in debug mode
yarn test:e2e --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```

## Automated checks

GitHub Actions runs on every branch push and pull request, and can also be started manually.
It checks types, runs both linters without changing files, builds the static site, and runs
Chromium tests against the production preview. Build output and browser reports are retained
for seven days.

The same workflow audits direct and transitive dependencies, blocks high and critical
vulnerabilities, scans the full Git history with Gitleaks, and runs CodeQL for JavaScript and
TypeScript. Gitleaks redacts detected credentials in its output. Dependabot checks npm packages
and GitHub Actions weekly and opens update pull requests.

To review vulnerabilities at every severity locally:

```sh
node .yarn/releases/yarn-4.18.1.cjs npm audit --all --recursive
```

## Vercel deployment

Import `pingcodeai/grokbotai` through Vercel's GitHub integration. Use the repository root,
Node.js 24, the `yarn build` build command, and `dist` as the output directory. The production
branch is `main`; other branches and pull requests receive preview deployments.

The canonical production origin is defined in source as `https://grokbotai.fun`, so preview or
legacy Vercel environment variables cannot accidentally replace it in generated SEO metadata.

The Git integration does not require a Vercel token in the repository or GitHub Actions.
Local `.env` files and `.vercel` state are ignored by Git. GitHub checks and Vercel builds run
independently; required checks on `main` must be configured in GitHub to prevent failed pull
requests from merging.
