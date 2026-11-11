import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { articles, categories } from './src/content/articles.ts'

/** dev 与 preview 固定使用该端口。 */
const PORT = 8999
const includedRoutes = [
  '/',
  ...categories.filter(({ id }) => id !== 'all').map(({ id }) => `/category/${id}/`),
  ...articles.map(({ slug }) => `/article/${slug}/`),
]
const latestArticleDate = articles.reduce(
  (latest, article) => (article.date > latest ? article.date : latest),
  '',
)

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (character) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      "'": '&apos;',
      '"': '&quot;',
    }
    return entities[character]
  })

const staticSeoFiles = (siteOrigin: string) => ({
  name: 'static-seo-files',
  generateBundle(this: {
    emitFile: (asset: { type: 'asset'; fileName: string; source: string }) => void
  }) {
    const sitemapEntries = [
      { path: '/', lastmod: latestArticleDate },
      ...categories
        .filter(({ id }) => id !== 'all')
        .map(({ id }) => ({
          path: `/category/${id}/`,
          lastmod:
            articles
              .filter((article) => article.categoryId === id)
              .reduce((latest, article) => (article.date > latest ? article.date : latest), '') ||
            latestArticleDate,
        })),
      ...articles.map(({ slug, date }) => ({ path: `/article/${slug}/`, lastmod: date })),
    ]
    const sitemap = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...sitemapEntries.map(
        ({ path, lastmod }) =>
          `  <url>\n    <loc>${escapeXml(`${siteOrigin}${path}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
      ),
      '</urlset>',
      '',
    ].join('\n')

    this.emitFile({
      type: 'asset',
      fileName: 'robots.txt',
      source: `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`,
    })
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
  },
})

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_SITE_ORIGIN')
  const siteOrigin = (env.VITE_SITE_ORIGIN ?? 'https://pingcode.ai').replace(/\/$/, '')

  return {
    plugins: [vue(), vueJsx(), vueDevTools(), staticSeoFiles(siteOrigin)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: PORT,
      // 监听所有网卡，便于局域网内其他设备访问
      host: true,
    },
    preview: {
      port: PORT,
      host: true,
    },
    ssgOptions: {
      dirStyle: 'nested',
      includedRoutes: () => includedRoutes,
    },
  } satisfies UserConfig & {
    ssgOptions: { dirStyle: 'nested'; includedRoutes: () => string[] }
  }
})
