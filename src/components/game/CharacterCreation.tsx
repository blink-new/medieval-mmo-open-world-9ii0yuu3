import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Sword, Zap, Target, User } from 'lucide-react'

interface CharacterCreationProps {
  onCreateCharacter: (name: string, characterClass: 'warrior' | 'mage' | 'archer') => void
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onCreateCharacter
}) => {
  const [name, setName] = useState('')
  const [selectedClass, setSelectedClass] = useState<'warrior' | 'mage' | 'archer'>('warrior')

  const classes = [
    {
      id: 'warrior' as const,
      name: 'Warrior',
      icon: <Sword className="w-8 h-8" />,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10 border-red-500',
      description: 'Strong melee fighter with high health and defense',
      stats: {
        health: 120,
        mana: 30,
        strength: 'High',
        magic: 'Low',
        agility: 'Medium'
      }
    },
    {
      id: 'mage' as const,
      name: 'Mage',
      icon: <Zap className="w-8 h-8" />,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500',
      description: 'Powerful spellcaster with high mana and magical abilities',
      stats: {
        health: 80,
        mana: 100,
        strength: 'Low',
        magic: 'High',
        agility: 'Medium'
      }
    },
    {
      id: 'archer' as const,
      name: 'Archer',
      icon: <Target className="w-8 h-8" />,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10 border-green-500',
      description: 'Agile ranged fighter with balanced stats and high accuracy',
      stats: {
        health: 100,
        mana: 50,
        strength: 'Medium',
        magic: 'Medium',
        agility: 'High'
      }
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreateCharacter(name.trim(), selectedClass)
    }
  }

  const selectedClassData = classes.find(c => c.id === selectedClass)!

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card/95 border-primary shadow-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-cinzel text-accent mb-2">
            Create Your Character
          </CardTitle>
          <p className="text-muted-foreground">
            Choose your name and class to begin your medieval adventure
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Character Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">
                Character Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your character name"
                  className="pl-10 bg-input border-border text-foreground"
                  maxLength={20}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {name.length}/20 characters
              </p>
            </div>

            {/* Class Selection */}
            <div className="space-y-4">
              <Label className="text-foreground font-medium">
                Choose Your Class
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {classes.map((classData) => (
                  <div
                    key={classData.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                      selectedClass === classData.id
                        ? classData.bgColor
                        : 'border-border bg-card/50 hover:bg-card/70'
                    }`}
                    onClick={() => setSelectedClass(classData.id)}
                  >
                    <div className="text-center space-y-3">
                      <div className={`${classData.color} flex justify-center`}>
                        {classData.icon}
                      </div>
                      <h3 className="font-cinzel text-lg text-foreground">
                        {classData.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {classData.description}
                      </p>
                      {selectedClass === classData.id && (
                        <Badge className="bg-accent text-accent-foreground">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Class Stats */}
            <Card className="bg-muted/30 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-cinzel text-accent flex items-center gap-2">
                  <span className={selectedClassData.color}>
                    {selectedClassData.icon}
                  </span>
                  {selectedClassData.name} Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Health:</span>
                    <span className="text-sm font-medium text-red-400">
                      {selectedClassData.stats.health}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mana:</span>
                    <span className="text-sm font-medium text-blue-400">
                      {selectedClassData.stats.mana}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Strength:</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedClassData.stats.strength}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Magic:</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedClassData.stats.magic}
                    </span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Agility:</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedClassData.stats.agility}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-cinzel text-lg py-6"
              disabled={!name.trim()}
            >
              Create Character & Enter World
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}