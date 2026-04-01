import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { exec } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let serverProcess: ReturnType<typeof exec> | null = null;

// 禁用 autofill 功能，避免 DevTools 警告
app.commandLine.appendSwitch('disable-features', 'AutofillServerCommunication');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 开发环境加载 Vite 开发服务器
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// 启动本地后端服务
function startServer() {
  const serverPath = app.isPackaged
    ? path.join(process.resourcesPath, 'server')
    : path.join(__dirname, '../../server');

  serverProcess = exec('npx tsx src/app.ts', { cwd: serverPath });
}

// IPC: 选择视频文件
ipcMain.handle('select-video-file', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [{ name: 'Videos', extensions: ['mp4', 'mov', 'avi', 'mkv'] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

// IPC: 保存输出文件
ipcMain.handle('save-output-file', async (event, defaultName: string) => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultName,
    filters: [{ name: 'Videos', extensions: ['mp4'] }],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePath;
});

app.whenReady().then(() => {
  startServer();
  createWindow();
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});