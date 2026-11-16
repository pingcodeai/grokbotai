<script setup lang="ts">
import { computed, ref } from 'vue'
import { marketplaceBots, marketplaceCategories, marketplaceSource } from '../content/marketplaceBots'
import { setPageSeo } from '../utils/seo'

const selectedCategory = ref<(typeof marketplaceCategories)[number]>('全部分类')
const search = ref('')
const categoryValues: Partial<Record<(typeof marketplaceCategories)[number], string>> = {
  销售业务: '销售',
  设计创意: '设计',
  人才招聘: '招聘与人才',
  产品管理: '产品',
  运营管理: '运营',
}

const visibleBots = computed(() => {
  const query = search.value.trim().toLocaleLowerCase()
  return marketplaceBots.filter((bot) => {
    const selectedValue = categoryValues[selectedCategory.value] ?? selectedCategory.value
    const matchesCategory = selectedCategory.value === '全部分类' || bot.category === selectedValue
    const searchable = `${bot.name} ${bot.creator} ${bot.description}`.toLocaleLowerCase()
    return matchesCategory && (!query || searchable.includes(query))
  })
})

setPageSeo({
  title: 'Grok Bot 市场_官方 Bot 中文目录_Grok Bot 实验室',
  structuredDataTitle: 'Grok Bot 市场中文目录',
  description: 'Grok Bot 市场中文目录整理官方 Marketplace 当前展示的 Bot，说明每个 Bot 的创建者、适用场景和具体用途，并按工程开发、销售业务、市场营销、设计创意、个人生活、人才招聘、产品管理和运营管理分类，帮助你快速找到适合实际工作的 Bot。',
  path: '/bots/',
  pageType: 'category',
  breadcrumbs: [{ name: '首页', path: '/' }, { name: 'Bot 市场', path: '/bots/' }],
})
</script>

<template>
  <main id="top" class="page-wrap marketplace-page">
    <section class="marketplace-hero">
      <p class="eyebrow">OFFICIAL MARKETPLACE / 中文整理</p>
      <div class="marketplace-hero-copy">
        <div>
          <h1>Grok Bot 市场</h1>
          <p>官方市场中的 Bot 不是同一种聊天助手。它们分别面向开发、销售、内容、设计、生活、招聘、产品和运营任务，可以在明确权限与人工确认范围后，承担重复的信息整理和执行工作。</p>
        </div>
        <a class="button" :href="marketplaceSource" target="_blank" rel="noopener noreferrer">访问官方市场 <span>↗</span></a>
      </div>
    </section>

    <section class="marketplace-directory" aria-labelledby="marketplace-directory-title">
      <div class="marketplace-toolbar">
        <div class="marketplace-categories" aria-label="Bot 分类">
          <button
            v-for="category in marketplaceCategories"
            :key="category"
            type="button"
            :class="{ selected: selectedCategory === category }"
            @click="selectedCategory = category"
          >{{ category }}</button>
        </div>
        <label class="search-box marketplace-search">
          <span aria-hidden="true">⌕</span>
          <input v-model="search" type="search" placeholder="搜索 Bot 或作者…" />
        </label>
      </div>

      <div class="marketplace-result-heading">
        <h2 id="marketplace-directory-title">{{ selectedCategory }}</h2>
        <span class="mono-label">{{ String(visibleBots.length).padStart(2, '0') }} BOTS</span>
      </div>

      <div v-if="visibleBots.length" class="marketplace-grid">
        <article v-for="bot in visibleBots" :key="`${bot.name}-${bot.creator}`" class="marketplace-card">
          <div class="marketplace-card-top">
            <span class="marketplace-avatar" aria-hidden="true">{{ bot.name.slice(0, 1).toUpperCase() }}</span>
            <span v-if="bot.featured" class="marketplace-featured">精选</span>
          </div>
          <span class="mono-label">{{ bot.category }}</span>
          <h3>{{ bot.name }}</h3>
          <p class="marketplace-creator">创建者：{{ bot.creator }}</p>
          <p>{{ bot.description }}</p>
          <a :href="marketplaceSource" target="_blank" rel="noopener noreferrer">前往官方市场查找 <span>↗</span></a>
        </article>
      </div>
      <p v-else class="empty-state">没有找到匹配的 Bot，请换一个名称或分类。</p>
    </section>
  </main>
</template>
