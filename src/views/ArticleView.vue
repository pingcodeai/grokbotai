<script setup lang="ts">
import { computed, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ProductCta from '../components/ProductCta.vue'
import { articles, categoryName, findArticle } from '../content/articles'
import { renderArticleMarkdown } from '../utils/articleMarkdown'
import { setPageSeo } from '../utils/seo'

const route = useRoute()
const article = computed(() => findArticle(route.params.slug))
const relatedArticles = computed(() =>
  articles.filter((candidate) => candidate.slug !== article.value?.slug).slice(0, 2),
)
const guide = computed(() => renderArticleMarkdown(article.value?.markdown ?? ''))
const headings = computed(() => guide.value.headings)
const articleHtml = computed(() => guide.value.html)

watchEffect(() => {
  const currentArticle = article.value
  setPageSeo({
    title: currentArticle
      ? `${currentArticle.title} — Grok Bot 实验室`
      : '文章未找到 — Grok Bot 实验室',
    structuredDataTitle: currentArticle?.title,
    description: currentArticle?.description ?? '该文章暂时无法找到。',
    path: route.path,
    image: currentArticle?.image,
    article: currentArticle
      ? {
          publishedTime: `${currentArticle.date}T00:00:00+08:00`,
          author: 'Grok Bot 实验室',
          keywords: [currentArticle.category, currentArticle.title],
        }
      : undefined,
  })
})
</script>

<template>
  <main id="top" class="page-wrap article-page">
    <template v-if="article">
      <div class="breadcrumbs">
        <RouterLink to="/">首页</RouterLink><span>/</span>
        <RouterLink :to="`/category/${article.categoryId}/`">
          {{ categoryName(article.categoryId) }}
        </RouterLink>
        <span>/</span><span>正在阅读</span>
      </div>

      <header class="article-header">
        <div class="article-kicker">
          <span class="category-tag">{{ article.category }}</span>
          <span class="mono-label">FIELD NOTE / {{ article.number }}</span>
        </div>
        <h1>{{ article.title }}</h1>
        <p class="article-deck">{{ article.description }}</p>
        <div class="author-row">
          <span class="author-mark" aria-hidden="true">✳</span>
          <div>
            <strong>Grok Bot 实验室</strong
            ><small>{{ article.displayDate }} · {{ article.readingTime }} MIN READ</small>
          </div>
          <RouterLink class="button back-button" to="/">全部文章 <span>↗</span></RouterLink>
        </div>
      </header>

      <figure v-if="article.image" class="article-hero-image">
        <img :src="article.image" :alt="article.imageAlt" />
        <figcaption>GROK BOT FIELD NOTES — {{ article.number }}</figcaption>
      </figure>
      <div
        v-else
        class="article-hero-placeholder"
        role="img"
        :aria-label="article.title + '，无封面图片'"
      >
        <span class="mono-label">{{ article.category }} / FIELD NOTE {{ article.number }}</span>
        <strong>{{ article.title }}</strong>
      </div>

      <div class="reading-layout">
        <aside class="table-of-contents" aria-label="文章目录">
          <strong>这篇文章里 / INDEX</strong>
          <a
            v-for="heading in headings"
            :key="heading.id"
            :href="`#${heading.id}`"
            :class="`toc-level-${heading.level}`"
          >
            {{ heading.number }} {{ heading.text }}
          </a>
          <p>START SMALL.<br />先把一件事做好。</p>
        </aside>
        <article class="article-content">
          <div class="article-markdown" v-html="articleHtml" />
          <div class="article-end">
            <span class="mono-label">END OF FIELD NOTE.<br />从一个任务开始，再继续迭代。</span>
          </div>
        </article>
      </div>

      <section
        v-if="relatedArticles.length"
        class="related-section"
        aria-labelledby="related-title"
      >
        <div class="section-heading">
          <div>
            <p class="eyebrow">KEEP EXPLORING</p>
            <h2 id="related-title">接着，看看这些。</h2>
          </div>
          <RouterLink to="/" class="text-link">全部文章 ↗</RouterLink>
        </div>
        <div class="related-grid">
          <RouterLink
            v-for="item in relatedArticles"
            :key="item.slug"
            class="related-card"
            :to="`/article/${item.slug}/`"
          >
            <span class="category-tag">{{ item.category }}</span>
            <strong>{{ item.title }}</strong>
            <span class="mono-label"
              >{{ item.displayDate }} · {{ item.readingTime }} MIN <b>↗</b></span
            >
          </RouterLink>
        </div>
      </section>

      <ProductCta />
    </template>

    <section v-else class="not-found">
      <p class="eyebrow">404 / NO FIELD NOTE HERE</p>
      <h1>这篇文章暂时找不到。</h1>
      <RouterLink class="button button-dark" to="/">回到文章首页 <span>↗</span></RouterLink>
    </section>
  </main>
</template>
