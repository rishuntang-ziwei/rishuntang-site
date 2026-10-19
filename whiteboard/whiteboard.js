(function () {
  const GRID = [
    ['巳', '午', '未', '申'],
    ['辰', null, null, '酉'],
    ['卯', null, null, '戌'],
    ['寅', '丑', '子', '亥'],
  ]

  /** 與 star-draw 主星牌組相同（日舜堂紫微卡牌） */
  const MAJOR_STAR_CARDS = [
    { name: '紫微', image: 'assets/cards/major/zi-wei.png' },
    { name: '天機', image: 'assets/cards/major/tian-ji.png' },
    { name: '太陽', image: 'assets/cards/major/tai-yang.png' },
    { name: '武曲', image: 'assets/cards/major/wu-qu.png' },
    { name: '天同', image: 'assets/cards/major/tian-tong.png' },
    { name: '廉貞', image: 'assets/cards/major/lian-zhen.png' },
    { name: '天府', image: 'assets/cards/major/tian-fu.png' },
    { name: '太陰', image: 'assets/cards/major/tai-yin.png' },
    { name: '貪狼', image: 'assets/cards/major/tan-lang.png' },
    { name: '巨門', image: 'assets/cards/major/ju-men.png' },
    { name: '天相', image: 'assets/cards/major/tian-xiang.png' },
    { name: '天梁', image: 'assets/cards/major/tian-liang.png' },
    { name: '七殺', image: 'assets/cards/major/qi-sha.png' },
    { name: '破軍', image: 'assets/cards/major/po-jun.png' },
  ]

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

  function savePalaceCardHtml() {
    const saved = {}
    chartGrid.querySelectorAll('[data-drop-zone]').forEach(function (zone) {
      saved[zone.dataset.dropZone] = zone.innerHTML
    })
    return saved
  }

  function restorePalaceCardHtml(saved) {
    if (!saved) return
    chartGrid.querySelectorAll('[data-drop-zone]').forEach(function (zone) {
      const key = zone.dataset.dropZone
      if (saved[key]) {
        zone.innerHTML = saved[key]
        zone.querySelectorAll('.wb-star-card').forEach(bindCardDrag)
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
    })
  }

  function applyAstrolabe(a) {
    state.astrolabe = a
    updatePalaceLabels(a)
  }

  function refreshChartFromForm() {
    try {
      const saved = savePalaceCardHtml()
      const input = getBirthInput()
      const a = computeAstrolabe(input)
      applyAstrolabe(a)
      restorePalaceCardHtml(saved)
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
          '<div class="wb-palace-body" data-drop-zone="' + branch + '"></div>' +
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

  function starCardByName(name) {
    return MAJOR_STAR_CARDS.find(function (c) { return c.name === name })
  }

  function createStarCard(name, options) {
    const opts = options || {}
    const meta = starCardByName(name)
    const card = document.createElement('div')
    card.className = 'wb-star-card'
    card.dataset.starName = name
    const img = document.createElement('img')
    img.className = 'wb-star-card-img star-card-img'
    img.src = opts.src || (meta && meta.image) || ''
    img.alt = name
    img.draggable = false
    card.appendChild(img)
    if (!opts.skipDeckBind) bindCardDrag(card)
    return card
  }

  function buildStarDeck() {
    MAJOR_STAR_CARDS.forEach(function (star) {
      deck.appendChild(createStarCard(star.name, { src: star.image }))
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
      zone.appendChild(createStarCard(card.dataset.starName, {
        src: card.querySelector('img').src,
      }))
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
