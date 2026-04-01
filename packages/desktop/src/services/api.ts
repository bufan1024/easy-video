const API_BASE = 'http://localhost:3001/api';

export async function startProcess(videoPath: string): Promise<{ taskId: string }> {
  const res = await fetch(`${API_BASE}/video/process`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoPath }),
  });
  return res.json();
}

export async function getTaskProgress(taskId: string): Promise<{
  taskId: string;
  status: string;
  progress: number;
  currentStep: string;
}> {
  const res = await fetch(`${API_BASE}/task/${taskId}`);
  return res.json();
}

export async function getSegments(taskId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/task/${taskId}/segments`);
  return res.json();
}

export async function updateSegment(
  taskId: string,
  segmentId: string,
  action: 'delete' | 'lock' | 'unlock'
): Promise<any> {
  const res = await fetch(`${API_BASE}/task/${taskId}/segments/${segmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  });
  return res.json();
}

export async function exportVideo(
  taskId: string,
  segmentIds: string[]
): Promise<{ outputPath: string }> {
  const res = await fetch(`${API_BASE}/task/${taskId}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segments: segmentIds }),
  });
  return res.json();
}

// LLM 配置相关 API
export interface LLMConfigResponse {
  configured: boolean;
  provider?: string;
  model?: string;
  baseUrl?: string;
  hasApiKey?: boolean;
  lastUpdated?: number;
}

export interface LLMConfigRequest {
  provider: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export async function getLLMConfig(): Promise<LLMConfigResponse> {
  const res = await fetch(`${API_BASE}/config/llm`);
  return res.json();
}

export async function saveLLMConfig(config: LLMConfigRequest): Promise<{ success: boolean; provider: string; model: string; lastUpdated: number }> {
  const res = await fetch(`${API_BASE}/config/llm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function deleteLLMConfig(): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/config/llm`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function testLLMConfig(config: LLMConfigRequest): Promise<{ success: boolean; message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/config/llm/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return res.json();
}