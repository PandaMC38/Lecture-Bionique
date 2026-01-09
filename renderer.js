const { ipcRenderer } = require('electron');

const contentDiv = document.getElementById('content');
const welcomeDiv = document.getElementById('welcome-message');

function toBionic(text) {
    // Escape HTML to prevent XSS if copying malicious code
    const safeText = text.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Split by spaces but preserve newlines
    return safeText.split(/(\s+)/).map(part => {
        if (part.trim().length === 0) return part; // Return whitespace as is

        const word = part;
        const length = word.length;

        if (length === 1) {
            return `<b>${word}</b>`;
        }

        const boldLength = Math.ceil(length / 2);
        const boldPart = word.substring(0, boldLength);
        const normalPart = word.substring(boldLength);

        return `<span class="bionic-word"><b>${boldPart}</b>${normalPart}</span>`;
    }).join('');
}

ipcRenderer.on('new-text', (event, text) => {
    if (welcomeDiv) {
        welcomeDiv.style.display = 'none';
    }

    // Simple logic: replace content. Could be improved to append or history.
    contentDiv.innerHTML = toBionic(text);

    // Scroll to top
    window.scrollTo(0, 0);
});
