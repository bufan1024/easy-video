import type { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import type { CreateTaskRequest, Task } from '@easy-video/shared';
import { saveTask } from '../storage';
import { processVideo } from '../services/processor';

export async function videoRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/video/process - 开始处理视频
  app.post<{ Body: CreateTaskRequest }>('/process', async (request, reply) => {
    const { videoPath } = request.body;

    const taskId = uuidv4();
    const task: Task = {
      id: taskId,
      videoPath,
      status: 'pending',
      progress: 0,
      currentStep: 'init',
      createdAt: Date.now(),
    };

    await saveTask(task);

    // 异步启动处理流程
    processVideo(taskId, videoPath).catch(console.error);

    return { taskId, message: 'Processing started' };
  });
}