import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('feather', {
      loadFeatherFile: (filePath: string) => {
        return new Promise((resolve, reject) => {
          ipcRenderer.send('load-feather-file', filePath)
          ipcRenderer.once('load-feather-file-reply', (event, response) => {
            if (response instanceof Error) {
              reject(response)
            } else {
              resolve(response)
            }
          })
        })
      },
      queryGlobalTable: (query?: { select?: string[] }) => {
        return new Promise((resolve, reject) => {
          ipcRenderer.send('query-global-table', query)
          ipcRenderer.once('query-global-table-reply', (event, response) => {
            if (response instanceof Error) {
              reject(response)
            } else {
              resolve(response)
            }
          })
        })
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
