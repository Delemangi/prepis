const path = require('path');
const electron = require('electron');
const config = require('./config.json');

let mainWindow;

function createWindow () {
  mainWindow = new electron.BrowserWindow({
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
  });

  mainWindow.loadFile('./index.html');
}

electron.app.whenReady().then(() => {
  createWindow();

  electron.globalShortcut.register('Esc', () => {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    } else {
      mainWindow.minimize();
    }
  });

  electron.ipcMain.on('hide', () => {
    mainWindow.minimize();
  });
});

electron.app.on('window-all-closed', () => {
  electron.app.quit();

  electron.globalShortcut.unregister('Esc');
});
