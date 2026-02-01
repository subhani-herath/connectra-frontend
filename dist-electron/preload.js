import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  // App info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  isDev: () => ipcRenderer.invoke("is-dev"),
  // Platform info
  platform: process.platform,
  // Window controls (can be expanded)
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  // Screen sharing
  getDesktopSources: () => ipcRenderer.invoke("get-desktop-sources")
});
