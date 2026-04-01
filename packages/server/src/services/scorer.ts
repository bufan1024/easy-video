import type { Transcript } from '@easy-video/shared';
import { loadLLMConfig } from './config-store';
import { callLLM } from './llm-client';

const SCORING_PROMPT = `你是一个视频内容评估专家。请评估以下视频片段的信息价值。

评分标准（1-10分）：
- 1-3分：内容空洞、无意义对话、纯寒暄
- 4-6分：有一定信息量，但不够精彩
- 7-8分：有价值的信息，值得保留
- 9-10分：核心精华、高潮片段、关键信息

视频片段文本：
{text}

时间段：{startTime}秒 - {endTime}秒

请直接返回JSON格式结果（不要包含markdown代码块）：
{"score": <1-10的整数>, "reason": "<简短理由>"}`;

export async function scoreSegment(segment: Transcript): Promise<{ score: number; reason: string }> {
  const config = await loadLLMConfig();

  if (!config) {
    // 未配置时使用 mock
    return mockScore(segment);
  }

  try {
    const prompt = SCORING_PROMPT
      .replace('{text}', segment.text)
      .replace('{startTime}', String(segment.startTime))
      .replace('{endTime}', String(segment.endTime));

    const response = await callLLM(config, [{ role: 'user', content: prompt }], {
      temperature: 0.3,
      maxTokens: 200,
    });

    // 解析 JSON 响应
    const result = JSON.parse(response.content);
    return {
      score: Math.min(10, Math.max(1, result.score)),
      reason: result.reason || 'LLM评分',
    };
  } catch (error) {
    console.error('LLM 评分失败，使用备用方案:', error);
    return mockScore(segment);
  }
}

function mockScore(segment: Transcript): { score: number; reason: string } {
  const duration = segment.endTime - segment.startTime;
  const textLength = segment.text.length;
  const score = Math.min(10, Math.max(1, Math.round((duration / 30) * 5 + textLength / 20)));
  const reason = '时长 ' + duration + ' 秒，文本长度 ' + textLength + ' 字符（模拟评分）';
  return { score, reason };
}