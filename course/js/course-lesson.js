(function () {
  const api = window.RishuntangCourse
  if (!api) return

  const params = new URLSearchParams(location.search)
  const courseId = params.get('course') || (api.config.courses[0] && api.config.courses[0].id)
  const lessonId = params.get('lesson')

  const course = api.findCourse(courseId)
  const found = lessonId ? api.findLesson(course, lessonId) : null

  if (!course || !found) {
    document.getElementById('lessonError').hidden = false
    document.getElementById('lessonLayout').hidden = true
    return
  }

  const lesson = found.lesson
  const cfg = api.config

  document.title = lesson.title + '｜' + cfg.brand.courseTitle

  const layout = document.getElementById('lessonLayout')
  const videoTitle = document.getElementById('lessonVideoTitle')
  const videoBody = document.getElementById('lessonVideoBody')
  const metaEl = document.getElementById('lessonMeta')
  const chartFrame = document.getElementById('lessonChartFrame')
  const chartOpen = document.getElementById('lessonChartOpenTab')
  const navList = document.getElementById('lessonNavList')

  if (videoTitle) videoTitle.textContent = lesson.title

  const embed = api.videoEmbedHtml(lesson)
  if (embed) {
    videoBody.innerHTML = embed
  } else {
    videoBody.innerHTML =
      '<div class="lesson-video-placeholder">' +
      '<div class="ph-icon" aria-hidden="true">▶</div>' +
      '<p>本集影片製作中</p>' +
      '<p class="ph-sub">上架後將在此播放老師示範操作排盤的錄影內容</p>' +
      (lesson.durationMin != null
        ? '<p class="ph-sub">預估片長約 ' + lesson.durationMin + ' 分鐘</p>'
        : '') +
      '</div>'
  }

  let metaHtml = ''
  if (lesson.practiceNote) {
    metaHtml += '<p><strong>同步練習：</strong>' + api.escapeHtml(lesson.practiceNote) + '</p>'
  }
  if (lesson.objectives && lesson.objectives.length) {
    metaHtml += '<p><strong>本集重點</strong></p><ul>'
    lesson.objectives.forEach(function (o) {
      metaHtml += '<li>' + api.escapeHtml(o) + '</li>'
    })
    metaHtml += '</ul>'
  }
  if (metaEl) metaEl.innerHTML = metaHtml

  const chartUrl = api.chartUrlForLesson(lesson)
  if (chartFrame) chartFrame.src = chartUrl
  if (chartOpen) {
    chartOpen.href = chartUrl
    chartOpen.target = '_blank'
    chartOpen.rel = 'noopener noreferrer'
  }

  const loginBtn = document.getElementById('lessonChartLogin')
  if (loginBtn && cfg.links.memberLogin) {
    loginBtn.href = cfg.links.memberLogin
  }

  if (navList) {
    let navHtml = ''
    course.modules.forEach(function (mod) {
      navHtml += '<div style="margin:6px 0 4px;font-weight:700;color:var(--brand-brown)">' + api.escapeHtml(mod.title) + '</div>'
      mod.lessons.forEach(function (l) {
        const current = l.id === lesson.id
        navHtml +=
          '<a class="' +
          (current ? 'is-current' : '') +
          '" href="' +
          api.lessonPageUrl(course.id, l.id) +
          '">' +
          api.escapeHtml(l.title) +
          (api.lessonHasVideo(l) ? '' : ' · 待上') +
          '</a>'
      })
    })
    navList.innerHTML = navHtml
  }

  const tabs = document.querySelectorAll('.lesson-mobile-tabs button')
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const panel = btn.dataset.panel
      layout.dataset.mobilePanel = panel
      tabs.forEach(function (b) {
        b.classList.toggle('is-active', b === btn)
      })
    })
  })
})()
