import { app, BrowserWindow, BrowserView, session, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let browserView: BrowserView | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Allow CORS and cross-origin requests for reverse engineering
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a1a',
  });

  // Load the renderer
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    browserView = null;
  });
}

function createBrowserView(url: string) {
  if (!mainWindow) return;

  // Remove existing browser view if any
  if (browserView) {
    mainWindow.removeBrowserView(browserView);
    browserView = null;
  }

  browserView = new BrowserView({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  mainWindow.setBrowserView(browserView);
  
  const bounds = mainWindow.getBounds();
  browserView.setBounds({
    x: 200, // After sidebar
    y: 56, // Below header
    width: bounds.width - 200, // Account for sidebar
    height: bounds.height - 56 - 300, // Account for header and tools panel
  });

  browserView.webContents.loadURL(url);

  // Update bounds on window resize
  const updateBounds = () => {
    if (browserView && mainWindow) {
      const bounds = mainWindow.getBounds();
      browserView.setBounds({
        x: 200, // After sidebar
        y: 56, // Below header
        width: bounds.width - 200, // Account for sidebar
        height: bounds.height - 56 - 300, // Account for header and tools panel
      });
    }
  };
  
  mainWindow.on('resize', updateBounds);
}

// Set up session to intercept network requests
app.whenReady().then(() => {
  const ses = session.defaultSession;

  // Intercept all network requests from browser view
  ses.webRequest.onBeforeRequest((details, callback) => {
    // Send request details to renderer
    if (mainWindow && browserView && details.webContentsId === browserView.webContents.id) {
      mainWindow.webContents.send('network-request', {
        id: details.id,
        url: details.url,
        method: details.method,
        timestamp: Date.now(),
        type: 'request',
        requestHeaders: details.requestHeaders,
      });
    }
    callback({});
  });

  ses.webRequest.onCompleted((details) => {
    if (mainWindow && browserView && details.webContentsId === browserView.webContents.id) {
      mainWindow.webContents.send('network-response', {
        id: details.id,
        url: details.url,
        statusCode: details.statusCode,
        statusLine: details.statusLine,
        timestamp: Date.now(),
        type: 'response',
        responseHeaders: details.responseHeaders,
      });
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('inject-script', async (event, script: string) => {
  if (browserView) {
    await browserView.webContents.executeJavaScript(script);
    return { success: true };
  }
  return { success: false, error: 'No browser view available' };
});

ipcMain.handle('navigate-to', async (event, url: string) => {
  createBrowserView(url);
  return { success: true };
});

ipcMain.handle('get-page-content', async (event) => {
  if (browserView) {
    const html = await browserView.webContents.executeJavaScript('document.documentElement.outerHTML');
    return { html };
  }
  return { html: '' };
});

ipcMain.handle('find-api-keys', async (event) => {
  if (browserView) {
    const result = await browserView.webContents.executeJavaScript(`
      (() => {
        const keys = [];
        const patterns = [
          /api[_-]?key["'\\s:=]+([a-zA-Z0-9_\\-]{20,})/gi,
          /apikey["'\\s:=]+([a-zA-Z0-9_\\-]{20,})/gi,
          /secret[_-]?key["'\\s:=]+([a-zA-Z0-9_\\-]{20,})/gi,
          /access[_-]?token["'\\s:=]+([a-zA-Z0-9_\\-]{20,})/gi,
        ];
        
        const text = document.body.innerText + ' ' + document.documentElement.innerHTML;
        patterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(text)) !== null) {
            keys.push({ type: pattern.source, value: match[1] });
          }
        });
        
        return keys;
      })()
    `);
    return { keys: result };
  }
  return { keys: [] };
});

ipcMain.handle('find-iframes', async (event) => {
  if (browserView) {
    const iframes = await browserView.webContents.executeJavaScript(`
      Array.from(document.querySelectorAll('iframe')).map(iframe => ({
        src: iframe.src,
        id: iframe.id,
        name: iframe.name,
        width: iframe.width,
        height: iframe.height,
      }))
    `);
    return { iframes };
  }
  return { iframes: [] };
});

