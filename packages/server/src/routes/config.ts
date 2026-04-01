import type { FastifyInstance } from 'fastify';
import type { LLMConfigRequest } from '@easy-video/shared';
import { loadLLMConfig, saveLLMConfig, deleteLLMConfig } from '../services/config-store';
import { callLLM } from '../services/llm-client';

export async function configRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/config/llm - 获取当前 LLM 配置（不返回 API Key）
  app.get('/llm', async () => {
    const config = await loadLLMConfig();
    if (!config) {
      return { configured: false };
    }

    return {
      configured: true,
      provider: config.provider,
      model: config.model,
      baseUrl: config.baseUrl,
      hasApiKey: true,
      lastUpdated: config.lastUpdated,
    };
  });

  // POST /api/config/llm - 保存 LLM 配置
  app.post<{ Body: LLMConfigRequest }>('/llm', async (request, reply) => {
    const { provider, apiKey, model, baseUrl } = request.body;

    if (!provider || !apiKey || !model) {
      return reply.code(400).send({ error: '缺少必要字段' });
    }

    const config = {
      provider,
      apiKey,
      model,
      baseUrl,
      lastUpdated: Date.now(),
    };

    await saveLLMConfig(config);

    return {
      success: true,
      provider,
      model,
      hasApiKey: true,
      lastUpdated: config.lastUpdated,
    };
  });

  // DELETE /api/config/llm - 删除 LLM 配置
  app.delete('/llm', async () => {
    await deleteLLMConfig();
    return { success: true };
  });

  // POST /api/config/llm/test - 测试 LLM 连接
  app.post<{ Body: LLMConfigRequest }>('/llm/test', async (request, reply) => {
    const { provider, apiKey, model, baseUrl } = request.body;

    if (!provider || !apiKey || !model) {
      return reply.code(400).send({ error: '缺少必要字段' });
    }

    try {
      const config = {
        provider,
        apiKey,
        model,
        baseUrl,
        lastUpdated: Date.now(),
      };

      await callLLM(config, [{ role: 'user', content: '请回复"OK"' }], {
        maxTokens: 10,
      });

      return { success: true, message: '连接成功' };
    } catch (error) {
      return reply.code(400).send({
        success: false,
        error: error instanceof Error ? error.message : '连接失败',
      });
    }
  });
}