import { useRef } from "react";
import { Header } from "@/components/Header";
import { SystemInfoCard } from "@/components/SystemInfoCard";
import { AudioUploadCard } from "@/components/AudioUploadCard";
import { TranscriptCard } from "@/components/TranscriptCard";
import { useSystemInfo } from "@/hooks/use-system-info";
import { useAudioFile } from "@/hooks/use-audio-file";
import { useTranscription } from "@/hooks/use-transcription";
import { useLoadingMessages } from "@/hooks/use-loading-messages";
import { useTimer } from "@/hooks/use-timer";

const App = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { systemInfo, isLoading: isLoadingSystemInfo } = useSystemInfo();
  const {
    selectedFile,
    fileName,
    audioUrl,
    audioDuration,
    handleFileSelect,
    clearFile,
  } = useAudioFile();
  const {
    transcript,
    isProcessing,
    transcriptEndRef,
    handleTranscribe,
    clearTranscript,
  } = useTranscription();
  const loadingMessage = useLoadingMessages(isProcessing);
  const { elapsedTime, resetTimer } = useTimer(isProcessing);

  const handleClear = () => {
    clearTranscript();
    clearFile();
    resetTimer();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 pb-8">
        <Header />
        <SystemInfoCard
          systemInfo={systemInfo}
          isLoading={isLoadingSystemInfo}
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AudioUploadCard
            onFileSelect={handleFileSelect}
            onTranscribe={() => handleTranscribe(selectedFile)}
            fileName={fileName}
            audioUrl={audioUrl}
            audioDuration={audioDuration}
            isProcessing={isProcessing}
            hasFile={!!selectedFile}
            fileInputRef={fileInputRef}
          />
          <TranscriptCard
            transcript={transcript}
            isProcessing={isProcessing}
            elapsedTime={elapsedTime}
            loadingMessage={loadingMessage}
            transcriptEndRef={transcriptEndRef}
            onClear={handleClear}
          />
        </div>
      </div>
    </main>
  );
};

export default App;
