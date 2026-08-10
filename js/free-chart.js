(function () {
  const cfg = window.RishuntangSiteConfig
  if (!cfg) return

  const GUEST_STORAGE_KEY = 'guestChartPayload'

  const form = document.getElementById('freeChartForm')
  const errorEl = document.getElementById('freeChartError')
  if (!form) return

  function showError(message) {
    if (!errorEl) return
    if (!message) {
      errorEl.hidden = true
      errorEl.textContent = ''
      return
    }
    errorEl.hidden = false
    errorEl.textContent = message
  }

  function todaySolarDate() {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + day
  }

  function getPayload() {
    const genderEl = document.querySelector('input[name="gender"]:checked')
    if (!genderEl) throw new Error('請選擇性別')

    const date = document.getElementById('solarDate')?.value
    if (!date) throw new Error('請輸入國曆出生日期')

    const timeVal = document.getElementById('time')?.value
    if (timeVal === '' || timeVal == null) throw new Error('請選擇出生時辰')

    const topic = document.getElementById('topic')?.value || 'overall'

    return {
      name: (document.getElementById('name')?.value || '').trim() || '訪客',
      gender: genderEl.value,
      calendar: 'solar',
      date: date,
      timeIndex: Number(timeVal),
      isLeap: false,
      initialChartType: 'natal',
      yearlyYear: new Date().getFullYear(),
      topic: topic,
    }
  }

  const solarDate = document.getElementById('solarDate')
  if (solarDate && !solarDate.value) solarDate.value = todaySolarDate()

  form.addEventListener('submit', function (e) {
    e.preventDefault()
    showError('')
    try {
      const payload = getPayload()
      const chartUrl = cfg.links.guestChartApp
      if (!chartUrl) throw new Error('排盤連結尚未設定，請稍後再試。')

      sessionStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(payload))
      const opened = window.open(chartUrl, '_blank')
      if (!opened) {
        showError('瀏覽器阻擋了彈出視窗，請允許此網站開啟新視窗後再試。')
        return
      }

      const targetOrigin = new URL(chartUrl, location.href).origin
      const message = { type: 'guestChartPayload', payload: payload }
      const postPayload = function () {
        opened.postMessage(message, targetOrigin)
      }
      postPayload()
      window.setTimeout(postPayload, 400)
      window.setTimeout(postPayload, 1200)
    } catch (err) {
      showError(err.message || '資料有誤，請檢查後再試。')
    }
  })
})()
