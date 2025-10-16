import { useCallback, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, Mic, FileAudio, Loader2 } from "lucide-react";

interface AudioUploadCardProps {
  onFileSelect: (file: File) => void;
  onTranscribe: () => void;
  fileName: string;
  audioUrl: string;
  audioDuration: number;
  isProcessing: boolean;
  hasFile: boolean;
  fileInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const AudioUploadCard = ({
  onFileSelect,
  onTranscribe,
  fileName,
  audioUrl,
  audioDuration,
  isProcessing,
  hasFile,
  fileInputRef: externalFileInputRef,
}: AudioUploadCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const internalFileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = externalFileInputRef || internalFileInputRef;

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  return (
    <Card className="flex flex-col h-[calc(100vh-24rem)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="size-5" />
          Upload Audio File
        </CardTitle>
        <CardDescription>
          Drag and drop an audio file or click to browse. Supports MP3, WAV, M4A,
          and more.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center min-h-0">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center transition-all flex-1 flex flex-col items-center justify-center gap-6
            ${isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
            }
            ${isProcessing ? "pointer-events-none opacity-50" : "cursor-pointer"}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isProcessing}
          />
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            <div className="rounded-full bg-primary/10 p-4">
              {isProcessing ? (
                <Loader2 className="size-10 text-primary animate-spin" />
              ) : (
                <FileAudio className="size-10 text-primary" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isProcessing
                  ? "Processing..."
                  : isDragging
                    ? "Drop your file here"
                    : hasFile
                      ? "File selected"
                      : "Drop your audio file here"}
              </p>
              <p className="text-sm text-muted-foreground">
                {hasFile ? fileName : "or click to browse"}
              </p>
            </div>
          </div>
        </div>
        {hasFile && audioDuration > 0 && (
          <Card className="mt-4 px-3 py-4 shadow-sm">
            <audio
              controls
              src={audioUrl}
              className="w-full h-10"
              preload="metadata"
            />
          </Card>
        )}
        {hasFile && !isProcessing && (
          <div className="mt-4">
            <Button
              size="lg"
              onClick={onTranscribe}
              className="w-full gap-2 shadow-sm"
            >
              <Mic className="size-4" />
              Start Transcription
            </Button>
          </div>
        )}
        {isProcessing && (
          <div className="mt-4 space-y-2">
            <Progress value={undefined} className="h-1" />
            <p className="text-xs text-center text-muted-foreground">
              Transcribing audio...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
