import { useState, useEffect } from "react";
import apiClient from "@/lib/axios";
import type { SystemInfo } from "@/types";

export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await apiClient.get<SystemInfo>("/system-info");
        setSystemInfo(response.data);
      } catch (error) {
        console.error("Error fetching system info:", error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSystemInfo();
  }, []);

  return { systemInfo, isLoading, error };
};
