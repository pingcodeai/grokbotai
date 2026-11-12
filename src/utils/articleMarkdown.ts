import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true })
markdown.validateLink = (url) => /^(https?:\/\/|\/(?!\/)|#)/i.test(url)

export interface ArticleHeading {
  id: string
  number: string
  text: string
  level: 2 | 3 | 4
}

export function renderArticleMarkdown(source: string) {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/^# .+\r?\n/, '')
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
    if (level <= 3) headings.push({ id, number, text, level })
  }

  return { html: markdown.renderer.render(tokens, markdown.options, {}), headings }
}
