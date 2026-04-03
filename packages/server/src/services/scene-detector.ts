import { exec } from 'child_process';
import { promisify } from 'util';
import type { SceneChange } from '@easy-video/shared';

const execAsync = promisify(exec);

// 场景检测 - 使用 ffmpeg scdet 滤镜
export async function detectScenes(videoPath: string, threshold = 20): Promise<SceneChange[]> {
  try {
    const { stdout, stderr } = await execAsync(
      `ffmpeg -i "${videoPath}" -vf "scdet=threshold=${threshold}:sc_pass=true" -f null - 2>&1`
    );

    // 解析 ffmpeg 输出中的场景变化信息
    return parseSceneChanges(stderr);
  } catch (error) {
    // ffmpeg 返回非零退出码时，stderr 仍包含输出
    const stderr = (error as any).stderr || '';
    return parseSceneChanges(stderr);
  }
}

// 解析场景变化输出
function parseSceneChanges(output: string): SceneChange[] {
  const scenes: SceneChange[] = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // 匹配 lavfi.scd.score 和 lavfi.scd.time
    const scoreMatch = line.match(/lavfi\.scd\.score=(\d+)/);
    const timeMatch = line.match(/lavfi\.scd\.time=([\d.]+)/);

    if (scoreMatch && timeMatch) {
      const score = parseInt(scoreMatch[1], 10);
      const timestamp = parseFloat(timeMatch[1]);

      // 只保留显著的场景变化（分数 > 阈值）
      if (score > 15) {
        scenes.push({
          timestamp,
          score,
          type: determineTransitionType(score),
        });
      }
    }
  }

  return scenes;
}

// 根据分数判断转场类型
function determineTransitionType(score: number): 'cut' | 'fade' | 'dissolve' {
  if (score > 50) return 'cut';
  if (score > 30) return 'fade';
  return 'dissolve';
}

// 获取场景边界时间点
export function getSceneBoundaries(scenes: SceneChange[], videoDuration: number): number[] {
  if (scenes.length === 0) {
    // 没有检测到场景变化，按固定间隔分段
    const interval = 30; // 30秒
    const boundaries: number[] = [];
    for (let t = interval; t < videoDuration; t += interval) {
      boundaries.push(t);
    }
    return boundaries;
  }

  // 使用场景变化点作为边界
  return scenes.map(s => s.timestamp);
}