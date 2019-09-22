'use strict'

import { app, BrowserWindow, shell, Menu } from 'electron'
import contextMenu from 'electron-context-menu'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
    // webPreferences: {
    //   webSecurity: false
    // }
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', () => {
  createWindow()
  createAppMenu()
  createContextMenu()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
    createAppMenu()
    createContextMenu()
  }
})

/**
 * Configure application menu
 */
function createAppMenu () {
  const application = {
    label: 'Application',
    submenu: [
      {
        label: 'About Application',
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit()
        }
      }
    ]
  }

  const edit = {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectAll'
      }
    ]
  }

  const template = [application, edit]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

/**
 * Configure context menu
 * https://github.com/sindresorhus/electron-context-menu
 */
function createContextMenu () {
  contextMenu({
    labels: {
      cut: 'Cut',
      copy: 'Copy',
      paste: 'Paste'
    },
    showCopyImage: false,
    showCopyImageAddress: false,
    showLookUpSelection: false,
    append: (defaultActions, params, browserWindow) => [
      {
        role: 'selectAll',
        label: 'Select All',
        visible: params.isEditable
      },
      {
        label: 'Search Google for “{selection}”',
        // Only show it when right-clicking text
        visible: params.selectionText.trim().length > 0,
        click: () => {
          shell.openExternal(`https://google.com/search?q="${encodeURIComponent(params.selectionText)}"`)
        }
      }
    ]
  })
}

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
