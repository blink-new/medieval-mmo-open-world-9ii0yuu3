import React from 'react'
import { InventoryItem } from '../../types/game'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Package, Sword, Shield, Beaker, Star } from 'lucide-react'

interface InventoryPanelProps {
  items: InventoryItem[]
  onEquipItem: (itemId: string) => void
  onUseItem: (itemId: string) => void
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  items,
  onEquipItem,
  onUseItem
}) => {
  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'weapon':
        return <Sword className="w-4 h-4" />
      case 'armor':
        return <Shield className="w-4 h-4" />
      case 'consumable':
        return <Beaker className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getItemColor = (itemType: string) => {
    switch (itemType) {
      case 'weapon':
        return 'text-red-400'
      case 'armor':
        return 'text-blue-400'
      case 'consumable':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  const getItemRarity = (itemName: string) => {
    // Simple rarity system based on item name
    if (itemName.includes('Legendary')) return 'legendary'
    if (itemName.includes('Epic')) return 'epic'
    if (itemName.includes('Rare')) return 'rare'
    return 'common'
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-orange-500 bg-orange-500/10'
      case 'epic':
        return 'border-purple-500 bg-purple-500/10'
      case 'rare':
        return 'border-blue-500 bg-blue-500/10'
      default:
        return 'border-gray-500 bg-gray-500/10'
    }
  }

  // Group items by type
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.itemType]) {
      acc[item.itemType] = []
    }
    acc[item.itemType].push(item)
    return acc
  }, {} as Record<string, InventoryItem[]>)

  return (
    <Card className="bg-card/90 border-primary h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-accent font-cinzel">
          <Package className="w-5 h-5" />
          Inventory
          <Badge variant="secondary" className="ml-auto">
            {items.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Your inventory is empty</p>
            <p className="text-xs">Explore the world to find items!</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([itemType, typeItems]) => (
            <div key={itemType} className="space-y-2">
              <h3 className="text-sm font-medium text-accent capitalize flex items-center gap-2">
                <span className={getItemColor(itemType)}>
                  {getItemIcon(itemType)}
                </span>
                {itemType}s ({typeItems.length})
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {typeItems.map((item) => {
                  const rarity = getItemRarity(item.itemName)
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-md border ${getRarityColor(rarity)} transition-colors hover:bg-opacity-20`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={getItemColor(item.itemType)}>
                            {getItemIcon(item.itemType)}
                          </span>
                          <div>
                            <h4 className="text-sm font-medium text-foreground">
                              {item.itemName}
                            </h4>
                            {item.quantity > 1 && (
                              <span className="text-xs text-muted-foreground">
                                Quantity: {item.quantity}
                              </span>
                            )}
                          </div>
                        </div>
                        {item.equipped && (
                          <Badge variant="default" className="text-xs bg-accent text-accent-foreground">
                            <Star className="w-3 h-3 mr-1" />
                            Equipped
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {item.itemType === 'weapon' || item.itemType === 'armor' ? (
                          <Button
                            size="sm"
                            variant={item.equipped ? "secondary" : "default"}
                            onClick={() => onEquipItem(item.id)}
                            className="text-xs"
                          >
                            {item.equipped ? 'Unequip' : 'Equip'}
                          </Button>
                        ) : item.itemType === 'consumable' ? (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onUseItem(item.id)}
                            className="text-xs"
                          >
                            Use
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}