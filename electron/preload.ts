import { contextBridge, ipcRenderer } from 'electron';

// Define the source type
interface DesktopSource {
    id: string;
    name: string;
    thumbnail: string;
}

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    // App info
    getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),
    isDev: (): Promise<boolean> => ipcRenderer.invoke('is-dev'),

    // Platform info
    platform: process.platform,

    // Window controls (can be expanded)
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),

    // Screen sharing
    getDesktopSources: (): Promise<DesktopSource[]> => ipcRenderer.invoke('get-desktop-sources'),
});

// TypeScript declarations for the exposed API
declare global {
    interface Window {
        electronAPI: {
            getAppVersion: () => Promise<string>;
            isDev: () => Promise<boolean>;
            platform: NodeJS.Platform;
            minimize: () => void;
            maximize: () => void;
            close: () => void;
            getDesktopSources: () => Promise<DesktopSource[]>;
        };
    }
}
