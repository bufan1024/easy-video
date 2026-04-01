export interface VideoInfo {
  path: string;
  duration: number;  // 秒
  size: number;      // bytes
  format: string;
}

export interface TimeRange {
  startTime: number;
  endTime: number;
}

export interface ExportRequest {
  segments: string[];  // segment ids
}

export interface ExportResponse {
  outputPath: string;
}