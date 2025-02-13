const quotes = [
  "Believe you can and you're halfway there.",
  "You are capable of amazing things!",
  "Make today amazing!",
  "Small steps lead to big changes.",
  "Your potential is limitless!"
];

const reminders = [
  "Time for a water break!",
  "Have you done your burpees today?",
  "Remember to stretch!",
  "Take a deep breath.",
  "Stand up and move around!"
];

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function createSplitWidget() {
  const widgetContainer = document.createElement('div');
  widgetContainer.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    margin: 10px;
    border-radius: 8px;
    background: white;
    font-family: Arial, sans-serif;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    min-width: 300px;
  `;

  // Quote Section
  const quoteSection = document.createElement('div');
  quoteSection.style.cssText = `
    padding: 15px;
    border-radius: 8px;
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    color: white;
    text-align: center;
  `;
  quoteSection.textContent = getRandomItem(quotes);

  // Reminder Section
  const reminderSection = document.createElement('div');
  reminderSection.style.cssText = `
    padding: 15px;
    border-radius: 8px;
    background: linear-gradient(135deg, #FF8C42, #FFA07A);
    color: white;
    text-align: center;
  `;
  reminderSection.textContent = getRandomItem(reminders);

  // Quick Add Section
  const quickAddSection = document.createElement('div');
  quickAddSection.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px;
    border-radius: 8px;
    background: #f5f5f5;
  `;

  // Quick Add Reminder
  const reminderInput = document.createElement('input');
  reminderInput.placeholder = '+ Add Quick Reminder';
  reminderInput.style.cssText = `
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 5px;
  `;

  // Quick Add Note
  const noteInput = document.createElement('textarea');
  noteInput.placeholder = '+ Add Note';
  noteInput.style.cssText = `
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    resize: vertical;
    min-height: 60px;
  `;

  // Save Button
  const saveButton = document.createElement('button');
  saveButton.textContent = 'Save';
  saveButton.style.cssText = `
    padding: 8px;
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  `;

  saveButton.addEventListener('click', () => {
    const reminderText = reminderInput.value;
    const noteText = noteInput.value;

    if (reminderText || noteText) {
      chrome.storage.sync.get(['customReminders', 'notes'], (data) => {
        const reminders = data.customReminders || [];
        const notes = data.notes || [];

        if (reminderText) {
          reminders.push({
            text: reminderText,
            frequency: 'daily',
            category: 'quick',
            created: new Date().toISOString(),
            completions: 0
          });
        }

        if (noteText) {
          notes.push({
            text: noteText,
            created: new Date().toISOString(),
            associated_reminder: reminderText || null
          });
        }

        chrome.storage.sync.set({ 
          customReminders: reminders,
          notes: notes 
        }, () => {
          reminderInput.value = '';
          noteInput.value = '';
          
          // Show success message
          const success = document.createElement('div');
          success.textContent = 'Saved!';
          success.style.cssText = `
            color: green;
            text-align: center;
            padding: 5px;
          `;
          quickAddSection.appendChild(success);
          setTimeout(() => success.remove(), 2000);
        });
      });
    }
  });

  // Assemble the widget
  quickAddSection.appendChild(reminderInput);
  quickAddSection.appendChild(noteInput);
  quickAddSection.appendChild(saveButton);

  widgetContainer.appendChild(quoteSection);
  widgetContainer.appendChild(reminderSection);
  widgetContainer.appendChild(quickAddSection);

  return widgetContainer;
}

function updateStats(newStats) {
  chrome.storage.sync.get(['stats', 'currentPageStats'], (data) => {
    const stats = data.stats || {};
    const currentPageStats = data.currentPageStats || {};
    
    // Update total stats
    stats.totalAdsReplaced = (stats.totalAdsReplaced || 0) + newStats.adsReplaced;
    stats.totalQuotesShown = (stats.totalQuotesShown || 0) + newStats.quotesShown;
    stats.totalRemindersShown = (stats.totalRemindersShown || 0) + newStats.remindersShown;
    
    // Update current page stats
    currentPageStats.url = window.location.href;
    currentPageStats.adsReplaced = (currentPageStats.adsReplaced || 0) + newStats.adsReplaced;
    currentPageStats.quotesShown = (currentPageStats.quotesShown || 0) + newStats.quotesShown;
    currentPageStats.remindersShown = (currentPageStats.remindersShown || 0) + newStats.remindersShown;
    
    chrome.storage.sync.set({ stats, currentPageStats });
  });
}

function handleReminderCompletion(reminderText) {
  chrome.storage.sync.get('reminderCompletions', (data) => {
    const completions = data.reminderCompletions || {};
    completions[reminderText] = (completions[reminderText] || 0) + 1;
    chrome.storage.sync.set({ reminderCompletions });
  });
}

function replaceAds() {
  chrome.storage.sync.get('settings', (data) => {
    const settings = data.settings || { showQuotes: true, showReminders: true };
    
    const adSelectors = [
      '[class*="ad-"]',
      '[class*="advertisement"]',
      '[id*="ad-"]',
      '[id*="advertisement"]',
      '[aria-label*="advertisement"]',
      'ins.adsbygoogle'
    ];
    
    const adElements = document.querySelectorAll(adSelectors.join(','));
    
    let newStats = {
      adsReplaced: 0,
      quotesShown: 0,
      remindersShown: 0
    };
    
    adElements.forEach((ad) => {
      if (ad.dataset.processed) return;
      
      if (settings.showQuotes || settings.showReminders) {
        const widget = createSplitWidget();
        ad.parentNode.replaceChild(widget, ad);
        
        newStats.adsReplaced++;
        if (settings.showQuotes) newStats.quotesShown++;
        if (settings.showReminders) newStats.remindersShown++;
      }
      
      ad.dataset.processed = 'true';
    });
    
    if (newStats.adsReplaced > 0) {
      updateStats(newStats);
    }
  });
}

// Initial replacement
replaceAds();

// Watch for dynamic content changes
const observer = new MutationObserver(replaceAds);
observer.observe(document.body, {
  childList: true,
  subtree: true
});
