import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ChatWindow from "./components/ChatWindow";
import { studyApi } from "./api/studyApi";
import "./App.css";

const STORAGE_KEYS = {
  DOCUMENTS: "ai_study_docs_v3",
  SESSIONS: "ai_study_sessions_v3",
  ACTIVE_SESSION: "ai_study_active_session_v3",
};

export default function App() {
  // Uploaded study documents
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeDocId, setActiveDocId] = useState(() => {
    return documents.length > 0 ? documents[0].id : null;
  });

  // Conversation history
  const [chatSessions, setChatSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION) || "session-default";
    } catch {
      return "session-default";
    }
  });

  // Transient state for unsaved active session
  const [unsavedMessages, setUnsavedMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(true);

  // Sync documents with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch {
      // Ignore
    }
  }, [documents]);

  // Sync sessions with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(chatSessions));
    } catch {
      // Ignore
    }
  }, [chatSessions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, activeSessionId);
    } catch {
      // Ignore
    }
  }, [activeSessionId]);

  // Periodic health check
  useEffect(() => {
    const verifyHealth = async () => {
      const res = await studyApi.checkHealth();
      setIsBackendConnected(res.isHealthy);
    };

    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeDocument = documents.find((d) => d.id === activeDocId);
  const currentSavedSession = chatSessions.find((s) => s.id === activeSessionId);
  const activeMessages = currentSavedSession
    ? currentSavedSession.messages
    : unsavedMessages;

  // Document handlers
  const handleUploadSuccess = (newDoc) => {
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.name !== newDoc.name);
      return [newDoc, ...filtered];
    });
    setActiveDocId(newDoc.id);
  };

  const handleDeleteDocument = (id) => {
    setDocuments((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (activeDocId === id) {
        setActiveDocId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  const handleSelectDocument = (id) => {
    setActiveDocId(id);
  };

  // Conversation handlers
  const handleNewChat = () => {
    if (activeMessages.length === 0) {
      setIsSidebarOpen(false);
      return;
    }

    const newId = `session-${Date.now()}`;
    setActiveSessionId(newId);
    setUnsavedMessages([]);
    setIsSidebarOpen(false);
  };

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    setIsSidebarOpen(false);
  };

  const handleClearChat = () => {
    setUnsavedMessages([]);
    setChatSessions((prev) => prev.filter((s) => s.id !== activeSessionId));
  };

  const handleSendMessage = async (questionText) => {
    if (!questionText || !questionText.trim()) return;

    const userMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: questionText.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newMessages = [...activeMessages, userMessage];
    const sessionTitle =
      questionText.length > 30 ? `${questionText.slice(0, 28)}...` : questionText;

    if (currentSavedSession) {
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: newMessages, updatedAt: Date.now() }
            : s
        )
      );
    } else {
      setUnsavedMessages(newMessages);
      setChatSessions((prev) => [
        {
          id: activeSessionId,
          title: sessionTitle,
          messages: newMessages,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
    }

    setIsLoading(true);

    try {
      const response = await studyApi.askQuestion(questionText);

      const assistantMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: response.answer,
        retrieved_chunks: response.retrieved_chunks || [],
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const finalMessages = [...newMessages, assistantMessage];

      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: finalMessages, updatedAt: Date.now() }
            : s
        )
      );
    } catch (err) {
      const errorMessage = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        error: true,
        originalQuestion: questionText,
        content:
          err.message ||
          "Could not retrieve an answer. Please verify the backend is running.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      const errorMessages = [...newMessages, errorMessage];

      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: errorMessages, updatedAt: Date.now() }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (question) => {
    handleSendMessage(question);
  };

  return (
    <div className="study-app-layout">
      {/* Left Navigation Sidebar */}
      <Sidebar
        documents={documents}
        activeDocId={activeDocId}
        onSelectDocument={handleSelectDocument}
        onDeleteDocument={handleDeleteDocument}
        onUploadSuccess={handleUploadSuccess}
        isUploading={isUploading}
        setIsUploading={setIsUploading}
        onNewChat={handleNewChat}
        chatSessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Study Workspace Area */}
      <main className="main-content-layout">
        <Header
          activeDocName={activeDocument?.name}
          docChunksCount={activeDocument?.chunksCount}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onClearChat={handleClearChat}
          hasMessages={activeMessages.length > 0}
        />

        <ChatWindow
          messages={activeMessages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          hasDocument={Boolean(activeDocument || documents.length > 0)}
          onRetry={handleRetry}
        />
      </main>
    </div>
  );
}
