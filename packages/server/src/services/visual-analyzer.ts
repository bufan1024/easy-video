import fs from 'fs/promises';
import type { LLMConfig, VisualAnalysis } from '@easy-video/shared';
import { loadLLMConfig } from './config-store';

const VISUAL_ANALYSIS_PROMPT = `分析此视频帧，返回 JSON 格式结果（不要包含 markdown 代码块）：
{
  "quality": 1-10的整数,         // 画面质量（模糊、过暗等会降低分数）
  "hasSpeaker": true/false,      // 是否有人物说话
  "sceneType": "场景类型",       // 如：采访、演讲、风景、动画、字幕等
  "visualInterest": 1-10的整数,  // 视觉吸引力
  "textOverlay": "屏幕上的文字", // 如果有字幕或文字，否则为空
  "issues": []                   // 质量问题数组，如：["模糊", "过暗", "过曝"]
}`;

// 视觉分析结果（带默认值）
const DEFAULT_ANALYSIS: VisualAnalysis = {
  quality: 5,
  hasSpeaker: false,
  sceneType: '未知',
  visualInterest: 5,
  issues: [],
};

// 分析单个帧
export async function analyzeFrame(framePath: string): Promise<VisualAnalysis> {
  const config = await loadLLMConfig();

  if (!config) {
    console.warn('未配置 LLM，跳过视觉分析');
    return DEFAULT_ANALYSIS;
  }

  try {
    const base64 = await fs.readFile(framePath, 'base64');
    const response = await callVisionLLM(config, base64);
    return parseAnalysis(response);
  } catch (error) {
    console.error('视觉分析失败:', error);
    return DEFAULT_ANALYSIS;
  }
}

// 批量分析多个帧
export async function analyzeFrames(framePaths: string[]): Promise<VisualAnalysis[]> {
  const results: VisualAnalysis[] = [];

  for (const framePath of framePaths) {
    const analysis = await analyzeFrame(framePath);
    results.push(analysis);
  }

  return results;
}

// 调用视觉 LLM
async function callVisionLLM(config: LLMConfig, imageBase64: string): Promise<string> {
  const baseUrl = config.baseUrl || getDefaultVisionUrl(config.provider);

  // 根据服务商构建请求
  if (config.provider === 'anthropic') {
    return callAnthropicVision(baseUrl, config, imageBase64);
  } else if (config.provider === 'qwen') {
    return callQwenVision(baseUrl, config, imageBase64);
  } else {
    // OpenAI 格式（默认）
    return callOpenAIVision(baseUrl, config, imageBase64);
  }
}

// 获取默认视觉 API URL
function getDefaultVisionUrl(provider: string): string {
  switch (provider) {
    case 'anthropic':
      return 'https://api.anthropic.com/v1/messages';
    case 'qwen':
      return 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
    default:
      return 'https://api.openai.com/v1/chat/completions';
  }
}

// OpenAI Vision API
async function callOpenAIVision(baseUrl: string, config: LLMConfig, imageBase64: string): Promise<string> {
  const apiUrl = baseUrl.includes('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: VISUAL_ANALYSIS_PROMPT },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      }],
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Vision API 错误: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Anthropic Vision API
async function callAnthropicVision(baseUrl: string, config: LLMConfig, imageBase64: string): Promise<string> {
  const apiUrl = baseUrl.includes('/messages') ? baseUrl : `${baseUrl}/v1/messages`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: VISUAL_ANALYSIS_PROMPT },
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic Vision API 错误: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// Qwen Vision API (通义千问 VL)
async function callQwenVision(baseUrl: string, config: LLMConfig, imageBase64: string): Promise<string> {
  const apiUrl = baseUrl.includes('/multimodal-generation') ? baseUrl :
    'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model || 'qwen-vl-plus',
      input: {
        messages: [{
          role: 'user',
          content: [
            { text: VISUAL_ANALYSIS_PROMPT },
            { image: `data:image/jpeg;base64,${imageBase64}` },
          ],
        }],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Qwen Vision API 错误: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.output.choices[0].message.content;
}

// 解析分析结果
function parseAnalysis(response: string): VisualAnalysis {
  try {
    // 尝试提取 JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        quality: Math.min(10, Math.max(1, parsed.quality || 5)),
        hasSpeaker: parsed.hasSpeaker || false,
        sceneType: parsed.sceneType || '未知',
        visualInterest: Math.min(10, Math.max(1, parsed.visualInterest || 5)),
        textOverlay: parsed.textOverlay || undefined,
        issues: parsed.issues || [],
      };
    }
  } catch (error) {
    console.error('解析视觉分析结果失败:', error);
  }

  return DEFAULT_ANALYSIS;
}