"use client";

import * as React from "react";
import { useChat } from "@/hooks/useChat";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";

/**
 * @module Chat
 * @description Main Chat component that assembles the message list and input.
 */
export function Chat() {
  const { messages, input, setInput, sendMessage, isLoading, clearMessages } =
    useChat();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] relative">
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        isLoading={isLoading}
        onClear={clearMessages}
      />
    </div>
  );
}
