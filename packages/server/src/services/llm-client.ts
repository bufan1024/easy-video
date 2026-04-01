import type { LLMConfig } from '@easy-video/shared';

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  content: string;
  usage?: { inputTokens: number; outputTokens: number };
}

interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
}

// 统一的 LLM 调用入口
export async function callLLM(
  config: LLMConfig,
  messages: LLMMessage[],
  options?: LLMOptions
): Promise<LLMResponse> {
  // 如果有自定义 baseUrl，检测 API 格式
  if (config.baseUrl) {
    return callCustomEndpoint(config, messages, options);
  }

  // 使用默认服务商 API
  switch (config.provider) {
    case 'openai':
      return callOpenAI(config, messages, options);
    case 'anthropic':
      return callAnthropic(config, messages, options);
    case 'zhipu':
      return callZhipu(config, messages, options);
    case 'qwen':
      return callQwen(config, messages, options);
    default:
      throw new Error(`不支持的服务商: ${config.provider}`);
  }
}

// 自定义端点 - 自动检测 API 格式
async function callCustomEndpoint(config: LLMConfig, messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
  const baseUrl = config.baseUrl as string;

  // 检测是否为 Anthropic 格式 API
  if (baseUrl.includes('/anthropic') || baseUrl.includes('anthropic')) {
    return callAnthropic(config, messages, options);
  }

  // 默认使用 OpenAI 兼容格式（最常见的代理格式）
  return callOpenAI(config, messages, options);
}

// OpenAI API (兼容 OpenAI 格式的端点)
async function callOpenAI(config: LLMConfig, messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1';

  // 构建完整的 API URL
  let apiUrl = baseUrl;
  if (!baseUrl.includes('/chat/completions')) {
    apiUrl = baseUrl.endsWith('/v1') ? `${baseUrl}/chat/completions` :
             baseUrl.includes('/v1/') ? `${baseUrl}` :
             `${baseUrl}/v1/chat/completions`;
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 错误: ${response.status} ${response.statusText} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: {
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
    },
  };
}

// Anthropic Claude API
async function callAnthropic(config: LLMConfig, messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
  const baseUrl = config.baseUrl || 'https://api.anthropic.com';

  // 构建完整的 API URL
  let apiUrl = baseUrl;
  if (!baseUrl.includes('/messages')) {
    apiUrl = baseUrl.endsWith('/v1') ? `${baseUrl}/messages` :
             baseUrl.includes('/v1/') ? `${baseUrl}` :
             `${baseUrl}/v1/messages`;
  }

  // 转换消息格式
  const systemMessage = messages.find(m => m.role === 'system');
  const otherMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: options?.maxTokens ?? 1024,
      system: systemMessage?.content,
      messages: otherMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 错误: ${response.status} ${response.statusText} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    usage: {
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
    },
  };
}

// 智谱 GLM API
async function callZhipu(config: LLMConfig, messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
  const baseUrl = config.baseUrl || 'https://open.bigmodel.cn/api/paas/v4';

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: options?.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`智谱 API 错误: ${response.status} ${response.statusText} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    usage: {
      inputTokens: data.usage?.prompt_tokens,
      outputTokens: data.usage?.completion_tokens,
    },
  };
}

// 通义千问 API (原生格式)
async function callQwen(config: LLMConfig, messages: LLMMessage[], options?: LLMOptions): Promise<LLMResponse> {
  const baseUrl = config.baseUrl || 'https://dashscope.aliyuncs.com/api/v1';

  const response = await fetch(`${baseUrl}/services/aigc/text-generation/generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      input: { messages },
      parameters: {
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`通义千问 API 错误: ${response.status} ${response.statusText} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.output.choices[0].message.content,
    usage: {
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
    },
  };
}