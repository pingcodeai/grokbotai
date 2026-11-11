export type ArticleBlock =
  | { type: 'paragraph'; text: string; lead?: boolean }
  | { type: 'heading'; id: string; number: string; text: string }
  | { type: 'quote'; text: string }
  | { type: 'compare'; leftTitle: string; leftText: string; rightTitle: string; rightText: string }
  | { type: 'code'; language: string; lines: string[] }

export interface Article {
  slug: string
  number: string
  categoryId: string
  category: string
  title: string
  description: string
  date: string
  displayDate: string
  readingTime: number
  image?: string
  imageAlt?: string
  blocks: ArticleBlock[]
}

export const categories = [
  { id: 'all', label: '全部文章', description: '从基础入门到场景实践，探索 Grok Bot 的使用方法、工具接入与产品变化。' },
  { id: 'getting-started', label: '新手入门', description: '理解 Bot、任务与对话，从清晰的任务说明开始，完成第一个可检查的工作。' },
  { id: 'bot-practice', label: '场景实战', description: '围绕资料整理、内容制作与日常工作，学习如何准备输入、执行任务和核对结果。' },
  { id: 'integrations', label: '接入与开发', description: '探索模型 API、外部工具与工作流接入，了解接口、权限和任务交接方法。' },
  { id: 'troubleshooting', label: '问题排查', description: '梳理权限、任务中断、重复运行与额度问题，找到可复查的处理思路。' },
  { id: 'product-updates', label: '产品动态', description: '关注 Grok Bot 的产品变化与社区生态，区分功能更新、实验项目和使用限制。' },
]

export const legacyCategoryIds: Record<string, string> = {
  'prompt-lab': 'getting-started',
  'grok-notes': 'product-updates',
}

export const articles: Article[
] = [
  {
    slug: 'grok-bot-shopping-with-human-approval',
    number: '015',
    categoryId: 'bot-practice',
    category: '场景实战',
    title: '让 Grok Bot 帮你购物：比价可以自动，付款必须你点头',
    description:
      '用购物卡片、短名单与人工批准支付，把 Grok Bot 的购物能力收成可复查闭环：研究自动，结账由你确认，订单可追踪。',
    date: '2026-11-09',
    displayDate: '2026.11.09',
    readingTime: 8,
    image:
      'https://img.yjfan.top/blog/articles/grok-bot-shopping-with-human-approval/grok-bot-shopping-20261109-v2.webp',
    imageAlt: 'Grok Bot 购物人工批准封面，比价卡片通向人工确认支付与订单追踪',
    blocks: [
      {
        type: 'paragraph',
        lead: true,
        text: '近期 Grok Bot 更新里出现了购物卡片、商品页、订单追踪，以及把支付方式放进 Vault 的能力。社区演示视频把流程串得很顺：搜货、对比、下单、跟物流。真正决定能不能长期用的，不是“它会不会买”，而是你有没有把支付权锁在人工批准这一环。',
      },
      {
        type: 'paragraph',
        text: '购物是不可逆动作。价格、库存、运费、退货政策和站点反自动化策略都会变化；有的商店允许助手走结账，有的会拦截。因此本文不承诺全网一键代购，只给一套可复制的边界：研究与比价可自动，付款与地址确认必须你点头。',
      },
      {
        type: 'heading',
        id: 'write-the-buy-contract',
        number: '01 /',
        text: '先写购买契约，再让 Bot 打开商品页',
      },
      {
        type: 'paragraph',
        text: '开放式的“帮我看看键盘”几乎一定会扩成无限浏览。购买契约至少写清：用途、硬性规格、预算上限、可接受品牌、必须排除的条件，以及“找不到就停下”的标准。没有契约，Bot 只会用流畅的推荐掩盖目标漂移。',
      },
      {
        type: 'code',
        language: 'BUY CONTRACT',
        lines: [
          'item: 一句话说明要买什么、给谁用',
          'must_have: 不可妥协的规格与兼容性',
          'nice_to_have: 可排序的加分项',
          'budget_max: 含税运的硬顶',
          'exclude: 明确不接受的品牌、材质或店铺类型',
          'shortlist_size: 通常 3 个候选即可',
          'stop_when: 无库存、超预算、规格冲突或证据不足',
          'checkout: 仅在人工批准后允许支付',
        ],
      },
      {
        type: 'heading',
        id: 'compare-fields-not-vibes',
        number: '02 /',
        text: '用固定字段做短名单，不要用感觉排序',
      },
      {
        type: 'paragraph',
        text: '要求 Bot 输出同一套字段：标价、到手价、运费、预计送达、退货窗口、关键规格、评分样本量和风险备注。三到五个候选足够；超过这个数量，人通常无法认真审。缺字段就标“待核实”，不要用营销语填空。',
      },
      {
        type: 'compare',
        leftTitle: '帮我挑个性价比高的，看着买就行。',
        leftText: '目标、预算和支付边界都含糊，Bot 容易越买越偏。',
        rightTitle: '给出三款对照表，超预算或缺规格就停下，支付需我批准。',
        rightText: '研究可自动推进，结账仍保留人工闸门。',
      },
      {
        type: 'heading',
        id: 'human-approves-payment',
        number: '03 /',
        text: '支付默认关闭：批准的是金额、地址与商品，不只是“继续”',
      },
      {
        type: 'paragraph',
        text: '把 Vault 里的卡、Shop Pay 或 Link 交给 Bot，不等于授权它自行结账。批准卡片上应同时出现：最终金额、收货地址摘要、商品 SKU/链接、商家名称，以及取消/退货入口。只回一句“好的”就放行，等于把核对工作又交回黑盒。',
      },
      {
        type: 'heading',
        id: 'track-after-checkout',
        number: '04 /',
        text: '下单之后改成追踪契约，而不是继续闲聊',
      },
      {
        type: 'paragraph',
        text: '订单追踪适合做成例行检查：物流状态是否变化、是否需要签收、是否进入可退货窗口。没有状态变化时，不必反复生成长报告。退货、拒收或价保这类动作，同样先起草再批准。',
      },
      {
        type: 'quote',
        text: 'Bot 可以替你找遍货架，\n但收银台前必须站着你。',
      },
      {
        type: 'heading',
        id: 'expect-site-friction',
        number: '05 /',
        text: '把站点摩擦当成正常情况，不要硬闯结账',
      },
      {
        type: 'paragraph',
        text: '验证码、登录墙、库存闪断和反自动化策略都会打断流程。约定失败时的产物：已确认的短名单、卡住的步骤、可用的人工结账链接。宁可让人完成最后一跳，也不要为了“全自动”去绕过安全校验。',
      },
      {
        type: 'heading',
        id: 'review-one-purchase',
        number: '06 /',
        text: '买完复盘一次：契约哪里松了',
      },
      {
        type: 'paragraph',
        text: '检查是否买贵、是否规格不符、是否因催促跳过了批准页。每次只收紧一个字段：预算、排除条件或短名单长度。稳定后，同一契约可以复用到补给品、配件和家庭常规采购。',
      },
      {
        type: 'paragraph',
        lead: true,
        text: 'Grok Bot 的购物能力，价值在于缩短研究与跟单时间，而不是拿走你的支付权。先写清购买契约，用字段化短名单做比较，再让人工批准金额与地址，最后用追踪契约收尾。研究可以自动，付款必须你点头。',
      },
    ],
  },
{
    slug: 'grok-bot-pages-living-work-docs',
    number: '014',
    categoryId: 'bot-practice',
    category: '场景实战',
    title: 'Grok Bot Pages：别再从聊天记录里挖上周的结论',
    description:
      '把报告、对照表和状态板做成可保存、可更新的 Pages，让结论住在 Library，而不是淹没在对话气泡里。',
    date: '2026-11-09',
    displayDate: '2026.11.09',
    readingTime: 8,
    image:
      'https://img.yjfan.top/blog/articles/grok-bot-pages-living-work-docs/grok-bot-pages-20261109-v2.webp',
    imageAlt: 'Grok Bot Pages 活文档封面，聊天结论沉淀为可更新的报告与仪表盘',
    blocks: [
      {
        type: 'paragraph',
        lead: true,
        text: 'Grok Bot 的 Pages 把“再生成一篇长回复”换成“维护一份还活着的文档”。你可以要一份报告、备忘或仪表盘，它会以卡片形式打开，并保存在 Library；之后既能一起编辑，也能按约定继续更新，而不必翻聊天记录找上周那个版本。',
      },
      {
        type: 'paragraph',
        text: '这对小团队尤其实用：报价对照、项目状态、内容排期、周报摘要，本来就不该只活在一次对话里。下面不复述某个演示里的业务结果，只整理何时该用 Page、如何约定数据源，以及分享前要守住的边界。',
      },
      {
        type: 'heading',
        id: 'when-page-beats-chat',
        number: '01 /',
        text: '会反复回看的产物，就不要只放在气泡里',
      },
      {
        type: 'paragraph',
        text: '一次性问答适合短结论；需要对照、追踪、共享或下周接着改的内容，更适合 Page。判断标准很简单：若你预计自己会搜索旧消息，或把同一段粘贴到别处，就该升级成文档。',
      },
      {
        type: 'compare',
        leftTitle: '再给我写一版本周总结，越详细越好。',
        leftText: '每个版本都沉进聊天，差异难以比对，也难分享。',
        rightTitle: '维护一页周报 Page，只更新变化项并保留上次数字。',
        rightText: '结论有固定地址，更新可追踪，回看成本更低。',
      },
      {
        type: 'heading',
        id: 'define-page-contract',
        number: '02 /',
        text: '创建 Page 前先约定读者、字段和更新节奏',
      },
      {
        type: 'paragraph',
        text: '写明这份 Page 给谁看、必须包含哪些栏目、数字从哪里来、多久更新一次，以及过期后如何标记。没有契约，Bot 容易把 Page 写成又一篇漂亮但难维护的长文。',
      },
      {
        type: 'code',
        language: 'PAGE CONTRACT',
        lines: [
          'audience: 谁会打开这页，决定粒度与术语',
          'sections: 固定栏目，避免每次重排结构',
          'sources: 允许读取的文件、链接或连接器',
          'refresh: 手动触发 / 例行更新 / 仅在有变化时更新',
          'owners: 谁负责核对数字与对外分享',
          'stale_after: 超过多久未更新要标为过期',
          'share_policy: 链接可见范围与禁止写入的字段',
        ],
      },
      {
        type: 'heading',
        id: 'update-delta-not-rewrite',
        number: '03 /',
        text: '更新时改变化，不要整页重写吞掉历史',
      },
      {
        type: 'paragraph',
        text: '要求 Bot 标注“本次变更”和“未变项”。对关键指标保留上次值，避免每次刷新都像一份新报告。若某块缺少新证据，应保留旧值并标记待核实，而不是为了完整感去补猜。',
      },
      {
        type: 'heading',
        id: 'share-with-boundaries',
        number: '04 /',
        text: '分享前先检查：链接等于潜在外发',
      },
      {
        type: 'paragraph',
        text: '可分享的 Page 很方便，也意味着权限一旦宽松，内容就可能离开原对话。对外分享前删除原始凭证、内部单价、未公开客户名和未审批结论；需要协作时，优先分享只读视图，并把可编辑权留在少数人手里。',
      },
      {
        type: 'quote',
        text: '聊天是草稿纸，\nPage 才是你能指给人看的桌面。',
      },
      {
        type: 'heading',
        id: 'human-checks-numbers',
        number: '05 /',
        text: '数字与承诺仍要人工核对',
      },
      {
        type: 'paragraph',
        text: 'Page 可以整理表格和图表，但不能代替对来源的抽查。涉及报价、用量、法务表述或对外承诺时，设一个发布前检查：抽三个数字追到来源，确认日期与单位，再允许分享。',
      },
      {
        type: 'heading',
        id: 'start-with-one-living-page',
        number: '06 /',
        text: '先养活一页，再复制模板',
      },
      {
        type: 'paragraph',
        text: '从一份真正每周都会打开的 Page 开始，例如项目状态或供应商对照。跑两周后，把稳定栏目沉淀成模板，再复制到同类场景。堆很多从未回看的仪表盘，只会制造新的信息坟场。',
      },
      {
        type: 'paragraph',
        lead: true,
        text: 'Pages 的意义，是让 Grok Bot 从“每次重新回答”变成“持续维护一份工作文档”。先约定读者与字段，按变化更新，分享前做权限与数字检查。这样结论住在 Library，而不是散落在聊天气泡里。',
      },
    ],
  },
{
    slug: 'grok-bot-not-a-chatbot-work-contract',
    number: '012',
    categoryId: 'getting-started',
    category: '新手入门',
    title: '别再把 Grok Bot 当聊天框：用工作契约换来可验收的交付',
    description:
      '把开放式闲聊改写为包含输入、输出物、验收标准与停止条件的工作契约，让 Grok Bot 少猜测、能交付、可复查。',
    date: '2026-11-09',
    displayDate: '2026.11.09',
    readingTime: 8,
    image:
      'https://img.yjfan.top/blog/articles/grok-bot-not-a-chatbot-work-contract/grok-bot-work-contract-20261109-v2.webp',
    imageAlt: 'Grok Bot 工作契约封面，任务输入、交付物、验收与停止条件组成一张流程卡',
    blocks: [
      {
        type: 'paragraph',
        lead: true,
        text: '把 Grok Bot 当作聊天机器人时，我们很容易只说“研究一下”“帮我处理”“继续优化”。这些话适合开启对话，却没有告诉 Bot 何时算完成、应该交付什么，也没有限制它在信息不足时继续猜。近期用户反馈中，一个反复出现的转折是：从陪聊式指令改成“读什么、做什么、交付什么”的工作契约后，任务才真正可用。',
      },
      {
        type: 'paragraph',
        text: '这不是让提示词变得更长，而是把任务边界写清楚。用量与产品限制会变化，本文也不讨论如何挤出更多调用次数；重点是让每次运行都有明确产物，避免 Bot 在模糊目标上来回追问、扩写和返工。',
      },
      {
        type: 'heading',
        id: 'chat-is-not-a-task',
        number: '01 /',
        text: '聊天有方向，工作必须有完成定义',
      },
      {
        type: 'paragraph',
        text: '“帮我看看竞品”只表达了兴趣，没有定义输入范围、比较维度、证据标准和输出格式。Bot 可能给出一篇流畅概览，但你无法判断它是否遗漏关键对象，也无法直接把结果交给同事。工作契约要把“感觉不错”替换为可以逐项检查的条件。',
      },
      {
        type: 'compare',
        leftTitle: '帮我研究这三家产品，给点有用的结论。',
        leftText: '范围、来源、篇幅和完成条件都由 Bot 猜，结果很难复用。',
        rightTitle: '读取指定页面，按六个字段做对照表，并列出证据缺口。',
        rightText: '输入、输出物和验收条件明确，缺资料时也知道如何停下。',
      },
      {
        type: 'heading',
        id: 'four-part-contract',
        number: '02 /',
        text: '一份最小契约只需要四个部分',
      },
      {
        type: 'paragraph',
        text: '第一是输入：允许读取哪些文件、页面或字段。第二是动作：需要分类、核对、计算还是起草。第三是输出物：表格、草稿、清单或状态更新。第四是停止条件：资料不足、权限缺失、结果冲突或达到预算时应该暂停并报告，而不是自行补全。',
      },
      {
        type: 'code',
        language: 'WORK CONTRACT',
        lines: [
          'goal: 用一句话说明本次任务要解决的问题',
          'inputs: 只读取明确列出的文件、链接与字段',
          'deliverable: 指定格式、字段、篇幅和保存位置',
          'acceptance: 列出必须满足的可检查条件',
          'stop_when: 缺证据、权限不足、冲突或超出范围',
          'on_stop: 返回已完成项、缺口和需要人工决定的问题',
        ],
      },
      {
        type: 'heading',
        id: 'separate-facts-decisions',
        number: '03 /',
        text: '把事实整理和业务决定拆开',
      },
      {
        type: 'paragraph',
        text: 'Bot 可以先读取资料、提取事实、标记矛盾并生成候选方案；涉及品牌承诺、价格例外、删除数据、对外发送或其他不可逆动作时，再由人决定。契约中写清“可以建议，但不能决定”的字段，能避免一个看似普通的整理任务悄悄扩大为执行授权。',
      },
      {
        type: 'heading',
        id: 'acceptance-tests',
        number: '04 /',
        text: '用验收测试代替“写得更好”',
      },
      {
        type: 'paragraph',
        text: '验收条件应能回答是或否。例如：每条结论是否带来源；表格是否包含全部指定对象；无法确认的数字是否标为待核实；是否没有执行外发；文件名与保存位置是否正确。不要用“专业、深入、有洞察”作为唯一标准，它们仍会迫使 Bot 猜测你的偏好。',
      },
      {
        type: 'quote',
        text: '提示词不是一段愿望，\n而是一份可以验收的工作说明。',
      },
      {
        type: 'heading',
        id: 'stop-cleanly',
        number: '05 /',
        text: '让 Bot 在不知道时干净地停下',
      },
      {
        type: 'paragraph',
        text: '停止不是失败。真正危险的是缺少来源时编造、遇到冲突时随意选边，或为了“完成任务”扩大读取和发送范围。要求 Bot 在停止时保留检查点：已经读取什么、完成哪些步骤、哪里缺证据、下一步需要谁决定。这样人工接手时不必从头重做。',
      },
      {
        type: 'heading',
        id: 'iterate-the-contract',
        number: '06 /',
        text: '复盘失败时先修契约，不先责怪模型',
      },
      {
        type: 'paragraph',
        text: '检查失败是否来自输入不完整、输出格式含糊、验收标准不可检查，或停止条件缺失。每次只修一个字段，再用同一组样例重跑。经过几轮后，这份契约可以成为 Routine、团队模板或交接文档，而不是只在一段聊天里有效。',
      },
      {
        type: 'paragraph',
        lead: true,
        text: 'Grok Bot 的价值不在于把对话拉得更长，而在于把一个任务推进到可交付状态。先写清输入、产物、验收和停止条件，再决定是否自动化。工作契约越明确，Bot 越少猜测，人也越容易检查、接管和复用。',
      },
    ],
  },

]

export function findArticle(slug: string | string[] | undefined) {
  return articles.find((article) => article.slug === slug)
}

export function categoryName(categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.label ?? '文章'
}
