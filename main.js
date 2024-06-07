const { app, BrowserWindow, Menu, systemPreferences } = require('electron');
const path = require('path');
const ping = require('ping');

const target = "google.com";
const maxping = 2000;
function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    alwaysOnTop: true, 
    resizable: true,
    transparent: true, 
    frame: false 
  });

  win.loadFile('index.html');
  Menu.setApplicationMenu(null); 

  win.webContents.on('did-finish-load', () => {
    let sysColor;
    try {
      sysColor = systemPreferences.getAccentColor();
    } catch{
      sysColor = '0000ff00';
    }
    win.webContents.send('set-value',  [sysColor, maxping] );
  });
  pingServer();
  async function pingServer() {
    try {
      const res = await ping.promise.probe(target, {timeout: maxping / 1000});
      win.webContents.send('ping', { alive: res.alive, time: res.time, pl: res.packetLoss});
    } catch (error) {
      console.log("ping failed");
      win.webContents.send('ping', { alive: false, time: 0, pl: res.packetLoss });
    }
    pingServer();
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log("closing...");
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

console.log("starting...");
