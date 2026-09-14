/** 演示的外部词典：组件、业务回复与网站文案各自由接入方提供。 */
export const widgetCopy = {
  zh: {
    title: '橙间助手', greeting: '你好，有什么可以帮你？',
    placeholder: '输入你的问题…', notice: '',
    open: '打开客服', close: '关闭客服', dismiss: '关闭提示', send: '发送', stop: '停止', retry: '重试', you: '你',
    inputLabel: '你的消息', inputHint: 'Enter 发送 · Shift + Enter 换行', unread: n => `${n} 条未读回复`,
    states: { idle: '随时为你解答', thinking: '正在理解你的问题…', working: '正在整理答案…', asking: '需要你补充一点信息', done: '回复已就绪', error: '暂时遇到一点问题' },
    errors: { unavailable: '客服尚未连接，请稍后再试。', failed: '这次没能收到回复，请重试。', empty: '暂未收到回复，请重试。', tooLong: '请将消息控制在 2,000 字以内。', cancelled: '已停止处理，你可以重试。' },
  },
  en: {
    title: 'Orange Studio assistant', greeting: 'Hi, how can I help you?',
    placeholder: 'Ask a question…', notice: '',
    open: 'Open assistant', close: 'Close assistant', dismiss: 'Dismiss notification', send: 'Send', stop: 'Stop', retry: 'Retry', you: 'You',
    inputLabel: 'Your message', inputHint: 'Enter to send · Shift + Enter for a new line', unread: n => `${n} unread ${n === 1 ? 'reply' : 'replies'}`,
    states: { idle: 'Ready to help', thinking: 'Understanding your question…', working: 'Putting an answer together…', asking: 'A little more information, please', done: 'Your reply is ready', error: 'Something went wrong' },
    errors: { unavailable: 'Support is not connected. Please try again later.', failed: 'We couldn’t get a reply. Please retry.', empty: 'No reply was received. Please retry.', tooLong: 'Please keep your message under 2,000 characters.', cancelled: 'Request stopped. You can try again.' },
  },
}

export const scenarios = {
  zh: {
    suggestions: ['如何开始使用？', '适合个人还是团队？', '有哪些功能？'],
    failQuestion: '演示一次请求失败',
    reply: '这是本地模拟回复。你可以先创建一个工作空间，再把项目和待办放进来。\n\n试试在处理时关闭面板：回复会保留，小球会提示你回来查看。',
    asking: '为了继续帮助你，请告诉我你是个人使用，还是和团队一起使用？',
    recovered: '重试成功。这条回复演示了失败后恢复，刚才的问题不会重复发送到对话记录中。',
    descriptions: { idle: '安静待在角落，点击小球就能开始聊天。', thinking: '轻轻呼吸并抬眼，让等待有明确的含义。', working: '一圈柔和光环表示正在处理，随时可以打开查看或停止。', asking: '胶囊提示需要补充信息，点击就回到对话。', done: '回复就绪时提示一次，打开后清除未读。', error: '用沉静的颜色提示失败，对话中可以重试。' },
  },
  en: {
    suggestions: ['How do I get started?', 'Is it for me or my team?', 'What can I do with it?'],
    failQuestion: 'Demonstrate a failed request',
    reply: 'This is a local simulated reply. Start by creating a workspace, then bring your projects and tasks together.\n\nTry closing the panel while I’m working: the reply stays here, and the orb lets you know when it is ready.',
    asking: 'To help you get started, are you working on your own or with a team?',
    recovered: 'The retry succeeded. Your original question stays in the conversation just once.',
    descriptions: { idle: 'Quietly in the corner. Click the orb whenever you need help.', thinking: 'Gentle breathing and an upward glance make the wait clear.', working: 'A soft ring shows progress. Open the panel to check in or stop.', asking: 'A capsule asks for more information. Click to return to the conversation.', done: 'A reply-ready notification clears when you open the conversation.', error: 'A muted color signals a problem. You can retry in the conversation.' },
  },
}

export const pageEnglish = {
  demoLabel: 'Website embed demo', darkBackground: 'Dark background', gallery: 'Orb gallery',
  brand: 'Orange Studio', navProduct: 'Product', navExperience: 'Try the assistant', navContact: 'Contact us',
  exampleSite: 'An example website for a workspace product', heroLineOne: 'Less busywork.', heroLineTwo: 'More breathing room.',
  heroDescription: 'Bring projects, ideas and next steps together. Keep your team focused on what matters, with room for something new.',
  heroAction: 'Talk to our assistant', heroNote: 'The little orb in the corner is here whenever you need it.',
  workspaceName: 'Design studio', workspaceDate: 'Monday · A new week', workspaceTitle: 'Make room for creating today.',
  workspaceProjects: 'Projects in progress', workspaceExample: 'Example content', projectOne: 'A brand, refreshed',
  projectOneDetail: 'Turn good ideas into clear expression', projectOneStatus: 'Designing', projectTwo: 'Summer inspiration',
  projectTwoDetail: 'Stay curious about what comes next', projectTwoStatus: 'Collecting', noteTitle: 'A small reminder',
  noteBody: 'You don’t have to do everything at once. Start with what matters most.', workspaceBottom: 'A place for ideas. A little order for work.',
  tryEyebrow: 'Meet your little assistant', tryTitle: 'Every state has a response.',
  tryDescription: 'Choose a state and watch the corner. Or open the conversation and ask your first question.',
  stateLegend: 'Preview assistant states', stateIdle: 'Ready', stateThinking: 'Thinking', stateWorking: 'Working',
  stateAsking: 'Your turn', stateDone: 'Done', stateError: 'Error', idleDescription: 'Quietly in the corner. Click the orb whenever you need help.',
  failureTest: 'Test failure & retry', resetPreview: 'Back to ready', disclaimer: 'A local ai-orb demo. Orange Studio is fictional. Replies are simulated; nothing is sent to a server.',
  backToOrb: 'Explore ai-orb',
}
