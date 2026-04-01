import type { Transcript } from '@easy-video/shared';
import { v4 as uuidv4 } from 'uuid';

// Mock 实现：返回模拟的转录结果
// 实际实现需要连接 FunASR WebSocket 服务
export async function transcribeAudio(audioPath: string): Promise<Transcript[]> {
  // 模拟 5 个片段，每个 30 秒
  const mockTranscripts: Transcript[] = [];

  for (let i = 0; i < 5; i++) {
    mockTranscripts.push({
      id: uuidv4(),
      startTime: i * 30,
      endTime: (i + 1) * 30,
      text: `这是第 ${i + 1} 段内容，包含一些有价值的信息和观点。`,
    });
  }

  return mockTranscripts;
}

// 实际 FunASR WebSocket 连接代码 (预留)
/*
import WebSocket from 'ws';

export async function transcribeAudioReal(audioPath: string): Promise<Transcript[]> {
  const ws = new WebSocket('ws://localhost:10095');
  // ... WebSocket 通信逻辑
}
*/