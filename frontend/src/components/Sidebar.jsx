import { BookOpen, MessageSquare, Plus, X } from "lucide-react";
import DocumentUpload from "./DocumentUpload";
import DocumentList from "./DocumentList";

export default function Sidebar({
  documents,
  activeDocId,
  onSelectDocument,
  onDeleteDocument,
  onUploadSuccess,
  isUploading,
  setIsUploading,
  onNewChat,
  chatSessions,
  activeSessionId,
  onSelectSession,
  isOpen,
  onClose,
  isBackendConnected,
}) {
  // Only show sessions that have messages or a custom title to avoid empty duplicates
  const validSessions = (chatSessions || []).filter(
    (s) => (s.messages && s.messages.length > 0) || s.id === activeSessionId
  );

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar-container ${isOpen ? "open" : ""}`}>
        {/* Subtle Branding */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <BookOpen size={18} className="brand-icon" />
            <span className="brand-title">AI Smart Study</span>
          </div>

          <button
            className="mobile-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={16} />
          </button>
        </div>

        {/* Add Document / New Study Chat Action */}
        <div className="sidebar-action-wrap">
          <button className="add-doc-trigger-btn" onClick={onNewChat}>
            <Plus size={15} />
            <span>New study chat</span>
          </button>
        </div>

        {/* Documents Section */}
        <div className="sidebar-section documents-section">
          <div className="section-label">
            <span>Documents</span>
            {documents.length > 0 && (
              <span className="section-badge">{documents.length}</span>
            )}
          </div>

          <DocumentUpload
            onUploadSuccess={onUploadSuccess}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />

          <DocumentList
            documents={documents}
            activeDocId={activeDocId}
            onSelectDocument={onSelectDocument}
            onDeleteDocument={onDeleteDocument}
          />
        </div>

        {/* Conversations History */}
        <div className="sidebar-section conversations-section">
          <div className="section-label">
            <span>Conversations</span>
          </div>

          <div className="conversations-scroll">
            {validSessions.length === 0 ? (
              <div className="empty-convos-note">No recent conversations</div>
            ) : (
              validSessions.map((session) => (
                <button
                  key={session.id}
                  className={`convo-row-item ${
                    session.id === activeSessionId ? "active" : ""
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <MessageSquare size={13} />
                  <span className="convo-title" title={session.title}>
                    {session.title || "Study Session"}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Subtle Footer */}
        <div className="sidebar-footer">
          <div className="status-indicator">
            <span
              className={`status-dot ${
                isBackendConnected ? "online" : "offline"
              }`}
            />
            <span>{isBackendConnected ? "Backend online" : "Backend offline"}</span>
          </div>
          <span className="app-version">Study Workspace</span>
        </div>
      </aside>
    </>
  );
}
