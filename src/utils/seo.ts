import { useHead } from '@unhead/vue'

interface BreadcrumbItem {
  name: string
  path: string
}

interface PageSeo {
  title: string
  structuredDataTitle?: string
  description: string
  path: string
  image?: string
  imageAlt?: string
  pageType?: 'home' | 'category' | 'article' | 'about' | 'utility'
  robots?: 'index,follow' | 'noindex,follow'
  breadcrumbs?: BreadcrumbItem[]
  article?: { publishedTime: string; modifiedTime?: string; author: string; keywords: string[] }
}

export const SITE_ORIGIN = 'https://grokbotai.fun'
export const SITE_NAME = 'Grok Bot 实验室'
const DEFAULT_IMAGE = new URL('/images/grok-bot-workflow.jpg', SITE_ORIGIN).href
const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`
const WEBSITE_ID = `${SITE_ORIGIN}/#website`

const absoluteUrl = (value?: string) => value ? new URL(value, SITE_ORIGIN).href : DEFAULT_IMAGE

export function setPageSeo({
  title,
  structuredDataTitle = title,
  description,
  path,
  image,
  imageAlt = structuredDataTitle,
  pageType = 'utility',
  robots = 'index,follow',
  breadcrumbs = [],
  article,
}: PageSeo) {
  const canonicalUrl = new URL(path, SITE_ORIGIN).href
  const imageUrl = absoluteUrl(image)
  const imageType = /\.webp(?:$|\?)/i.test(imageUrl)
    ? 'image/webp'
    : /\.png(?:$|\?)/i.test(imageUrl)
      ? 'image/png'
      : 'image/jpeg'
  const organization = {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_ORIGIN,
    logo: { '@type': 'ImageObject', url: new URL('/grok-bot-icon.svg', SITE_ORIGIN).href },
    sameAs: ['https://github.com/pingcodeai/grokbotai'],
  }
  const website = {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_ORIGIN}/`,
    publisher: { '@id': ORGANIZATION_ID },
    inLanguage: 'zh-CN',
  }
  const breadcrumbData = breadcrumbs.length
    ? {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: new URL(item.path, SITE_ORIGIN).href,
        })),
      }
    : undefined
  const pageData = article
    ? {
        '@type': 'Article',
        headline: structuredDataTitle,
        description,
        url: canonicalUrl,
        mainEntityOfPage: canonicalUrl,
        image: { '@type': 'ImageObject', url: imageUrl },
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime ?? article.publishedTime,
        author: { '@id': ORGANIZATION_ID },
        publisher: { '@id': ORGANIZATION_ID },
        keywords: article.keywords,
        inLanguage: 'zh-CN',
      }
    : {
        '@type': pageType === 'category' ? 'CollectionPage' : pageType === 'about' ? 'AboutPage' : 'WebPage',
        name: structuredDataTitle,
        description,
        url: canonicalUrl,
        isPartOf: { '@id': WEBSITE_ID },
        inLanguage: 'zh-CN',
      }
  const graph = pageType === 'home'
    ? [organization, website, { ...pageData, '@type': 'WebPage', about: { '@id': ORGANIZATION_ID } }]
    : [organization, website, pageData, ...(breadcrumbData ? [breadcrumbData] : [])]

  useHead({
    htmlAttrs: { lang: 'zh-CN' },
    title,
    link: [{ rel: 'canonical', href: canonicalUrl }],
    meta: [
      { name: 'description', content: description },
      { name: 'robots', content: robots },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: 'zh_CN' },
      { property: 'og:type', content: article ? 'article' : 'website' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:alt', content: imageAlt },
      { property: 'og:image:type', content: imageType },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
      ...(article ? [
        { property: 'article:published_time', content: article.publishedTime },
        { property: 'article:modified_time', content: article.modifiedTime ?? article.publishedTime },
      ] : []),
    ],
    script: [{ type: 'application/ld+json', textContent: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }],
  })
}
