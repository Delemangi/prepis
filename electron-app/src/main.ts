import * as electron from 'electron';
import * as path from 'node:path';

import { config } from './config.js';

type WindowOptions = {
  alwaysOnTop: boolean;
  autoHideMenuBar: boolean;
  closable: boolean;
  frame: boolean;
  fullscreen: boolean;
  fullscreenable: boolean;
  hasShadow: boolean;
  height: number;
  maximizable: boolean;
  minimizable: boolean;
  movable: boolean;
  resizable: boolean;
  skipTaskbar: boolean;
  thickFrame: boolean;
  title: string;
  transparent: boolean;
  webPreferences: {
    preload: string;
    sandbox?: boolean;
  };
  width: number;
  x: number;
  y: number;
};

const options: WindowOptions = {
  alwaysOnTop: true,
  autoHideMenuBar: true,
  closable: false,
  frame: false,
  fullscreen: false,
  fullscreenable: false,
  hasShadow: false,
  height: config.height,
  maximizable: false,
  minimizable: false,
  movable: false,
  resizable: false,
  skipTaskbar: true,
  thickFrame: false,
  title: '',
  transparent: true,
  webPreferences: {
    preload: path.join(import.meta.dirname, 'preload.js'),
    sandbox: false
  },
  width: config.width,
  x: config.x,
  y: config.y
};

const createMainWindow = (): electron.BrowserWindow => {
  const mainWindow = new electron.BrowserWindow(options);
  void mainWindow.loadFile(path.join(
    import.meta.dirname,
    '..',
    'public',
    'index.html'
  ));

  return mainWindow;
};

const createPDFWindow = (): electron.BrowserWindow => {
  const pdfWindow = new electron.BrowserWindow({
    ...options,
    opacity: 0.25,
    webPreferences: {
      ...options.webPreferences,
      plugins: true
    }
  });
  void pdfWindow.loadFile(path.join(
    import.meta.dirname,
    '..',
    '..',
    'assets',
    'test.pdf'
  ));

  pdfWindow.minimize();

  return pdfWindow;
};

await electron.app.whenReady();

const main = createMainWindow();
const pdf = createPDFWindow();

electron.globalShortcut.register('Esc', () => {
  if (main.isMinimized()) {
    main.restore();
  } else {
    main.minimize();
  }
});

electron.globalShortcut.register('Shift+Esc', () => {
  if (pdf.isMinimized()) {
    pdf.restore();
  } else {
    pdf.minimize();
  }
});

electron.globalShortcut.register('Alt+S', () => {
  if (pdf.isMinimized()) {
    return;
  }

  const opacity = pdf.getOpacity();
  pdf.setOpacity(Math.min(1, Math.max(0.05, opacity - 0.05)));
});

electron.globalShortcut.register('Alt+W', () => {
  if (pdf.isMinimized()) {
    return;
  }

  const opacity = pdf.getOpacity();
  pdf.setOpacity(Math.min(1, Math.max(0.05, opacity + 0.05)));
});

electron.ipcMain.on('hide', () => {
  main.minimize();
});

electron.app.on('window-all-closed', () => {
  electron.app.quit();

  electron.globalShortcut.unregisterAll();
});
