import { FileText, Trash2 } from "lucide-react";

export default function DocumentList({
  documents,
  activeDocId,
  onSelectDocument,
  onDeleteDocument,
}) {
  if (!documents || documents.length === 0) {
    return (
      <div className="empty-docs-note">
        No documents loaded yet.
      </div>
    );
  }

  return (
    <div className="doc-list-scroll">
      {documents.map((doc) => {
        const isActive = doc.id === activeDocId;
        return (
          <div
            key={doc.id}
            className={`doc-row-item ${isActive ? "active" : ""}`}
            onClick={() => onSelectDocument(doc.id)}
            title={doc.name}
          >
            <div className="doc-row-left">
              <FileText size={15} className="doc-icon" />
              <div className="doc-info">
                <span className="doc-title">{doc.name}</span>
                <span className="doc-sub">
                  {doc.size} · {doc.chunksCount} {doc.chunksCount === 1 ? "passage" : "passages"}
                </span>
              </div>
            </div>

            <button
              className="doc-delete-trigger"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteDocument(doc.id);
              }}
              title="Remove document from workspace"
              aria-label="Delete document"
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
