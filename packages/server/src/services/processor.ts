import type { Task, Segment } from '@easy-video/shared';
import { saveTask, saveSegments, loadSegments } from '../storage';
import { extractAudio, getVideoDuration, extractKeyframes } from './ffmpeg';
import { transcribeAudio } from './asr';
import { detectScenes, getSceneBoundaries } from './scene-detector';
import { analyzeFrames } from './visual-analyzer';
import { analyzeEmotion } from './emotion-analyzer';
import { scoreSegmentMultiModal } from './scorer';
import { concatSegments } from './ffmpeg';

export async function processVideo(taskId: string, videoPath: string): Promise<void> {
  try {
    // Step 1: 抽取音频
    await updateProgress(taskId, 'extract-audio', 5, 'processing');
    const audioPath = await extractAudio(videoPath, taskId);

    // Step 2: 场景检测
    await updateProgress(taskId, 'detect-scenes', 10);
    const scenes = await detectScenes(videoPath);
    const videoDuration = await getVideoDuration(videoPath);

    // Step 3: ASR 转录
    await updateProgress(taskId, 'transcribe', 20);
    const transcripts = await transcribeAudio(audioPath);

    // Step 4: 提取关键帧
    await updateProgress(taskId, 'extract-frames', 35);
    const segmentMidpoints = transcripts.map(t => (t.startTime + t.endTime) / 2);
    const framePaths = await extractKeyframes(videoPath, segmentMidpoints.slice(0, 10), taskId); // 限制帧数

    // Step 5: 视觉分析
    await updateProgress(taskId, 'analyze-visuals', 45);
    const visualAnalyses = await analyzeFrames(framePaths);

    // Step 6: 情绪分析 + 综合评分
    await updateProgress(taskId, 'score-segments', 55);
    const segments: Segment[] = [];

    for (let i = 0; i < transcripts.length; i++) {
      const transcript = transcripts[i];
      const visualAnalysis = visualAnalyses[Math.min(i, visualAnalyses.length - 1)];

      // 情绪分析
      const emotionScore = await analyzeEmotion(transcript.text);

      // 综合评分
      const scoreResult = await scoreSegmentMultiModal(transcript, visualAnalysis, emotionScore);

      segments.push({
        ...transcript,
        score: scoreResult.score,
        reason: scoreResult.reason,
        selected: scoreResult.score >= 5,
        locked: false,
        textScore: scoreResult.textScore,
        visualScore: scoreResult.visualScore,
        emotionScore: scoreResult.emotionScore,
        sceneChange: scenes.some(s =>
          s.timestamp >= transcript.startTime && s.timestamp < transcript.endTime
        ),
      });
    }

    await saveSegments(taskId, segments);

    // Step 7: 选择精华片段
    await updateProgress(taskId, 'select-highlights', 80);

    // Step 8: 完成
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

async function loadTaskFromStorage(taskId: string): Promise<Task | null> {
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