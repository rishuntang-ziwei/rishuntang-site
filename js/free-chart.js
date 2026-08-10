(function () {
  const cfg = window.RishuntangSiteConfig
  if (!cfg) return

  const GUEST_STORAGE_KEY = 'guestChartPayload'
  const TOPIC_OPTIONS = [
    { value: 'overall', label: '整體運勢' },
    { value: 'love', label: '戀愛運勢' },
    { value: 'career', label: '事業運勢' },
  ]

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

  function updateCalendarUI() {
    const lunar = document.querySelector('input[name="calendar"]:checked')?.value === 'lunar'
    document.getElementById('lunarDateFields')?.classList.toggle('hidden', !lunar)
    document.getElementById('solarDateFields')?.classList.toggle('hidden', lunar)
    document.getElementById('leapRow')?.classList.toggle('hidden', !lunar)
    const dateLabel = document.getElementById('dateLabel')
    const calendarNote = document.getElementById('calendarNote')
    if (dateLabel) dateLabel.textContent = lunar ? '農曆出生日期' : '國曆出生日期'
    if (calendarNote) calendarNote.textContent = lunar ? '以農曆排盤（陰曆）' : '以國曆排盤（陽曆）'
  }

  function getPayload() {
    const genderEl = document.querySelector('input[name="gender"]:checked')
    if (!genderEl) throw new Error('請選擇性別')

    const calendar = document.querySelector('input[name="calendar"]:checked')?.value || 'solar'
    let date
    if (calendar === 'lunar') {
      const y = document.getElementById('lunarYear')?.value
      const m = document.getElementById('lunarMonth')?.value
      const d = document.getElementById('lunarDay')?.value
      if (!y || !m || !d) throw new Error('請輸入農曆出生日期')
      date = y + '-' + m + '-' + d
    } else {
      date = document.getElementById('solarDate')?.value
      if (!date) throw new Error('請輸入國曆出生日期')
    }

    const timeVal = document.getElementById('time')?.value
    if (timeVal === '' || timeVal == null) throw new Error('請選擇出生時辰')

    const topic = document.getElementById('topic')?.value || 'overall'

    return {
      name: (document.getElementById('name')?.value || '').trim() || '訪客',
      gender: genderEl.value,
      calendar: calendar,
      date: date,
      timeIndex: Number(timeVal),
      isLeap: Boolean(document.getElementById('isLeap')?.checked),
      initialChartType: 'natal',
      yearlyYear: new Date().getFullYear(),
      topic: topic,
    }
  }

  const solarDate = document.getElementById('solarDate')
  if (solarDate && !solarDate.value) solarDate.value = todaySolarDate()

  document.querySelectorAll('input[name="calendar"]').forEach(function (el) {
    el.addEventListener('change', updateCalendarUI)
  })
  updateCalendarUI()

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
