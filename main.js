let peer;
let conn;
let isHost = true;

function initializePeer() {
    peer = new Peer();
    peer.on('open', (id) => {
        document.getElementById('connection-status').textContent = `Your ID: ${id}`;
    });
    peer.on('connection', (connection) => {
        conn = connection;
        setupConnection();
    });
}

function connectToPeer() {
    const peerId = document.getElementById('peer-id').value;
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
}

document.getElementById('connect-btn').addEventListener('click', connectToPeer);

initializePeer();

window.addEventListener('beforeunload', () => {
    if (conn) {
        localStorage.setItem('peerJsId', conn.peer);
    }
});