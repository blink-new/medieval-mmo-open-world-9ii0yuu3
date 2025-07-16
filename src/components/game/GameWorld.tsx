import React, { useState, useEffect, useRef } from 'react'
import { Player } from '../../types/game'

interface GameWorldProps {
  currentPlayer: Player | null
  otherPlayers: Player[]
  onPlayerMove: (x: number, y: number) => void
}

export const GameWorld: React.FC<GameWorldProps> = ({
  currentPlayer,
  otherPlayers,
  onPlayerMove
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMoving, setIsMoving] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background (medieval grass texture)
    ctx.fillStyle = '#2d5016'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid pattern
    ctx.strokeStyle = '#3d6026'
    ctx.lineWidth = 1
    for (let x = 0; x < canvas.width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y < canvas.height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Draw trees and obstacles
    const trees = [
      { x: 150, y: 100 },
      { x: 300, y: 200 },
      { x: 500, y: 150 },
      { x: 650, y: 300 },
      { x: 200, y: 400 },
      { x: 450, y: 450 }
    ]

    trees.forEach(tree => {
      // Tree trunk
      ctx.fillStyle = '#8B4513'
      ctx.fillRect(tree.x - 5, tree.y + 10, 10, 20)
      
      // Tree crown
      ctx.fillStyle = '#228B22'
      ctx.beginPath()
      ctx.arc(tree.x, tree.y, 15, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw rocks
    const rocks = [
      { x: 400, y: 100 },
      { x: 600, y: 250 },
      { x: 100, y: 300 }
    ]

    rocks.forEach(rock => {
      ctx.fillStyle = '#696969'
      ctx.beginPath()
      ctx.arc(rock.x, rock.y, 12, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw current player
    if (currentPlayer) {
      drawPlayer(ctx, currentPlayer, true)
    }

    // Draw other players
    otherPlayers.forEach(player => {
      drawPlayer(ctx, player, false)
    })
  }, [currentPlayer, otherPlayers])

  const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player, isCurrentPlayer: boolean) => {
    const x = player.xPosition
    const y = player.yPosition

    // Player shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.ellipse(x, y + 25, 15, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Player body based on class
    let bodyColor = '#8B4513' // Default warrior brown
    if (player.characterClass === 'mage') bodyColor = '#4169E1'
    if (player.characterClass === 'archer') bodyColor = '#228B22'

    ctx.fillStyle = bodyColor
    ctx.fillRect(x - 8, y - 5, 16, 20)

    // Player head
    ctx.fillStyle = '#FDBCB4'
    ctx.beginPath()
    ctx.arc(x, y - 15, 8, 0, Math.PI * 2)
    ctx.fill()

    // Player name
    ctx.fillStyle = isCurrentPlayer ? '#DAA520' : '#FFFFFF'
    ctx.font = '12px Cinzel'
    ctx.textAlign = 'center'
    ctx.fillText(player.name, x, y - 30)

    // Health bar
    const healthBarWidth = 30
    const healthPercentage = player.health / player.maxHealth
    
    // Health bar background
    ctx.fillStyle = '#333333'
    ctx.fillRect(x - healthBarWidth/2, y + 30, healthBarWidth, 4)
    
    // Health bar fill
    ctx.fillStyle = healthPercentage > 0.5 ? '#00FF00' : healthPercentage > 0.25 ? '#FFFF00' : '#FF0000'
    ctx.fillRect(x - healthBarWidth/2, y + 30, healthBarWidth * healthPercentage, 4)

    // Level indicator
    ctx.fillStyle = '#DAA520'
    ctx.font = '10px Inter'
    ctx.fillText(`Lv.${player.level}`, x, y + 45)
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentPlayer || isMoving) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setIsMoving(true)
    onPlayerMove(x, y)
    
    // Reset moving state after animation
    setTimeout(() => setIsMoving(false), 500)
  }

  return (
    <div className="relative bg-gradient-to-b from-sky-400 to-sky-600 rounded-lg overflow-hidden border-2 border-primary">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="cursor-crosshair"
        onClick={handleCanvasClick}
      />
      
      {/* Movement indicator */}
      {isMoving && (
        <div className="absolute top-4 left-4 bg-black/70 text-accent px-3 py-1 rounded-md text-sm font-cinzel">
          Moving...
        </div>
      )}
      
      {/* Minimap */}
      <div className="absolute top-4 right-4 w-32 h-24 bg-black/70 border border-accent rounded-md p-2">
        <div className="text-accent text-xs font-cinzel mb-1">Minimap</div>
        <div className="relative w-full h-full bg-green-800 rounded">
          {currentPlayer && (
            <div 
              className="absolute w-2 h-2 bg-accent rounded-full"
              style={{
                left: `${(currentPlayer.xPosition / 800) * 100}%`,
                top: `${(currentPlayer.yPosition / 600) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
          {otherPlayers.map(player => (
            <div
              key={player.id}
              className="absolute w-1.5 h-1.5 bg-white rounded-full"
              style={{
                left: `${(player.xPosition / 800) * 100}%`,
                top: `${(player.yPosition / 600) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}