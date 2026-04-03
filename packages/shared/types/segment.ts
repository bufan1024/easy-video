export interface Transcript {
  id: string;
  startTime: number;  // 秒
  endTime: number;
  text: string;
  words?: WordTimestamp[];
  speaker?: string;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface Segment extends Transcript {
  score: number;
  reason: string;
  selected: boolean;
  locked: boolean;

  // 多模态评分
  textScore?: number;
  visualScore?: number;
  audioScore?: number;
  emotionScore?: number;

  // 分析结果
  sceneChange?: boolean;
  emotions?: string[];
  hasMusic?: boolean;
  issues?: string[];
}

export interface UpdateSegmentRequest {
  action: 'delete' | 'lock' | 'unlock';
}