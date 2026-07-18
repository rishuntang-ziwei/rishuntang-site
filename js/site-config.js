/** 官網連結與文案設定 — 有正式資料時改這裡即可 */
window.RishuntangSiteConfig = {
  brand: {
    name: '國際日舜堂',
    tagline: '紫微斗數 · 傳承與實修',
    slogan: '以日舜堂安星為本，融會古今，助您明察命運、掌握人生方向',
  },
  teacher: {
    name: '川益老師',
    title: '日舜堂紫微斗數講師',
    /** 待填：老師簡介（可換成 HTML 段落） */
    bio:
      '（待填寫）川益老師長年鑽研紫微斗數，承日舜堂安星法脈，擅長將深奧星理化為易懂、可實踐的解盤與教學。內容待您提供後替換。',
  },
  links: {
    /** 現有排盤系統（方案 B 工具入口） */
    chartApp: 'https://rishuntang-ziwei.github.io/rishuntang-ziwei/chart.html',
    memberLogin: 'https://rishuntang-ziwei.github.io/rishuntang-ziwei/index.html',
    youtube: 'https://www.youtube.com/@holin4176',
    tiktok: 'https://www.tiktok.com/@holin417690',
    line: '', // 例：https://line.me/...
    email: 'contact@rishuntang.com',
    facebook: 'https://www.facebook.com/holin4176',
    instagram: '',
  },
  /**
   * YouTube 內嵌：填 videoId 或完整網址即可
   * 例：{ id: 'dQw4w9WgXcQ', title: '影片標題' }
   * 例：{ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
   */
  youtubeEmbeds: [
    {
      url: 'https://www.youtube.com/shorts/QyDRUydkYH0',
      title: '川益老師 YouTube Shorts',
    },
  ],
  /**
   * TikTok 單支影片內嵌（需完整影片頁網址，無法內嵌整個帳號或直播）
   * 例：{ url: 'https://www.tiktok.com/@holin417690/video/7123456789012345678' }
   */
  tiktokEmbeds: [
    {
      url: 'https://www.tiktok.com/@holin417690/video/7629953816779099399?is_from_webapp=1&sender_device=pc',
    },
  ],
  services: [
    {
      id: 'youtube',
      icon: '▶',
      title: 'YouTube 影片',
      desc: '川益老師 YouTube 頻道，精選教學、解盤與命理分享。',
      cta: '前往頻道',
      hrefKey: 'youtube',
    },
    {
      id: 'tiktok',
      icon: '◎',
      title: 'TikTok 直播',
      desc: '川益老師 TikTok 直播與短影片，即時互動、答疑與斗數入門。',
      cta: '前往 TikTok',
      hrefKey: 'tiktok',
    },
    {
      id: 'online',
      icon: '☁',
      title: '線上教學',
      desc: '（待填寫）課程名稱、堂數、開課時間與報名方式。',
      cta: '了解課程',
      hrefKey: 'line',
    },
    {
      id: 'offline',
      icon: '⌂',
      title: '線下教學',
      desc: '（待填寫）上課地點、梯次、費用與名額。',
      cta: '洽詢報名',
      hrefKey: 'line',
    },
    {
      id: 'consult',
      icon: '✦',
      title: '斗數相關服務',
      desc: '（待填寫）一對一諮詢、合盤、流年分析等。',
      cta: '預約諮詢',
      hrefKey: 'line',
    },
  ],
}
