import MarkdownIt from 'markdown-it'

const markdown = new MarkdownIt({ html: false, linkify: true, typographer: true })
markdown.validateLink = (url) => /^(https?:\/\/|\/(?!\/)|#)/i.test(url)

export function renderArticleMarkdown(source: string) {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/^# .+\r?\n/, '')
  const tokens = markdown.parse(body, {})
  const headings: { id: string; number: string; text: string }[] = []

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index]
    if (token?.type !== 'heading_open' || token.tag !== 'h2') continue
    const text = tokens[index + 1]?.content ?? ''
    const number = String(headings.length + 1).padStart(2, '0') + ' /'
    const id = 'section-' + (headings.length + 1)
    token.attrSet('id', id)
    headings.push({ id, number, text })
  }

  return { html: markdown.renderer.render(tokens, markdown.options, {}), headings }
}
