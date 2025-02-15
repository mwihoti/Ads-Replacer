// popup.js

/* ==============================
   🌟 Main Initialization
   ============================== */
   document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeSettings();
    loadReminders();
    loadNotes();
    updateProgress();
});

/* ==============================
   📑 Tab Management
   ============================== */
function initializeTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

            // Activate clicked tab and its content
            this.classList.add('active');
            const contentId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(contentId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });

    // Ensure first tab is active on load
    const firstTab = document.querySelector('.tab.active');
    if (firstTab) {
        const firstTabContent = document.getElementById(firstTab.getAttribute('data-tab'));
        if (firstTabContent) {
            firstTabContent.classList.add('active');
        }
    }
}

/* ==============================
   ⚙️ Settings Management
   ============================== */
function initializeSettings() {
    loadSavedSettings();
    const saveButton = document.getElementById('save');
    if (saveButton) {
        saveButton.addEventListener('click', saveSettings);
    }
}

function loadSavedSettings() {
    chrome.storage.sync.get('settings', function(data) {
        console.log('Loading settings:', data.settings);
        const settings = data.settings || { showQuotes: true, showReminders: true };
        
        const quotesCheckbox = document.getElementById('quotes');
        const remindersCheckbox = document.getElementById('remindersToggle');
        
        if (quotesCheckbox && remindersCheckbox) {
            quotesCheckbox.checked = settings.showQuotes;
            remindersCheckbox.checked = settings.showReminders;
        }
    });
}

function saveSettings() {
    const quotesCheckbox = document.getElementById('quotes');
    const remindersCheckbox = document.getElementById('remindersToggle');
    
    if (!quotesCheckbox || !remindersCheckbox) {
        console.error('Settings checkboxes not found');
        return;
    }

    const settings = {
        showQuotes: quotesCheckbox.checked,
        showReminders: remindersCheckbox.checked
    };

    chrome.storage.sync.set({ settings }, function() {
        if (chrome.runtime.lastError) {
            console.error('Error saving settings:', chrome.runtime.lastError);
            return;
        }

        // Visual feedback
        const saveButton = document.getElementById('save');
        if (saveButton) {
            saveButton.textContent = 'Saved!';
            saveButton.style.backgroundColor = '#4CAF50';

            // Notify content script
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        type: 'settingsUpdated',
                        settings: settings
                    });
                }
            });

            // Reset button after 2 seconds
            setTimeout(() => {
                saveButton.textContent = 'Save Settings';
                saveButton.style.backgroundColor = '';
            }, 2000);
        }
    });
}

/* ==============================
   🚀 Reminder Management
   ============================== */
function loadReminders() {
    chrome.storage.sync.get('customReminders', (data) => {
        const reminders = data.customReminders || [];
        const reminderList = document.getElementById('reminderList');
        if (!reminderList) return;

        reminderList.innerHTML = '';

        if (reminders.length === 0) {
            reminderList.innerHTML = '<p>No reminders yet. Add a new reminder!</p>';
            return;
        }

        reminders.forEach((reminder, index) => {
            const div = document.createElement('div');
            div.className = 'reminder-item';
            div.setAttribute('data-index', index);
            div.innerHTML = `
                <span>${reminder.text} (${reminder.frequency})</span>
                <span>${reminder.category}</span>
                <div class="reminder-actions">
                    <button class="edit-reminder">Edit</button>
                    <button class="delete-reminder">Delete</button>
                </div>
            `;
            reminderList.appendChild(div);
        });
    });
}

// Add reminder event listener
document.getElementById('addReminder')?.addEventListener('click', () => {
    const text = document.getElementById('reminderText')?.value;
    const frequency = document.getElementById('reminderFrequency')?.value;
    const category = document.getElementById('reminderCategory')?.value;

    if (!text) return;

    chrome.storage.sync.get('customReminders', (data) => {
        const reminders = data.customReminders || [];
        reminders.push({
            text,
            frequency,
            category,
            created: new Date().toISOString(),
            completions: 0
        });

        chrome.storage.sync.set({ customReminders: reminders }, () => {
            if (document.getElementById('reminderText')) {
                document.getElementById('reminderText').value = '';
            }
            loadReminders();
            updateProgress();
        });
    });
});

// Event delegation for reminder actions
document.getElementById('reminderList')?.addEventListener('click', (event) => {
    const target = event.target;
    const reminderItem = target.closest('.reminder-item');
    if (!reminderItem) return;

    const index = parseInt(reminderItem.getAttribute('data-index'), 10);

    if (target.classList.contains('delete-reminder')) {
        deleteReminder(index);
    } else if (target.classList.contains('edit-reminder')) {
        editReminder(index);
    }
});

function editReminder(index) {
    chrome.storage.sync.get('customReminders', (data) => {
        let reminders = data.customReminders || [];
        const reminder = reminders[index];
        if (!reminder) return;

        const newText = prompt('Edit your reminder:', reminder.text);
        if (newText && newText.trim()) {
            reminders[index] = {
                ...reminder,
                text: newText.trim(),
                lastEdited: new Date().toISOString()
            };
            chrome.storage.sync.set({ customReminders: reminders }, loadReminders);
        }
    });
}

function deleteReminder(index) {
    chrome.storage.sync.get('customReminders', (data) => {
        let reminders = data.customReminders || [];
        reminders.splice(index, 1);
        chrome.storage.sync.set({ customReminders: reminders }, () => {
            loadReminders();
            updateProgress();
        });
    });
}

/* ==============================
   📝 Notes Management
   ============================== */
function loadNotes() {
    chrome.storage.sync.get('notes', (data) => {
        const notes = data.notes || [];
        const notesContainer = document.getElementById('notesContainer');
        if (!notesContainer) return;

        notesContainer.innerHTML = '';

        if (notes.length === 0) {
            notesContainer.innerHTML = '<p>No notes yet. Add one!</p>';
            return;
        }

        notes.forEach((note, index) => {
            const div = document.createElement('div');
            div.className = 'note-item';
            div.setAttribute('data-index', index);
            div.innerHTML = `
                <p>${note.text}</p>
                <small>Created: ${new Date(note.created).toLocaleDateString()}</small>
                ${note.associated_reminder ? `<small>Reminder: ${note.associated_reminder}</small>` : ''}
                <div class="note-actions">
                    <button class="edit-note">Edit</button>
                    <button class="delete-note">Delete</button>
                </div>
            `;
            notesContainer.appendChild(div);
        });
    });
}

// Event delegation for note actions
document.getElementById('notesContainer')?.addEventListener('click', (event) => {
    const target = event.target;
    const noteItem = target.closest('.note-item');
    if (!noteItem) return;

    const index = parseInt(noteItem.getAttribute('data-index'), 10);

    if (target.classList.contains('delete-note')) {
        deleteNote(index);
    } else if (target.classList.contains('edit-note')) {
        editNote(index);
    }
});

function editNote(index) {
    chrome.storage.sync.get('notes', (data) => {
        let notes = data.notes || [];
        const note = notes[index];
        if (!note) return;

        const newText = prompt('Edit your note:', note.text);
        if (newText && newText.trim()) {
            notes[index] = {
                ...note,
                text: newText.trim(),
                lastEdited: new Date().toISOString()
            };
            chrome.storage.sync.set({ notes }, loadNotes);
        }
    });
}

function deleteNote(index) {
    chrome.storage.sync.get('notes', (data) => {
        let notes = data.notes || [];
        notes.splice(index, 1);
        chrome.storage.sync.set({ notes }, loadNotes);
    });
}

/* ==============================
   📊 Progress Tracking
   ============================== */
function updateProgress() {
    chrome.storage.sync.get(['customReminders', 'reminderCompletions'], (data) => {
        const reminders = data.customReminders || [];
        const completions = data.reminderCompletions || {};
        const progressStats = document.getElementById('progressStats');
        if (!progressStats) return;

        const stats = reminders.reduce((acc, reminder) => {
            const category = reminder.category;
            if (!acc[category]) {
                acc[category] = { total: 0, completed: 0 };
            }
            acc[category].total++;
            acc[category].completed += completions[reminder.text] || 0;
            return acc;
        }, {});

        progressStats.innerHTML = Object.entries(stats).map(([category, stat]) => `
            <div class="progress-container">
                <h3>${category}</h3>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${(stat.completed / stat.total) * 100}%"></div>
                </div>
                <p>Completed: ${stat.completed} / ${stat.total}</p>
            </div>
        `).join('');
    });
}