import type { FastifyInstance } from 'fastify';
import type { UpdateSegmentRequest, ExportRequest, TaskProgressResponse } from '@easy-video/shared';
import { loadTask, loadSegments, saveSegments } from '../storage';
import { exportVideo } from '../services/processor';

export async function taskRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/task/:id - 获取任务状态
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const task = await loadTask(request.params.id);
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' });
    }

    const response: TaskProgressResponse = {
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      currentStep: task.currentStep,
    };

    return response;
  });

  // GET /api/task/:id/segments - 获取片段列表
  app.get<{ Params: { id: string } }>('/:id/segments', async (request, reply) => {
    const segments = await loadSegments(request.params.id);
    return segments;
  });

  // PATCH /api/task/:id/segments/:sid - 更新片段状态
  app.patch<{ Params: { id: string; sid: string }; Body: UpdateSegmentRequest }>(
    '/:id/segments/:sid',
    async (request, reply) => {
      const { id, sid } = request.params;
      const { action } = request.body;

      const segments = await loadSegments(id);
      const segment = segments.find(s => s.id === sid);

      if (!segment) {
        return reply.code(404).send({ error: 'Segment not found' });
      }

      if (action === 'delete') {
        segment.selected = false;
      } else if (action === 'lock') {
        segment.locked = true;
        segment.selected = true;
      } else if (action === 'unlock') {
        segment.locked = false;
      }

      await saveSegments(id, segments);
      return segment;
    }
  );

  // POST /api/task/:id/export - 导出视频
  app.post<{ Params: { id: string }; Body: ExportRequest }>('/:id/export', async (request, reply) => {
    const { id } = request.params;
    const { segments } = request.body;

    const task = await loadTask(id);
    if (!task) {
      return reply.code(404).send({ error: 'Task not found' });
    }

    const outputPath = await exportVideo(id, task.videoPath, segments);

    return { outputPath };
  });
}