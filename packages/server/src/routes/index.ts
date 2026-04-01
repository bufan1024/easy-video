import type { FastifyInstance } from 'fastify';
import { videoRoutes } from './video';
import { taskRoutes } from './task';
import { configRoutes } from './config';

export async function registerRoutes(app: FastifyInstance): Promise<void> {
  await app.register(videoRoutes, { prefix: '/api/video' });
  await app.register(taskRoutes, { prefix: '/api/task' });
  await app.register(configRoutes, { prefix: '/api/config' });
}