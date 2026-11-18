<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { articles, categories, type Article } from '../content/articles'
import {
  EDITOR_STORAGE_KEY,
  articleToEditable,
  articleToMarkdownFile,
  createBlankArticle,
  renderMarkdown,
  type EditableArticle,
} from '../utils/articleEditor'
import { setPageSeo } from '../utils/seo'

const drafts = ref<EditableArticle[]>([])
const activeId = ref('')
const savedAt = ref('')
const status = ref('正在读取项目最新文章…')
const saving = ref(false)
const draggedId = ref('')
const fileInput = ref<HTMLInputElement>()
const markdownInput = ref<HTMLTextAreaElement>()
const uploadingImages = ref(0)
const baselines = new Map<string, Article>()
const ready = ref(false)
const cacheDrafts = () => {
  if (!ready.value) return
  localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(drafts.value.map((draft) => ({ draft, base: baselines.get(draft.id) }))))
}

const activeArticle = computed(() => drafts.value.find((article) => article.id === activeId.value))
const previewHtml = computed(() => renderMarkdown(activeArticle.value?.markdown ?? ''))

const persist = (message = '草稿与排序已暂存于浏览器') => {
  cacheDrafts()
  status.value = message
}

const saveToProject = async () => {
  if (saving.value) return
  const target = activeArticle.value
  if (!target) return
  const snapshot = JSON.parse(JSON.stringify(target)) as EditableArticle
  const base = baselines.get(target.id)
  saving.value = true
  status.value = '正在写入项目文章文件…'
  try {
    const response = await fetch('/api/local-article-save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article: snapshot, originalSlug: base?.slug, base }),
    })
    const result = await response.json() as { article?: Article; error?: string }
    if (!response.ok) throw new Error(result.error || '保存失败')
    if (!result.article) throw new Error('保存结果无效')
    baselines.set(target.id, result.article)
    cacheDrafts()
    savedAt.value = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date())
    status.value = '已保存：' + snapshot.title + '（仅此篇文章）'
  } catch (error) {
    status.value = '保存失败：' + (error instanceof Error ? error.message : '未知错误')
  } finally {
    saving.value = false
  }
}

const selectArticle = (id: string) => { activeId.value = id }
const addArticle = () => {
  const article = createBlankArticle()
  drafts.value.unshift(article)
  activeId.value = article.id
  persist('新草稿已创建')
}
const updateCategory = () => {
  const article = activeArticle.value
  if (!article) return
  article.category = categories.find((category) => category.id === article.categoryId)?.label ?? '文章'
}
const moveArticle = (fromId: string, toId: string) => {
  if (!fromId || fromId === toId) return
  const fromIndex = drafts.value.findIndex((article) => article.id === fromId)
  const toIndex = drafts.value.findIndex((article) => article.id === toId)
  if (fromIndex < 0 || toIndex < 0) return
  const [moved] = drafts.value.splice(fromIndex, 1)
  if (!moved) return
  drafts.value.splice(toIndex, 0, moved)
  draggedId.value = ''
  persist('文章位置已更新')
}
const nudge = (id: string, direction: -1 | 1) => {
  const index = drafts.value.findIndex((article) => article.id === id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= drafts.value.length) return
  const [moved] = drafts.value.splice(index, 1)
  if (!moved) return
  drafts.value.splice(target, 0, moved)
  persist('文章位置已更新')
}
const downloadMarkdown = () => {
  const article = activeArticle.value
  if (!article) return
  const blob = new Blob([articleToMarkdownFile(article)], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${article.slug || 'article'}.md`
  anchor.click()
  URL.revokeObjectURL(url)
  status.value = 'Markdown 文件已导出'
}
const importMarkdown = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const article = createBlankArticle()
  article.title = file.name.replace(/\.md$/i, '')
  article.slug = article.title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-|-$/g, '') || article.slug
  article.markdown = await file.text()
  drafts.value.unshift(article)
  activeId.value = article.id
  input.value = ''
  persist('Markdown 文件已导入')
}
const resetDrafts = async () => {
  try {
  const response = await fetch('/api/local-article-save', { cache: 'no-store' })
  if (!response.ok) throw new Error('读取项目文章失败')
  const result = await response.json() as { articles: Article[] }
  baselines.clear()
  result.articles.forEach((article) => baselines.set(article.slug, article))
  drafts.value = result.articles.map(articleToEditable)
  activeId.value = drafts.value[0]?.id ?? ''
  persist('已恢复为项目内的文章内容')
  } catch (error) { status.value = String(error) }
}
const insertMarkdownAtCursor = (markdown: string, article: EditableArticle, start: number, end: number) => {
  const textarea = markdownInput.value
  article.markdown = `${article.markdown.slice(0, start)}${markdown}${article.markdown.slice(end)}`
  nextTick(() => {
    if (!textarea || activeId.value !== article.id) return
    const cursor = start + markdown.length
    textarea.focus()
    textarea.setSelectionRange(cursor, cursor)
  })
}
const uploadPastedImage = async (file: File, article: EditableArticle, start: number, end: number) => {
  uploadingImages.value += 1
  status.value = `正在上传图片 ${file.name || 'clipboard-image'}…`
  try {
    const response = await fetch('/api/local-r2-upload', {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'image/png',
        'x-file-name': encodeURIComponent(file.name || `clipboard-${Date.now()}.png`),
      },
      body: file,
    })
    const result = await response.json() as { url?: string; error?: string }
    if (!response.ok || !result.url) throw new Error(result.error || '上传失败')
    insertMarkdownAtCursor(`![粘贴的图片](${result.url})\n\n`, article, start, end)
    persist('图片已上传到 Cloudflare R2，并插入文章')
  } catch (error) {
    status.value = error instanceof Error ? error.message : '图片上传失败'
  } finally {
    uploadingImages.value -= 1
  }
}
const handleMarkdownPaste = async (event: ClipboardEvent) => {
  const imageFiles = Array.from(event.clipboardData?.items ?? [])
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((file): file is File => Boolean(file))
  if (!imageFiles.length) return
  event.preventDefault()
  const target = activeArticle.value
  if (!target) return
  const start = markdownInput.value?.selectionStart ?? target.markdown.length
  const end = markdownInput.value?.selectionEnd ?? start
  for (const file of imageFiles) await uploadPastedImage(file, target, start, end)
}

onMounted(async () => {
  const stored = localStorage.getItem(EDITOR_STORAGE_KEY)
  drafts.value = articles.map(articleToEditable)
  await resetDrafts()
  try {
    const cached = stored ? JSON.parse(stored) as { draft: EditableArticle; base?: Article }[] : []
    let conflicts = 0
    for (const entry of cached) {
      if (!entry.draft?.id) continue
      const index = drafts.value.findIndex((draft) => draft.id === entry.draft.id)
      if (index >= 0 && JSON.stringify(baselines.get(entry.draft.id)) === JSON.stringify(entry.base)) {
        drafts.value[index] = { ...entry.draft, enabled: entry.draft.enabled !== false }
      } else if (!entry.base && index < 0) {
        drafts.value.push({ ...entry.draft, enabled: entry.draft.enabled !== false })
      } else { conflicts += 1 }
    }
    if (conflicts) status.value = '已载入项目最新内容；过期草稿未自动应用，原缓存保留在浏览器中。'
    if (conflicts) localStorage.setItem(`${EDITOR_STORAGE_KEY}.conflict-backup`, stored ?? '')
  } catch { status.value = '浏览器草稿无效，已载入项目最新内容。' }
  ready.value = true
  cacheDrafts()
  activeId.value = drafts.value[0]?.id ?? ''
  setPageSeo({
    title: '文章工作台 — Grok Bot 实验室',
    description: '编辑、预览与排列 Markdown 文章。',
    path: '/editor/',
    pageType: 'utility',
    robots: 'noindex,follow',
  })
})

watch(drafts, cacheDrafts, { deep: true })
</script>

<template>
  <main id="top" class="editor-page">
    <header class="editor-hero">
      <div>
        <p class="eyebrow">LOCAL ARTICLE STUDIO / MARKDOWN</p>
        <h1>文章工作台</h1>
        <p>写 Markdown、实时预览。点击“保存当前文章”仅写入正在编辑的这一篇；其他文章的草稿不会一起保存。</p>
      </div>
      <div class="editor-hero-actions">
        <button class="editor-button secondary" type="button" @click="fileInput?.click()">导入 .md</button>
        <button class="editor-button" type="button" @click="addArticle">＋ 新文章</button>
        <input ref="fileInput" class="visually-hidden" type="file" accept=".md,text/markdown" @change="importMarkdown" />
      </div>
    </header>

    <section class="editor-status">
      <span><b>LOCAL</b> {{ status }}<i v-if="uploadingImages"> · 上传中 {{ uploadingImages }}</i></span>
      <span v-if="savedAt" class="mono-label">SAVED {{ savedAt }}</span>
    </section>

    <div class="editor-layout">
      <aside class="editor-library">
        <div class="editor-panel-heading">
          <div><span class="mono-label">LIBRARY</span><h2>文章顺序</h2></div>
          <span>{{ String(drafts.length).padStart(2, '0') }}</span>
        </div>
        <p class="editor-hint">点击选择文章。拖动仅调整本次编辑列表，不会修改网站文章顺序。</p>
        <div class="editor-article-list">
          <article
            v-for="(article, index) in drafts"
            :key="article.id"
            class="editor-list-card"
            :class="{ active: article.id === activeId, dragging: article.id === draggedId }"
            draggable="true"
            @dragstart="draggedId = article.id"
            @dragend="draggedId = ''"
            @dragover.prevent
            @drop.prevent="moveArticle(draggedId, article.id)"
            @click="selectArticle(article.id)"
          >
            <button class="drag-handle" type="button" aria-label="拖动文章">⠿</button>
            <div>
              <span class="mono-label">{{ String(index + 1).padStart(2, '0') }} · {{ article.category }}</span>
              <strong>{{ article.title }}</strong>
              <small>{{ article.enabled === false ? '已关闭 · 前台隐藏' : '已开启 · 前台展示' }}</small>
              <small>/{{ article.slug }}/</small>
            </div>
            <div class="order-buttons">
              <button type="button" :disabled="index === 0" aria-label="上移" @click.stop="nudge(article.id, -1)">↑</button>
              <button type="button" :disabled="index === drafts.length - 1" aria-label="下移" @click.stop="nudge(article.id, 1)">↓</button>
            </div>
          </article>
        </div>
        <button class="editor-reset" type="button" @click="resetDrafts">恢复项目文章</button>
      </aside>

      <section v-if="activeArticle" :key="activeId" class="editor-workspace">
        <div class="editor-metadata">
          <label class="wide"><span>文章显示</span><select v-model="activeArticle.enabled"><option :value="true">开启：展示文章</option><option :value="false">关闭：隐藏文章</option></select><small>点击“保存当前文章”生效。线上站点需要重新构建部署。</small></label>
          <label class="wide"><span>标题</span><input v-model="activeArticle.title" /></label>
          <label><span>Slug</span><input v-model="activeArticle.slug" /></label>
          <label><span>分类</span><select v-model="activeArticle.categoryId" @change="updateCategory"><option v-for="category in categories.filter(item => item.id !== 'all')" :key="category.id" :value="category.id">{{ category.label }}</option></select></label>
          <label><span>日期</span><input v-model="activeArticle.date" type="date" /></label>
          <label><span>更新日期</span><input v-model="activeArticle.updatedDate" type="date" /></label>
          <label><span>阅读分钟</span><input v-model.number="activeArticle.readingTime" type="number" min="1" /></label>
          <label class="wide"><span>摘要</span><textarea v-model="activeArticle.description" rows="2" /></label>
          <label class="wide"><span>封面图片 URL</span><input v-model="activeArticle.image" placeholder="https://..." /></label>
        </div>

        <div class="editor-toolbar">
          <div><span class="mono-label">ACTIVE DOCUMENT</span><strong>{{ activeArticle.slug }}.md</strong></div>
          <div>
            <button class="editor-button secondary" type="button" @click="downloadMarkdown">导出 Markdown</button>
            <button class="editor-button" type="button" :disabled="saving || !ready || uploadingImages > 0" @click="saveToProject">{{ saving ? '保存中…' : '保存当前文章' }}</button>
          </div>
        </div>

        <div class="editor-split">
          <label class="markdown-editor">
            <span class="editor-pane-title">MARKDOWN / 编辑</span>
            <textarea ref="markdownInput" v-model="activeArticle.markdown" spellcheck="false" @paste="handleMarkdownPaste" />
          </label>
          <article class="markdown-preview">
            <span class="editor-pane-title">PREVIEW / 预览</span>
            <div class="preview-body" v-html="previewHtml" />
          </article>
        </div>
      </section>
    </div>
  </main>
</template>
