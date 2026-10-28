/** 官網連結與文案設定 — 有正式資料時改這裡即可 */
window.RishuntangSiteConfig = {
  brand: {
    name: '國際日舜堂',
    tagline: '紫微斗數 · 傳承與實修',
    slogan: '以日舜堂安星為本，融會古今，助您明察命運、掌握人生方向',
  },
  /** 首頁「關於日舜堂」區塊 — 改文案請編輯這裡 */
  about: {
    subtitle: '準確、實用、大眾化 — 日舜堂紫微斗數',
    paragraphs: [
      '國際日舜堂成立於 2000 年，迄今已有 26 年的歷史。主持人川益老師是先天通，由神明直接傳授紫微斗數，並自成一派；日舜堂紫微斗數講求：準確、實用、大眾化。',
      '成立至今已經訓練出超過兩百名專業命理師。每年僅開班授業 1 個梯次，今年預計開授第 21 梯次，全都是小班制，目的就是讓學生們能更好的學習紫微斗數。',
      '我們不教複雜的諸星定義；我們的排盤方式，從 108 顆星簡化成 41 顆最常使用、也最容易理解學習的星曜。我們不談難懂的四化飛星，我們教你用最快速、最簡易的方式看懂命盤。',
      '日舜堂紫微斗數將中華幾千年斗數精華融入現代生活之中。我們不談鑑古知今那種空泛的舊思維，我們希望讓更多的人更容易學習紫微斗數；於是今年 2026 我們即將推出全新版本線上教學課程，敬請期待。',
    ],
    highlights: [
      { title: '準確 · 實用 · 大眾化', text: '日舜堂紫微斗數三大核心，讓解盤回到生活實務。' },
      { title: '41 顆核心星曜', text: '化繁為簡，不教艱深諸星定義，也不談難懂的四化飛星。' },
      { title: '第 21 梯小班授課', text: '每年一梯、小班制深耕；2026 全新線上教學課程即將推出。' },
    ],
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
    /** 免費試排表單頁 */
    freeChart: './free-chart.html',
    /** 訪客模式排盤（由 free-chart 開新視窗） */
    guestChartApp: 'https://rishuntang-ziwei.github.io/rishuntang-ziwei/chart.html?guest=1',
    /** 線上教學站（影片＋同步排盤） */
    courseHome: './course/index.html',
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
      desc: '影片示範搭配排盤軟體同步練習；課程架構已就緒，影片陸續上架。',
      cta: '進入教學站',
      hrefKey: 'courseHome',
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
