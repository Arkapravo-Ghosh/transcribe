import { useState, useEffect } from "react";
import { LOADING_MESSAGES, LOADING_MESSAGE_INTERVAL } from "@/constants";

export const useLoadingMessages = (isProcessing: boolean) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= LOADING_MESSAGES.length - 1) {
            clearInterval(interval);
            return LOADING_MESSAGES.length - 1;
          }
          return nextIndex;
        });
      }, LOADING_MESSAGE_INTERVAL);
      return () => clearInterval(interval);
    } else {
      setMessageIndex(0);
    }
  }, [isProcessing]);

  return LOADING_MESSAGES[messageIndex];
};
