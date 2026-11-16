<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { setPageSeo } from '../utils/seo'

const description = 'Grok Bot 实验室持续整理 Grok Bot 的入门方法、场景实战、接入开发、问题排查与产品动态。本站公开文章标注来源、发布时间和更新时间，帮助读者核对功能边界与实际操作步骤。'

setPageSeo({
  title: '关于本站-Grok Bot 实验室',
  structuredDataTitle: '关于 Grok Bot 实验室',
  description,
  path: '/about/',
  pageType: 'about',
  breadcrumbs: [{ name: '首页', path: '/' }, { name: '关于本站', path: '/about/' }],
})
</script>

<template>
  <main id="top" class="page-wrap about-page">
    <nav class="breadcrumbs" aria-label="面包屑">
      <RouterLink to="/">首页</RouterLink><span>/</span><span aria-current="page">关于本站</span>
    </nav>
    <article class="about-content">
      <header class="article-header">
        <p class="eyebrow">ABOUT / EDITORIAL NOTES</p>
        <h1>关于 Grok Bot 实验室</h1>
        <p class="article-deck">{{ description }}</p>
      </header>
      <section>
        <h2>本站关注什么</h2>
        <p>内容围绕 Grok Bot 的真实使用展开，包括第一次创建任务、团队工作流、常见故障和官方产品更新。文章尽量保留可复查的操作步骤、截图、来源链接与功能限制。</p>
      </section>
      <section>
        <h2>内容如何维护</h2>
        <p>每篇文章显示发布时间和更新时间。涉及版本、套餐、额度或平台规则时，以文章列出的官方来源和读者账户中的实际界面为准；产品发生变化后，文章会根据能够核实的资料更新。</p>
      </section>
      <section>
        <h2>项目与联系</h2>
        <p>本站代码公开托管在 GitHub。发现文章中的链接失效、操作步骤过时或事实错误，可以通过项目仓库提交问题。</p>
        <a class="button button-dark" href="https://github.com/pingcodeai/grokbotai" target="_blank" rel="noopener noreferrer">查看 GitHub 项目 <span aria-hidden="true">↗</span></a>
      </section>
    </article>
  </main>
</template>
