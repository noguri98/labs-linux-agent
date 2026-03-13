import { Send, Loader2, Plus, CornerDownLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { useEffect, useRef } from "react";
import { Kbd } from "@/components/ui/kbd";

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  isLoading: boolean;
  onClear?: () => void;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isLoading,
  onClear,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <CardFooter className="p-6 border-t bg-background/50 backdrop-blur-md sticky bottom-0 z-20">
      <div className="flex w-full flex-col gap-4 max-w-3xl mx-auto">
        <form onSubmit={onSend} className="relative group">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask me anything... (Press / to focus)"
            className="flex-1 bg-muted/30 border-muted-foreground/20 focus-visible:ring-primary h-14 pl-5 pr-24 rounded-2xl shadow-sm transition-all hover:bg-muted/50 focus:bg-background"
            disabled={isLoading}
          />
          <div className="absolute right-2 top-2 flex items-center gap-2">
            {!value.trim() && (
              <div className="hidden md:block">
                <Kbd>/</Kbd>
              </div>
            )}
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !value.trim()}
              className="size-10 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-between px-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClear}
              className="h-8 rounded-lg text-[10px] font-semibold uppercase tracking-wider gap-2 border-muted-foreground/20 hover:bg-muted"
            >
              <Plus className="size-3" />
              New Chat
            </Button>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            <span>Press</span>
            <CornerDownLeft className="size-3" />
            <span>Enter to send</span>
          </div>
        </div>
      </div>
    </CardFooter>
  );
}
