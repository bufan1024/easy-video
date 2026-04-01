# Easy Video - AI 自动剪辑应用

一个本地运行的 AI 自动剪辑桌面应用，自动从长视频中提取精华片段。

## 功能特性

- 🎬 本地视频文件选择
- 🤖 AI 语音转录 (FunASR 预留接口)
- 📝 智能内容评分 (Ollama 预留接口)
- ✂️ 自动片段提取与拼接
- 🖥️ 跨平台桌面应用 (macOS / Windows)

## 技术栈

| 层级 | 技术 |
|------|------|
| 包管理 | pnpm + Monorepo |
| 桌面应用 | Electron + React + Ant Design |
| 后端服务 | Fastify + TypeScript |
| 视频处理 | FFmpeg (ffmpeg-static) |
| AI-ASR | FunASR (预留) |
| AI-LLM | Ollama + Qwen2.5 (预留) |

## 项目结构

```
easy-video/
├── packages/
│   ├── shared/           # 共享类型定义
│   │   └── types/        # TypeScript 类型
│   │
│   ├── server/           # 后端服务
│   │   └── src/
│   │       ├── routes/   # API 路由
│   │       ├── services/ # 业务逻辑 (FFmpeg, ASR, Scorer)
│   │       └── storage.ts # 本地文件存储
│   │
│   └── desktop/          # 桌面应用
│       ├── electron/     # Electron 主进程
│       └── src/          # React 渲染进程
│           ├── pages/    # 页面组件
│           ├── hooks/    # 自定义 Hooks
│           └── services/ # API 调用
│
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 9+

### 安装依赖

```bash
pnpm install
```

### 开发模式

**方式一：同时启动后端和桌面应用**

```bash
pnpm dev
```

**方式二：分别启动**

```bash
# 终端 1：启动后端服务
pnpm dev:server

# 终端 2：启动桌面应用
pnpm dev:desktop
```

### 访问地址

- 后端 API: http://localhost:3001
- 前端开发服务器: http://localhost:3000

## 使用流程

1. **选择视频** - 点击「选择视频文件」按钮，选择本地视频
2. **开始处理** - 点击「开始处理」，等待 AI 分析
3. **预览片段** - 查看提取的精华片段，可删除或锁定
4. **导出视频** - 点击「开始导出」，生成剪辑后的视频

## 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 同时启动后端和桌面应用 |
| `pnpm dev:server` | 仅启动后端服务 |
| `pnpm dev:desktop` | 仅启动桌面应用 |
| `pnpm build` | 构建桌面应用 |
| `pnpm build:server` | 构建后端服务 |

## 数据存储

应用数据存储在用户目录下：

```
~/.easy-video/data/
├── videos/       # 原视频
├── outputs/      # 导出视频
├── transcripts/  # 转录数据
├── temp/         # 临时文件
└── tasks/        # 任务状态
```

## AI 服务配置 (可选)

### FunASR 语音识别

```bash
docker run -d -p 10095:10095 \
  -v ./models:/workspace/models \
  registry.cn-hangzhou.aliyuncs.com/funasr_repo/funasr:funasr-runtime-sdk-online-cpu-0.1.12
```

### Ollama 内容评分

```bash
# 安装 Ollama
brew install ollama  # macOS

# 下载模型
ollama pull qwen2.5:7b

# 启动服务
ollama serve
```

## 打包发布

```bash
# macOS
pnpm package:mac

# Windows
pnpm package:win
```

打包产物位于 `packages/desktop/release/` 目录。

## 开发说明

### API 路由

| 路径 | 方法 | 说明 |
|------|------|------|
| `/api/video/process` | POST | 开始处理视频 |
| `/api/task/:id` | GET | 获取任务状态 |
| `/api/task/:id/segments` | GET | 获取片段列表 |
| `/api/task/:id/segments/:sid` | PATCH | 更新片段状态 |
| `/api/task/:id/export` | POST | 导出视频 |

### 页面路由

| 路径 | 说明 |
|------|------|
| `/` | 上传页 |
| `/process/:taskId` | 处理页 |
| `/preview/:taskId` | 预览页 |
| `/export/:taskId` | 导出页 |

## License

MIT