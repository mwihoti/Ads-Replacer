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

// Add this to your content.js file

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

