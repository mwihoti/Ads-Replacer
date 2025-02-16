const quotes = [
  "Believe you can and you're halfway there.",
  "You are capable of amazing things!",
  "Make today amazing!",
  "Small steps lead to big changes.",
  "Your potential is limitless!"
];
const DEFAULT_QUOTES = [
  "Believe you can and you're halfway there.",
  "You are capable of amazing things!",
  "Make today amazing!",
  "Small steps lead to big changes.",
  "Your potential is limitless!"
];

const DEFAULT_REMINDERS = [
  "Time for a water break!",
  "Have you done your burpees today?",
  "Remember to stretch!",
  "Take a deep breath.",
  "Stand up and move around!"
];

// Keep track of used reminders to prevent repetition
let usedReminders = new Set();
let usedQuotes = new Set();

// Modified getRandomItem to handle both custom and default items with better distribution
function getRandomItem(type) {
  return new Promise((resolve) => {
    if (type === 'quote') {
      chrome.storage.sync.get('notes', (data) => {
        const customNotes = data.notes || [];
        let availableQuotes = [];

        // Changed condition to < 2 to include default quotes when there's only one custom note
        if (customNotes.length < 2) {
          // Add custom notes first
          availableQuotes = customNotes.map(n => n.text);
          
          // Add default quotes that haven't been used
          DEFAULT_QUOTES.forEach(quote => {
            if (!usedQuotes.has(quote)) {
              availableQuotes.push(quote);
            }
          });
        } else {
          // Use only custom notes if we have 2 or more
          availableQuotes = customNotes.map(n => n.text);
        }

        // Filter out already used quotes
        availableQuotes = availableQuotes.filter(q => !usedQuotes.has(q));

        // If all quotes have been used, reset the tracking
        if (availableQuotes.length === 0) {
          usedQuotes.clear();
          // Changed condition to match the above logic
          availableQuotes = customNotes.length < 2
            ? [...customNotes.map(n => n.text), ...DEFAULT_QUOTES]
            : customNotes.map(n => n.text);
        }

        // Select a random quote from available ones
        const randomIndex = Math.floor(Math.random() * availableQuotes.length);
        const selectedQuote = availableQuotes[randomIndex];
        
        // Track this quote as used
        usedQuotes.add(selectedQuote);
        
        resolve(selectedQuote);
      });
      
    } else if (type === 'reminder') {
      chrome.storage.sync.get('customReminders', (data) => {
        const customReminders = data.customReminders || [];
        let availableReminders = [];

        // If we have less than 1 custom reminders, combine with default reminders
        if (customReminders.length < 1) {
          // Add custom reminders first
          availableReminders = customReminders.map(r => r.text);
          
          // Add default reminders
          DEFAULT_REMINDERS.forEach(reminder => {
            if (!usedReminders.has(reminder)) {
              availableReminders.push(reminder);
            }
          });
        } else {
          // Use only custom reminders if we have enough
          availableReminders = customReminders.map(r => r.text);
        }

        // Filter out already used reminders
        availableReminders = availableReminders.filter(r => !usedReminders.has(r));

        // If all reminders have been used, reset the tracking
        if (availableReminders.length === 0) {
          usedReminders.clear();
          availableReminders = customReminders.length < 2 
            ? [...customReminders.map(r => r.text), ...DEFAULT_REMINDERS]
            : customReminders.map(r => r.text);
        }

        // Select a random reminder from available ones
        const randomIndex = Math.floor(Math.random() * availableReminders.length);
        const selectedReminder = availableReminders[randomIndex];
        
        // Track this reminder as used
        usedReminders.add(selectedReminder);
        
        resolve(selectedReminder);
      });
    }
  });
}

// Modified createSplitWidget to use the new reminder system
async function createSplitWidget() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('settings', async (data) => {
      const settings = data.settings || { showQuotes: true, showReminders: true };
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

      // Handle quotes section
      if (settings.showQuotes) {
        const quoteSection = document.createElement('div');
        quoteSection.style.cssText = `
          padding: 15px;
          border-radius: 8px;
          background: linear-gradient(135deg, #6e8efb, #a777e3);
          color: white;
          text-align: center;
        `;
        quoteSection.textContent = await getRandomItem('quote');
        widgetContainer.appendChild(quoteSection);
      }

      // Handle reminders section
      if (settings.showReminders) {
        const reminderSection = document.createElement('div');
        reminderSection.style.cssText = `
          padding: 15px;
          border-radius: 8px;
          background: linear-gradient(135deg, #FF8C42, #FFA07A);
          color: white;
          text-align: center;
        `;
        reminderSection.textContent = await getRandomItem('reminder');
        widgetContainer.appendChild(reminderSection);
      }

      resolve(widgetContainer);
    });
  });
}

// Reset used reminders when page reloads or settings change
function resetReminderTracking() {
  usedReminders.clear();
  usedQuotes.clear();
}

// Modified message listener to handle resets
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'settingsUpdated' || message.type === 'remindersUpdated' || message.type === 'notesUpdated' ) {
    resetReminderTracking();
    window.location.reload();
  }
});

// Initialize 
resetReminderTracking();
// Modified replaceAds function to handle the new reminder system
async function replaceAds() {
  chrome.storage.sync.get('settings', async (data) => {
    const settings = data.settings || { showQuotes: true, showReminders: true };
    
    if (!settings.showQuotes && !settings.showReminders) return;
    
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
    
    for (const ad of adElements) {
      if (ad.dataset.processed) continue;
      
      try {
        const widget = await createSplitWidget();
        ad.parentNode.replaceChild(widget, ad);
        
        newStats.adsReplaced++;
        if (settings.showQuotes) newStats.quotesShown++;
        if (settings.showReminders) newStats.remindersShown++;
        
        ad.dataset.processed = 'true';
      } catch (error) {
        console.error('Error replacing ad:', error);
      }
    }
    
    if (newStats.adsReplaced > 0) {
      updateStats(newStats);
    }
  });
}

// Initialize
resetReminderTracking();
replaceAds();

// Watch for dynamic content changes
const observer = new MutationObserver(replaceAds);
observer.observe(document.body, {
  childList: true,
  subtree: true
});

function createFloatingIcon() {
  // Create the floating icon
  const floatingIcon = document.createElement('div');
  floatingIcon.id = 'adfriend-floating-icon';
  floatingIcon.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #6e8efb, #a777e3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 9999;
    transition: transform 0.3s ease;
  `;

  // Add plus icon
  const plusIcon = document.createElement('div');
  plusIcon.style.cssText = `
    color: white;
    font-size: 24px;
    font-weight: bold;
  `;
  plusIcon.textContent = '+';
  floatingIcon.appendChild(plusIcon);

  // Hover effect
  floatingIcon.addEventListener('mouseover', () => {
    floatingIcon.style.transform = 'scale(1.1)';
  });
  floatingIcon.addEventListener('mouseout', () => {
    floatingIcon.style.transform = 'scale(1)';
  });

  // Create popup
  function createQuickAddPopup() {
    const popup = document.createElement('div');
    popup.id = 'adfriend-quick-add-popup';
    popup.style.cssText = `
      position: fixed;
      right: 80px;
      bottom: 20px;
      width: 300px;
      background: white;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 15px rgba(0,0,0,0.1);
      z-index: 9998;
      font-family: Arial, sans-serif;
      animation: slideIn 0.3s ease;
    `;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);

    // Popup content
    popup.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #333;">Quick Add</h3>
        <button id="adfriend-close-popup" style="
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          font-size: 18px;
          padding: 5px;
        ">×</button>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <input type="text" id="adfriend-quick-reminder" placeholder="Add a reminder..." style="
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        ">
        <textarea id="adfriend-quick-note" placeholder="Add a note..." style="
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          resize: vertical;
          min-height: 80px;
        "></textarea>
        <button id="adfriend-save-quick-add" style="
          background: linear-gradient(135deg, #6e8efb, #a777e3);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: opacity 0.2s ease;
        ">Save</button>
      </div>
    `;

    // Handle save
    popup.querySelector('#adfriend-save-quick-add').addEventListener('click', () => {
      const reminderText = popup.querySelector('#adfriend-quick-reminder').value.trim();
      const noteText = popup.querySelector('#adfriend-quick-note').value.trim();

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
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
              position: fixed;
              bottom: 80px;
              right: 20px;
              background: #4CAF50;
              color: white;
              padding: 10px 20px;
              border-radius: 4px;
              animation: fadeIn 0.3s ease;
            `;
            successMsg.textContent = 'Saved successfully!';
            document.body.appendChild(successMsg);
            
            // Remove success message after 2 seconds
            setTimeout(() => {
              successMsg.remove();
            }, 2000);

            // Clear inputs and close popup
            popup.remove();
          });
        });
      }
    });

    // Handle close
    popup.querySelector('#adfriend-close-popup').addEventListener('click', () => {
      popup.remove();
    });

    return popup;
  }

  // Toggle popup on icon click
  floatingIcon.addEventListener('click', () => {
    const existingPopup = document.getElementById('adfriend-quick-add-popup');
    if (existingPopup) {
      existingPopup.remove();
    } else {
      document.body.appendChild(createQuickAddPopup());
    }
  });

  // Add icon to page
  document.body.appendChild(floatingIcon);
}

// Initialize floating icon
createFloatingIcon();

