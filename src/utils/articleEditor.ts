import type { Article } from '../content/articles'
export { renderMarkdown } from './markdown'

export interface EditableArticle {
  id: string
  enabled: boolean
  slug: string
  title: string
  description: string
  categoryId: string
  category: string
  date: string
  updatedDate: string
  readingTime: number
  image: string
  markdown: string
  updatedAt: string
}

// Keep previous browser drafts untouched while loading the latest project article content.
export const EDITOR_STORAGE_KEY = 'grokbotai.article-editor.v5'

export const articleToEditable = (article: Article): EditableArticle => ({
  id: article.slug,
  enabled: article.enabled !== false,
  slug: article.slug,
  title: article.title,
  description: article.description,
  categoryId: article.categoryId,
  category: article.category,
  date: article.date,
  updatedDate: article.updatedDate ?? article.date,
  readingTime: article.readingTime,
  image: article.image ?? '',
  markdown: article.markdown,
  updatedAt: new Date().toISOString(),
})

export const createBlankArticle = (): EditableArticle => {
  const timestamp = Date.now()
  return {
    id: `draft-${timestamp}`,
    enabled: true,
    slug: `new-article-${timestamp}`,
    title: '未命名文章',
    description: '请填写文章摘要。',
    categoryId: 'getting-started',
    category: '新手入门',
    date: new Date().toISOString().slice(0, 10),
    updatedDate: new Date().toISOString().slice(0, 10),
    readingTime: 5,
    image: '',
    markdown: '# 未命名文章\n\n从这里开始写作。',
    updatedAt: new Date().toISOString(),
  }
}

export const articleToMarkdownFile = (article: EditableArticle) => {
  const quoteFrontmatter = (value: string) => JSON.stringify(value)
  const frontmatter = [
    '---',
    `title: ${quoteFrontmatter(article.title)}`,
    `slug: ${quoteFrontmatter(article.slug)}`,
    `enabled: ${article.enabled !== false}`,
    `description: ${quoteFrontmatter(article.description)}`,
    `category: ${quoteFrontmatter(article.category)}`,
    `categoryId: ${quoteFrontmatter(article.categoryId)}`,
    `date: ${quoteFrontmatter(article.date)}`,
    `updatedDate: ${quoteFrontmatter(article.updatedDate)}`,
    `readingTime: ${article.readingTime}`,
    `image: ${quoteFrontmatter(article.image)}`,
    '---',
    '',
  ].join('\n')
  return frontmatter + article.markdown
}
