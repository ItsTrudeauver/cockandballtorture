const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,  // Recommended for security reasons
            contextIsolation: true   // Important for security as well
        },
    });

    // Ensure the path to the 'index.html' is correct (production build)
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));

    // Open DevTools for debugging (optional)
    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});
