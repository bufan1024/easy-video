export type LLMProvider = 'openai' | 'anthropic' | 'zhipu' | 'qwen';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
  lastUpdated: number;
}

export interface LLMConfigRequest {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface LLMConfigResponse {
  configured: boolean;
  provider?: LLMProvider;
  model?: string;
  baseUrl?: string;
  hasApiKey?: boolean;
  lastUpdated?: number;
}

// 各服务商支持的模型列表
export const PROVIDER_MODELS: Record<LLMProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
  zhipu: ['glm-4', 'glm-4-flash', 'glm-3-turbo'],
  qwen: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
};

// 服务商显示名称
export const PROVIDER_NAMES: Record<LLMProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic Claude',
  zhipu: '智谱 GLM',
  qwen: '通义千问',
};