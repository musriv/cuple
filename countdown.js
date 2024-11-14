const targetDateInput = document.getElementById('target-date');
const setCountdownButton = document.getElementById('set-countdown');
const countdownDisplay = document.getElementById('countdown');
const connectionStatus = document.getElementById('connection-status');

let countdownInterval;
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
        connectionStatus.textContent = 'Connected!';
    });
    conn.on('data', (data) => {
        if (data.type === 'setCountdown') {
            targetDateInput.value = data.date;
            startCountdown();
        }
    });
}

function updateCountdown() {
    const now = new Date().getTime();
    const targetDate = new Date(targetDateInput.value).getTime();
    const timeLeft = targetDate - now;

    if (timeLeft < 0) {
        clearInterval(countdownInterval);
        countdownDisplay.textContent = "Countdown finished! 🎉";
        return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    countdownDisplay.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function startCountdown() {
    clearInterval(countdownInterval);
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
    localStorage.setItem('countdownDate', targetDateInput.value);
}

setCountdownButton.addEventListener('click', () => {
    if (targetDateInput.value) {
        startCountdown();
        if (conn) {
            conn.send({ type: 'setCountdown', date: targetDateInput.value });
        }
    }
});

// Load saved date from localStorage
const savedDate = localStorage.getItem('countdownDate');
if (savedDate) {
    targetDateInput.value = savedDate;
    startCountdown();
}

initializePeer();