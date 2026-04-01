# AI 自动剪辑 App 技术方案文档 v1.0 (简化版 - 本地优先)

## 1. 文档信息

- **项目名称**：AI 自动剪辑 App
- **文档类型**：技术方案文档
- **版本**：v1.0 简化版
- **日期**：2026-03-31
- **目标阶段**：MVP 本地运行版本
- **设计原则**：本地优先、零数据库、快速验证

---

## 2. 技术选型总览

| 层级 | 技术方案 | 选型理由 |
|------|----------|----------|
| 包管理 | pnpm + Monorepo | 高效磁盘利用、支持多包共享 |
| 前端-桌面 | Electron | 本地文件处理、无需服务器上传 |
| 后端 | TypeScript + Fastify | 本地 HTTP 服务、类型安全 |
| AI-ASR | FunASR (阿里开源) | 中文识别优秀、本地部署 |
| AI-LLM | Ollama + Qwen2.5 | 本地部署、无 API 费用 |
| 视频处理 | FFmpeg | 开源免费、行业标准 |

**简化说明**：
- 移除 PostgreSQL/Redis/MinIO - 数据存储改为本地文件系统
- 移除 Web 端 - MVP 仅开发 Electron 桌面应用
- 移除 CI/CD/监控 - 本地开发阶段暂不需要

---

## 3. 项目结构 (pnpm Monorepo)

```
easy-video/
├── packages/
│   ├── desktop/                # Electron 桌面应用
│   │   ├── main.ts             # Electron 主进程
│   │   ├── preload.ts          # 预加载脚本
│   │   ├── src/                # 渲染进程 React 代码
│   │   │   ├── pages/          # 页面组件
│   │   │   ├── components/     # UI 组件
│   │   │   └── hooks/          # 自定义 hooks
│   │   └── package.json
│   │
│   ├── server/                 # 本地 HTTP 服务
│   │   ├── src/
│   │   │   ├── routes/         # API 路由
│   │   │   ├── services/       # 业务逻辑
│   │   │   │   ├── asr.ts      # ASR 转录服务
│   │   │   │   ├── scorer.ts   # LLM 评分服务
│   │   │   │   └── video.ts    # FFmpeg 视频处理
│   │   │   ├── storage.ts      # 本地文件存储
│   │   │   └── app.ts          # 应用入口
│   │   └── package.json
│   │
│   └── shared/                 # 共享代码
│   │   ├── types/              # TypeScript 类型定义
│   │   └── package.json
│
├── data/                       # 本地数据目录 (运行时创建)
│   ├── videos/                 # 原视频文件
│   ├── outputs/                # 输出视频
│   ├── transcripts/            # 转录 JSON 文件
│   └── temp/                   # 临时处理文件
│
├── docs/                       # 文档
├── pnpm-workspace.yaml
└── package.json
```

---

## 4. 桌面应用架构 (packages/desktop)

### 4.1 页面流程

```
上传页 → 处理页 → 预览页 → 导出页
```

### 4.2 核心组件

| 组件 | 功能 |
|------|------|
| VideoUploader | 本地视频文件选择 |
| ProcessPanel | 处理进度显示 |
| SegmentTimeline | 片段时间轴、删除/锁定操作 |
| VideoPlayer | 视频预览播放 |
| ExportPanel | 导出控制、文件保存 |

### 4.3 Electron 主进程

```typescript
// packages/desktop/main.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadURL('http://localhost:3001'); // 本地服务
}

// IPC: 选择本地视频文件
ipcMain.handle('select-video-file', async () => {
  // 返回用户选择的本地视频文件路径
});

// IPC: 保存导出文件
ipcMain.handle('save-output-file', async (event, outputPath) => {
  // 返回用户选择的保存路径
});
```

---

## 5. 本地服务架构 (packages/server)

### 5.1 应用入口

```typescript
// packages/server/src/app.ts
import Fastify from 'fastify';
import { registerRoutes } from './routes';

const app = Fastify({ logger: true });

async function start() {
  await registerRoutes(app);
  await app.listen({ port: 3001, host: 'localhost' });
  console.log('本地服务启动: http://localhost:3001');
}

start();
```

### 5.2 API 路由 (简化版)

| 路径 | 方法 | 功能 |
|------|------|------|
| `/api/process` | POST | 开始处理视频 |
| `/api/process/:id` | GET | 获取处理状态 |
| `/api/process/:id/segments` | GET | 获取片段列表 |
| `/api/process/:id/segments/:sid` | PATCH | 更新片段状态 |
| `/api/export/:id` | POST | 触发导出 |

### 5.3 处理流程 (内存执行)

```typescript
// packages/server/src/services/processor.ts
export async function processVideo(videoPath: string, taskId: string) {
  const steps = [
    'extract-audio',      // FFmpeg 抽取音频
    'transcribe',         // FunASR 转录
    'segment-text',       // 文本分段
    'score-segments',     // Ollama 评分
    'select-highlights',  // 片段选择
  ];

  for (const step of steps) {
    updateProgress(taskId, step);
    await executeStep(step, videoPath, taskId);
  }
}
```

### 5.4 本地存储方案

```typescript
// packages/server/src/storage.ts
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// 存储转录结果
export async function saveTranscript(taskId: string, transcript: Transcript[]) {
  await fs.writeFile(
    path.join(DATA_DIR, 'transcripts', `${taskId}.json`),
    JSON.stringify(transcript)
  );
}

// 读取转录结果
export async function loadTranscript(taskId: string): Promise<Transcript[]> {
  const data = await fs.readFile(
    path.join(DATA_DIR, 'transcripts', `${taskId}.json`)
  );
  return JSON.parse(data.toString());
}
```

---

## 6. AI/算法服务 (本地部署)

### 6.1 FunASR (语音识别)

**本地启动命令**:

```bash
docker run -d -p 10095:10095 \
  -v ./models:/workspace/models \
  registry.cn-hangzhou.aliyuncs.com/funasr_repo/funasr:funasr-runtime-sdk-online-cpu-0.1.12
```

**调用示例**:

```typescript
// packages/server/src/services/asr.ts
import WebSocket from 'ws';

export async function transcribeAudio(audioPath: string): Promise<Transcript[]> {
  const ws = new WebSocket('ws://localhost:10095');
  // 发送音频数据，接收转录结果
  // 返回带时间戳的文本片段
}
```

### 6.2 Ollama + Qwen2.5 (评分模型)

**本地安装命令**:

```bash
# 安装 Ollama
brew install ollama  # macOS

# 下载模型
ollama pull qwen2.5:7b

# 启动服务
ollama serve
```

**调用示例**:

```typescript
// packages/server/src/services/scorer.ts
import ollama from 'ollama';

export async function scoreSegment(segment: TranscriptSegment): Promise<ScoreResult> {
  const response = await ollama.chat({
    model: 'qwen2.5:7b',
    messages: [{
      role: 'user',
      content: `请评估以下视频片段的信息价值，给出1-10分评分:

      文本内容: "${segment.text}"
      
      以JSON格式返回: {score: number, reason: string}`
    }],
  });

  return JSON.parse(response.message.content);
}
```

### 6.3 FFmpeg (视频处理)

**本地安装命令**:

```bash
brew install ffmpeg  # macOS
```

**核心命令**:

```bash
# 抽取音频
ffmpeg -i input.mp4 -vn -acodec pcm_s16le audio.wav

# 提取片段
ffmpeg -i input.mp4 -ss 00:01:30 -t 00:00:45 -c copy segment.mp4

# 拼接片段
ffmpeg -f concat -i segments.txt -c copy output.mp4

# 烧录字幕
ffmpeg -i video.mp4 -vf "subtitles=subtitle.srt" output.mp4
```

---

## 7. 本地启动指南

### 7.1 环境准备

```bash
# 1. 安装依赖
pnpm install

# 2. 启动 FunASR (Docker)
docker run -d -p 10095:10095 ...

# 3. 启动 Ollama
ollama serve

# 4. 启动本地服务
pnpm dev:server

# 5. 启动 Electron 应用
pnpm dev:desktop
```

### 7.2 开发命令

```json
// package.json
{
  "scripts": {
    "dev:server": "pnpm --filter server dev",
    "dev:desktop": "pnpm --filter desktop dev",
    "build": "pnpm --filter desktop build"
  }
}
```

---

## 8. 开发顺序建议

### Phase 1: 基础搭建 (1周)

1. 初始化 pnpm Monorepo 项目结构
2. 实现 Electron 基础框架 + 页面路由
3. 实现本地 HTTP 服务基础 API

### Phase 2: 核心功能 (2周)

4. 集成 FunASR 实现转录功能
5. 实现文本分段逻辑
6. 集成 Ollama 实现评分功能
7. 实现片段选择逻辑

### Phase 3: 视频处理 (1周)

8. 实现 FFmpeg 视频拼接
9. 实现字幕烧录
10. 完成导出流程

---

## 9. 后续扩展路径

当 MVP 验证成功后，可逐步添加：

1. **Web 端支持** - 添加 Next.js Web 应用
2. **数据库支持** - 添加 PostgreSQL 持久化存储
3. **云端部署** - Docker Compose 云服务器部署
4. **多用户支持** - 用户认证与权限管理
5. **CI/CD** - GitHub Actions 自动化流程

---

## 10. 附录

### A. 系统要求

- macOS 12+ / Windows 10+ / Linux
- Node.js 18+
- Docker (用于 FunASR)
- Ollama
- FFmpeg

### B. 参考资料

- [FunASR GitHub](https://github.com/alibaba-damo-academy/FunASR)
- [Ollama 官网](https://ollama.ai)
- [Qwen2.5 模型](https://github.com/QwenLM/Qwen2.5)
- [Electron 文档](https://electronjs.org/docs)
- [FFmpeg 文档](https://ffmpeg.org/documentation.html)