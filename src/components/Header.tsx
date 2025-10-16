import { Mic } from "lucide-react";

export const Header = () => {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
        <Mic className="size-8 text-primary" />
        Transcribe me Daddy! 🥴
      </h1>
      <p className="text-muted-foreground">
        Real-time audio transcription using OpenAI Whisper Large on Local
      </p>
    </div>
  );
};
