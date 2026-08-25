import { useState } from "react";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a PDF first.");
      return;
    }

    const formData = new FormData();

    formData.append("file", selectedFile);

    const response = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    setMessage(
      `Uploaded: ${data.filename} (${data.content_type})`
    );
  };

  return (
    <div>
      <h1>AI Study Assistant</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
      />

      {selectedFile && (
        <p>Selected file: {selectedFile.name}</p>
      )}

      <button onClick={handleUpload}>
        Upload PDF
      </button>

      <p>{message}</p>
    </div>
  );
}

export default App;
