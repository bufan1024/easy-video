export interface Transcript {
  id: string;
  startTime: number;  // 秒
  endTime: number;
  text: string;
}

export interface Segment extends Transcript {
  score: number;
  reason: string;
  selected: boolean;
  locked: boolean;
}

export interface UpdateSegmentRequest {
  action: 'delete' | 'lock' | 'unlock';
}