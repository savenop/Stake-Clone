const cards = document.querySelectorAll('.card');
const betBtn = document.querySelector('.btn3');
const minesSelect = document.querySelector('select[name="Mines"]');
const betInput = document.querySelector('.bet input[type="text"]');
const halfBtn = document.querySelector('.betinp .half');
const dblBtn = document.querySelector('.betinp .dbl');
const minesCol = document.querySelector('.mines-col');
const gemsCol = document.querySelector('.gems-col');
const minesLabel = document.querySelector('.mines-label');
const minesCountSpan = document.getElementById('mines-count');
const gemsInput = document.getElementById('gems-input');
const profitField = document.querySelector('.profit-field');
const profitInput = document.getElementById('profit-input');
const pickRandomBtn = document.querySelector('.pick-random-btn');
const betDiv = document.querySelector('.bet');

let mineIndices = [];
let gameActive = false;
let clickedIndices = [];
let mineHit = false; // Add this flag
let gems = 0;
let profit = 0;

// Helper to shuffle and pick N unique indices
function getRandomIndices(total, count) {
    const arr = Array.from({length: total}, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, count);
}

// Reset all cards to initial state
function resetCards() {
    cards.forEach(card => {
        card.innerHTML = '';
        card.classList.remove('popanimate', 'revealed', 'untouched-reveal', 'noshadow');
        card.style.backgroundColor = '';
        card.disabled = false;
    });
    clickedIndices = [];
}

function setBettingFieldsDisabled(disabled) {
    betInput.disabled = disabled;
    minesSelect.disabled = disabled;
    halfBtn.disabled = disabled;
    dblBtn.disabled = disabled;
}

function updateProfit() {
    profit = (clickedIndices.length * 10); // Replace with your formula
    profitInput.value = profit;
}

function updateGems() {
    gems = clickedIndices.length;
    gemsInput.value = gems;
}

function showBetGameUI(mineCount) {
    // 1. Bet amount input opacity
    betInput.style.opacity = '0.5';

    // 2. Mines select shrink, show label
    minesSelect.style.width = '100%';
    minesSelect.parentElement.style.flex = '1';
    minesLabel.style.display = '';
    minesCountSpan.textContent = mineCount;

    // 3. Show gems field
    gemsCol.style.display = '';
    gemsInput.value = 0;

    // 4. Show profit field
    profitField.style.display = '';
    profitInput.value = 0;

    // 5. Show pick random tile button
    pickRandomBtn.style.display = '';

    // 6. Adjust cashout button margin
    betBtn.style.marginTop = '10px';
}

function hideBetGameUI() {
    betInput.style.opacity = '1';
    minesLabel.style.display = 'none';
    gemsCol.style.display = 'none';
    profitField.style.display = 'none';
    pickRandomBtn.style.display = 'none';
    betBtn.style.marginTop = '';
}

function resetBetButton() {
    betBtn.textContent = 'Bet';
    betBtn.classList.remove('cashout');
    setBettingFieldsDisabled(false);
    gameActive = false;
    hideBetGameUI();
}

// On Bet button click: randomize mines and reset cards
betBtn.addEventListener('click', () => {
    if (!gameActive) {
        // Start game
        const mineCount = parseInt(minesSelect.value, 10);
        mineIndices = getRandomIndices(cards.length, mineCount);
        gameActive = true;
        resetCards();
        betBtn.textContent = 'Cashout';
        betBtn.classList.add('cashout');
        setBettingFieldsDisabled(true);
        showBetGameUI(mineCount);
        gems = 0;
        profit = 0;
        updateGems();
        updateProfit();
    } else {
        // Cashout
        resetBetButton();
        resetCards();
    }
});

// Card click logic
cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
        if (!gameActive || card.classList.contains('revealed') || mineHit) return;

        // If this card is a mine, immediately block further clicks
        if (mineIndices.includes(idx)) {
            mineHit = true;
            cards.forEach(c => c.style.pointerEvents = 'none');
        }

        card.classList.add('popanimate');
        card.classList.add('revealed');
        card.classList.add('noshadow');
        clickedIndices.push(idx);

        setTimeout(() => {
            card.classList.remove('popanimate');
            const img = document.createElement('img');
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';
            img.classList.add('img-pop');
            card.style.backgroundColor = '#071824';
            if (mineIndices.includes(idx)) {
                img.src = './assets/red.png';
                card.innerHTML = '';
                card.appendChild(img);

                // Reveal all cards on mine
                setTimeout(() => {
                    cards.forEach((c, i) => {
                        if (!c.classList.contains('revealed')) {
                            c.classList.add('revealed', 'untouched-reveal', 'noshadow');
                            c.style.backgroundColor = '#071824';
                            const revealImg = document.createElement('img');
                            revealImg.style.width = '100%';
                            revealImg.style.height = '100%';
                            revealImg.style.objectFit = 'contain';
                            // DO NOT add 'img-pop' here to avoid pop animation on untouched cards
                            revealImg.src = mineIndices.includes(i) ? './assets/red.png' : './assets/blue.png';
                            c.innerHTML = '';
                            c.appendChild(revealImg);
                        }
                    });
                    resetBetButton();
                    // Restore pointer events and flag for next game
                    cards.forEach(c => c.style.pointerEvents = '');
                    mineHit = false;
                }, 500);
            } else {
                img.src = './assets/blue.png';
                card.innerHTML = '';
                card.appendChild(img);
                // Update gems and profit
                updateGems();
                updateProfit();
            }
        }, 360);

    });
});

// Allow editing of gems and profit fields
gemsInput.addEventListener('input', (e) => {
    gems = parseInt(e.target.value, 10) || 0;
});
profitInput.addEventListener('input', (e) => {
    profit = parseFloat(e.target.value) || 0;
});

// Pick random tile button logic
pickRandomBtn.addEventListener('click', () => {
    if (!gameActive || mineHit) return;
    // Find all unclicked, non-mine cards
    const safeIndices = Array.from(cards).map((c, i) => (!c.classList.contains('revealed') && !mineIndices.includes(i)) ? i : null).filter(i => i !== null);
    if (safeIndices.length === 0) return;
    const randIdx = safeIndices[Math.floor(Math.random() * safeIndices.length)];
    cards[randIdx].click();
});







