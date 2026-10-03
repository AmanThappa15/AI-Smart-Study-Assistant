import { useState, useRef } from "react";
import { AlertCircle, Check, Loader2, Upload } from "lucide-react";
import { studyApi } from "../api/studyApi";

export default function DocumentUpload({ onUploadSuccess, isUploading, setIsUploading }) {
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const processFile = async (file) => {
    if (!file) return;

    setErrorMessage("");
    setSuccessMessage("");

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Please select a PDF document (.pdf).");
      return;
    }

    setIsUploading(true);

    try {
      const data = await studyApi.uploadDocument(file);
      setSuccessMessage(`Loaded "${data.filename}" (${data.number_of_chunks} passages)`);
      if (onUploadSuccess) {
        onUploadSuccess({
          id: `${Date.now()}-${file.name}`,
          name: data.filename,
          size: formatFileSize(file.size),
          rawSize: file.size,
          chunksCount: data.number_of_chunks,
          textLength: data.text_length,
          uploadedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }
      setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to process PDF.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="compact-upload-wrapper">
      <div
        className={`compact-dropzone ${dragActive ? "drag-active" : ""} ${
          isUploading ? "uploading" : ""
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          style={{ display: "none" }}
          disabled={isUploading}
        />

        {isUploading ? (
          <>
            <Loader2 size={16} className="animate-spin text-accent" />
            <span className="dropzone-text-main">Processing PDF...</span>
            <div className="inline-progress">
              <div className="progress-bar-fill"></div>
            </div>
          </>
        ) : (
          <>
            <Upload size={14} className="text-muted" />
            <span className="dropzone-text-main">Drop PDF here or click to browse</span>
            <span className="dropzone-text-sub">Syllabus, chapters, papers</span>
          </>
        )}
      </div>

      {errorMessage && (
        <div className="upload-inline-alert error animate-fade-in">
          <AlertCircle size={13} />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="upload-inline-alert success animate-fade-in">
          <Check size={13} />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
