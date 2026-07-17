(function () {
  const cfg = window.RishuntangSiteConfig
  if (!cfg) return

  const navToggle = document.getElementById('navToggle')
  const siteNav = document.getElementById('siteNav')
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      const open = siteNav.classList.toggle('is-open')
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    })
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('is-open')
        navToggle.setAttribute('aria-expanded', 'false')
      })
    })
  }

  function applyHrefKeys(scope) {
    const root = scope || document
    root.querySelectorAll('[data-href-key]').forEach(function (el) {
      const key = el.getAttribute('data-href-key')
      const url = cfg.links[key]
      if (!url) {
        el.classList.add('is-disabled')
        el.setAttribute('aria-disabled', 'true')
        if (el.tagName === 'A') {
          el.removeAttribute('href')
          el.addEventListener('click', function (e) {
            e.preventDefault()
          })
        }
        return
      }
      if (el.tagName === 'A') {
        el.href = url
        if (url.startsWith('http')) {
          el.target = '_blank'
          el.rel = 'noopener noreferrer'
        }
      }
    })
  }

  applyHrefKeys()

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function parseYoutubeId(input) {
    if (!input) return ''
    const value = String(input).trim()
    if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value
    const match = value.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/)([A-Za-z0-9_-]{11})/)
    return match ? match[1] : ''
  }

  function renderYoutubeEmbeds() {
    const root = document.getElementById('youtubeEmbeds')
    if (!root) return

    const items = Array.isArray(cfg.youtubeEmbeds) ? cfg.youtubeEmbeds : []
    const valid = items
      .map(function (item) {
        const id = parseYoutubeId(item && (item.id || item.url))
        if (!id) return null
        return {
          id: id,
          title: item.title || 'YouTube 影片',
        }
      })
      .filter(Boolean)

    if (!valid.length) {
      root.innerHTML =
        '<p class="video-empty">尚未設定精選 YouTube 影片。請在 <code>js/site-config.js</code> 的 <code>youtubeEmbeds</code> 貼上影片網址，或<a data-href-key="youtube" href="' +
        escapeHtml(cfg.links.youtube || '#') +
        '">前往 YouTube 頻道</a>觀看。</p>'
      return
    }

    root.innerHTML = valid
      .map(function (item) {
        return (
          '<figure class="video-item">' +
          '<div class="video-embed">' +
          '<iframe src="https://www.youtube.com/embed/' +
          escapeHtml(item.id) +
          '" title="' +
          escapeHtml(item.title) +
          '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>' +
          '</div>' +
          '<figcaption class="video-caption">' +
          escapeHtml(item.title) +
          '</figcaption>' +
          '</figure>'
        )
      })
      .join('')
  }

  function parseTiktokVideoId(input) {
    if (!input) return ''
    const match = String(input).match(/\/video\/(\d+)/)
    return match ? match[1] : ''
  }

  function renderTiktokEmbeds() {
    const root = document.getElementById('tiktokEmbeds')
    if (!root) return

    const items = Array.isArray(cfg.tiktokEmbeds) ? cfg.tiktokEmbeds : []
    const entries = items
      .map(function (item) {
        const rawUrl = item && item.url ? String(item.url).trim() : ''
        const videoId = parseTiktokVideoId(rawUrl)
        if (!videoId) return null
        const pageUrl = rawUrl.split('?')[0]
        return {
          videoId: videoId,
          pageUrl: pageUrl,
          title: item.title || 'TikTok 影片',
        }
      })
      .filter(Boolean)

    if (!entries.length) {
      root.innerHTML =
        '<p class="video-empty">TikTok 需貼上<strong>單支影片</strong>網址才能內嵌（無法直接內嵌直播或整個帳號）。請在 <code>js/site-config.js</code> 的 <code>tiktokEmbeds</code> 加入影片連結，或<a data-href-key="tiktok" href="' +
        escapeHtml(cfg.links.tiktok || '#') +
        '">前往 TikTok</a>觀看。</p>'
      return
    }

    root.innerHTML = entries
      .map(function (item) {
        return (
          '<figure class="video-item tiktok-item">' +
          '<div class="tiktok-embed-wrap">' +
          '<iframe class="tiktok-embed-frame" src="https://www.tiktok.com/embed/v2/' +
          escapeHtml(item.videoId) +
          '" title="' +
          escapeHtml(item.title) +
          '" allow="encrypted-media; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" loading="lazy"></iframe>' +
          '</div>' +
          '<p class="video-caption">' +
          '<a href="' +
          escapeHtml(item.pageUrl) +
          '" target="_blank" rel="noopener noreferrer">若無法播放，請在 TikTok 開啟此影片</a>' +
          '</p>' +
          '</figure>'
        )
      })
      .join('')
  }

  renderYoutubeEmbeds()
  renderTiktokEmbeds()
  applyHrefKeys(document.getElementById('videos'))

  const yearEl = document.getElementById('footerYear')
  if (yearEl) yearEl.textContent = String(new Date().getFullYear())
})()
