import type { Transcript } from '@easy-video/shared';

// Mock 实现：返回模拟的评分结果
// 实际实现需要调用 Ollama HTTP API
export async function scoreSegment(segment: Transcript): Promise<{ score: number; reason: string }> {
  // 模拟评分：基于时长和文本长度
  const duration = segment.endTime - segment.startTime;
  const textLength = segment.text.length;

  const score = Math.min(10, Math.max(1, Math.round((duration / 30) * 5 + textLength / 20)));
  const reason = `时长 ${duration} 秒，文本长度 ${textLength} 字符`;

  return { score, reason };
}

// 实际 Ollama API 调用代码 (预留)
/*
import ollama from 'ollama';

export async function scoreSegmentReal(segment: Transcript): Promise<{ score: number; reason: string }> {
  const response = await ollama.chat({
    model: 'qwen2.5:7b',
    messages: [{
      role: 'user',
      content: `请评估以下视频片段的信息价值...
    }],
  });
  return JSON.parse(response.message.content);
}
*/