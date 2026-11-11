import type { RouterScrollBehavior, RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ArticleView from '../views/ArticleView.vue'
import { categories, legacyCategoryIds } from '../content/articles'

export const scrollBehavior: RouterScrollBehavior = (to) => {
  if (to.hash) return { el: to.hash, behavior: 'smooth' }
  return { top: 0 }
}

export const routes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/category/:categoryId/',
      name: 'category',
      component: HomeView,
    },
    {
      path: '/article/:slug/',
      name: 'article',
      component: ArticleView,
    },
  ]

export function handleRouteRedirect(to: RouteLocationNormalized) {
  const pathCategory = typeof to.params.categoryId === 'string' ? to.params.categoryId : ''
  const replacement = legacyCategoryIds[pathCategory]
  if (to.name === 'category' && replacement) {
    return { path: '/category/' + replacement + '/', replace: true }
  }

  const legacyCategory = typeof to.query.category === 'string'
    ? legacyCategoryIds[to.query.category] ?? to.query.category
    : to.query.category
  if (to.path === '/' && typeof legacyCategory === 'string') {
    const category = categories.find((item) => item.id === legacyCategory && item.id !== 'all')
    return category
      ? { path: `/category/${category.id}/`, replace: true }
      : { path: '/', replace: true }
  }

  if (to.path === '/' && to.hash === '#articles') {
    return { path: '/', query: to.query, replace: true }
  }

  if (
    to.name === 'category' &&
    !categories.some((item) => item.id === to.params.categoryId && item.id !== 'all')
  ) {
    return { path: '/', replace: true }
  }
}
