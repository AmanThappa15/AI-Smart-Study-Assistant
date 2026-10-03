import { ArrowRight } from "lucide-react";

export default function EmptyState({ onSelectPrompt }) {
  const examplePrompts = [
    "Summarize this chapter",
    "Explain this concept simply",
    "Create practice questions",
    "What are the key definitions?",
  ];

  return (
    <div className="empty-state-wrap">
      <div className="empty-state-box">
        <h2 className="empty-state-heading">Start studying</h2>
        <p className="empty-state-guide-text">
          Upload a PDF from the library, then ask questions about it.
        </p>

        <span className="empty-state-prompts-label">Try an example question</span>

        <div className="empty-prompts-grid">
          {examplePrompts.map((promptText, idx) => (
            <button
              key={idx}
              className="subtle-prompt-btn"
              onClick={() => onSelectPrompt(promptText)}
            >
              <span>{promptText}</span>
              <ArrowRight size={13} className="text-muted" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
