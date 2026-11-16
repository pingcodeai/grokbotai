export interface MarketplaceBot {
  name: string
  creator: string
  category: string
  description: string
  featured?: boolean
}

export const marketplaceSource = 'https://x.ai/bot/marketplace'
export const marketplaceCollectedAt = '2026-11-16'

export const marketplaceCategories = [
  '全部分类',
  '官方团队',
  '工程开发',
  '销售业务',
  '市场营销',
  '设计创意',
  '个人生活',
  '人才招聘',
  '产品管理',
  '运营管理',
] as const

export const marketplaceBots: MarketplaceBot[] = [
  { name: 'dr eggbot', creator: 'Lauren Tan', category: '官方团队', description: '帮助设计高质量、职责清晰的 Grok Bot，会先询问关键偏好，再创建对应 Bot。', featured: true },
  { name: 'Overheard', creator: 'Lenny Rachitsky', category: '官方团队', description: '监测 Reddit、Hacker News、新闻网站和 X 上的品牌提及，并整理工作日摘要。', featured: true },
  { name: 'Tradbot', creator: 'Claire Vo', category: '官方团队', description: '关注个人邮件和日历中的学校表格、账单与 RSVP，起草回复但不会自行发送。', featured: true },
  { name: 'Projects Manager', creator: 'Eric Zakariasson', category: '官方团队', description: '通过 Notion 管理团队项目、频道与任务，由专业 Bot 领取执行，自己只负责协调。', featured: true },
  { name: 'Researchy', creator: 'Farzad', category: '工程开发', description: '使用最新 Grok 模型和实时网页搜索完成研究与事实核查，输出带来源和日期的结论。' },
  { name: "Lingxi's Engineer Bot", creator: 'Lingxi Li', category: '工程开发', description: '负责工程任务编排、启动云端编码代理并定期检查 PR，只在需要合并时提醒你。' },
  { name: 'tinkabot', creator: 'Lauren Tan', category: '工程开发', description: '把 API 封装成 Cursor 或 Agent 插件，包括 MCP 与技能，并先完成最小可用验证。' },
  { name: 'QA bot', creator: 'Ulysses Ng', category: '工程开发', description: '在实际部署环境运行验收清单，在发布前给出通过或失败结论。' },
  { name: 'Outbound Prospecting', creator: 'Krista Letz', category: '销售', description: '按照理想客户画像寻找潜在客户并起草首次联系信息，发送前必须由人确认。' },
  { name: 'GTM Loop Closer', creator: 'Jon Grigull', category: '销售', description: '从会议、邮件、Slack、CRM 和任务工具中找出遗漏的承诺与跟进事项。' },
  { name: 'Sales Call Coach', creator: 'Daniel Brill', category: '销售', description: '分析销售通话或录音并给出评分，指出下一次通话需要改进的具体问题。' },
  { name: 'Meeting Recap Deck', creator: 'Krista Letz', category: '销售', description: '把会议笔记整理成符合现有幻灯片模板的复盘演示文稿，不会虚构引语。' },
  { name: 'SEO & AEO Desk', creator: 'Adam Tanguay', category: '市场营销', description: '把关键词整理成面向搜索引擎与 AI 回答的内容选题和可直接写作的内容简报。' },
  { name: 'Stills & Clips Desk', creator: 'Matt Palmer', category: '市场营销', description: '从视频中提取静帧、缩略图和短片，并按发布渠道调整尺寸、文案与替代文本。' },
  { name: 'Clip Bot', creator: 'This Week in AI', category: '市场营销', description: '从长录音或视频中找出精彩片段，生成带字幕、转录和时间戳的短视频。' },
  { name: 'Copy Humanizer', creator: 'Massimo De Luisa', category: '市场营销', description: '润色草稿、邮件和网页，让表达更自然，同时保留原有声音并说明修改原因。' },
  { name: 'Imogen', creator: 'Kent C. Dodds', category: '设计', description: '为图片生成简短、可复制的替代文本，突出最重要的信息并改善无障碍体验。' },
  { name: 'figma bro', creator: 'John Bai', category: '设计', description: '把 Figma 画面转换为开发规格，检查组件、设计令牌和动效，也能根据简报搭建界面。' },
  { name: 'Critiquito: Design Critique', creator: 'Manuel Muñoz Solera', category: '设计', description: '根据截图或 Figma 链接给出按优先级排列的设计评审，覆盖层级、字体、颜色和无障碍。' },
  { name: 'Game Art Director', creator: 'Danny Limanseta', category: '设计', description: '把游戏概念整理成风格指南、配色和图片提示词，并检查精灵图的网格与色板偏差。' },
  { name: 'Credit Card Max', creator: 'Trevin Chow', category: '个人生活', description: '根据积分、返现和会员等级等偏好建议刷哪张卡，并跟踪权益与周期性扣款。' },
  { name: 'Home robots', creator: 'Sawyer Merritt', category: '个人生活', description: '通过聊天控制支持的割草机、吸尘器和 Matter 家庭机器人，执行启动、暂停和回充。' },
  { name: 'Flora: Plant Care Log', creator: 'Rich Silver', category: '个人生活', description: '建立私密的室内植物养护日志和每周提醒，并在本地电脑中保存植物记录。' },
  { name: 'Pfp Bot', creator: 'Shub Gaur', category: '个人生活', description: '把 X 头像、自拍或宠物照片转换成保留发型与配色特征的 Grokbot 风格小头像。' },
  { name: 'Recruiting Coordinator', creator: 'Tommy Hansen', category: '招聘与人才', description: '安排面试流程、准备面试官资料并跟进停滞事项，未经确认不会联系候选人。' },
  { name: 'Talent Discovery', creator: 'Tommy Hansen', category: '招聘与人才', description: '按照职位条件寻找候选人，并排除已经存在于招聘管理系统中的人员。' },
  { name: 'Director Bot', creator: 'Xi Yan', category: '产品', description: '把创意简报转换为短片、广告、解说或音乐视频，覆盖规划、拍摄、剪辑和交付。' },
  { name: 'Proto Bot', creator: 'Shub Gaur', category: '产品', description: '把日常想法做成可分享的产品原型和草稿 PR，并提供操作截图与短视频。' },
  { name: 'Startup QA Bot', creator: 'Shub Gaur', category: '产品', description: '每个工作日在独立测试账户中检查产品，报告新增、回退和故障并附复现步骤。' },
  { name: 'PM bot', creator: 'Ulysses Ng', category: '产品', description: '明确产品范围、排除项和验收标准，在获得批准前不会让工程工作开始。' },
  { name: 'Office Ops Desk', creator: 'Erika Cabrera', category: '运营', description: '跟踪办公室快递、设施问题和团队生日，并根据清单或表格整理摘要。' },
  { name: 'Event Request Desk', creator: 'Emma Weyrauch', category: '运营', description: '评估活动、赞助和演讲邀请并起草接受或拒绝回复，未经确认不会发送。' },
  { name: 'Executive Assistant', creator: 'Natasha Kuo', category: '运营', description: '处理会议室、面试准备、管理层联络、Slack 清单以及表格与日历核对等行政工作。' },
  { name: 'Alfred', creator: 'Robin Delta', category: '运营', description: '设计和审查 Grok Bot 组织结构，明确人工负责人、减少重复岗位，并在变更前取得确认。' },
]
