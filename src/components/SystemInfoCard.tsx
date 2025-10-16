import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Monitor, Cpu, HardDrive } from "lucide-react";
import type { SystemInfo } from "@/types";

interface SystemInfoCardProps {
  systemInfo: SystemInfo | null;
  isLoading: boolean;
}

export const SystemInfoCard = ({ systemInfo, isLoading }: SystemInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="size-5" />
          System Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : systemInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Monitor className="size-4" />
                System
              </div>
              <p className="text-sm font-mono">{systemInfo.hostname}</p>
              <p className="text-xs text-muted-foreground">{systemInfo.os}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Cpu className="size-4" />
                CPU
              </div>
              <p className="text-sm font-mono">{systemInfo.cpu_name}</p>
              <p className="text-xs text-muted-foreground">
                {systemInfo.cpu_cores} cores / {systemInfo.cpu_threads} threads
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Monitor className="size-4" />
                GPU
              </div>
              <p className="text-sm font-mono">{systemInfo.gpu_name}</p>
              <p className="text-xs text-muted-foreground">
                {systemInfo.gpu_cores} cores
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <HardDrive className="size-4" />
                Memory
              </div>
              <p className="text-sm font-mono">RAM: {systemInfo.total_memory}</p>
              <p className="text-xs text-muted-foreground">
                GPU: {systemInfo.gpu_memory}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Failed to load system information
          </p>
        )}
      </CardContent>
    </Card>
  );
};
