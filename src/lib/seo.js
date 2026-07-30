import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { seoFor, siteUrl } from '../data/seo'

// Create the tag if it's missing, then set its content. Tags prerendered into
// index.html are reused, so this never duplicates them.
function setMeta(selector, attrs, content) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// Keeps <title> and the meta tags matching the current route.
//
// NOTE: this is for humans — browser tabs, bookmarks, and history. Social
// crawlers (Facebook, X, Threads, Viber) don't run JavaScript, so the share
// card they see comes from the static HTML written by scripts/prerender-seo.mjs
// at build time. Both read from src/data/seo.js, so they stay in sync.
export function useSeo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const { title, description, image, noindex } = seoFor(pathname)
    const url = siteUrl + pathname
    const imageUrl = siteUrl + image

    document.title = title
    setMeta('meta[name="description"]', { name: 'description' }, description)
    setLink('canonical', url)

    setMeta('meta[property="og:title"]', { property: 'og:title' }, title)
    setMeta('meta[property="og:description"]', { property: 'og:description' }, description)
    setMeta('meta[property="og:url"]', { property: 'og:url' }, url)
    setMeta('meta[property="og:image"]', { property: 'og:image' }, imageUrl)

    setMeta('meta[name="twitter:title"]', { name: 'twitter:title' }, title)
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description' }, description)
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image' }, imageUrl)

    // Only the placeholder /shop page and unknown (404) routes set this.
    const robots = document.head.querySelector('meta[name="robots"]')
    if (noindex) setMeta('meta[name="robots"]', { name: 'robots' }, 'noindex')
    else if (robots) robots.remove()
  }, [pathname])
}
