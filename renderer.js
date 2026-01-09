const { ipcRenderer } = require('electron');

const contentDiv = document.getElementById('content');
const welcomeDiv = document.getElementById('welcome-message');

// UI Controls
const btnPause = document.getElementById('btn-pause');
const btnRead = document.getElementById('btn-read');
const selectTheme = document.getElementById('select-theme');
const selectFont = document.getElementById('select-font');
const rangeSize = document.getElementById('range-size');
const appDiv = document.getElementById('app');

// State
let isPaused = false;
let currentText = "";
let isReading = false;

// Initialize Preferences
function loadPreferences() {
    const theme = localStorage.getItem('theme') || 'light';
    const font = localStorage.getItem('font') || "'Segoe UI', Inter, sans-serif";
    const size = localStorage.getItem('size') || '18';

    setTheme(theme);
    setFont(font);
    setSize(size);

    // Update UI controls to match
    if (selectTheme) selectTheme.value = theme;
    if (selectFont) selectFont.value = font;
    if (rangeSize) rangeSize.value = size;
}

// Bionic Logic
function toBionic(text) {
    const safeText = text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    return safeText.split(/(\s+)/).map(part => {
        if (part.trim().length === 0) return part;
        const word = part;
        const length = word.length;
        if (length === 1) return `<b>${word}</b>`;
        const boldLength = Math.ceil(length / 2);
        return `<span class="bionic-word"><b>${word.substring(0, boldLength)}</b>${word.substring(boldLength)}</span>`;
    }).join('');
}

// Event Handling
ipcRenderer.on('new-text', (event, text) => {
    if (isPaused) return;

    // Reset TTS if new text arrives
    if (isReading) stopReading();

    currentText = text;
    if (welcomeDiv) welcomeDiv.style.display = 'none';

    contentDiv.innerHTML = toBionic(text);
    window.scrollTo(0, 0);
});

// Controls Logic
if (btnPause) {
    btnPause.addEventListener('click', () => {
        isPaused = !isPaused;
        btnPause.classList.toggle('active', isPaused);
        btnPause.innerText = isPaused ? "⏸️" : "👁️";
    });
}

if (btnRead) {
    btnRead.addEventListener('click', () => {
        if (isReading) {
            stopReading();
        } else {
            if (!currentText && contentDiv.innerText) {
                // If text was already there before load or reload
                currentText = contentDiv.innerText;
            }
            if (!currentText) return;
            startReading(currentText);
        }
    });
}

function startReading(text) {
    isReading = true;
    btnRead.classList.add('active');
    btnRead.innerText = "🔇"; // Icon to stop

    // Clean text for speech (remove HTML tags if any leaks, though standard text is safer)
    // Actually we should speak the raw text, not the HTML bionic one.
    // currentText contains raw text from clipboard.

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR'; // Default to French
    utterance.onend = () => stopReading();
    utterance.onerror = () => stopReading();

    window.speechSynthesis.speak(utterance);
}

function stopReading() {
    isReading = false;
    btnRead.classList.remove('active');
    btnRead.innerText = "🔊";
    window.speechSynthesis.cancel();
}

// Theme
if (selectTheme) {
    selectTheme.addEventListener('change', (e) => {
        setTheme(e.target.value);
        localStorage.setItem('theme', e.target.value);
    });
}

function setTheme(theme) {
    document.body.className = ''; // Reset
    if (theme !== 'light') {
        document.body.classList.add(`theme-${theme}`);
    }
}

// Font
if (selectFont) {
    selectFont.addEventListener('change', (e) => {
        setFont(e.target.value);
        localStorage.setItem('font', e.target.value);
    });
}

function setFont(fontFamily) {
    document.body.style.fontFamily = fontFamily;
}

// Text Size
if (rangeSize) {
    rangeSize.addEventListener('input', (e) => {
        setSize(e.target.value);
    });
    rangeSize.addEventListener('change', (e) => {
        localStorage.setItem('size', e.target.value);
    });
}

function setSize(size) {
    contentDiv.style.fontSize = `${size}px`;
}

// Init
// Wait for DOM to be fully ready just in case script is loaded in head (though it is at body end)
document.addEventListener('DOMContentLoaded', loadPreferences);
// Also call it now if already ready
loadPreferences();
