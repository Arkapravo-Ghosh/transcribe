import { useState, useCallback, useRef } from "react";
import apiClient from "@/lib/axios";

export const useTranscription = () => {
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const handleTranscribe = useCallback(async (file: File | null) => {
    if (!file) return;

    setTranscript("");
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await apiClient.post<{ job_id: string }>(
        "/upload",
        formData
      );
      const jobId = uploadResponse.data.job_id;

      const eventSource = new EventSource(
        `${apiClient.defaults.baseURL}/transcribe/${jobId}`
      );

      eventSource.onmessage = (event) => {
        const data = event.data;
        if (data !== "complete") {
          setTranscript((prev) => prev + data);
        }
      };

      eventSource.addEventListener("done", () => {
        eventSource.close();
        setIsProcessing(false);
      });

      eventSource.onerror = () => {
        eventSource.close();
        setIsProcessing(false);
        setTranscript("Error: Failed to transcribe audio. Please try again.");
      };
    } catch (error) {
      console.error("Error transcribing:", error);
      setTranscript("Error: Failed to transcribe audio. Please try again.");
      setIsProcessing(false);
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    transcript,
    isProcessing,
    transcriptEndRef,
    handleTranscribe,
    clearTranscript,
    setTranscript,
  };
};
