import { useHead } from '@unhead/vue'

interface PageSeo {
  title: string
  structuredDataTitle?: string
  description: string
  path: string
  image?: string
  article?: { publishedTime: string; modifiedTime?: string; author: string; keywords: string[] }
}

const SITE_ORIGIN = import.meta.env.VITE_SITE_ORIGIN ?? 'https://pingcode.ai'
const DEFAULT_IMAGE = 'https://img.yjfan.top/blog/articles/grok-bot-workflow.webp'

export function setPageSeo({
  title,
  structuredDataTitle = title,
  description,
  path,
  image,
  article,
}: PageSeo) {
  const canonicalUrl = new URL(path, SITE_ORIGIN).href
  const imageUrl = image ?? DEFAULT_IMAGE
  const structuredData = article
    ? {
        '@context': 'https://schema.org', '@type': 'Article', headline: structuredDataTitle, description,
        url: canonicalUrl, mainEntityOfPage: canonicalUrl,
        image: { '@type': 'ImageObject', url: imageUrl },
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime ?? article.publishedTime,
        author: { '@type': 'Organization', name: article.author },
        publisher: {
          '@type': 'Organization', name: 'Grok Bot 实验室',
          logo: { '@type': 'ImageObject', url: new URL('/grok-bot-icon.svg', SITE_ORIGIN).href },
        },
        keywords: article.keywords,
      }
    : {
        '@context': 'https://schema.org',
        '@type': path.startsWith('/category/') ? 'CollectionPage' : 'WebSite',
        name: structuredDataTitle, description, url: canonicalUrl,
        isPartOf: { '@type': 'WebSite', name: 'Grok Bot 实验室', url: SITE_ORIGIN },
      }

  useHead({
    title,
    link: [{ rel: 'canonical', href: canonicalUrl }],
    meta: [
      { name: 'description', content: description },
      { property: 'og:site_name', content: 'Grok Bot 实验室' },
      { property: 'og:locale', content: 'zh_CN' },
      { property: 'og:type', content: article ? 'article' : 'website' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:image', content: imageUrl },
      { property: 'og:image:alt', content: title },
      { property: 'og:image:type', content: 'image/webp' },
      { property: 'og:image:width', content: '1200' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:url', content: canonicalUrl },
      { name: 'twitter:image', content: imageUrl },
      ...(article ? [
        { property: 'article:published_time', content: article.publishedTime },
        { property: 'article:modified_time', content: article.modifiedTime ?? article.publishedTime },
      ] : []),
    ],
    script: [{ type: 'application/ld+json', textContent: JSON.stringify(structuredData) }],
  })
}
