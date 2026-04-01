import type { Task, Segment } from '@easy-video/shared';
import { saveTask, saveSegments, loadSegments } from '../storage';
import { extractAudio } from './ffmpeg';
import { transcribeAudio } from './asr';
import { scoreSegment } from './scorer';
import { concatSegments } from './ffmpeg';

export async function processVideo(taskId: string, videoPath: string): Promise<void> {
  try {
    // Step 1: 抽取音频
    await updateProgress(taskId, 'extract-audio', 10, 'processing');
    const audioPath = await extractAudio(videoPath, taskId);

    // Step 2: ASR 转录
    await updateProgress(taskId, 'transcribe', 25);
    const transcripts = await transcribeAudio(audioPath);

    // Step 3: 文本分段 (已在 ASR 中完成)
    await updateProgress(taskId, 'segment-text', 40);

    // Step 4: LLM 评分
    await updateProgress(taskId, 'score-segments', 55);
    const segments: Segment[] = [];
    for (const transcript of transcripts) {
      const { score, reason } = await scoreSegment(transcript);
      segments.push({
        ...transcript,
        score,
        reason,
        selected: score >= 5,  // 默认选择评分 >= 5 的片段
        locked: false,
      });
    }
    await saveSegments(taskId, segments);

    // Step 5: 选择精华片段
    await updateProgress(taskId, 'select-highlights', 70);

    // Step 6: 完成
    await updateProgress(taskId, 'complete', 100, 'completed');

  } catch (error) {
    console.error(`Processing failed for task ${taskId}:`, error);
    await updateProgress(taskId, 'error', 0, 'failed');
  }
}

async function updateProgress(
  taskId: string,
  step: string,
  progress: number,
  status?: Task['status']
): Promise<void> {
  const task = await loadTaskFromStorage(taskId);
  if (task) {
    task.currentStep = step;
    task.progress = progress;
    if (status) task.status = status;
    await saveTask(task);
  }
}

// 辅助函数：从存储加载任务
async function loadTaskFromStorage(taskId: string): Promise<Task | null> {
  // 直接使用 storage 的 loadTask
  const { loadTask } = await import('../storage');
  return loadTask(taskId);
}

export async function exportVideo(
  taskId: string,
  videoPath: string,
  segmentIds: string[]
): Promise<string> {
  const segments = await loadSegments(taskId);
  const selectedSegments = segments.filter(s => segmentIds.includes(s.id) && s.selected);

  const ranges = selectedSegments.map(s => ({
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  return concatSegments(videoPath, ranges, taskId);
}