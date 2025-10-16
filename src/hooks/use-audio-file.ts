import { useState, useCallback, useEffect } from "react";

export const useAudioFile = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number>(0);

  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);

    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);

    const audio = new Audio();
    audio.src = objectUrl;

    audio.addEventListener("loadedmetadata", () => {
      setAudioDuration(audio.duration);
    });

    audio.addEventListener("error", () => {
      setAudioDuration(0);
    });
  }, []);

  const clearFile = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setSelectedFile(null);
    setFileName("");
    setAudioUrl("");
    setAudioDuration(0);
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return {
    selectedFile,
    fileName,
    audioUrl,
    audioDuration,
    handleFileSelect,
    clearFile,
  };
};
