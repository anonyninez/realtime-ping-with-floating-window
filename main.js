const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const ping = require('ping');

const interval = 100;

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 200,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    },
    alwaysOnTop: true,  // Keep the window always on top
    resizable: true,    // Allow the window to be resized
    transparent: true,  // Make the window transparent
    frame: false 
  });

  win.loadFile('index.html');
  Menu.setApplicationMenu(null); 

  setInterval(async () => {
	try {
		const res = await ping.promise.probe("google.com", {timeout:interval/1000});
		// console.log(res.time);
		win.webContents.send('ping', { alive : res.alive, time: res.time });
	} catch (error) {
		console.log("ping fail");
		win.webContents.send('ping', { alive : res.alive, time: interval });
	}
  }, interval);
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
