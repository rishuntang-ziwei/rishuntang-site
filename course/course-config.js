/**
 * 線上教學站設定 — 課綱、影片網址、排盤連結皆在此維護。
 * video: null 表示尚未上傳；之後可填 { provider: 'youtube', id: '...' } 或 { provider: 'file', url: '...' }
 */
window.RishuntangCourseConfig = {
  brand: {
    name: '國際日舜堂',
    courseTitle: '紫微斗數線上教學',
    tagline: '老師示範 · 學員同步操作排盤軟體',
  },
  links: {
    mainSite: '../index.html',
    /** 學員練習用（訪客試排，關閉視窗資料不保留） */
    chartGuest: 'https://rishuntang-ziwei.github.io/rishuntang-ziwei/chart.html?guest=1',
    /** 會員登入後完整功能 */
    chartMember: 'https://rishuntang-ziwei.github.io/rishuntang-ziwei/chart.html',
    memberLogin: 'https://rishuntang-ziwei.github.io/rishuntang-ziwei/index.html',
  },
  /** 預設嵌入排盤：guest | member */
  defaultChartAccess: 'guest',
  courses: [
    {
      id: 'ziwei-online-2026',
      title: '日舜堂紫微斗數線上教學（2026）',
      summary:
        '以影片示範搭配日舜堂排盤軟體實作。老師在影片中操作軟體並講解命盤結構，學員可在右側同步練習。',
      status: 'coming-soon',
      modules: [
        {
          id: 'mod-01',
          title: '第一單元｜認識命盤與軟體操作',
          lessons: [
            {
              id: '01-01',
              title: '課程導讀與學習方式',
              durationMin: null,
              video: null,
              chartAccess: 'guest',
              practiceNote: '可先熟悉右側排盤介面：輸入資料、按「開始排盤」。',
              objectives: ['了解雙欄學習模式', '完成第一次試排'],
            },
            {
              id: '01-02',
              title: '十二宮與三方四正概覽',
              durationMin: null,
              video: null,
              chartAccess: 'guest',
              practiceNote: '點選各宮位，觀察三方四正標示變化。',
              objectives: ['認識十二宮位置', '理解三方四正'],
            },
          ],
        },
        {
          id: 'mod-02',
          title: '第二單元｜41 核心星曜入門',
          lessons: [
            {
              id: '02-01',
              title: '主星與宮位：讀盤起點',
              durationMin: null,
              video: null,
              chartAccess: 'guest',
              practiceNote: '對照影片中命盤，在右側找出相同主星所在宮位。',
              objectives: ['區分主星與輔星', '對照宮位讀星'],
            },
            {
              id: '02-02',
              title: '亮度與實務判斷提示',
              durationMin: null,
              video: null,
              chartAccess: 'guest',
              practiceNote: '觀察各主星亮度標示，記錄你的問題待下集解答。',
              objectives: ['認識亮度標示', '建立讀盤習慣'],
            },
          ],
        },
        {
          id: 'mod-03',
          title: '第三單元｜大限與流年（進階預告）',
          lessons: [
            {
              id: '03-01',
              title: '大限命盤切換示範',
              durationMin: null,
              video: null,
              chartAccess: 'member',
              practiceNote: '需會員登入後方可使用大限／流年功能；可先觀看影片預習。',
              objectives: ['了解大限切換位置', '知道會員功能差異'],
            },
            {
              id: '03-02',
              title: '流年讀盤與軟體操作整合',
              durationMin: null,
              video: null,
              chartAccess: 'member',
              practiceNote: '跟著影片步驟切換流年，同步在右側操作。',
              objectives: ['流年盤操作', '整合講解與實作'],
            },
          ],
        },
      ],
    },
  ],
}
