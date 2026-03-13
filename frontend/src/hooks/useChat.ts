/**
 * @module useChat
 * @description State management hook for the chat interface.
 */
import { useState, useCallback } from "react";
import { chatService } from "@/services/chat";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  thinking?: string;
  tools?: {
    name: string;
    arguments: any;
    result?: string;
  }[];
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "noguri 님 무엇을 도와드릴까요?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text || isLoading) return;

      const userMsgId = Date.now().toString();
      const userMsg: Message = {
        id: userMsgId,
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      const assistantMsgId = (Date.now() + 1).toString();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        thinking: "",
        tools: [],
      };

      setMessages((prev) => [...prev, assistantMsg]);

      try {
        const response = await chatService.sendMessage({
          model: "gemini-3-flash-preview",
          prompt: text,
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        if (!reader) return;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // 마지막 줄은 불완전할 수 있으므로 버퍼에 남겨둠
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith("data: ")) continue;

            const dataStr = trimmedLine.replace("data: ", "").trim();
            if (dataStr === "[DONE]") break;

            try {
              const data = JSON.parse(dataStr);
              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== assistantMsgId) return msg;

                  if (data.type === "thinking") {
                    return {
                      ...msg,
                      thinking: (msg.thinking || "") + data.content,
                    };
                  } else if (data.type === "content") {
                    return { ...msg, content: msg.content + data.content };
                  } else if (data.type === "tool") {
                    return {
                      ...msg,
                      tools: [
                        ...(msg.tools || []),
                        {
                          name: data.name,
                          arguments: data.arguments,
                          result: data.result,
                        },
                      ],
                    };
                  }
                  return msg;
                }),
              );
            } catch (e) {
              // JSON이 아직 완성되지 않았을 경우 무시
            }
          }
        }
      } catch (error) {
        console.error("[useChat] Error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const clearMessages = useCallback(() => setMessages([]), []);

  return {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    clearMessages,
  };
}
