import paragraphs from './paragraphs.js';
import { Timer } from './timer.js';

const textDisplay = document.getElementById('text-display');
const hiddenInput = document.getElementById('hidden-input');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const timeLeftEl = document.getElementById('time-left');
const restartBtn = document.getElementById('restart-btn');
const timeBtns = document.querySelectorAll('.setting-btn');

// Modal Elements
const resultsModal = document.getElementById('results-modal');
const finalWpmEl = document.getElementById('final-wpm');
const finalAccuracyEl = document.getElementById('final-accuracy');
const finalCorrectKeysEl = document.getElementById('final-correct-keys');
const finalIncorrectKeysEl = document.getElementById('final-incorrect-keys');
const modalRestartBtn = document.getElementById('modal-restart-btn');

let currentText = "";
let charIndex = 0;
let mistakes = 0;
let isTyping = false;
let maxTime = 15;
let correctKeys = 0;

const timer = new Timer(
    maxTime, 
    (timeLeft) => {
        timeLeftEl.innerText = timeLeft;
        calculateStats();
    }, 
    () => {
        finishTest();
    }
);

function loadText() {
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    currentText = paragraphs[randomIndex];
    
    // Clear and build DOM
    textDisplay.innerHTML = "";
    currentText.split("").forEach(char => {
        const span = document.createElement("span");
        span.innerText = char;
        textDisplay.appendChild(span);
    });
    
    // Set first character as active
    if(textDisplay.querySelectorAll("span")[0]) {
        textDisplay.querySelectorAll("span")[0].classList.add("active-char");
    }

    // Reset variables
    charIndex = 0;
    mistakes = 0;
    correctKeys = 0;
    isTyping = false;
    hiddenInput.value = "";
    timeLeftEl.innerText = maxTime;
    wpmEl.innerText = 0;
    accuracyEl.innerText = "100%";
    
    // Ensure hidden input is focused
    document.addEventListener("keydown", () => hiddenInput.focus());
    textDisplay.addEventListener("click", () => hiddenInput.focus());
}

function handleInput() {
    const characters = textDisplay.querySelectorAll("span");
    const typedChar = hiddenInput.value.split("")[charIndex];
    
    if (charIndex < characters.length && timer.getTimeLeft() > 0) {
        if (!isTyping) {
            timer.start();
            isTyping = true;
        }

        // Handle backspace
        if (typedChar == null) {
            if (charIndex > 0) {
                charIndex--;
                if (characters[charIndex].classList.contains("incorrect")) {
                    mistakes--;
                } else if (characters[charIndex].classList.contains("correct")) {
                    correctKeys--;
                }
                characters[charIndex].classList.remove("correct", "incorrect", "active-char");
            }
        } else {
            if (characters[charIndex].innerText === typedChar) {
                characters[charIndex].classList.add("correct");
                correctKeys++;
            } else {
                characters[charIndex].classList.add("incorrect");
                mistakes++;
            }
            charIndex++;
        }
        
        // Update active character class
        characters.forEach(span => span.classList.remove("active-char"));
        if (charIndex < characters.length) {
            characters[charIndex].classList.add("active-char");
            // Scroll logic so the text scrolls up
            const activeSpan = characters[charIndex];
            const displayRect = textDisplay.getBoundingClientRect();
            const spanRect = activeSpan.getBoundingClientRect();
            
            if (spanRect.bottom > displayRect.bottom - 10) {
                textDisplay.scrollTop += spanRect.height;
            } else if (spanRect.top < displayRect.top) {
                textDisplay.scrollTop -= spanRect.height;
            }
        }
        
        calculateStats();

        // If text is finished early, load a new one
        if (charIndex === characters.length) {
            // append new text
            const randomIndex = Math.floor(Math.random() * paragraphs.length);
            const extraText = " " + paragraphs[randomIndex];
            currentText += extraText;
            
            extraText.split("").forEach(char => {
                const span = document.createElement("span");
                span.innerText = char;
                textDisplay.appendChild(span);
            });
        }
    }
}

function calculateStats() {
    const elapsedTime = timer.getElapsedTime();
    if (elapsedTime > 0) {
        // Calculate WPM: (Total characters typed / 5) / time in minutes
        // We only count correct keys towards WPM or total keys minus mistakes
        const wpm = Math.round((((charIndex - mistakes) / 5) / elapsedTime) * 60);
        wpmEl.innerText = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
        
        // Calculate accuracy
        const accuracy = charIndex > 0 ? Math.round(((charIndex - mistakes) / charIndex) * 100) : 100;
        accuracyEl.innerText = `${accuracy}%`;
    }
}

function finishTest() {
    timer.stop();
    hiddenInput.blur();
    
    // Calculate final stats
    const elapsedTime = maxTime; // test finished
    const wpm = Math.round((((charIndex - mistakes) / 5) / elapsedTime) * 60);
    const accuracy = charIndex > 0 ? Math.round(((charIndex - mistakes) / charIndex) * 100) : 100;

    finalWpmEl.innerText = wpm < 0 || !wpm ? 0 : wpm;
    finalAccuracyEl.innerText = `${accuracy}%`;
    finalCorrectKeysEl.innerText = correctKeys;
    finalIncorrectKeysEl.innerText = mistakes;

    resultsModal.classList.remove('hidden');
}

function resetTest() {
    timer.reset(maxTime);
    loadText();
    resultsModal.classList.add('hidden');
    textDisplay.scrollTop = 0;
}

// Event Listeners
hiddenInput.addEventListener("input", handleInput);
restartBtn.addEventListener("click", resetTest);
modalRestartBtn.addEventListener("click", resetTest);

timeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        timeBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        maxTime = parseInt(btn.getAttribute("data-time"));
        resetTest();
    });
});

// Initialize
loadText();
