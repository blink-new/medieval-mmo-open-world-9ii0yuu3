export interface Player {
  id: string
  userId: string
  name: string
  level: number
  health: number
  maxHealth: number
  mana: number
  maxMana: number
  xPosition: number
  yPosition: number
  characterClass: 'warrior' | 'mage' | 'archer'
  experience: number
  gold: number
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  userId: string
  playerName: string
  message: string
  createdAt: string
}

export interface InventoryItem {
  id: string
  userId: string
  playerId: string
  itemName: string
  itemType: 'weapon' | 'armor' | 'consumable' | 'misc'
  quantity: number
  equipped: boolean
  createdAt: string
}

export interface Quest {
  id: string
  title: string
  description: string
  reward: number
  experienceReward: number
  completed: boolean
  createdAt: string
}

export interface PlayerQuest {
  id: string
  userId: string
  playerId: string
  questId: string
  completed: boolean
  progress: number
  createdAt: string
}

export interface GameState {
  currentPlayer: Player | null
  otherPlayers: Player[]
  inventory: InventoryItem[]
  chatMessages: ChatMessage[]
  quests: Quest[]
  playerQuests: PlayerQuest[]
  isLoading: boolean
  selectedPanel: 'chat' | 'inventory' | 'quests' | null
}