import { User, Bot, Loader2, Sparkles } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Message } from "@/hooks/useChat"
import { useEffect, useRef } from "react"

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-4">
        <div className="p-4 bg-primary/5 rounded-full">
          <Sparkles className="size-12 text-primary/30" />
        </div>
        <h3 className="text-xl font-semibold text-foreground/70">Start a conversation</h3>
        <p className="text-muted-foreground max-w-[280px]">Ask anything and I'll do my best to help you today.</p>
      </div>
    )
  }

  return (
    <ScrollArea ref={scrollRef} className="h-[500px] px-6 py-4">
      <div className="flex flex-col gap-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <Avatar className={cn(
              "size-9 ring-2 ring-offset-2 ring-transparent",
              msg.role === "user" ? "ring-primary/20" : "ring-muted"
            )}>
              <AvatarFallback className={cn(
                "font-semibold",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              )}>
                {msg.role === "user" ? <User className="size-5" /> : <Bot className="size-5 text-primary" />}
              </AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col gap-1.5 max-w-[80%]", msg.role === "user" ? "items-end" : "items-start")}>
              <div className={cn(
                "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted/50 text-foreground border rounded-tl-none backdrop-blur-sm"
              )}>
                {msg.content}
              </div>
              <span className="text-[10px] text-muted-foreground font-medium px-1 uppercase tracking-wider">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2">
            <Avatar className="size-9 ring-2 ring-offset-2 ring-muted">
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
  )
}
