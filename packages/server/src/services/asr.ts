import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import type { Transcript, WordTimestamp } from '@easy-video/shared';
import { loadLLMConfig } from './config-store';

// Whisper API 响应格式
interface WhisperResponse {
  text: string;
  segments?: {
    id: number;
    start: number;
    end: number;
    text: string;
    words?: {
      word: string;
      start: number;
      end: number;
    }[];
  }[];
  words?: {
    word: string;
    start: number;
    end: number;
  }[];
}

// 转录音频
export async function transcribeAudio(audioPath: string): Promise<Transcript[]> {
  const config = await loadLLMConfig();

  if (!config) {
    console.warn('未配置 LLM，使用 mock 转录');
    return mockTranscribe();
  }

  try {
    // 使用 Whisper API
    return await whisperTranscribe(audioPath, config.apiKey, config.baseUrl);
  } catch (error) {
    console.error('Whisper 转录失败，使用 mock:', error);
    return mockTranscribe();
  }
}

// Whisper API 转录
async function whisperTranscribe(audioPath: string, apiKey: string, baseUrl?: string): Promise<Transcript[]> {
  const apiUrl = baseUrl
    ? (baseUrl.includes('/audio/transcriptions') ? baseUrl : `${baseUrl}/audio/transcriptions`)
    : 'https://api.openai.com/v1/audio/transcriptions';

  // 构建 FormData
  const formData = new FormData();
  const fileStream = fs.createReadStream(audioPath);
  formData.append('file', fileStream as any, path.basename(audioPath));
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities', JSON.stringify(['word']));

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API 错误: ${response.status} - ${error}`);
  }

  const data: WhisperResponse = await response.json();

  // 转换为 Transcript 格式
  return convertWhisperResponse(data);
}

// 转换 Whisper 响应为 Transcript 数组
function convertWhisperResponse(data: WhisperResponse): Transcript[] {
  if (!data.segments || data.segments.length === 0) {
    // 如果没有分段，使用整个文本
    return [{
      id: uuidv4(),
      startTime: 0,
      endTime: data.words?.[data.words.length - 1]?.end ?? 0,
      text: data.text.trim(),
      words: data.words,
    }];
  }

  return data.segments.map((seg) => ({
    id: uuidv4(),
    startTime: seg.start,
    endTime: seg.end,
    text: seg.text.trim(),
    words: seg.words,
  }));
}

// Mock 转录（备用）
function mockTranscribe(): Transcript[] {
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