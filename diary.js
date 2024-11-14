const form = document.getElementById('diary-form');
const entryInput = document.getElementById('diary-entry');
const entriesContainer = document.getElementById('diary-entries');

let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
let peer;
let conn;

function initializePeer() {
    const savedPeerId = localStorage.getItem('peerJsId');
    if (savedPeerId) {
        peer = new Peer();
        peer.on('open', () => {
            conn = peer.connect(savedPeerId);
            setupConnection();
        });
    }
}

function setupConnection() {
    conn.on('open', () => {
        console.log('Connected to partner!');
    });
    conn.on('data', (data) => {
        if (data.type === 'diaryEntry') {
            addEntry(data.entry, false);
        }
    });
}

function renderEntries() {
    entriesContainer.innerHTML = '';
    entries.forEach((entry) => {
        const entryElement = document.createElement('div');
        entryElement.classList.add('diary-entry');
        entryElement.innerHTML = `
            <p class="entry-date">${entry.date}</p>
            <p>${entry.text}</p>
            <p class="entry-author">${entry.isLocal ? 'You' : 'Your partner'}</p>
        `;
        entriesContainer.prepend(entryElement);
    });
}

function addEntry(entry, isLocal) {
    entries.push({ ...entry, isLocal });
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
    renderEntries();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = entryInput.value.trim();
    if (text) {
        const newEntry = {
            text,
            date: new Date().toLocaleString()
        };
        addEntry(newEntry, true);
        entryInput.value = '';
        if (conn) {
            conn.send({ type: 'diaryEntry', entry: newEntry });
        }
    }
});

initializePeer();
renderEntries();