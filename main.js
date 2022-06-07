const path = require('path');
const electron = require('electron');
const PDFWindow = require('electron-pdf-window');
const config = require('./config.json');

const options = {
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
    preload: path.join(__dirname, 'preload.js')
  },
  width: config.width,
  x: config.x,
  y: config.y
};

let main;
let pdf;

function createMainWindow () {
  main = new electron.BrowserWindow(options);
  main.loadFile('./index.html');
}

function createPDFWindow () {
  pdf = new PDFWindow({
    ...options,
    opacity: 0.25
  });
  pdf.loadURL(path.join(__dirname, 'assets', 'test.pdf'));

  pdf.minimize();
}

electron.app.whenReady().then(() => {
  createMainWindow();
  createPDFWindow();

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
    if (!pdf.isMinimized()) {
      const opacity = pdf.getOpacity();
      pdf.setOpacity(Math.min(1, Math.max(0.05, opacity - 0.05)));
    }
  });

  electron.globalShortcut.register('Alt+W', () => {
    if (!pdf.isMinimized()) {
      const opacity = pdf.getOpacity();
      pdf.setOpacity(Math.min(1, Math.max(0.05, opacity + 0.05)));
    }
  });

  electron.ipcMain.on('hide', () => {
    main.minimize();
  });
});

electron.app.on('window-all-closed', () => {
  electron.app.quit();

  electron.globalShortcut.unregisterAll();
});
