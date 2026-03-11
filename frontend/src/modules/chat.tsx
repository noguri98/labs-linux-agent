"use client";

import * as React from "react";
import { useChat } from "@/hooks/useChat";
import { Card, CardContent } from "@/components/ui/card";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

/**
 * @module Chat
 * @description Main Chat component that assembles the header, message list, and input.
 */
export function Chat() {
  const { messages, input, setInput, sendMessage, isLoading, clearMessages } =
    useChat();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-2xl border-none shadow-2xl bg-linear-to-b from-background/80 to-background/40 backdrop-blur-xl transition-all duration-500 hover:shadow-primary/5">
        <ChatHeader onClear={clearMessages} />
        <CardContent className="p-0">
          <MessageList messages={messages} isLoading={isLoading} />
        </CardContent>
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </Card>
    </div>
  );
}
