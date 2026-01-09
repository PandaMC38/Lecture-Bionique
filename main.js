const { app, BrowserWindow, clipboard } = require('electron');
const path = require('path');

// Variables
let mainWindow;
let splashWindow;
let lastClipboardContent = '';

function createWindow() {
    // 1. Create Splash Sreen
    splashWindow = new BrowserWindow({
        width: 300,
        height: 300,
        transparent: false, // Set true if you handle transparency in CSS
        frame: false,
        alwaysOnTop: true,
        resizable: false,
        center: true
    });
    splashWindow.loadFile('splash.html');

    // 2. Create Main Window (Hidden initially)
    mainWindow = new BrowserWindow({
        width: 600,
        height: 400,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: "Lecteur Bionique",
        autoHideMenuBar: true,
        show: false // Don't show yet
    });

    mainWindow.loadFile('index.html');

    // 3. Wait for Main Window to be ready + artificial delay for smoothness
    mainWindow.once('ready-to-show', () => {
        setTimeout(() => {
            if (splashWindow && !splashWindow.isDestroyed()) {
                splashWindow.close();
            }
            mainWindow.show();
        }, 2000); // 2 seconds splash screen
    });
}

function checkClipboard() {
    const text = clipboard.readText();
    if (text !== lastClipboardContent && text.trim().length > 0) {
        lastClipboardContent = text;
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('new-text', text);
        }
    }
}

app.whenReady().then(() => {
    createWindow();

    // Check clipboard every 1 second
    setInterval(checkClipboard, 1000);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
