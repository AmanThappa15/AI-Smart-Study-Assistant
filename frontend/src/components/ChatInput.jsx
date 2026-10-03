import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ChatInput({
  onSendMessage,
  isLoading,
  hasDocument,
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const placeholderText = hasDocument
    ? "Ask a question about your study material..."
    : "Upload a document to ask questions about it...";

  return (
    <div className="chat-input-wrapper">
      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="composer-box">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            rows={1}
            disabled={isLoading}
            className="composer-textarea"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`composer-send-btn ${input.trim() && !isLoading ? "active" : ""}`}
            title="Send question (Enter)"
            aria-label="Send message"
          >
            <ArrowUp size={16} />
          </button>
        </form>

        <div className="composer-meta-hints">
          <span className="composer-hint">
            Enter to send · Shift + Enter for new line
          </span>
          {!hasDocument && (
            <span className="composer-warning">
              No document loaded
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
