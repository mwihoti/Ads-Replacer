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
            div.setAttribute('data-index', index);
            div.innerHTML = `
                <span>${reminder.text} (${reminder.frequency})</span>
                <span>${reminder.category}</span>
                <button class="edit-reminder">Edit</button>
                <button class="delete-reminder">Delete</button>
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
// Event Delegation Attah click event to delete reminder list
document.getElementById('reminderList').addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-reminder')) {
        const index = event.target.parentElement.dataset.index;
        deleteReminder(index);
    }
})


// Edit delegation Attach click event to edit reminder list
document.getElementById('reminderList').addEventListener('click', (event) => {
    if (event.target.classList.contains('edit-reminder')) {
        const reminderItem  = event.target.closest( '.reminder-item');
        if (!reminderItem) return;
        const index = parseInt(reminderItem.getAttribute('data-index'), 10);
        editReminder(index);
    }
})

function editReminder(index) {
    chrome.storage.sync.get('customReminders', (data) => {
       let reminders = data.customReminders || [];
        const newText = prompt('Edit your reminder: ', reminders[index]?.text || '');

        if (newText) {
            reminders[index].text = newText;
            chrome.storage.sync.set({ customReminders: reminders }, loadReminders);          
        }
    })
}
// Event Delegation 

// Delete reminder
function deleteReminder (index) {
    chrome.storage.sync.get('customReminders', (data) => {
        let reminders = data.customReminders || [];
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

// Delete note function
function deleteNote(index) {
    chrome.storage.sync.get('notes', (data) => {
        let notes = data.notes || [];
        notes.splice(index, 1);
        chrome.storage.sync.set({ notes }, () => {
            loadNotes(); // Reload notes after deletion
        });
    });
}

// Edit note function
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
            
            chrome.storage.sync.set({ notes }, () => {
                loadNotes(); // Reload notes after editing
            });
        }
    });
}

// Event listener for note actions
document.addEventListener('DOMContentLoaded', () => {
    // Event delegation for note actions
    document.getElementById('notesContainer').addEventListener('click', (event) => {
        const noteItem = event.target.closest('.note-item');
        if (!noteItem) return;

        const index = parseInt(noteItem.getAttribute('data-index'), 10);
        
        if (event.target.classList.contains('delete-note')) {
            deleteNote(index);
        } else if (event.target.classList.contains('edit-note')) {
            editNote(index);
        }
    });

    // Load notes when popup opens
    loadNotes();
});


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

    // Reminder input
    const reminderInput = document.createElement('input');
    reminderInput.placeholder = "New Reminder";
    reminderInput.style.width = "100%";

    // Save button

    const saveBtn = document.createElement('button');
    saveBtn.textContent = "save";
    saveBtn.style.cssText = `
        background: linear-gradient(135deg, #6e8efb, #a777e3);
        coloer: white;
        padding: 8px;
        border: none;
        border-radius: 4px;
        width: 100%;
        margin-top: 5px;
        cursor: pointer;
    `

    saveBtn.addEventListener('click', () => {
        const reminderText = reminderInput.value.trim();
        const noteText = noteInput.value.trim();

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
                        created: new DataTransfer.toISOString()
                    });
                }
                chrome.storage.synnc.set({ customReminders: reminders, notes: notes}, () => {
                    reminderInput.value = '';
                    noteInput.value = '';
                    popup.style.display = 'none';

                });
            });
        }
    });

    // close Button 
    const closeBtn = document.createElement('button');
    closeBtn.textContent = "X";
    closeBtn.style.cssText `
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    color: white;
    border: none;
    cursor: pointer;
    `;

    closeBtn.addEventListener('click', () => popup.remove());

    popup.appendChild(title);
    popup.appendChild(reminderInput);
    popup.appendChild(noteInput);
    popup.appendChild(saveBtn);
    popup.appendChild(closeBtn);

    document.body.appendChild(popup);
}

//open floating popup when extension icon is clicked
chrome.browserAction.clicked.addListener(() => {
    createFloatingPopup();
})
