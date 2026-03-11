import { Bot, Trash2 } from "lucide-react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ChatHeaderProps {
  onClear: () => void;
}

export function ChatHeader({ onClear }: ChatHeaderProps) {
  return (
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
        onClick={onClear}
        className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
      >
        <Trash2 className="size-4" />
      </Button>
    </CardHeader>
  )
}
