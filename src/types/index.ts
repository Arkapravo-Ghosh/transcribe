export interface SystemInfo {
  hostname: string;
  cpu_name: string;
  cpu_cores: number;
  cpu_threads: number;
  gpu_name: string;
  gpu_cores: string | number;
  total_memory: string;
  gpu_memory: string;
  os: string;
  device: string;
}

export interface AudioFile {
  file: File;
  url: string;
  duration: number;
}
