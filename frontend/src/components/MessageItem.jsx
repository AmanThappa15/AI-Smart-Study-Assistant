import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  RotateCcw,
} from "lucide-react";

export default function MessageItem({ message, onRetry }) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const isUser = message.role === "user";
  const isError = Boolean(message.error);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const chunks = message.retrieved_chunks || [];

  return (
    <div
      className={`message-item-container ${isUser ? "user" : "assistant"} ${
        isError ? "has-error" : ""
      }`}
    >
      {/* Sender Header Line */}
      <div className="message-header-line">
        <span className="message-sender-title">
          {isUser ? "You" : "Study Assistant"}
        </span>
        {message.timestamp && (
          <span className="message-timestamp">{message.timestamp}</span>
        )}
      </div>

      {/* Message Body */}
      {isError ? (
        <div className="error-msg-card">
          <p>{message.content}</p>
          {onRetry && (
            <button
              className="retry-action-btn"
              onClick={() => onRetry(message.originalQuestion)}
            >
              <RotateCcw size={12} style={{ display: "inline", marginRight: "4px" }} />
              Retry request
            </button>
          )}
        </div>
      ) : isUser ? (
        <div className="user-body-bubble">{message.content}</div>
      ) : (
        <div className="assistant-body-card">
          <div className="study-markdown-body">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* Footnote Bar with Copy and Sources */}
          <div className="assistant-footnote-bar">
            <button
              className="action-text-btn"
              onClick={handleCopy}
              title="Copy answer text"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-success" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>

            {chunks.length > 0 && (
              <button
                className={`sources-pill-btn ${showSources ? "active" : ""}`}
                onClick={() => setShowSources(!showSources)}
                aria-expanded={showSources}
              >
                <BookOpen size={13} />
                <span>
                  Sources · {chunks.length}{" "}
                  {chunks.length === 1 ? "relevant passage" : "relevant passages"}
                </span>
                {showSources ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
              </button>
            )}
          </div>

          {/* Sources Section: Relevant Passages from Document */}
          {showSources && chunks.length > 0 && (
            <div className="sources-drawer animate-fade-in">
              <div className="sources-drawer-header">
                <span className="sources-drawer-title">
                  From your documents · Relevant passages
                </span>
                <span className="sources-drawer-sub">
                  Matching text retrieved to formulate this response
                </span>
              </div>

              <div className="passages-grid">
                {chunks.map((chunk, idx) => (
                  <div key={idx} className="passage-card">
                    <div className="passage-meta-line">
                      <span>Passage {idx + 1}</span>
                      <span>{chunk.length} characters</span>
                    </div>
                    <p className="passage-text-quote">{chunk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
