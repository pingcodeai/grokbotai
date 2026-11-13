import { fileURLToPath, URL } from 'node:url'
import { createHash, createHmac } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'


import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { articles, categories } from './src/content/articles.ts'

/** dev 与 preview 固定使用该端口。 */
const PORT = 8999
const SITE_ORIGIN = 'https://grokbotai.fun'
const includedRoutes = [
  '/',
  '/editor/',
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

const readLocalR2Config = () => {
  const configPath = fileURLToPath(new URL('./cf.txt', import.meta.url))
  if (!existsSync(configPath)) return null
  const values = Object.fromEntries(
    readFileSync(configPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=')
        const value = separator < 0 ? '' : line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2')
        return separator < 0 ? [line, ''] : [line.slice(0, separator).trim(), value]
      }),
  )
  const required = ['CF_R2_ACCESS_KEY', 'CF_R2_SECRET_KEY', 'CF_R2_ENDPOINT', 'CF_R2_BUCKET_NAME', 'CF_R2_DOMAIN_URL']
  return required.every((key) => values[key]) ? values : null
}

const sha256 = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const hmac = (key: string | Buffer, value: string) => createHmac('sha256', key).update(value).digest()
const encodeObjectKey = (key: string) => key.split('/').map(encodeURIComponent).join('/')

const uploadToLocalR2 = async (body: Buffer, fileName: string, contentType: string) => {
  const config = readLocalR2Config()
  if (!config) throw new Error('cf.txt 缺少 Cloudflare R2 配置')
  const endpointValue = /^https?:\/\//.test(config.CF_R2_ENDPOINT)
    ? config.CF_R2_ENDPOINT
    : `https://${config.CF_R2_ENDPOINT}`
  const endpoint = new URL(endpointValue)
  const extension = fileName.match(/\.[a-zA-Z0-9]+$/)?.[0].toLowerCase() ?? '.png'
  const datePrefix = new Date().toISOString().slice(0, 10)
  const objectKey = `article-images/${datePrefix}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}${extension}`
  const encodedPath = `/${encodeURIComponent(config.CF_R2_BUCKET_NAME)}/${encodeObjectKey(objectKey)}`
  const uploadUrl = new URL(encodedPath, endpoint)
  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const shortDate = amzDate.slice(0, 8)
  const bodyHash = sha256(body)
  const canonicalHeaders = `content-type:${contentType}\nhost:${uploadUrl.host}\nx-amz-content-sha256:${bodyHash}\nx-amz-date:${amzDate}\n`
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'
  const canonicalRequest = ['PUT', uploadUrl.pathname, '', canonicalHeaders, signedHeaders, bodyHash].join('\n')
  const scope = `${shortDate}/auto/s3/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n')
  const dateKey = hmac(`AWS4${config.CF_R2_SECRET_KEY}`, shortDate)
  const regionKey = hmac(dateKey, 'auto')
  const serviceKey = hmac(regionKey, 's3')
  const signingKey = hmac(serviceKey, 'aws4_request')
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.CF_R2_ACCESS_KEY}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: authorization,
      'Content-Type': contentType,
      'x-amz-content-sha256': bodyHash,
      'x-amz-date': amzDate,
    },
    body,
  })
  if (!response.ok) throw new Error(`R2 上传失败（${response.status}）`)
  return `${config.CF_R2_DOMAIN_URL.replace(/\/$/, '')}/${objectKey}`
}

const readRequestBody = (request: IncomingMessage) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    request.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > 20 * 1024 * 1024) {
        reject(new Error('图片不能超过 20 MB'))
        request.destroy()
      } else chunks.push(chunk)
    })
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })

const localR2UploadPlugin = () => ({
  name: 'local-r2-image-upload',
  configureServer(server: { middlewares: { use: (handler: (request: IncomingMessage, response: ServerResponse, next: () => void) => void) => void } }) {
    server.middlewares.use(async (request, response, next) => {
      if (request.url !== '/api/local-r2-upload' || request.method !== 'POST') return next()
      try {
        const body = await readRequestBody(request)
        const encodedName = String(request.headers['x-file-name'] ?? 'pasted-image.png')
        const fileName = decodeURIComponent(encodedName)
        const contentType = String(request.headers['content-type'] ?? 'image/png')
        if (!contentType.startsWith('image/')) throw new Error('仅支持上传图片')
        const url = await uploadToLocalR2(body, fileName, contentType)
        response.statusCode = 200
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.end(JSON.stringify({ url }))
      } catch (error) {
        response.statusCode = 500
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.end(JSON.stringify({ error: error instanceof Error ? error.message : '上传失败' }))
      }
    })
  },
})

const localArticleSavePlugin = () => ({
  name: 'local-article-save',
  configureServer(server: { middlewares: { use: (handler: (request: IncomingMessage, response: ServerResponse, next: () => void) => void) => void } }) {
    server.middlewares.use(async (request, response, next) => {
      if (request.url !== '/api/local-article-save' || request.method !== 'POST') return next()
      const reply = (status: number, body: object) => {
        response.statusCode = status
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.end(JSON.stringify(body))
      }
      try {
        const origin = request.headers.origin
        if (!origin || new URL(origin).host !== request.headers.host || request.headers['content-type']?.split(';')[0] !== 'application/json') {
          return reply(403, { error: '仅允许从本地文章工作台保存' })
        }
        const payload: unknown = JSON.parse((await readRequestBody(request)).toString('utf8'))
        if (!Array.isArray(payload) || payload.length > 500 || !payload.length) throw new Error('文章列表无效')
        const usedSlugs = new Set<string>()
        const knownNumbers = new Map(articles.map((article) => [article.slug, article.number]))
        const knownMetadata = new Map(articles.map((article) => [article.slug, article]))
        let nextNumber = Math.max(0, ...articles.map((article) => Number(article.number) || 0))
        const saved = payload.map((item: unknown) => {
          if (!item || typeof item !== 'object') throw new Error('文章格式无效')
          const data = item as Record<string, unknown>
          const slug = String(data.slug ?? '').trim()
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || usedSlugs.has(slug)) throw new Error('文章 Slug 无效或重复：' + slug)
          usedSlugs.add(slug)
          const title = String(data.title ?? '').trim()
          const description = String(data.description ?? '').trim()
          const categoryId = String(data.categoryId ?? '')
          const category = categories.find((entry) => entry.id === categoryId && entry.id !== 'all')
          const date = String(data.date ?? '')
          const readingTime = Number(data.readingTime)
          const markdown = data.markdown
          const image = String(data.image ?? '').trim()
          if (!title || !description || !category || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(readingTime) || readingTime < 1 || typeof markdown !== 'string' || !markdown.trim()) throw new Error('请填写标题、摘要、分类、日期、阅读时间和正文')
          if (image && !/^https?:\/\//i.test(image)) throw new Error('封面图片 URL 必须以 http 或 https 开头')
          return {
            slug,
            number: knownNumbers.get(slug) ?? String(++nextNumber).padStart(3, '0'),
            categoryId,
            category: category.label,
            title,
            description,
            date,
            displayDate: date.replace(/-/g, '.'),
            readingTime,
            ...(image ? { image } : {}),
            ...(typeof data.imageAlt === 'string' && data.imageAlt ? { imageAlt: data.imageAlt } : knownMetadata.get(slug)?.imageAlt ? { imageAlt: knownMetadata.get(slug)?.imageAlt } : {}),
            ...(data.format === 'markdown' || knownMetadata.get(slug)?.format === 'markdown' ? { format: 'markdown' } : {}),
            markdown,
          }
        })
        const path = fileURLToPath(new URL('./src/content/articles.ts', import.meta.url))
        const original = readFileSync(path, 'utf8')
        const start = original.indexOf('export const articles: Article[] = [')
        const end = original.indexOf('\nexport function findArticle(', start)
        if (start < 0 || end < 0) throw new Error('无法定位文章数据，文件没有改动')
        const serialized = saved.map((entry) => '  ' + JSON.stringify(entry, null, 2).replace(/\n/g, '\n  ')).join(',\n')
        const updated = original.slice(0, start) + 'export const articles: Article[] = [\n' + serialized + '\n]\n' + original.slice(end)
        await writeFile(path, updated, 'utf8')
        reply(200, { count: saved.length })
      } catch (error) {
        reply(400, { error: error instanceof Error ? error.message : '保存失败' })
      }
    })
  },
})

const staticSeoFiles = (siteOrigin: string) => ({
  name: 'static-seo-files',
  generateBundle(this: {
    emitFile: (asset: { type: 'asset'; fileName: string; source: string }) => void
  }) {
    const pageEntries = [
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
    ]
    const articleEntries = articles.map(({ slug, date }) => ({
      path: `/article/${slug}/`,
      lastmod: date,
    }))
    const createUrlSet = (entries: { path: string; lastmod: string }[]) =>
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries.map(
          ({ path, lastmod }) =>
            `  <url>\n    <loc>${escapeXml(`${siteOrigin}${path}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
        ),
        '</urlset>',
        '',
      ].join('\n')
    const sitemapIndex = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...[
        { path: '/sitemaps/page-sitemap.xml', lastmod: latestArticleDate },
        { path: '/sitemaps/article-sitemap.xml', lastmod: latestArticleDate },
      ].map(
        ({ path, lastmod }) =>
          `  <sitemap>\n    <loc>${escapeXml(`${siteOrigin}${path}`)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`,
      ),
      '</sitemapindex>',
      '',
    ].join('\n')

    this.emitFile({
      type: 'asset',
      fileName: 'robots.txt',
      source: `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\n`,
    })
    this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapIndex })
    this.emitFile({
      type: 'asset',
      fileName: 'sitemaps/page-sitemap.xml',
      source: createUrlSet(pageEntries),
    })
    this.emitFile({
      type: 'asset',
      fileName: 'sitemaps/article-sitemap.xml',
      source: createUrlSet(articleEntries),
    })
  },
})

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [localArticleSavePlugin(), localR2UploadPlugin(), vue(), vueJsx(), vueDevTools(), staticSeoFiles(SITE_ORIGIN)],
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
