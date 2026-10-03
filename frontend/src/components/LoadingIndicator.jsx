export default function LoadingIndicator() {
  return (
    <div className="message-item-container assistant animate-fade-in">
      <div className="message-header-line">
        <span className="message-sender-title">Study Assistant</span>
      </div>
      <div className="assistant-thinking-row">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span>Searching document passages and formulating answer...</span>
      </div>
    </div>
  );
}
