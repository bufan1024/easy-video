import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  selectVideoFile: () => ipcRenderer.invoke('select-video-file'),
  saveOutputFile: (defaultName: string) => ipcRenderer.invoke('save-output-file', defaultName),
});