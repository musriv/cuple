let peer;
let conn;
let isHost = true;

function initializePeer() {
    peer = new Peer();
    
    peer.on('open', (id) => {
        document.getElementById('connection-status').textContent = `Your ID: ${id}`;
        document.getElementById('connect-btn').disabled = false;
    });

    peer.on('connection', (connection) => {
        conn = connection;
        setupConnection();
    });

    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        document.getElementById('connection-status').textContent = `Error: ${err.type}`;
    });
}

function connectToPeer() {
    const peerId = document.getElementById('peer-id').value.trim();
    if (!peerId) {
        alert("Please enter your partner's ID");
        return;
    }

    document.getElementById('connection-status').textContent = 'Connecting...';
    conn = peer.connect(peerId);
    setupConnection();
    isHost = false;
}

function setupConnection() {
    conn.on('open', () => {
        document.getElementById('connection-status').textContent = 'Connected!';
        document.getElementById('connect-btn').style.display = 'none';
        document.getElementById('peer-id').style.display = 'none';
    });

    conn.on('error', (err) => {
        console.error('Connection error:', err);
        document.getElementById('connection-status').textContent = `Connection error: ${err.type}`;
    });
}

document.getElementById('connect-btn').addEventListener('click', connectToPeer);

// Disable the connect button initially
document.getElementById('connect-btn').disabled = true;

initializePeer();

window.addEventListener('beforeunload', () => {
    if (conn) {
        localStorage.setItem('peerJsId', conn.peer);
    }
});
