<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import ProductCta from '../components/ProductCta.vue'
import { articles, categories } from '../content/articles'
import { setPageSeo } from '../utils/seo'

const route = useRoute()
const search = ref('')
const selectedCategory = computed(() =>
  typeof route.params.categoryId === 'string' ? route.params.categoryId : 'all',
)

const activeCategory = computed(() =>
  categories.find((category) => category.id === selectedCategory.value),
)
const pageHeading = computed(() => {
  const category = activeCategory.value
  return category && category.id !== 'all'
    ? `${category.label}：Grok Bot 使用指南`
    : 'Grok Bot 使用指南与实战教程'
})

watchEffect(() => {
  const category = activeCategory.value
  const title = category
    ? category.id === 'all'
      ? 'Grok Bot 使用指南与实战教程 — Grok Bot 实验室'
      : `${pageHeading.value} — Grok Bot 实验室`
    : '分类未找到 — Grok Bot 实验室'
  const description = category?.description ?? '该文章分类暂不存在。'

  setPageSeo({
    title,
    structuredDataTitle: pageHeading.value,
    description,
    path: route.path,
    image: articles.find((article) => article.image)?.image,
  })
})

const visibleArticles = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return articles.filter((article) => {
    const matchesCategory =
      selectedCategory.value === 'all' || article.categoryId === selectedCategory.value
    const text = `${article.title} ${article.description} ${article.category}`.toLocaleLowerCase()
    return matchesCategory && (!query || text.includes(query))
  })
})
</script>

<template>
  <main id="top" class="page-wrap">
    <section id="articles" class="articles-section" aria-labelledby="articles-title">
      <div class="section-heading articles-heading">
        <div>
          <p class="eyebrow">BUILD NOTES &amp; FIELD TESTS</p>
          <h1 id="articles-title">{{ pageHeading }}</h1>
          <p>{{ activeCategory?.description }}</p>
        </div>
        <span class="article-total mono-label"
          >{{ String(visibleArticles.length).padStart(2, '0') }} ARTICLES ↙</span
        >
      </div>
      <div v-if="articles.length" class="article-tools">
        <div class="category-list" aria-label="文章分类">
          <RouterLink
            v-for="category in categories"
            :key="category.id"
            class="category-button"
            :to="category.id === 'all' ? '/' : `/category/${category.id}/`"
            :class="{ selected: selectedCategory === category.id }"
            :aria-current="selectedCategory === category.id ? 'page' : undefined"
          >
            {{ category.label }}
          </RouterLink>
        </div>
        <label class="search-box">
          <span aria-hidden="true">⌕</span>
          <input v-model="search" type="search" placeholder="搜 Grok、Bot、提示词…" />
          <span class="mono-label">↵</span>
        </label>
      </div>

      <div v-if="articles.length && visibleArticles.length" class="article-grid">
        <article
          v-for="(article, index) in visibleArticles"
          :key="article.slug"
          class="article-card"
        >
          <RouterLink class="article-link" :to="`/article/${article.slug}/`">
            <div class="article-cover">
              <img
                v-if="article.image"
                :src="article.image"
                :alt="article.imageAlt ?? article.title"
                :loading="index < 3 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : 'auto'"
                decoding="async"
              />
              <div v-else class="article-cover-placeholder" aria-label="此文章没有封面图片">
                <span class="mono-label">{{ article.category }} / FIELD NOTE</span>
                <strong>{{ article.title }}</strong>
              </div>
              <span class="cover-index">{{ article.number }}</span>
            </div>
            <div class="article-card-body">
              <span class="category-tag">{{ article.category }}</span>
              <h2>{{ article.title }} <span aria-hidden="true">↗</span></h2>
              <p>{{ article.description }}</p>
              <div class="article-meta">
                <time :datetime="article.date">{{ article.displayDate }}</time>
                <span>{{ article.readingTime }} MIN READ</span>
              </div>
            </div>
          </RouterLink>
        </article>
      </div>
      <p v-else class="empty-state">
        {{
          articles.length
            ? search.trim() ? '没有找到相关文章。试试别的关键词。' : '这个栏目暂时没有文章，内容将陆续更新。你也可以查看全部文章。'
            : '目前没有已发布的文章。之后把文章添加到本地文章目录，它们会自动显示在这里。'
        }}
      </p>
      <p class="maintenance-note">静态文章目录 · 无登录、点赞或订阅功能</p>
    </section>

    <ProductCta />
  </main>
</template>
