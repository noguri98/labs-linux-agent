import {
  User,
  Bot,
  Loader2,
  Sparkles,
  Terminal,
  Wrench,
  ChevronDown,
  ChevronUp,
  Calendar,
  CheckSquare,
  ListTodo,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Message } from "@/hooks/useChat";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

function SmartMessageContent({
  content,
  role,
}: {
  content: string;
  role: string;
}) {
  if (role === "user") return <div>{content}</div>;

  // Detect sections for special rendering
  const sections = content.split(/(?=###?\s+)/);

  return (
    <div className="space-y-4 prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:rounded-xl">
      {sections.map((section, idx) => {
        const isEvents = /###?\s+.*(일정|Events|Calendar)/i.test(section);
        const isTodo = /###?\s+.*(할 일|To-do|Tasks)/i.test(section);

        if (isEvents) {
          return (
            <div
              key={idx}
              className="my-4 rounded-2xl border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30 overflow-hidden shadow-sm transition-all hover:shadow-md"
            >
              <div className="bg-blue-100/50 dark:bg-blue-900/30 px-4 py-2 flex items-center gap-2 border-b border-blue-200/50 dark:border-blue-800/30">
                <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                  Events
                </span>
              </div>
              <div className="p-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {section}
                </ReactMarkdown>
              </div>
            </div>
          );
        }

        if (isTodo) {
          return (
            <div
              key={idx}
              className="my-4 rounded-2xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30 overflow-hidden shadow-sm transition-all hover:shadow-md"
            >
              <div className="bg-emerald-100/50 dark:bg-emerald-900/30 px-4 py-2 flex items-center gap-2 border-b border-emerald-200/50 dark:border-emerald-800/30">
                <CheckSquare className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  To-do List
                </span>
              </div>
              <div className="p-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {section}
                </ReactMarkdown>
              </div>
            </div>
          );
        }

        return (
          <div key={idx} className="last:mb-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{section}</ReactMarkdown>
          </div>
        );
      })}
    </div>
  );
}

function MessageTools({ tools }: { tools: Message["tools"] }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!tools || tools.length === 0) return null;

  return (
    <div className="mt-2 w-full max-w-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-background/50 text-[10px] font-medium text-muted-foreground hover:bg-accent transition-colors"
      >
        <Wrench className="size-3 text-primary" />
        <span>
          Used {tools.length} tool{tools.length > 1 ? "s" : ""}
        </span>
        {isOpen ? (
          <ChevronUp className="size-3" />
        ) : (
          <ChevronDown className="size-3" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1">
          {tools.map((tool, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border bg-muted/30 text-[10px] font-mono"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-primary font-bold">{tool.name}</span>
                <Badge variant="outline" className="text-[8px] h-4">
                  Success
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground italic">Arguments:</div>
                <pre className="p-1.5 bg-background/50 rounded overflow-x-auto">
                  {JSON.stringify(tool.arguments, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-4">
        <div className="p-4 bg-primary/5 rounded-full">
          <Sparkles className="size-12 text-primary/30" />
        </div>
        <h3 className="text-xl font-semibold text-foreground/70">
          Start a conversation
        </h3>
        <p className="text-muted-foreground max-w-[280px]">
          Ask anything and I'll do my best to help you today.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea ref={scrollRef} className="h-full px-6 py-4">
      <div className="flex flex-col gap-6 max-w-3xl mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-start gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
              msg.role === "user" ? "flex-row-reverse" : "flex-row",
            )}
          >
            <Avatar
              className={cn(
                "size-9 ring-2 ring-offset-2 ring-transparent transition-transform hover:scale-105",
                msg.role === "user" ? "ring-primary/20" : "ring-muted",
              )}
            >
              <AvatarFallback
                className={cn(
                  "font-semibold",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {msg.role === "user" ? (
                  <User className="size-5" />
                ) : (
                  <Bot className="size-5 text-primary" />
                )}
              </AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "flex flex-col gap-1.5 max-w-[85%]",
                msg.role === "user" ? "items-end" : "items-start",
              )}
            >
              {msg.thinking && msg.thinking.trim() !== "" && (
                <div className="flex items-center gap-2 mb-1 px-3 py-1.5 rounded-xl bg-muted/30 border border-dashed text-[11px] text-muted-foreground italic animate-in fade-in slide-in-from-top-1">
                  <Terminal className="size-3" />
                  <span>Thinking: {msg.thinking}</span>
                </div>
              )}

              {msg.content && msg.content.trim() !== "" && (
                <div
                  className={cn(
                    "rounded-2xl px-5 py-3 text-sm leading-relaxed animate-in fade-in zoom-in-95 duration-300",
                    msg.role === "user"
                      ? "bg-primary/10 text-foreground border border-primary/20 rounded-tr-none backdrop-blur-[2px]"
                      : "bg-muted/20 text-foreground border border-border/50 rounded-tl-none backdrop-blur-[2px]",
                  )}
                >
                  <SmartMessageContent content={msg.content} role={msg.role} />
                </div>
              )}

              <span className="text-[10px] text-muted-foreground font-medium px-1 uppercase tracking-wider mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
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
            <div className="bg-background text-foreground border rounded-2xl rounded-tl-none px-5 py-3 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground animate-pulse">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
