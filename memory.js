const images = ['heart.jpg', 'kiss.jpg', 'rose.jpg', 'music.jpg', 'rainbow.jpg', 'pizza.jpg', 'movie.jpg', 'book.jpg'];
const gameGrid = images.concat(images);
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let isMyTurn = true;

const gridElement = document.getElementById('memory-grid');
const movesElement = document.getElementById('moves');
const resetButton = document.getElementById('reset-btn');
const connectionStatus = document.getElementById('connection-status');
const turnIndicator = document.getElementById('turn-indicator');

let peer;
let conn;
let isHost = true;

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
        if (isHost) {
            resetGame();
        }
    });
    conn.on('data', (data) => {
        if (data.type === 'flip') {
            const card = document.querySelector(`[data-card-index="${data.index}"]`);
            flipCard.call(card);
        } else if (data.type === 'reset') {
            resetGame();
        }
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createCard(image, index) {
    const card = document.createElement('div');
    card.classList.add('memory-card');
    card.dataset.cardIndex = index;
    card.addEventListener('click', flipCard);
    
    const img = document.createElement('img');
    img.src = `img/${image}`;
    img.alt = 'Memory Card';
    img.classList.add('hidden');
    
    card.appendChild(img);
    return card;
}

function flipCard() {
    if (!isMyTurn) return;
    if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
        this.classList.add('flipped');
        this.querySelector('img').classList.remove('hidden');
        flippedCards.push(this);
        
        if (conn) {
            conn.send({ type: 'flip', index: this.dataset.cardIndex });
        }
        
        if (flippedCards.length === 2) {
            moves++;
            movesElement.textContent = `Moves: ${moves}`;
            setTimeout(checkMatch, 500);
            isMyTurn = false;
            updateTurnIndicator();
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    if (card1.querySelector('img').src === card2.querySelector('img').src) {
        matchedPairs++;
        if (matchedPairs === images.length) {
            alert(`Congratulations! You won in ${moves} moves! 🎉`);
        }
    } else {
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            card1.querySelector('img').classList.add('hidden');
            card2.querySelector('img').classList.add('hidden');
        }, 1000);
    }
    flippedCards = [];
    isMyTurn = true;
    updateTurnIndicator();
}

function resetGame() {
    shuffleArray(gameGrid);
    gridElement.innerHTML = '';
    gameGrid.forEach((image, index) => {
        gridElement.appendChild(createCard(image, index));
    });
    matchedPairs = 0;
    moves = 0;
    movesElement.textContent = 'Moves: 0';
    isMyTurn = isHost;
    updateTurnIndicator();
    
    if (conn) {
        conn.send({ type: 'reset' });
    }
}

function updateTurnIndicator() {
    turnIndicator.textContent = isMyTurn ? "It's your turn" : "It's your partner's turn";
}

resetButton.addEventListener('click', resetGame);

initializePeer();
resetGame();