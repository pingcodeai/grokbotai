export interface MarkdownHeading { id: string; number: string; text: string; level: number }

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] ?? character)
const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '')

const inlineMarkdown = (value: string) => {
  const tokens: string[] = []
  let output = escapeHtml(value)
  output = output.replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, (_match, alt: string, url: string) => {
    const index = tokens.push(`<img src="${safeUrl(url)}" alt="${alt}" loading="lazy" decoding="async" />`) - 1
    return `@@MD_${index}@@`
  })
  output = output.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_match, label: string, url: string) => {
    const index = tokens.push(`<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`) - 1
    return `@@MD_${index}@@`
  })
  output = output.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>')
  tokens.forEach((token, index) => { output = output.replace(`@@MD_${index}@@`, token) })
  return output
}

const parseHeading = (line: string, index: number): MarkdownHeading | null => {
  const match = line.match(/^(#{1,3})\s+(.+?)(?:\s+\{#([a-zA-Z0-9-_]+)\})?$/)
  if (!match) return null
  const rawText = match[2] ?? ''
  const numbered = rawText.match(/^(\d{2}\s*\/)\s*(.+)$/)
  return { id: match[3] ?? `section-${index}`, number: numbered?.[1] ?? '', text: numbered?.[2] ?? rawText, level: (match[1] ?? '#').length }
}

export const extractMarkdownHeadings = (markdown: string) => markdown.replace(/```[\s\S]*?```/g, '').split(/\r?\n/).map((line, index) => parseHeading(line, index + 1)).filter((heading): heading is MarkdownHeading => Boolean(heading?.level === 2))

export const renderMarkdown = (markdown: string) => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const html: string[] = []
  let paragraph: string[] = []; let list: string[] = []; let code: string[] | null = null; let language = ''; let headingIndex = 0
  const flushParagraph = () => {
    if (!paragraph.length) return
    const source = paragraph.join(' ')
    const rendered = inlineMarkdown(source)
    html.push(source.startsWith('![') ? `<figure class="markdown-image">${rendered}</figure>` : `<p>${rendered}</p>`)
    paragraph = []
  }
  const flushList = () => { if (list.length) html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`); list = [] }
  for (const line of lines) {
    if (code) { if (line.startsWith('```')) { html.push(`<pre class="code-sample"><code>${escapeHtml(code.join('\n'))}</code><span>${escapeHtml(language)}</span></pre>`); code = null; language = '' } else code.push(line); continue }
    if (line.startsWith('```')) { flushParagraph(); flushList(); code = []; language = line.slice(3).trim(); continue }
    if (!line.trim()) { flushParagraph(); flushList(); continue }
    const heading = parseHeading(line, ++headingIndex)
    if (heading) { flushParagraph(); flushList(); html.push(`<h${heading.level} id="${heading.id}">${heading.number ? `<span>${escapeHtml(heading.number)}</span>` : ''}${inlineMarkdown(heading.text)}</h${heading.level}>`); continue }
    if (line.startsWith('> ')) { flushParagraph(); flushList(); html.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`); continue }
    const item = line.match(/^[-*]\s+(.+)$/)
    if (item) { flushParagraph(); list.push(item[1] ?? ''); continue }
    paragraph.push(line.trim())
  }
  flushParagraph(); flushList(); if (code) html.push(`<pre class="code-sample"><code>${escapeHtml(code.join('\n'))}</code></pre>`)
  return html.join('')
}
