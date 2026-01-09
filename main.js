const { app, BrowserWindow, clipboard } = require('electron');
const path = require('path');

let mainWindow;
let lastClipboardContent = '';

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 400,
        alwaysOnTop: true, // Keep it visible for "clipboard gadget" feel
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // For simple prototyping/IPC
        },
        title: "Lecteur Bionique",
        autoHideMenuBar: true
    });

    mainWindow.loadFile('index.html');
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
