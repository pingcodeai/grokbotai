<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { categories } from './content/articles'
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <div class="nav-wrap">
        <RouterLink class="brand" to="/" aria-label="Grok Bot 实验室首页">
          <span class="brand-mark" aria-hidden="true">
            <svg class="brand-glyph" viewBox="0 0 48 48" fill="none">
              <path class="brand-glyph-orbit" d="M9 15.5 24 7l15 8.5-15 8.6L9 32.5 24 41l15-8.5" />
              <path class="brand-glyph-signal" d="M9 15.5 24 24.1 39 15.5M24 24.1V41" />
              <circle cx="24" cy="24" r="3.25" />
            </svg>
          </span>
          <span class="brand-copy">
            <strong>Grok Bot 实验室</strong>
            <small>GROK BOT FIELD NOTES</small>
          </span>
        </RouterLink>
        <nav class="main-nav" aria-label="主导航">
          <RouterLink
            v-for="category in categories"
            :key="category.id"
            :to="category.id === 'all' ? '/' : '/category/' + category.id + '/'"
            exact-active-class="nav-current"
          >{{ category.label }}</RouterLink>
        </nav>
        <div class="nav-actions">
          <a
            class="button nav-cta"
            href="https://pingcode.ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            免费领取千万 Token <span>↗</span>
          </a>
          <a
            class="button nav-github"
            href="https://github.com/pingcodeai/grokbotai"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="在 GitHub 查看 Grok Bot AI 项目"
          >
            GitHub <span>↗</span>
          </a>
        </div>
      </div>
    </header>
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.fullPath" />
    </RouterView>
    <footer class="site-footer">
      <RouterLink class="footer-brand" to="/">GROK BOT FIELD NOTES</RouterLink>
      <span>为可用的 Bot 而写。© 2026</span>
      <a href="#top">回到顶部 ↑</a>
    </footer>
  </div>
</template>
