const path = require('path');
const electron = require('electron');

function createWindow () {
  const mainWindow = new electron.BrowserWindow({
    alwaysOnTop: true,
    autoHideMenuBar: true,
    closable: false,
    frame: false,
    fullscreen: false,
    fullscreenable: false,
    hasShadow: false,
    height: 450,
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
    width: 620,
    x: 180,
    y: 550
  });

  mainWindow.loadFile('./index.html');
}

electron.app.whenReady().then(() => {
  createWindow();
});

electron.app.on('window-all-closed', () => {
  electron.app.quit();
});
