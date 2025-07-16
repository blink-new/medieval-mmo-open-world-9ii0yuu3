import React from 'react'
import { Player } from '../../types/game'
import { Progress } from '../ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Sword, Shield, Zap, Coins } from 'lucide-react'

interface PlayerStatsProps {
  player: Player
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ player }) => {
  const healthPercentage = (player.health / player.maxHealth) * 100
  const manaPercentage = (player.mana / player.maxMana) * 100
  const experienceToNext = player.level * 100 // Simple XP calculation
  const experiencePercentage = (player.experience % experienceToNext) / experienceToNext * 100

  const getClassIcon = () => {
    switch (player.characterClass) {
      case 'warrior':
        return <Sword className="w-5 h-5" />
      case 'mage':
        return <Zap className="w-5 h-5" />
      case 'archer':
        return <Shield className="w-5 h-5" />
      default:
        return <Sword className="w-5 h-5" />
    }
  }

  const getClassColor = () => {
    switch (player.characterClass) {
      case 'warrior':
        return 'text-red-400'
      case 'mage':
        return 'text-blue-400'
      case 'archer':
        return 'text-green-400'
      default:
        return 'text-red-400'
    }
  }

  return (
    <Card className="bg-card/90 border-primary">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-accent font-cinzel">
          <div className={getClassIcon().props.className + ' ' + getClassColor()}>
            {getClassIcon()}
          </div>
          {player.name}
          <span className="text-sm text-muted-foreground ml-auto">
            Level {player.level}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-red-400 font-medium">Health</span>
            <span className="text-foreground">{player.health}/{player.maxHealth}</span>
          </div>
          <Progress 
            value={healthPercentage} 
            className="h-2"
            style={{
              background: 'hsl(var(--muted))'
            }}
          />
        </div>

        {/* Mana Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-blue-400 font-medium">Mana</span>
            <span className="text-foreground">{player.mana}/{player.maxMana}</span>
          </div>
          <Progress 
            value={manaPercentage} 
            className="h-2"
            style={{
              background: 'hsl(var(--muted))'
            }}
          />
        </div>

        {/* Experience Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-accent font-medium">Experience</span>
            <span className="text-foreground">{player.experience % experienceToNext}/{experienceToNext}</span>
          </div>
          <Progress 
            value={experiencePercentage} 
            className="h-2"
            style={{
              background: 'hsl(var(--muted))'
            }}
          />
        </div>

        {/* Gold */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Gold</span>
          </div>
          <span className="text-foreground font-bold">{player.gold}</span>
        </div>

        {/* Class Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={getClassColor()}>
              {getClassIcon()}
            </div>
            <span className="text-sm font-medium">Class</span>
          </div>
          <span className={`text-sm font-bold capitalize ${getClassColor()}`}>
            {player.characterClass}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}