document.addEventListener('DOMContentLoaded', function() {
    // Tab switching logic
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove "active" class from all tabs and contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

            // Activate clicked tab and its corresponding content
            this.classList.add('active');
            const contentId = this.getAttribute('data-tab');

            // Ensure correct tab content is shown
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
            firstTabContent.classList.add('active')
        }
    }

    // Load initial data
    loadReminders();
    loadNotes();
    updateProgress();
});


/* ==============================
   🚀 Reminder Management
   ============================== */
function loadReminders() {
    chrome.storage.sync.get('customReminders', (data) => {
        const reminders = data.customReminders || [];
        const reminderList = document.getElementById('reminderList');
        reminderList.innerHTML = '';

        if (reminders.length === 0) {
            reminderList.innerHTML = `<p>No reminders yet. Add a new reminder!</p>`;
            return;
        }

        reminders.forEach((reminder, index) => {
            const div = document.createElement('div');
            div.className = 'reminder-item';
            div.innerHTML = `
                <span>${reminder.text} (${reminder.frequency})</span>
                <span>${reminder.category}</span>
                <button onclick="deleteReminder(${index})">Delete</button>
            `;
            reminderList.appendChild(div);
        });
    });
}

// Add reminder
document.getElementById('addReminder').addEventListener('click', () => {
    const text = document.getElementById('reminderText').value;
    const frequency = document.getElementById('reminderFrequency').value;
    const category = document.getElementById('reminderCategory').value;

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
            document.getElementById('reminderText').value = '';
            loadReminders();
            updateProgress();
        });
    });
});
// Edit reminder
window.editReminder = function (index) {
    chrome.storage.sync.get('customReminders', (data) => {
        const reminders = data.customReminders || [];
        const newText = prompt('Edit your reminder: ', reminders[index].text);

        if (newText) {
            reminders[index].text = newText;
            chrome.storage.sync.set({ customReminders: reminders }, loadReminders);          
        }
    })
}

// Delete reminder
window.deleteReminder = function(index) {
    chrome.storage.sync.get('customReminders', (data) => {
        const reminders = data.customReminders || [];
        reminders.splice(index, 1);
        chrome.storage.sync.set({ customReminders: reminders }, loadReminders);
    });
};

/* ==============================
   📝 Notes Management
   ============================== */
function loadNotes() {
    chrome.storage.sync.get('notes', (data) => {
        const notes = data.notes || [];
        const notesContainer = document.getElementById('notesContainer');
        notesContainer.innerHTML = '';

        if (notes.length === 0) {
            notesContainer.innerHTML = `<p>No notes yet. Add a new note!</p>`;
            return;
        }

        notes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.innerHTML = `
                <p>${note.text}</p>
                <small>Created: ${new Date(note.created).toLocaleDateString()}</small>
                ${note.associated_reminder ? `<small>Reminder: ${note.associated_reminder}</small>` : ''}
                <button onclick="deleteNote(${index})">Delete</button>
            `;
            notesContainer.appendChild(noteElement);
        });
    });
}

// Add note
document.getElementById('addNote').addEventListener('click', () => {
    const text = document.getElementById('noteText').value;
    if (!text) return;

    chrome.storage.sync.get('notes', (data) => {
        const notes = data.notes || [];
        notes.push({
            text,
            created: new Date().toISOString()
        });

        chrome.storage.sync.set({ notes }, () => {
            document.getElementById('noteText').value = '';
            loadNotes();
        });
    });
});

// Delete note
window.deleteNote = function(index) {
    chrome.storage.sync.get('notes', (data) => {
        const notes = data.notes || [];
        notes.splice(index, 1);
        chrome.storage.sync.set({ notes }, loadNotes);
    });
};

/* ==============================
   📊 Progress Tracking
   ============================== */
function updateProgress() {
    chrome.storage.sync.get(['customReminders', 'reminderCompletions'], (data) => {
        const reminders = data.customReminders || [];
        const completions = data.reminderCompletions || {};
        const progressStats = document.getElementById('progressStats');

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

function createFloatingPopup () {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 250px;
        padding: 15px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        font-family: Arial, sans-serif;
    `;

    // Title
    const title = document.createElement('h3');
    title.textContent = "Quick Add";
    title.style.marginBottom = "10px";

    
}
