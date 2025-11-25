import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  injectScript: (script: string) => ipcRenderer.invoke('inject-script', script),
  navigateTo: (url: string) => ipcRenderer.invoke('navigate-to', url),
  getPageContent: () => ipcRenderer.invoke('get-page-content'),
  findAPIKeys: () => ipcRenderer.invoke('find-api-keys'),
  findIframes: () => ipcRenderer.invoke('find-iframes'),
  onNetworkRequest: (callback: (data: any) => void) => {
    ipcRenderer.on('network-request', (_, data) => callback(data));
  },
  onNetworkResponse: (callback: (data: any) => void) => {
    ipcRenderer.on('network-response', (_, data) => callback(data));
  },
  removeNetworkListeners: () => {
    ipcRenderer.removeAllListeners('network-request');
    ipcRenderer.removeAllListeners('network-response');
  },
});

