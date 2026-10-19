(function () {
  const GRID = [
    ['巳', '午', '未', '申'],
    ['辰', null, null, '酉'],
    ['卯', null, null, '戌'],
    ['寅', '丑', '子', '亥'],
  ]

  const MAIN_STAR_NAMES = [
    '紫微', '天機', '太陽', '武曲', '天同', '廉貞', '天府',
    '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍',
  ]

  const MAJOR_STAR_ORDER_RTL = [
    '紫微', '廉貞', '武曲', '天相', '天府', '七殺', '破軍', '貪狼',
    '太陽', '太陰', '天機', '巨門', '天同', '天梁',
  ]

  const MUTAGEN_BY_STEM = {
    甲: ['廉貞', '破軍', '武曲', '太陽'],
    乙: ['天機', '天梁', '紫微', '太陰'],
    丙: ['天同', '天機', '文昌', '廉貞'],
    丁: ['太陰', '天同', '天機', '巨門'],
    戊: ['貪狼', '太陰', '右弼', '天機'],
    己: ['武曲', '貪狼', '天梁', '文曲'],
    庚: ['太陽', '武曲', '天同', '太陰'],
    辛: ['巨門', '太陽', '文曲', '文昌'],
    壬: ['天梁', '紫微', '左輔', '武曲'],
    癸: ['破軍', '巨門', '太陰', '貪狼'],
  }

  const MUTAGEN_LABELS = ['祿', '權', '科', '忌']

  const HIGHLIGHT_GREEN = new Set([
    '天馬', '天鉞', '天魁', '左輔', '右弼', '文昌', '文曲',
    '地劫', '地空', '擎羊', '祿存', '鈴星', '火星', '陀羅',
  ])
  const LEFT_PURPLE = new Set([
    '解神', '天刑', '天廚', '咸池', '天空', '天姚', '陰煞', '紅鸞', '華蓋',
  ])
  const LEFT_GREEN = new Set(['三台', '八座', '恩光', '天貴'])
  const EXCLUDED = new Set([
    '天德', '台輔', '天月', '天喜', '寡宿', '天才', '年解', '鳳閣', '天使', '天哭',
    '天官', '天虛', '天福', '天巫', '月德', '天壽', '龍池', '孤辰',
    '破碎', '封誥', '旬空', '空亡', '截路', '蜚廉', '截空', '天傷',
  ])

  const state = {
    interactionMode: 'draw',
    tool: 'pen',
    color: '#c62828',
    drawing: false,
    dragCard: null,
    dragOffsetX: 0,
    dragOffsetY: 0,
    floatEl: null,
    astrolabe: null,
  }

  const canvas = document.getElementById('drawCanvas')
  const stage = document.getElementById('chartStage')
  const chartGrid = document.getElementById('chartGrid')
  const deck = document.getElementById('starDeck')
  const ctx = canvas.getContext('2d')

  let astroApi = null

  function formatPalaceName(name) {
    const raw = String(name || '').replace(/宫/g, '宮')
    const map = { 官祿: '事業', 官禄: '事業', 僕役: '交友', 仆役: '交友' }
    const display = map[raw] || raw
    return '(' + display.split('').join(' ') + ')'
  }

  function normalizeDate(date) {
    const parts = date.split('-')
    return parts[0] + '-' + Number(parts[1]) + '-' + Number(parts[2])
  }

  function todaySolarDate() {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + day
  }

  function getBirthInput() {
    const date = document.getElementById('birthSolar')?.value
    if (!date) throw new Error('請選擇國曆出生日期')
    const timeVal = document.getElementById('birthTime')?.value
    if (timeVal === '' || timeVal == null) throw new Error('請選擇出生時辰')
    const genderEl = document.querySelector('input[name="wbGender"]:checked')
    if (!genderEl) throw new Error('請選擇性別')
    return {
      gender: genderEl.value,
      calendar: 'solar',
      date: date,
      timeIndex: Number(timeVal),
      isLeap: false,
    }
  }

  function computeAstrolabe(input) {
    if (!astroApi) throw new Error('排盤引擎尚未載入')
    const d = normalizeDate(input.date)
    return astroApi.bySolar(d, input.timeIndex, input.gender, true, 'zh-TW')
  }

  function formatBazi(a) {
    const parts = a.rawDates.chineseDate
    return (
      parts.yearly[0] + parts.yearly[1] + ' ' +
      parts.monthly[0] + parts.monthly[1] + ' ' +
      parts.daily[0] + parts.daily[1] + ' ' +
      parts.hourly[0] + parts.hourly[1]
    )
  }

  function formatBrightness(b) {
    if (!b) return ''
    const raw = String(b).trim()
    if (raw === '利') return '旺'
    if (raw === '地') return '閒'
    const canonical = new Set(['廟', '旺', '平', '陷', '閒'])
    if (canonical.has(raw)) return raw
    return '平'
  }

  function getNatalYearStem(a) {
    return a.rawDates.chineseDate.yearly[0]
  }

  function getMutagenForStar(stem, starName) {
    const stars = MUTAGEN_BY_STEM[stem]
    if (!stars) return ''
    const idx = stars.indexOf(starName)
    return idx >= 0 ? MUTAGEN_LABELS[idx] : ''
  }

  function mutagenClass(m) {
    return { 祿: 'lu', 權: 'quan', 科: 'ke', 忌: 'ji' }[m] || 'lu'
  }

  function getZiweiBranch(a) {
    const palace = a.palaces.find(function (p) {
      return p.majorStars.some(function (s) { return s.name === '紫微' })
    })
    return palace ? palace.earthlyBranch : null
  }

  function lookupRishuntangBrightness(ziweiBranch, palaceBranch, starName) {
    const table = window.RishuntangBrightness
    if (!table || !ziweiBranch || !palaceBranch) return null
    const stars = table[ziweiBranch] && table[ziweiBranch][palaceBranch]
    if (!stars) return null
    const hit = stars.find(function (s) { return s.name === starName })
    return hit ? hit.brightness : null
  }

  function majorBrightnessForDisplay(a, palaceBranch, starName, iztroBrightness) {
    const ziweiBranch = getZiweiBranch(a)
    return lookupRishuntangBrightness(ziweiBranch, palaceBranch, starName) ?? iztroBrightness
  }

  function sortMajorStars(stars) {
    const order = new Map(MAJOR_STAR_ORDER_RTL.map(function (name, index) { return [name, index] }))
    return stars.slice().sort(function (a, b) {
      return (order.get(b.name) ?? -1) - (order.get(a.name) ?? -1)
    })
  }

  function filterStars(stars) {
    return stars.filter(function (s) { return !EXCLUDED.has(s.name) })
  }

  function splitMinors(stars) {
    const filtered = filterStars(stars)
    return {
      leftPurple: filtered.filter(function (s) { return LEFT_PURPLE.has(s.name) }),
      leftGreen: filtered.filter(function (s) { return LEFT_GREEN.has(s.name) }),
      rightGreen: filtered.filter(function (s) { return HIGHLIGHT_GREEN.has(s.name) }),
    }
  }

  function renderStarLine(star, roleClass, a, natalStem) {
    const mut = getMutagenForStar(natalStem, star.name)
    const mutHtml = mut
      ? '<span class="wb-star-mutagen ' + mutagenClass(mut) + '">' + mut + '</span>'
      : ''
    const bright = star.brightness && roleClass === 'major'
      ? '<span class="wb-star-bright">' + formatBrightness(star.brightness) + '</span>'
      : ''
    return (
      '<div class="wb-star-line ' + roleClass + '">' +
        '<span class="wb-star-name">' + star.name + '</span>' +
        bright +
        mutHtml +
      '</div>'
    )
  }

  function renderPalaceAutoHtml(p, a) {
    const natalStem = getNatalYearStem(a)
    const minors = splitMinors(
      p.minorStars.concat(p.adjectiveStars).map(function (s) {
        return { name: s.name, brightness: s.brightness }
      }),
    )
    const majors = sortMajorStars(
      p.majorStars.map(function (s) {
        return {
          name: s.name,
          brightness: majorBrightnessForDisplay(a, p.earthlyBranch, s.name, s.brightness),
        }
      }),
    )

    const leftLines =
      minors.leftPurple.map(function (s) { return renderStarLine(s, 'minor-purple', a, natalStem) }).join('') +
      minors.leftGreen.map(function (s) { return renderStarLine(s, 'minor-green', a, natalStem) }).join('')
    const rightMinors = minors.rightGreen
      .map(function (s) { return renderStarLine(s, 'minor-green', a, natalStem) })
      .join('')
    const majorLines = majors.length
      ? majors.map(function (s) { return renderStarLine(s, 'major', a, natalStem) }).join('')
      : renderStarLine({ name: '空', brightness: '' }, 'major', a, natalStem)

    return (
      '<div class="wb-stars-layout">' +
        '<div class="wb-stars-left">' + leftLines + '</div>' +
        '<div class="wb-stars-right">' + rightMinors + majorLines + '</div>' +
      '</div>'
    )
  }

  function saveManualCards() {
    const saved = {}
    chartGrid.querySelectorAll('.wb-manual-layer').forEach(function (layer) {
      const body = layer.closest('.wb-palace-body')
      if (!body) return
      saved[body.dataset.dropZone] = layer.innerHTML
    })
    return saved
  }

  function restoreManualCards(saved) {
    if (!saved) return
    chartGrid.querySelectorAll('.wb-manual-layer').forEach(function (layer) {
      const body = layer.closest('.wb-palace-body')
      if (!body) return
      const key = body.dataset.dropZone
      if (saved[key]) {
        layer.innerHTML = saved[key]
        layer.querySelectorAll('.wb-star-card').forEach(bindCardDrag)
      }
    })
  }

  function updatePalaceLabels(a) {
    const map = new Map(a.palaces.map(function (p) { return [p.earthlyBranch, p] }))
    chartGrid.querySelectorAll('.wb-cell[data-branch]').forEach(function (cell) {
      const branch = cell.dataset.branch
      const p = map.get(branch)
      const labelEl = cell.querySelector('.wb-palace-label')
      const ganEl = cell.querySelector('.wb-gz-gan')
      const zhiEl = cell.querySelector('.wb-gz-zhi')
      if (!p || !labelEl || !ganEl || !zhiEl) return
      labelEl.textContent = formatPalaceName(p.name)
      ganEl.textContent = p.heavenlyStem || ''
      zhiEl.textContent = p.earthlyBranch || branch

      const autoLayer = cell.querySelector('.wb-auto-layer')
      if (autoLayer) autoLayer.innerHTML = renderPalaceAutoHtml(p, a)

      let badge = cell.querySelector('.wb-body-badge')
      if (p.isBodyPalace) {
        if (!badge) {
          badge = document.createElement('span')
          badge.className = 'wb-body-badge'
          cell.appendChild(badge)
        }
        badge.textContent = '身'
      } else if (badge) {
        badge.remove()
      }
    })
  }

  function updateCenterPanel(a, input) {
    const el = document.getElementById('centerBazi')
    if (!el || !a) return
    el.textContent = formatBazi(a) + ' · ' + input.gender + ' · 本命盤'
  }

  function applyAstrolabe(a, input) {
    state.astrolabe = a
    updatePalaceLabels(a)
    updateCenterPanel(a, input)
  }

  function refreshChartFromForm() {
    try {
      const saved = saveManualCards()
      const input = getBirthInput()
      const a = computeAstrolabe(input)
      applyAstrolabe(a, input)
      restoreManualCards(saved)
    } catch (err) {
      alert(err.message || '排盤失敗')
    }
  }

  function buildChartGrid() {
    let centerPlaced = false
    GRID.forEach(function (row, ri) {
      row.forEach(function (branch, ci) {
        if (!branch) {
          if (ri === 1 && ci === 1 && !centerPlaced) {
            centerPlaced = true
            const center = document.createElement('div')
            center.className = 'wb-center wb-cell'
            center.id = 'chartCenter'
            center.style.gridRow = '2 / span 2'
            center.style.gridColumn = '2 / span 2'
            center.innerHTML =
              '<img class="wb-logo" src="../assets/logo.png" alt="日舜堂紫微斗數" onerror="this.hidden=true;this.nextElementSibling.hidden=false" />' +
              '<div class="wb-logo-fallback" hidden>日舜堂<br />Logo</div>' +
              '<p class="wb-brand-title">日舜堂紫微斗數</p>' +
              '<p class="wb-center-bazi" id="centerBazi"></p>' +
              '<div class="wb-topic-wrap">' +
                '<input type="text" class="wb-topic-input" id="topicInput" maxlength="80" placeholder="本集教學主題…" />' +
                '<p class="wb-topic-display hidden" id="topicDisplay"></p>' +
                '<div class="wb-topic-actions">' +
                  '<button type="button" class="wb-btn" id="topicLockBtn">鎖定主題</button>' +
                  '<button type="button" class="wb-btn hidden" id="topicEditBtn">重新編輯</button>' +
                '</div>' +
              '</div>'
            chartGrid.appendChild(center)
          }
          return
        }

        const cell = document.createElement('div')
        cell.className = 'wb-cell'
        cell.dataset.branch = branch
        cell.style.gridRow = String(ri + 1)
        cell.style.gridColumn = String(ci + 1)
        cell.innerHTML =
          '<div class="wb-palace-body" data-drop-zone="' + branch + '">' +
            '<div class="wb-auto-layer"></div>' +
            '<div class="wb-manual-layer"></div>' +
          '</div>' +
          '<div class="wb-palace-footer">' +
            '<div class="wb-palace-footer-grid">' +
              '<div class="wb-palace-label">(　)</div>' +
              '<span class="wb-gz-col">' +
                '<span class="wb-gz-gan">—</span>' +
                '<span class="wb-gz-zhi">' + branch + '</span>' +
              '</span>' +
            '</div>' +
          '</div>'
        chartGrid.appendChild(cell)
      })
    })
  }

  function createStarCard(name, options) {
    const opts = options || {}
    const card = document.createElement('div')
    card.className = 'wb-star-card'
    card.dataset.starName = name
    const label = document.createElement('span')
    label.className = 'wb-star-card-label star-card-label'
    label.textContent = name
    card.appendChild(label)
    if (!opts.skipDeckBind) bindCardDrag(card)
    return card
  }

  function buildStarDeck() {
    MAIN_STAR_NAMES.forEach(function (name) {
      deck.appendChild(createStarCard(name))
    })
  }

  function setInteractionMode(mode) {
    state.interactionMode = mode
    document.body.dataset.mode = mode
    canvas.classList.toggle('is-pass-through', mode !== 'draw')
    document.getElementById('modeDrawBtn').classList.toggle('is-active', mode === 'draw')
    document.getElementById('modeDragBtn').classList.toggle('is-active', mode === 'drag')
    document.getElementById('modeHint').textContent =
      mode === 'draw' ? '繪圖模式：可在命盤上書寫標記' : '拖曳模式：可拖曳主星圖卡至各宮位'
  }

  function setTool(tool) {
    state.tool = tool
    document.getElementById('toolPenBtn').classList.toggle('is-active', tool === 'pen')
    document.getElementById('toolHighlighterBtn').classList.toggle('is-active', tool === 'highlighter')
    document.getElementById('toolEraserBtn').classList.toggle('is-active', tool === 'eraser')
  }

  function setColor(color) {
    state.color = color
    if (state.tool === 'eraser') setTool('pen')
    document.querySelectorAll('.wb-color').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.color === color)
    })
  }

  function resizeCanvas() {
    if (!stage || !canvas) return
    const rect = stage.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const snapshot = document.createElement('canvas')
    snapshot.width = canvas.width
    snapshot.height = canvas.height
    snapshot.getContext('2d').drawImage(canvas, 0, 0)

    canvas.width = Math.max(1, Math.floor(rect.width * dpr))
    canvas.height = Math.max(1, Math.floor(rect.height * dpr))
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (snapshot.width > 0 && snapshot.height > 0) {
      ctx.drawImage(snapshot, 0, 0, rect.width, rect.height)
    }
  }

  function canvasPoint(evt) {
    const rect = canvas.getBoundingClientRect()
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    }
  }

  function applyStrokeStyle() {
    if (state.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
      ctx.lineWidth = 28
      ctx.globalAlpha = 1
      return
    }
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = state.color
    if (state.tool === 'highlighter') {
      ctx.lineWidth = 22
      ctx.globalAlpha = 0.38
    } else {
      ctx.lineWidth = 3
      ctx.globalAlpha = 1
    }
  }

  function startDraw(evt) {
    if (state.interactionMode !== 'draw') return
    if (evt.pointerType === 'mouse' && evt.button !== 0) return
    state.drawing = true
    const pt = canvasPoint(evt)
    canvas.setPointerCapture(evt.pointerId)
    applyStrokeStyle()
    ctx.beginPath()
    ctx.moveTo(pt.x, pt.y)
    evt.preventDefault()
  }

  function moveDraw(evt) {
    if (!state.drawing || state.interactionMode !== 'draw') return
    const pt = canvasPoint(evt)
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
    evt.preventDefault()
  }

  function endDraw(evt) {
    if (!state.drawing) return
    state.drawing = false
    try {
      canvas.releasePointerCapture(evt.pointerId)
    } catch (_) { /* ignore */ }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  function clearCanvas() {
    if (!confirm('確定清除所有手寫內容？')) return
    const rect = stage.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
  }

  function bindCardDrag(card) {
    card.addEventListener('pointerdown', onCardPointerDown)
  }

  function onCardPointerDown(evt) {
    if (state.interactionMode !== 'drag') return
    if (evt.button !== 0 && evt.pointerType === 'mouse') return
    const card = evt.currentTarget
    state.dragCard = card
    card.classList.add('is-dragging')
    card.setPointerCapture(evt.pointerId)

    const rect = card.getBoundingClientRect()
    state.dragOffsetX = evt.clientX - rect.left
    state.dragOffsetY = evt.clientY - rect.top

    state.floatEl = card.cloneNode(true)
    state.floatEl.classList.add('wb-float-card')
    document.body.appendChild(state.floatEl)
    moveFloatCard(evt.clientX, evt.clientY)
    evt.preventDefault()
  }

  function moveFloatCard(clientX, clientY) {
    if (!state.floatEl) return
    state.floatEl.style.left = clientX - state.dragOffsetX + 'px'
    state.floatEl.style.top = clientY - state.dragOffsetY + 'px'
  }

  function dropTargetAt(x, y) {
    state.floatEl.hidden = true
    const el = document.elementFromPoint(x, y)
    state.floatEl.hidden = false
    if (!el) return null
    return el.closest('[data-drop-zone]')
  }

  function onCardPointerMove(evt) {
    if (!state.dragCard) return
    moveFloatCard(evt.clientX, evt.clientY)
    document.querySelectorAll('[data-drop-zone].is-drop-target').forEach(function (z) {
      z.classList.remove('is-drop-target')
    })
    const zone = dropTargetAt(evt.clientX, evt.clientY)
    if (zone) zone.classList.add('is-drop-target')
    evt.preventDefault()
  }

  function onCardPointerUp(evt) {
    if (!state.dragCard) return
    const card = state.dragCard
    const zone = dropTargetAt(evt.clientX, evt.clientY)
    document.querySelectorAll('[data-drop-zone].is-drop-target').forEach(function (z) {
      z.classList.remove('is-drop-target')
    })

    if (zone) {
      const manual = zone.querySelector('.wb-manual-layer')
      const target = manual || zone
      target.appendChild(createStarCard(card.dataset.starName))
    }

    card.classList.remove('is-dragging')
    try {
      card.releasePointerCapture(evt.pointerId)
    } catch (_) { /* ignore */ }

    if (state.floatEl) {
      state.floatEl.remove()
      state.floatEl = null
    }
    state.dragCard = null
  }

  function bindTopicControls() {
    const input = document.getElementById('topicInput')
    const display = document.getElementById('topicDisplay')
    const lockBtn = document.getElementById('topicLockBtn')
    const editBtn = document.getElementById('topicEditBtn')
    if (!input || !lockBtn) return

    lockBtn.addEventListener('click', function () {
      const text = input.value.trim()
      if (!text) {
        input.focus()
        return
      }
      display.textContent = text
      display.classList.remove('hidden')
      input.classList.add('hidden')
      lockBtn.classList.add('hidden')
      editBtn.classList.remove('hidden')
    })

    editBtn.addEventListener('click', function () {
      display.classList.add('hidden')
      input.classList.remove('hidden')
      lockBtn.classList.remove('hidden')
      editBtn.classList.add('hidden')
      input.focus()
    })

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') lockBtn.click()
    })
  }

  function bindToolbar() {
    document.getElementById('modeDrawBtn').addEventListener('click', function () {
      setInteractionMode('draw')
    })
    document.getElementById('modeDragBtn').addEventListener('click', function () {
      setInteractionMode('drag')
    })
    document.getElementById('toolPenBtn').addEventListener('click', function () {
      setTool('pen')
    })
    document.getElementById('toolHighlighterBtn').addEventListener('click', function () {
      setTool('highlighter')
    })
    document.getElementById('toolEraserBtn').addEventListener('click', function () {
      setTool('eraser')
    })
    document.getElementById('clearCanvasBtn').addEventListener('click', clearCanvas)
    document.getElementById('applyBirthBtn').addEventListener('click', refreshChartFromForm)

    document.querySelectorAll('.wb-color').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setColor(btn.dataset.color)
      })
    })
  }

  function initCanvasEvents() {
    canvas.addEventListener('pointerdown', startDraw)
    canvas.addEventListener('pointermove', moveDraw)
    canvas.addEventListener('pointerup', endDraw)
    canvas.addEventListener('pointercancel', endDraw)
    window.addEventListener('pointermove', onCardPointerMove)
    window.addEventListener('pointerup', onCardPointerUp)
    window.addEventListener('pointercancel', onCardPointerUp)
    window.addEventListener('resize', resizeCanvas)
    resizeCanvas()
  }

  function initBirthFormDefaults() {
    const dateEl = document.getElementById('birthSolar')
    if (dateEl && !dateEl.value) dateEl.value = todaySolarDate()
    const timeEl = document.getElementById('birthTime')
    if (timeEl && timeEl.value === '') timeEl.value = '6'
  }

  function initAstro() {
    if (!window.iztro) {
      alert('排盤引擎載入失敗，無法計算干支宮位')
      return
    }
    astroApi = window.iztro.astro
    astroApi.config({
      mutagens: {
        gengHeavenly: ['taiyangMaj', 'wuquMaj', 'tiantongMaj', 'taiyinMaj'],
      },
    })
    initBirthFormDefaults()
    refreshChartFromForm()
  }

  buildChartGrid()
  buildStarDeck()
  bindToolbar()
  bindTopicControls()
  initCanvasEvents()
  setInteractionMode('draw')
  setTool('pen')
  setColor('#c62828')

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAstro)
  } else {
    initAstro()
  }
})()
