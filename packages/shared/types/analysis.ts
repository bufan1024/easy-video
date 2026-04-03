// 视觉分析结果
export interface VisualAnalysis {
  quality: number;          // 1-10 画面质量
  hasSpeaker: boolean;      // 是否有人物说话
  sceneType: string;        // 场景类型：采访、演讲、风景等
  visualInterest: number;   // 1-10 视觉吸引力
  textOverlay?: string;     // 屏幕文字
  issues: string[];         // 质量问题：模糊、过暗等
}

// 情绪分析结果
export interface EmotionScore {
  energy: number;           // 1-10 能量级别
  emotion: string;          // 情绪类型：兴奋、平静、悲伤等
  keyMoment: boolean;       // 是否为关键时刻
}

// 场景变化
export interface SceneChange {
  timestamp: number;        // 时间点（秒）
  score: number;            // 场景变化强度 0-100
  type: 'cut' | 'fade' | 'dissolve';
}

// ASR 配置
export interface ASRConfig {
  provider: 'whisper' | 'funasr';
  language?: string;        // 语言代码，如 zh, en
  enableDiarization?: boolean;  // 是否启用说话人分离
}

// 视觉分析配置
export interface VisionConfig {
  provider: 'qwen-vl' | 'gpt-4v';
  model: string;
  sampleInterval?: number;  // 采样间隔（秒）
}