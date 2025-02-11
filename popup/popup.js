document.getElementById('save').addEventListener('click', () => {
    const settings = {
        showQuotes: document.getElementById('quotes').checked,
        showReminders: document.getElementById('reminders').checked
    };
    chrome.storage.sync.set({ settings }, () => {
        alert('Settings saved!')
    });
});

// Load saved settings

chrome.storage.sync.get('settings', (data) => {
    if (data.settings) {
        document.getElementById('quotes').checked = data.settings.showQuotes;
        document.getElementById('reminders').checked = data.settings.showReminders;
    }
});