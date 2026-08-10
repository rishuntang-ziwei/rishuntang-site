(function () {
  var cfg = window.DengShifuConfig || {}

  function applyLinks() {
    document.querySelectorAll('[data-ds-href]').forEach(function (el) {
      var key = el.getAttribute('data-ds-href')
      var parts = key.split('.')
      var value = cfg
      for (var i = 0; i < parts.length; i += 1) {
        if (!value) return
        value = value[parts[i]]
      }
      if (!value) return
      if (el.tagName === 'A') {
        el.href = value
        if (String(value).startsWith('http')) {
          el.target = '_blank'
          el.rel = 'noopener noreferrer'
        }
      }
    })

    document.querySelectorAll('[data-ds-text]').forEach(function (el) {
      var key = el.getAttribute('data-ds-text')
      var parts = key.split('.')
      var value = cfg
      for (var i = 0; i < parts.length; i += 1) {
        if (!value) return
        value = value[parts[i]]
      }
      if (value) el.textContent = value
    })
  }

  applyLinks()

  var navToggle = document.getElementById('dsNavToggle')
  var nav = document.getElementById('dsNav')

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open')
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    })
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open')
        navToggle.setAttribute('aria-expanded', 'false')
      })
    })
  }

  document.querySelectorAll('[data-toggle-details]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('aria-controls')
      var panel = document.getElementById(targetId)
      if (!panel) return

      var expanded = btn.getAttribute('aria-expanded') === 'true'
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true')
      panel.hidden = expanded
      btn.textContent = expanded ? '查看完整成分與保存資訊' : '收起詳細資訊'
    })
  })

  var yearEl = document.getElementById('dsFooterYear')
  if (yearEl) yearEl.textContent = String(new Date().getFullYear())
})()
