const { app, BrowserWindow, dialog, Menu, MenuItem } = require('electron');
const path = require('path');
const ipc = require('electron').ipcMain;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

const createWindow = () => {
  // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
    }
});

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
    mainWindow.setMenuBarVisibility(false);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Spellchecker context menu
    mainWindow.webContents.on('context-menu', (event, params) => {
        const menu = new Menu()

        for (const suggestion of params.dictionarySuggestions) {
            menu.append(new MenuItem({
                label: suggestion,
                click: () => mainWindow.webContents.replaceMisspelling(suggestion)
            }))
        }

        if (params.misspelledWord) {
            menu.append(
                new MenuItem({
                label: 'Add to dictionary',
                click: () => mainWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
                })
            )
        }

        menu.popup()
    })
};

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    
    app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

//Load Directory
ipc.on('open-folder-dialog', function (event) {
    dialog.showOpenDialog( {
        properties: ['openDirectory']
    }).then(result => {
        event.sender.send('selected-folder', result);
        //console.log(result.filePaths)
    })//.catch(err => {
    //console.log(err)
    //})
})

const createReadme = () => {
    const subWindow = new BrowserWindow({
        width: 600,
        height: 1010,
        alwaysOnTop: true,
        webPreferences: {
            //Placeholder
        }
    });

    subWindow.loadFile(path.join(__dirname, 'info.html'));
    subWindow.setMenuBarVisibility(false);
};

ipc.on('open-readme', function() {
    if (BrowserWindow.getAllWindows().length < 2) { createReadme(); }
})