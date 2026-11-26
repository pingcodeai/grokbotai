import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true })
markdown.validateLink = (url) => /^(https?:\/\/|\/(?!\/)|#)/i.test(url)
const defaultImageRenderer = markdown.renderer.rules.image
markdown.renderer.rules.image = (tokens, index, options, env, renderer) => {
  const token = tokens[index]
  token?.attrSet('loading', env?.imageLoading === 'eager' ? 'eager' : 'lazy')
  token?.attrSet('decoding', 'async')
  return defaultImageRenderer
    ? defaultImageRenderer(tokens, index, options, env, renderer)
    : renderer.renderToken(tokens, index, options)
}

export interface ArticleHeading {
  id: string
  number: string
  text: string
  level: 2 | 3 | 4
}

export function renderArticleMarkdown(source: string, imageLoading: 'eager' | 'lazy' = 'lazy') {
  const body = source
    .replace(/^\s*---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/^\s*# .+\r?\n/, '')
  const tokens = markdown.parse(body, {})
  const headings: ArticleHeading[] = []
  const headingCounts = [0, 0, 0]

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    if (token?.type !== 'heading_open' || !/^h[2-4]$/.test(token.tag)) continue
    const level = Number(token.tag.slice(1)) as ArticleHeading['level']
    const levelIndex = level - 2
    headingCounts[levelIndex] = (headingCounts[levelIndex] ?? 0) + 1
    headingCounts.fill(0, levelIndex + 1)
    const text = tokens[index + 1]?.content ?? ''
    const numberParts = headingCounts.slice(0, levelIndex + 1)
    const number =
      level === 2
        ? String(numberParts[0]).padStart(2, '0') + ' /'
        : numberParts.join('.') + ' /'
    const id = 'section-' + numberParts.join('-')
    token.attrSet('id', id)
    headings.push({ id, number, text, level })
  }

  return { html: markdown.renderer.render(tokens, markdown.options, { imageLoading }), headings }
}
