import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import type { Task, Segment } from '@easy-video/shared';

// 数据目录：用户 home 目录下的 .easy-video
const DATA_DIR = path.join(os.homedir(), '.easy-video', 'data');

export async function ensureDataDir(): Promise<void> {
  const subDirs = ['videos', 'outputs', 'transcripts', 'temp', 'tasks'];
  for (const dir of subDirs) {
    await fs.mkdir(path.join(DATA_DIR, dir), { recursive: true });
  }
}

export async function saveTask(task: Task): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'tasks', `${task.id}.json`);
  await fs.writeFile(filePath, JSON.stringify(task, null, 2));
}

export async function loadTask(taskId: string): Promise<Task | null> {
  try {
    const filePath = path.join(DATA_DIR, 'tasks', `${taskId}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveSegments(taskId: string, segments: Segment[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, 'transcripts', `${taskId}-segments.json`);
  await fs.writeFile(filePath, JSON.stringify(segments, null, 2));
}

export async function loadSegments(taskId: string): Promise<Segment[]> {
  try {
    const filePath = path.join(DATA_DIR, 'transcripts', `${taskId}-segments.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function getTempDir(): string {
  return path.join(DATA_DIR, 'temp');
}

export function getOutputDir(): string {
  return path.join(DATA_DIR, 'outputs');
}