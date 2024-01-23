import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import { loadFeatherFile, queryGlobalTable, tableToJson } from './feather'
import { queryParquetFile, getAllColumns } from './parquet'
import { getResourceList, getCategories } from './resources'

import icon from '../../resources/icon.png?asset'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('load-feather-file', async (event, filePath: string) => {
  try {
    const table = await loadFeatherFile(filePath)
    event.reply('load-feather-file-reply', table)
  } catch (error) {
    event.reply('load-feather-file-reply', error)
  }
})

ipcMain.on('query-global-table', (event, query?: { select?: string[] }) => {
  try {
    const table = queryGlobalTable(query)
    const json = tableToJson(table)

    event.reply('query-global-table-reply', json)
  } catch (error) {
    event.reply('query-global-table-reply', error)
  }
})

ipcMain.on('query-parquet-file', async (event, filePath: string, query?: string[]) => {
  try {
    const json = await queryParquetFile(filePath, query)
    event.reply('query-parquet-file-reply', json)
  } catch (error) {
    event.reply('query-parquet-file-reply', error)
  }
});

ipcMain.on('get-parquet-columns', async (event, filePath: string) => {
  try {
    const columns = await getAllColumns(filePath)
    event.reply('get-parquet-columns-reply', columns)
  } catch (error) {
    event.reply('get-parquet-columns-reply', error)
  }
});

ipcMain.on('get-resource-list', async (event, dirPath: string) => {
  try {
    const files = await getResourceList(dirPath)
    event.reply('get-resource-list-reply', files)
  } catch (error) {
    event.reply('get-resource-list-reply', error)
  }
});

ipcMain.on('get-resource-categories', async (event, path: string) => {
  try {
    const categories = await getCategories(path)
    event.reply('get-resource-categories-reply', categories)
  } catch (error) {
    event.reply('get-resource-categories-reply', error)
  }
});