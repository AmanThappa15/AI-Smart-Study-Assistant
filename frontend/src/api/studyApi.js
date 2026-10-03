/**
 * Frontend API service for AI Smart Study Assistant.
 * Interacts with FastAPI backend endpoints:
 * - POST /upload
 * - GET  /ask
 * - GET  /health
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const studyApi = {
  /**
   * Upload a PDF file to the backend
   * @param {File} file
   * @returns {Promise<{ filename: string, content_type: string, message: string, text_length: number, number_of_chunks: number, chunks: string[] }>}
   */
  async uploadDocument(file) {
    if (!file) {
      throw new Error("No file selected.");
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("Only PDF files (.pdf) are allowed.");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data.detail ||
          data.error ||
          `Upload failed with status code ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      if (err.message && err.message.includes("Failed to fetch")) {
        throw new Error(
          "Cannot reach the backend server. Please verify FastAPI is running at http://127.0.0.1:8000.",
          { cause: err }
        );
      }
      throw err;
    }
  },

  /**
   * Ask a question against the processed PDF document
   * @param {string} question
   * @returns {Promise<{ question: string, answer: string, retrieved_chunks: string[] }>}
   */
  async askQuestion(question) {
    if (!question || !question.trim()) {
      throw new Error("Please enter a question.");
    }

    const encodedQuestion = encodeURIComponent(question.trim());

    try {
      const response = await fetch(
        `${API_BASE_URL}/ask?question=${encodedQuestion}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg =
          data.detail ||
          data.error ||
          `Request failed with status code ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      if (err.message && err.message.includes("Failed to fetch")) {
        throw new Error(
          "Cannot reach backend server. Please verify FastAPI is running at http://127.0.0.1:8000.",
          { cause: err }
        );
      }
      throw err;
    }
  },

  /**
   * Health check to detect backend connection
   * @returns {Promise<{ isHealthy: boolean, status: string }>}
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        return { isHealthy: true, status: data.status || "healthy" };
      }
      return { isHealthy: false, status: `HTTP ${response.status}` };
    } catch {
      return { isHealthy: false, status: "offline" };
    }
  },
};
