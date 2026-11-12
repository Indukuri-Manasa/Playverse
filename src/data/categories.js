export const categories = [
  {
    id: 'arcade',
    title: 'Arcade & Action',
    short: 'Arcade',
    description: 'Fast reflexes, rising speed, one more run.',
    icon: 'bolt',
    color: '#5dff9d',
  },
  {
    id: 'puzzle',
    title: 'Brain & Puzzle',
    short: 'Puzzle',
    description: 'Memory, patterns and sharp recall.',
    icon: 'brain',
    color: '#2ee6ff',
  },
  {
    id: 'strategy',
    title: 'Strategy & Thinking',
    short: 'Strategy',
    description: 'Read the board, plan ahead, outwit.',
    icon: 'chess',
    color: '#b26bff',
  },
  {
    id: 'quick',
    title: 'Quick Challenges',
    short: 'Quick',
    description: 'Bite-sized games for a five-minute break.',
    icon: 'timer',
    color: '#ff4fb8',
  },
]

export const getCategory = (id) => categories.find((c) => c.id === id)
