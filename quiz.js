const questions = [
    {
        question: "What was the first movie we watched together?",
        answers: ["The Notebook", "Titanic", "La La Land", "The Proposal"],
        correct: 1
    },
    {
        question: "Where did we have our first virtual date?",
        answers: ["Zoom", "Skype", "FaceTime", "Google Meet"],
        correct: 2
    },
    {
        question: "What's my favorite food that you always tease me about?",
        answers: ["Pineapple on Pizza", "Sushi", "Broccoli", "Chocolate covered pickles"],
        correct: 0
    }
];

let currentQuestion = 0;
let score = 0;

const questionEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const resultEl = document.getElementById('result');
const nextBtn = document.getElementById('next-btn');
const connectionStatus = document.getElementById('connection-status');

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
            loadQuestion();
        }
    });
    conn.on('data', (data) => {
        if (data.type === 'answer') {
            selectAnswer(data.index);
        } else if (data.type === 'nextQuestion') {
            loadQuestion();
        }
    });
}

function loadQuestion() {
    const question = questions[currentQuestion];
    questionEl.textContent = question.question;
    answersEl.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.textContent = answer;
        button.classList.add('game-button');
        button.style.margin = '0.5rem';
        button.addEventListener('click', () => selectAnswer(index));
        answersEl.appendChild(button);
    });
    
    resultEl.textContent = '';
    nextBtn.style.display = 'none';
}

function selectAnswer(index) {
    const question = questions[currentQuestion];
    if (index === question.correct) {
        score++;
        resultEl.textContent = 'Correct! 💖';
    } else {
        resultEl.textContent = 'Wrong. The correct answer was: ' + question.answers[question.correct] + ' 💔';
    }
    
    Array.from(answersEl.children).forEach(button => button.disabled = true);
    nextBtn.style.display = 'inline-block';
    
    if (conn) {
        conn.send({ type: 'answer', index: index });
    }
}

nextBtn.addEventListener('click', () => {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion();
        if (conn) {
            conn.send({ type: 'nextQuestion' });
        }
    } else {
        questionEl.textContent = `Quiz completed! Your score: ${score}/${questions.length} 🎉`;
        answersEl.innerHTML = '';
        resultEl.textContent = '';
        nextBtn.style.display = 'none';
    }
});

initializePeer();
loadQuestion();