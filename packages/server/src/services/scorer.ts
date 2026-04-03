import type { Transcript, VisualAnalysis, EmotionScore } from '@easy-video/shared';
import { loadLLMConfig } from './config-store';
import { callLLM } from './llm-client';

// 评分结果类型
interface ScoreResult {
  score: number;
  reason: string;
}

// 多模态评分结果
interface MultiModalScoreResult extends ScoreResult {
  textScore: number;
  visualScore: number;
  emotionScore: number;
}

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

// 评分权重
const SCORE_WEIGHTS = {
  textContent: 0.35,
  visualQuality: 0.25,
  emotionEnergy: 0.25,
  audioQuality: 0.15,
};

// 评分片段
export async function scoreSegment(segment: Transcript): Promise<ScoreResult> {
  const config = await loadLLMConfig();

  if (!config) {
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

// 多模态综合评分
export async function scoreSegmentMultiModal(
  segment: Transcript,
  visualAnalysis?: VisualAnalysis,
  emotionScore?: EmotionScore
): Promise<MultiModalScoreResult> {
  // 1. 文本评分
  const textResult = await scoreSegment(segment);
  const textScore = textResult.score;

  // 2. 视觉评分
  const visualScore = visualAnalysis?.visualInterest ?? 5;

  // 3. 情绪评分
  const emotionValue = emotionScore?.energy ?? 5;

  // 4. 音频评分
  const audioScore = inferAudioScore(segment.text, emotionValue);

  // 5. 综合评分
  const totalScore =
    textScore * SCORE_WEIGHTS.textContent +
    visualScore * SCORE_WEIGHTS.visualQuality +
    emotionValue * SCORE_WEIGHTS.emotionEnergy +
    audioScore * SCORE_WEIGHTS.audioQuality;

  const finalScore = Math.round(totalScore * 10) / 10;

  return {
    score: Math.min(10, Math.max(1, Math.round(finalScore))),
    reason: generateReason(textResult.reason, visualAnalysis, emotionScore),
    textScore,
    visualScore,
    emotionScore: emotionValue,
  };
}

// 推断音频评分
function inferAudioScore(text: string, emotionEnergy: number): number {
  const length = text.length;

  if (length > 50 && emotionEnergy >= 6) return 7;
  if (length > 30) return 6;
  if (length > 10) return 5;
  return 4;
}

// 生成综合理由
function generateReason(
  textReason: string,
  visualAnalysis?: VisualAnalysis,
  emotionScore?: EmotionScore
): string {
  const parts: string[] = [textReason];

  if (visualAnalysis) {
    if (visualAnalysis.quality < 5) {
      parts.push('画面质量: ' + visualAnalysis.quality + '/10');
    }
    if (visualAnalysis.sceneType !== '未知') {
      parts.push('场景: ' + visualAnalysis.sceneType);
    }
  }

  if (emotionScore?.keyMoment) {
    parts.push('🔥 高潮片段');
  } else if (emotionScore?.energy && emotionScore.energy >= 7) {
    parts.push('情绪: ' + emotionScore.emotion);
  }

  return parts.join(' | ');
}

// Mock 评分
function mockScore(segment: Transcript): ScoreResult {
  const duration = segment.endTime - segment.startTime;
  const textLength = segment.text.length;
  const score = Math.min(10, Math.max(1, Math.round((duration / 30) * 5 + textLength / 20)));
  const reason = '时长 ' + duration + ' 秒，文本长度 ' + textLength + ' 字符（模拟评分）';
  return { score, reason };
}