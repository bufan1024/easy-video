import type { LLMConfig, EmotionScore } from '@easy-video/shared';
import { loadLLMConfig } from './config-store';
import { callLLM } from './llm-client';

const EMOTION_ANALYSIS_PROMPT = `分析以下文本的情绪能量，返回 JSON 格式结果（不要包含 markdown 代码块）：
{
  "energy": 1-10的整数,     // 能量级别：1=低沉/平静，10=兴奋/激烈
  "emotion": "主要情绪",    // 如：兴奋、平静、悲伤、愤怒、幽默、紧张等
  "keyMoment": true/false   // 是否为关键高潮时刻
}

文本：
{text}`;

// 默认情绪分数
const DEFAULT_EMOTION: EmotionScore = {
  energy: 5,
  emotion: '平静',
  keyMoment: false,
};

// 分析文本情绪
export async function analyzeEmotion(text: string): Promise<EmotionScore> {
  const config = await loadLLMConfig();

  if (!config) {
    console.warn('未配置 LLM，跳过情绪分析');
    return DEFAULT_EMOTION;
  }

  try {
    const prompt = EMOTION_ANALYSIS_PROMPT.replace('{text}', text);
    const response = await callLLM(config, [{ role: 'user', content: prompt }], {
      temperature: 0.3,
      maxTokens: 200,
    });

    return parseEmotion(response.content);
  } catch (error) {
    console.error('情绪分析失败:', error);
    return DEFAULT_EMOTION;
  }
}

// 批量分析情绪
export async function analyzeEmotions(texts: string[]): Promise<EmotionScore[]> {
  const results: EmotionScore[] = [];

  for (const text of texts) {
    const emotion = await analyzeEmotion(text);
    results.push(emotion);
  }

  return results;
}

// 解析情绪结果
function parseEmotion(response: string): EmotionScore {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        energy: Math.min(10, Math.max(1, parsed.energy || 5)),
        emotion: parsed.emotion || '平静',
        keyMoment: parsed.keyMoment || false,
      };
    }
  } catch (error) {
    console.error('解析情绪结果失败:', error);
  }

  return DEFAULT_EMOTION;
}

// 基于文本长度和关键词的简单情绪估算（备用）
export function estimateEmotion(text: string): EmotionScore {
  const length = text.length;

  // 感叹号数量
  const exclamations = (text.match(/[!！]/g) || []).length;

  // 问号数量
  const questions = (text.match(/[?？]/g) || []).length;

  // 高能关键词
  const highEnergyKeywords = ['太棒', '厉害', '重要', '关键', '精彩', '必须', '一定', '震惊'];
  const hasHighEnergy = highEnergyKeywords.some(kw => text.includes(kw));

  // 计算能量分数
  let energy = 5;
  energy += exclamations * 0.5;
  energy += hasHighEnergy ? 2 : 0;
  energy = Math.min(10, Math.max(1, Math.round(energy)));

  return {
    energy,
    emotion: hasHighEnergy ? '兴奋' : (questions > 0 ? '疑问' : '平静'),
    keyMoment: energy >= 7 || hasHighEnergy,
  };
}