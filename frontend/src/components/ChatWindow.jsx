import { useRef, useEffect } from "react";
import MessageItem from "./MessageItem";
import EmptyState from "./EmptyState";
import LoadingIndicator from "./LoadingIndicator";
import ChatInput from "./ChatInput";

export default function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  hasDocument,
  onRetry,
}) {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading]);

  return (
    <div className="chat-window-layout">
      {/* Scrollable Conversation Stream */}
      <div className="chat-messages-scroll" ref={containerRef}>
        <div className="chat-messages-container">
          {messages.length === 0 ? (
            <EmptyState onSelectPrompt={onSendMessage} />
          ) : (
            <div className="messages-flow">
              {messages.map((msg, index) => (
                <MessageItem
                  key={msg.id || index}
                  message={msg}
                  onRetry={onRetry}
                />
              ))}

              {isLoading && <LoadingIndicator />}
              <div ref={messagesEndRef} className="scroll-anchor" />
            </div>
          )}
        </div>
      </div>

      {/* Persistent Question Composer */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        hasDocument={hasDocument}
      />
    </div>
  );
}
