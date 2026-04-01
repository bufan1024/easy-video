// Electron API 类型声明
declare global {
  interface Window {
    electronAPI: {
      selectVideoFile: () => Promise<string | null>;
      saveOutputFile: (defaultName: string) => Promise<string | null>;
    };
  }
}

export {};