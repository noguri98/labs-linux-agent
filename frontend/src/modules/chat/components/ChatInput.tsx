import { Send, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CardFooter } from "@/components/ui/card"

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSend, isLoading }: ChatInputProps) {
  return (
    <CardFooter className="p-4 border-t bg-muted/20">
      <form onSubmit={onSend} className="flex w-full items-center space-x-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-background/50 border-muted focus-visible:ring-primary h-11 px-4 rounded-xl shadow-inner transition-all hover:border-primary/30"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !value.trim()}
          className="size-11 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
        >
          {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </CardFooter>
  )
}
