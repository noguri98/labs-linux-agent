/**
 * @module Chat
 * @description A premium chat interface component using shadcn-UI.
 * 
 * Features:
 * - Real-time message rendering with smooth animations.
 * - Auto-scrolling to the latest message.
 * - Responsive layout with glassmorphism effects.
 * - User and Assistant message distinction with avatars.
 * - Loading indicator for AI responses.
 * - Clear conversation functionality.
 * - Modern aesthetics with shadcn/ui components (Card, ScrollArea, Avatar, etc.).
 */
"use client"

import * as React from "react"
import { Send, User, Bot, Trash2, Loader2, Sparkles } from "lucide-react"

import { useChat } from "@/hooks/useChat"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function Chat() {
  const { messages, input, setInput, sendMessage, isLoading, clearMessages } = useChat()
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    await sendMessage(input)
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-2xl border-none shadow-2xl bg-gradient-to-b from-background/80 to-background/40 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="size-6 text-primary animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">AI Assistant</CardTitle>
              <Badge variant="secondary" className="mt-1 font-medium bg-green-500/10 text-green-600 border-green-500/20">
                Online
              </Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon-sm" 
            onClick={clearMessages}
            className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
          >
            <Trash2 className="size-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea ref={scrollRef} className="h-[500px] px-6 py-4">
            <div className="flex flex-col gap-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                  <div className="p-4 bg-primary/5 rounded-full">
                    <Sparkles className="size-12 text-primary/30" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground/70">Start a conversation</h3>
                  <p className="text-muted-foreground max-w-[280px]">Ask anything and I'll do my best to help you today.</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <Avatar className={cn(
                    "size-9 ring-2 ring-offset-2 ring-transparent transition-all",
                    message.role === "user" ? "ring-primary/20" : "ring-muted"
                  )}>
                    {message.role === "user" ? (
                      <>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          <User className="size-5" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-muted text-foreground font-semibold">
                          <Bot className="size-5 text-primary" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  <div
                    className={cn(
                      "flex flex-col gap-1.5 max-w-[80%]",
                      message.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all hover:shadow-md",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-none"
                          : "bg-muted/50 text-foreground border rounded-tl-none backdrop-blur-sm"
                      )}
                    >
                      {message.content}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium px-1 uppercase tracking-wider">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <Avatar className="size-9 ring-2 ring-offset-2 ring-muted transition-all">
                    <AvatarFallback className="bg-muted text-foreground font-semibold">
                      <Bot className="size-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted/50 text-foreground border rounded-2xl rounded-tl-none px-4 py-2.5 backdrop-blur-sm shadow-sm">
                    <Loader2 className="size-4 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 border-t bg-muted/20">
          <form onSubmit={handleSend} className="flex w-full items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-background/50 border-muted focus-visible:ring-primary h-11 px-4 rounded-xl shadow-inner transition-all hover:border-primary/30"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="size-11 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
            >
              {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
