import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Loader2 } from "lucide-react";
import { formatTime } from "@/utils/format";

interface TranscriptCardProps {
  transcript: string;
  isProcessing: boolean;
  elapsedTime: number;
  loadingMessage: string;
  transcriptEndRef: React.RefObject<HTMLDivElement | null>;
  onClear: () => void;
}

export const TranscriptCard = ({
  transcript,
  isProcessing,
  elapsedTime,
  loadingMessage,
  transcriptEndRef,
  onClear,
}: TranscriptCardProps) => {
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcript, isProcessing, transcriptEndRef]);

  return (
    <Card className="flex flex-col h-[calc(100vh-24rem)]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              Transcript
            </CardTitle>
            <CardDescription>
              {isProcessing
                ? "Streaming results in real-time..."
                : transcript
                  ? "Transcription complete"
                  : "Upload an audio file to start transcription"}
            </CardDescription>
          </div>
          {elapsedTime > 0 && (
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
              <Clock className="size-3" />
              <span className="font-mono text-xs">{formatTime(elapsedTime)}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 w-full rounded-md border bg-muted/30 p-4 overflow-hidden">
          {isProcessing && !transcript ? (
            <div className="space-y-4 animate-in fade-in duration-500">
              <div className="flex items-center gap-3 text-primary">
                <Loader2 className="size-5 animate-spin" />
                <p className="text-sm font-medium animate-pulse">
                  {loadingMessage}
                </p>
              </div>
              <div className="space-y-3 mt-6">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[92%]" />
                <Skeleton className="h-4 w-[88%]" />
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed break-words">
              {transcript || (
                <span className="text-muted-foreground italic">
                  No transcription yet. Upload an audio file to begin.
                </span>
              )}
              <div ref={transcriptEndRef} />
            </div>
          )}
        </ScrollArea>
        {transcript && !isProcessing && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(transcript);
              }}
            >
              Copy to Clipboard
            </Button>
            <Button variant="outline" size="sm" onClick={onClear}>
              Clear
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
