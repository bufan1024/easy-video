import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import path from 'path';
import fs from 'fs/promises';
import type { TimeRange } from '@easy-video/shared';
import { getTempDir, getOutputDir } from '../storage';

// 设置 ffmpeg 路径
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

export async function extractAudio(videoPath: string, taskId: string): Promise<string> {
  const tempDir = getTempDir();
  const audioPath = path.join(tempDir, `${taskId}.wav`);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec('pcm_s16le')
      .output(audioPath)
      .on('end', () => resolve(audioPath))
      .on('error', reject)
      .run();
  });
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, data) => {
      if (err) reject(err);
      const duration = data?.format?.duration || 0;
      resolve(Math.round(duration));
    });
  });
}

export async function extractSegment(
  videoPath: string,
  range: TimeRange,
  outputName: string
): Promise<string> {
  const tempDir = getTempDir();
  const outputPath = path.join(tempDir, outputName);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(range.startTime)
      .setDuration(range.endTime - range.startTime)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}

export async function concatSegments(
  videoPath: string,
  ranges: TimeRange[],
  taskId: string
): Promise<string> {
  const outputDir = getOutputDir();
  const outputPath = path.join(outputDir, `${taskId}-output.mp4`);

  // 提取所有片段
  const segmentFiles: string[] = [];
  for (let i = 0; i < ranges.length; i++) {
    const segmentPath = await extractSegment(videoPath, ranges[i], `segment-${i}.mp4`);
    segmentFiles.push(segmentPath);
  }

  // 创建 concat 文件列表
  const tempDir = getTempDir();
  const concatListPath = path.join(tempDir, 'concat-list.txt');
  const concatList = segmentFiles.map(f => `file '${f}'`).join('\n');
  await fs.writeFile(concatListPath, concatList);

  // 拼接视频
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatListPath)
      .inputOptions('-f concat')
      .inputOptions('-safe 0')
      .outputOptions('-c copy')
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .run();
  });
}