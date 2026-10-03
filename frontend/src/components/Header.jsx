import { FileText, Menu, Trash2 } from "lucide-react";

export default function Header({
  activeDocName,
  docChunksCount,
  onToggleSidebar,
  onClearChat,
  hasMessages,
}) {
  return (
    <header className="app-header">
      <div className="header-left-wrap">
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>

        <div className="active-context-display">
          {activeDocName ? (
            <>
              <FileText size={15} className="text-accent" />
              <span className="context-doc-name">{activeDocName}</span>
              {docChunksCount > 0 && (
                <span className="context-stat-badge">
                  {docChunksCount} {docChunksCount === 1 ? "passage" : "passages"}
                </span>
              )}
            </>
          ) : (
            <span className="context-idle-text">
              No document selected · Upload a PDF to begin studying
            </span>
          )}
        </div>
      </div>

      <div className="header-actions">
        {hasMessages && (
          <button
            className="header-action-btn"
            onClick={onClearChat}
            title="Clear current study conversation"
          >
            <Trash2 size={13} />
            <span>Clear conversation</span>
          </button>
        )}
      </div>
    </header>
  );
}
