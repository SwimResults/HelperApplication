const {app, BrowserWindow} = require('electron/main')
const path = require('node:path')
const dgram = require('node:dgram')

function createWindow() {
  console.log('createWindow');

  const win = new BrowserWindow({
    width: 900,
    height: 650,
    icon: `file://${__dirname}/dist/assets/logo.png`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  win.loadURL(`file://${__dirname}/dist/swim-results-helper-application/index.html`)


  //let socket = dgram.createSocket({ type: 'udp4', reuseAddr: true, reusePort: true });
  //socket.bind(26);

  //win.webContents.openDevTools()
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
