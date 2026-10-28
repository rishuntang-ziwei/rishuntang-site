(function () {
  const api = window.RishuntangCourse
  if (!api) return

  const root = document.getElementById('courseCatalog')
  if (!root) return

  const cfg = api.config
  document.title = cfg.brand.courseTitle + '｜' + cfg.brand.name

  const titleEl = document.getElementById('coursePageTitle')
  const leadEl = document.getElementById('coursePageLead')
  if (titleEl) titleEl.textContent = cfg.brand.courseTitle
  if (leadEl) leadEl.textContent = cfg.brand.tagline

  let html = ''
  cfg.courses.forEach(function (course) {
    html += '<article class="course-block">'
    html += '<div class="course-block-head">'
    html += '<h2>' + api.escapeHtml(course.title) + '</h2>'
    html += '<p>' + api.escapeHtml(course.summary || '') + '</p>'
    if (course.status === 'coming-soon') {
      html += '<span class="course-status">影片陸續上架中</span>'
    }
    html += '</div>'

    ;(course.modules || []).forEach(function (mod) {
      html += '<div class="module-block">'
      html += '<h3>' + api.escapeHtml(mod.title) + '</h3>'
      html += '<ul class="lesson-list">'
      mod.lessons.forEach(function (lesson) {
        const hasVideo = api.lessonHasVideo(lesson)
        const badge = hasVideo
          ? '<span class="lesson-badge lesson-badge--video-ready">已上架</span>'
          : '<span class="lesson-badge lesson-badge--video-pending">影片待上</span>'
        const dur =
          lesson.durationMin != null
            ? '<span class="lesson-badge">' + lesson.durationMin + ' 分鐘</span>'
            : ''
        html +=
          '<li><a href="' +
          api.lessonPageUrl(course.id, lesson.id) +
          '"><span class="lesson-title">' +
          api.escapeHtml(lesson.title) +
          '</span>' +
          badge +
          dur +
          '</a></li>'
      })
      html += '</ul></div>'
    })

    html += '</article>'
  })

  root.innerHTML = html
})()
