import { app, BrowserWindow, ipcMain, desktopCapturer, session } from "electron";
import path from "path";
import { fileURLToPath } from "url";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = path.dirname(__filename$1);
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
let mainWindow = null;
function createWindow() {
  console.log("Creating Electron window...");
  console.log("isDev:", isDev);
  console.log("__dirname:", __dirname$1);
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ["media", "mediaKeySystem", "display-capture"];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });
  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ["screen", "window"] }).then((sources) => {
      if (sources.length > 0) {
        callback({ video: sources[0], audio: "loopback" });
      }
    });
  });
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: "#0F0F1A",
    // Match Connectra dark background
    frame: true,
    autoHideMenuBar: true,
    // Hide File, Edit, View, etc. menu bar
    webPreferences: {
      preload: path.join(__dirname$1, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
      // Disable sandbox for debugging
    },
    show: true
    // Show immediately
  });
  console.log("Window created, loading content...");
  mainWindow.webContents.on("render-process-gone", (event, details) => {
    console.error("Render process gone:", details.reason, details.exitCode);
  });
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("Failed to load:", errorCode, errorDescription);
  });
  mainWindow.on("unresponsive", () => {
    console.error("Window became unresponsive");
  });
  mainWindow.on("close", (event) => {
    console.log("Window is closing...");
  });
  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    console.log("Loading from Vite dev server:", devUrl);
    mainWindow.loadURL(devUrl).then(() => {
      console.log("Successfully loaded Vite dev server");
    }).catch((err) => {
      console.error("Failed to load Vite dev server:", err);
    });
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname$1, "../dist/index.html");
    console.log("Loading production build from:", indexPath);
    mainWindow.loadFile(indexPath).then(() => {
      console.log("Successfully loaded production build");
    }).catch((err) => {
      console.error("Failed to load production build:", err);
    });
  }
  mainWindow.on("closed", () => {
    console.log("Window closed");
    mainWindow = null;
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("web-contents-created", (_, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });
});
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});
ipcMain.handle("is-dev", () => {
  return isDev;
});
ipcMain.handle("get-desktop-sources", async () => {
  const sources = await desktopCapturer.getSources({
    types: ["screen", "window"],
    thumbnailSize: { width: 320, height: 180 }
  });
  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL()
  }));
});
