import React, { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Player, ChatMessage, InventoryItem, GameState } from './types/game'
import { CharacterCreation } from './components/game/CharacterCreation'
import { GameWorld } from './components/game/GameWorld'
import { PlayerStats } from './components/game/PlayerStats'
import { ChatPanel } from './components/game/ChatPanel'
import { InventoryPanel } from './components/game/InventoryPanel'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Package, MessageCircle, Scroll, Settings, LogOut } from 'lucide-react'
import { toast } from 'react-hot-toast'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: null,
    otherPlayers: [],
    inventory: [],
    chatMessages: [],
    quests: [],
    playerQuests: [],
    isLoading: false,
    selectedPanel: null
  })

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      if (state.user) {
        loadPlayerData(state.user.id)
      }
    })
    return unsubscribe
  }, [])

  const loadPlayerData = async (userId: string) => {
    try {
      // Load player from localStorage for now (since DB creation failed)
      const savedPlayer = localStorage.getItem(`player_${userId}`)
      if (savedPlayer) {
        const player = JSON.parse(savedPlayer)
        setGameState(prev => ({ ...prev, currentPlayer: player }))
        
        // Load inventory
        const savedInventory = localStorage.getItem(`inventory_${userId}`)
        if (savedInventory) {
          setGameState(prev => ({ ...prev, inventory: JSON.parse(savedInventory) }))
        }
        
        // Load chat messages
        const savedMessages = localStorage.getItem('chatMessages')
        if (savedMessages) {
          setGameState(prev => ({ ...prev, chatMessages: JSON.parse(savedMessages) }))
        }
      }
    } catch (error) {
      console.error('Error loading player data:', error)
    }
  }

  const createCharacter = async (name: string, characterClass: 'warrior' | 'mage' | 'archer') => {
    if (!user) return

    const newPlayer: Player = {
      id: `player_${Date.now()}`,
      userId: user.id,
      name,
      level: 1,
      health: characterClass === 'warrior' ? 120 : characterClass === 'mage' ? 80 : 100,
      maxHealth: characterClass === 'warrior' ? 120 : characterClass === 'mage' ? 80 : 100,
      mana: characterClass === 'warrior' ? 30 : characterClass === 'mage' ? 100 : 50,
      maxMana: characterClass === 'warrior' ? 30 : characterClass === 'mage' ? 100 : 50,
      xPosition: 400,
      yPosition: 300,
      characterClass,
      experience: 0,
      gold: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Save to localStorage
    localStorage.setItem(`player_${user.id}`, JSON.stringify(newPlayer))
    
    // Create starting inventory
    const startingItems: InventoryItem[] = [
      {
        id: `item_${Date.now()}_1`,
        userId: user.id,
        playerId: newPlayer.id,
        itemName: characterClass === 'warrior' ? 'Iron Sword' : characterClass === 'mage' ? 'Wooden Staff' : 'Hunting Bow',
        itemType: 'weapon',
        quantity: 1,
        equipped: true,
        createdAt: new Date().toISOString()
      },
      {
        id: `item_${Date.now()}_2`,
        userId: user.id,
        playerId: newPlayer.id,
        itemName: 'Health Potion',
        itemType: 'consumable',
        quantity: 3,
        equipped: false,
        createdAt: new Date().toISOString()
      },
      {
        id: `item_${Date.now()}_3`,
        userId: user.id,
        playerId: newPlayer.id,
        itemName: 'Leather Armor',
        itemType: 'armor',
        quantity: 1,
        equipped: true,
        createdAt: new Date().toISOString()
      }
    ]

    localStorage.setItem(`inventory_${user.id}`, JSON.stringify(startingItems))

    setGameState(prev => ({
      ...prev,
      currentPlayer: newPlayer,
      inventory: startingItems
    }))

    toast.success(`Welcome to the world, ${name}!`)
  }

  const handlePlayerMove = async (x: number, y: number) => {
    if (!gameState.currentPlayer || !user) return

    const updatedPlayer = {
      ...gameState.currentPlayer,
      xPosition: x,
      yPosition: y,
      updatedAt: new Date().toISOString()
    }

    // Save to localStorage
    localStorage.setItem(`player_${user.id}`, JSON.stringify(updatedPlayer))
    
    setGameState(prev => ({
      ...prev,
      currentPlayer: updatedPlayer
    }))

    // Publish movement to other players via realtime
    try {
      await blink.realtime.publish('game-world', 'player-move', {
        playerId: updatedPlayer.id,
        playerName: updatedPlayer.name,
        x,
        y,
        characterClass: updatedPlayer.characterClass
      })
    } catch (error) {
      console.error('Error publishing movement:', error)
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!gameState.currentPlayer || !user) return

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      userId: user.id,
      playerName: gameState.currentPlayer.name,
      message,
      createdAt: new Date().toISOString()
    }

    // Save to localStorage
    const currentMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]')
    const updatedMessages = [...currentMessages, newMessage].slice(-50) // Keep last 50 messages
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages))

    setGameState(prev => ({
      ...prev,
      chatMessages: updatedMessages
    }))

    // Publish to realtime chat
    try {
      await blink.realtime.publish('game-chat', 'message', newMessage)
    } catch (error) {
      console.error('Error sending message:', error)
    }

    toast.success('Message sent!')
  }

  const handleEquipItem = (itemId: string) => {
    if (!user) return

    const updatedInventory = gameState.inventory.map(item => {
      if (item.id === itemId) {
        return { ...item, equipped: !item.equipped }
      }
      // Unequip other items of the same type
      if (item.itemType === gameState.inventory.find(i => i.id === itemId)?.itemType && item.equipped) {
        return { ...item, equipped: false }
      }
      return item
    })

    localStorage.setItem(`inventory_${user.id}`, JSON.stringify(updatedInventory))
    setGameState(prev => ({ ...prev, inventory: updatedInventory }))
    
    const item = gameState.inventory.find(i => i.id === itemId)
    toast.success(`${item?.equipped ? 'Unequipped' : 'Equipped'} ${item?.itemName}`)
  }

  const handleUseItem = (itemId: string) => {
    if (!user || !gameState.currentPlayer) return

    const item = gameState.inventory.find(i => i.id === itemId)
    if (!item || item.itemType !== 'consumable') return

    const updatedPlayer = { ...gameState.currentPlayer }
    let updatedInventory = [...gameState.inventory]

    // Apply item effects
    if (item.itemName === 'Health Potion') {
      updatedPlayer.health = Math.min(updatedPlayer.maxHealth, updatedPlayer.health + 30)
    }

    // Reduce item quantity or remove if used up
    if (item.quantity > 1) {
      updatedInventory = updatedInventory.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      )
    } else {
      updatedInventory = updatedInventory.filter(i => i.id !== itemId)
    }

    // Save updates
    localStorage.setItem(`player_${user.id}`, JSON.stringify(updatedPlayer))
    localStorage.setItem(`inventory_${user.id}`, JSON.stringify(updatedInventory))

    setGameState(prev => ({
      ...prev,
      currentPlayer: updatedPlayer,
      inventory: updatedInventory
    }))

    toast.success(`Used ${item.itemName}`)
  }

  const handleLogout = () => {
    blink.auth.logout()
    setGameState({
      currentPlayer: null,
      otherPlayers: [],
      inventory: [],
      chatMessages: [],
      quests: [],
      playerQuests: [],
      isLoading: false,
      selectedPanel: null
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-accent font-cinzel">Loading Medieval World...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center space-y-4">
          <h1 className="text-2xl font-cinzel text-accent">Medieval MMO</h1>
          <p className="text-muted-foreground">Please sign in to enter the world</p>
          <Button onClick={() => blink.auth.login()} className="bg-primary hover:bg-primary/80">
            Sign In
          </Button>
        </Card>
      </div>
    )
  }

  if (!gameState.currentPlayer) {
    return <CharacterCreation onCreateCharacter={createCharacter} />
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-cinzel text-accent">Medieval MMO</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {gameState.currentPlayer.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
          {/* Left Panel - Player Stats */}
          <div className="lg:col-span-1 space-y-4">
            <PlayerStats player={gameState.currentPlayer} />
          </div>

          {/* Center Panel - Game World */}
          <div className="lg:col-span-2">
            <GameWorld
              currentPlayer={gameState.currentPlayer}
              otherPlayers={gameState.otherPlayers}
              onPlayerMove={handlePlayerMove}
            />
          </div>

          {/* Right Panel - Tabs */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="grid w-full grid-cols-3 bg-card border-primary">
                <TabsTrigger value="chat" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <MessageCircle className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="inventory" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Package className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="quests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Scroll className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="h-[calc(100%-60px)] mt-4">
                <ChatPanel
                  messages={gameState.chatMessages}
                  currentPlayerName={gameState.currentPlayer.name}
                  onSendMessage={handleSendMessage}
                />
              </TabsContent>
              
              <TabsContent value="inventory" className="h-[calc(100%-60px)] mt-4">
                <InventoryPanel
                  items={gameState.inventory}
                  onEquipItem={handleEquipItem}
                  onUseItem={handleUseItem}
                />
              </TabsContent>
              
              <TabsContent value="quests" className="h-[calc(100%-60px)] mt-4">
                <Card className="bg-card/90 border-primary h-full flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Scroll className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Quest system coming soon!</p>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App