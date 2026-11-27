# Grok Bot 实验室 · Grok Bot Field Notes

Grok Bot 实验室是一个中文教程与资源网站，整理 Grok Bot 的新手入门、场景实战、问题排查、产品动态和 Bot 中文目录。文章提供可复查的步骤、实际操作截图、来源链接与使用边界。

**[在线阅读：grokbotai.fun](https://grokbotai.fun/)** · [关于本站](https://grokbotai.fun/about/) · [Bot 中文目录](https://grokbotai.fun/bots/)

## 从这里开始

- [从 0 到 1 创建第一个 Grok Bot 任务](https://grokbotai.fun/article/grok-bot-beginner-guide/)：创建 Bot、交代任务并核对输出；记录会议待办中无依据状态的纠错过程。
- [用 Grok Bot 检查网站，把坏链接和页面问题整理成报告](https://grokbotai.fun/article/grok-bot-website-check-bug-report/)：网站巡检案例，包含页面问题、真实截图及人工复查方法。
- [全部文章](https://grokbotai.fun/)：按入门、场景实战、问题排查和产品动态浏览。

本站是教程与资源项目，不提供 Grok Bot 软件本体或大模型 API 服务，也不代表 xAI 官方。涉及外部产品的功能、价格或可用范围，请核对文章所列来源和产品当前说明。

## 内容纠错与参与

发现链接失效、步骤过时或事实错误，请在本仓库提交 Issue，附上文章网址、问题位置及可核查的依据。不要在 Issue 中提交密码、令牌或其他私人信息。

Grok Bot Field Notes provides Chinese-language guides, practical workflow examples, troubleshooting articles, product updates, and a Bot directory. Read the guides at [grokbotai.fun](https://grokbotai.fun/).

## 网站源码与本地开发

本仓库包含网站源码。开发与部署说明如下。

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
