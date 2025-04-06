const {app, BrowserWindow} = require('electron/main')
const path = require('node:path')

function createWindow() {
  console.log('createWindow');

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: `file://${__dirname}/dist/assets/logo.png`,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'electron/preload.js')
    }
  })

  win.loadURL(`file://${__dirname}/dist/swim-results-helper-application/index.html`)

  win.webContents.openDevTools()
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
