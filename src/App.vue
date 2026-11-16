<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

const footerQrCodes = [
  {
    label: '公众号',
    src: '/images/grok-bot-public-account-qr.webp',
    alt: 'Grok Bot 实验室公众号二维码',
  },
  {
    label: '视频号',
    src: '/images/grok-bot-video-account-qr.webp',
    alt: 'Grok Bot 实验室视频号二维码',
  },
]
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
          <RouterLink to="/" exact-active-class="nav-current">文章首页</RouterLink>
          <RouterLink to="/bots/" exact-active-class="nav-current">Bot 市场</RouterLink>
          <RouterLink to="/about/" exact-active-class="nav-current">关于本站</RouterLink>
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
      <div class="footer-main">
        <section class="footer-intro" aria-labelledby="footer-site-title">
          <RouterLink id="footer-site-title" class="footer-brand" to="/">Grok Bot 实验室</RouterLink>
          <p>
            专注整理 Grok Bot 的使用方法、场景实战、Bot 市场、问题排查与产品动态。
            通过可复查的步骤、真实截图和官方来源，帮助你把 Bot 用到实际工作中。
          </p>
          <span class="footer-note">GROK BOT FIELD NOTES / BUILD · TEST · VERIFY</span>
        </section>

        <nav class="footer-links" aria-label="底部快捷链接">
          <strong>快捷链接</strong>
          <div>
            <RouterLink to="/">文章首页</RouterLink>
            <RouterLink to="/bots/">Bot 市场</RouterLink>
            <RouterLink to="/about/">关于本站</RouterLink>
            <a href="https://github.com/pingcodeai/grokbotai" target="_blank" rel="noopener noreferrer">GitHub 项目</a>
            <a href="https://pingcode.ai/" target="_blank" rel="noopener noreferrer">PingCode AI</a>
          </div>
        </nav>

        <section class="footer-qr-section" aria-labelledby="footer-qr-title">
          <strong id="footer-qr-title">关注与交流</strong>
          <div class="footer-qr-grid">
            <div v-for="item in footerQrCodes" :key="item.label" class="footer-qr-item">
              <div class="footer-qr-image">
                <img :src="item.src" :alt="item.alt" loading="lazy" decoding="async" />
              </div>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </section>
      </div>

      <div class="footer-bottom">
        <span>© 2026 Grok Bot 实验室</span>
        <span>内容以官方资料与实际测试为依据</span>
        <a href="#top">回到顶部 ↑</a>
      </div>
    </footer>
  </div>
</template>
