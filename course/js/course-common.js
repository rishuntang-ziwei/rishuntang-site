(function () {
  const cfg = window.RishuntangCourseConfig
  if (!cfg) return

  function findCourse(courseId) {
    return (cfg.courses || []).find(function (c) {
      return c.id === courseId
    })
  }

  function findLesson(course, lessonId) {
    if (!course) return null
    for (let mi = 0; mi < course.modules.length; mi++) {
      const mod = course.modules[mi]
      for (let li = 0; li < mod.lessons.length; li++) {
        const lesson = mod.lessons[li]
        if (lesson.id === lessonId) {
          return {
            lesson: lesson,
            module: mod,
            moduleIndex: mi,
            lessonIndex: li,
          }
        }
      }
    }
    return null
  }

  function lessonHasVideo(lesson) {
    const v = lesson && lesson.video
    if (!v) return false
    if (v.provider === 'youtube' && v.id) return true
    if (v.provider === 'file' && v.url) return true
    if (v.url) return true
    return false
  }

  function videoEmbedHtml(lesson) {
    if (!lessonHasVideo(lesson)) return ''
    const v = lesson.video
    if (v.provider === 'youtube' || (!v.provider && v.id)) {
      const id = v.id || extractYoutubeId(v.url)
      if (!id) return ''
      return (
        '<iframe class="lesson-video-embed" title="' +
        escapeAttr(lesson.title) +
        '" src="https://www.youtube-nocookie.com/embed/' +
        encodeURIComponent(id) +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      )
    }
    if (v.provider === 'file' || v.url) {
      const url = v.url || ''
      return (
        '<video class="lesson-video-embed" controls playsinline preload="metadata" src="' +
        escapeAttr(url) +
        '"></video>'
      )
    }
    return ''
  }

  function extractYoutubeId(url) {
    if (!url) return ''
    try {
      const u = new URL(url)
      if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0]
      if (u.searchParams.get('v')) return u.searchParams.get('v')
      const shorts = u.pathname.match(/\/shorts\/([^/]+)/)
      if (shorts) return shorts[1]
    } catch (_) {
      /* ignore */
    }
    return ''
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function escapeAttr(s) {
    return escapeHtml(s)
  }

  function chartUrlForLesson(lesson) {
    const access = (lesson && lesson.chartAccess) || cfg.defaultChartAccess || 'guest'
    if (access === 'member') return cfg.links.chartMember
    return cfg.links.chartGuest
  }

  function lessonPageUrl(courseId, lessonId) {
    return './lesson.html?course=' + encodeURIComponent(courseId) + '&lesson=' + encodeURIComponent(lessonId)
  }

  window.RishuntangCourse = {
    config: cfg,
    findCourse: findCourse,
    findLesson: findLesson,
    lessonHasVideo: lessonHasVideo,
    videoEmbedHtml: videoEmbedHtml,
    chartUrlForLesson: chartUrlForLesson,
    lessonPageUrl: lessonPageUrl,
    escapeHtml: escapeHtml,
  }
})()
