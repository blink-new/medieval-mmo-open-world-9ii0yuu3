import React, { useState, useRef, useEffect } from 'react'
import { ChatMessage } from '../../types/game'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'
import { Send, MessageCircle } from 'lucide-react'

interface ChatPanelProps {
  messages: ChatMessage[]
  currentPlayerName: string
  onSendMessage: (message: string) => void
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentPlayerName,
  onSendMessage
}) => {
  const [newMessage, setNewMessage] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <Card className="bg-card/90 border-primary h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-accent font-cinzel">
          <MessageCircle className="w-5 h-5" />
          World Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        {/* Messages Area */}
        <ScrollArea className="flex-1 h-64 pr-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-2 rounded-md ${
                    message.playerName === currentPlayerName
                      ? 'bg-primary/20 border-l-2 border-primary ml-4'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span 
                      className={`text-sm font-medium ${
                        message.playerName === currentPlayerName
                          ? 'text-accent'
                          : 'text-foreground'
                      }`}
                    >
                      {message.playerName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground break-words">
                    {message.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
            maxLength={200}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
            className="bg-primary hover:bg-primary/80 text-primary-foreground"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Character count */}
        <div className="text-xs text-muted-foreground text-right">
          {newMessage.length}/200
        </div>
      </CardContent>
    </Card>
  )
}