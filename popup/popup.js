function updateStats() {
    chrome.storage.sync.get(['stats', 'currentPageStats'], (data) => {
        const stats = data.stats || {};
        const currentPageStats = data.currentPageStats || {};


        // update current page stats
        const currentPageEl = document.getElementById('currentPage');
        currentPageEl.innerHTML = `
            <h4>Current Page: </h4>
            <div class="stat-item">URL: ${currentPageStats.url || 'N/A'} </div>
            <div class="stat-item">Ads Replaced: ${currentPageStats.adsReplaced || 0} </div>
            <div class="stat-item">Quotes Shown: ${currentPageStats.quotesShown || 0} </div>
            <div class="stat-item">Reminders shown: ${currentPageStats.remindersShown || 0} </div>
        
        `;

        const totalStatsEl = document.getElementById('totalStats');
        totalStatsEl.innerHTML = `
        <h4>All-Time Stats: </h4>
        <div class="stat-item">Total Ads Replaced: ${stats.totalAdsReplaced || 0} </div>
        <div class="stat-item"> Total Quotes shown: ${stats.totalQuotesShown || 0} </div>
        <div class="stat-item"> Total Quotes shown: ${stats.totalRemindersShown || 0} </div>

        
        `;
    });
};
document.getElementById('save').addEventListener('click', () => {
    const settings = {
        showQuotes: document.getElementById('quotes').checked,
        showReminders: document.getElementById('reminders').checked
    };
    chrome.storage.sync.set({ settings }, () => {
        alert('Settings saved!')
    });
});

document.getElementById('clearStats').addEventListener('click', () => {
    chrome.storage.sync.set({
        stats: {},
        currentPageStats: {}
    }, () => {
        updateStats();
        alert('Statistics cleared!')
    });
});

// Load saved settings

chrome.storage.sync.get('settings', (data) => {
    if (data.settings) {
        document.getElementById('quotes').checked = data.settings.showQuotes;
        document.getElementById('reminders').checked = data.settings.showReminders;
    }
});
updateStats();