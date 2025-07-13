const cards = document.querySelectorAll('.card');
const betBtn = document.querySelector('.btn3');
const minesSelect = document.querySelector('select[name="Mines"]');
const betInput = document.querySelector('.bet input[type="text"]');
const halfBtn = document.querySelector('.betinp .half');
const dblBtn = document.querySelector('.betinp .dbl');
const minesCol = document.querySelector('.mines-col');
const gemsCol = document.querySelector('.gems-col');
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
    // Hide SVG arrow by removing background-image when disabled
    if (disabled) {
        minesSelect.style.backgroundImage = 'none';
        minesSelect.style.backgroundColor = '#2F4553';
    } else {
        minesSelect.style.backgroundImage = '';
        minesSelect.style.backgroundColor = '';
    }
}

function updateProfit() {
    profit = (clickedIndices.length * 10); // Replace with your formula
    profitInput.value = profit;
}

function updateGems() {
    // Show remaining gems (total gems - gems clicked)
    gemsInput.value = gems - clickedIndices.length;
}

function showBetGameUI(mineCount) {
    // 1. Bet amount input opacity
    betInput.style.opacity = '0.5';

    // 2. Mines select shrink (no label)
    minesSelect.style.width = '100%';
    minesSelect.parentElement.style.flex = '1';

    // 3. Show gems field
    gemsCol.style.display = '';
    gemsInput.disabled = true;

    // 4. Show profit field and disable editing
    profitField.style.display = '';
    profitInput.value = 0;
    profitInput.disabled = true;

    // 5. Show pick random tile button
    pickRandomBtn.style.display = '';

    // 6. Adjust cashout button margin
    betBtn.style.marginTop = '10px';
}

function hideBetGameUI() {
    betInput.style.opacity = '1';
    gemsCol.style.display = 'none';
    profitField.style.display = 'none';
    pickRandomBtn.style.display = 'none';
    betBtn.style.marginTop = '';
    gemsInput.disabled = true;
    profitInput.disabled = true;
}

function resetBetButton() {
    betBtn.textContent = 'Bet';
    betBtn.classList.remove('cashout');
    betBtn.style.backgroundColor = ''; // Reset to default
    setBettingFieldsDisabled(false);
    gameActive = false;
    hideBetGameUI();
}

function showLoaderOnButton(btn) {
    btn.disabled = true;
    btn._originalText = btn.textContent;
    btn.innerHTML = `<span class="loader-dots"><span></span><span></span><span></span></span>`;
}

function hideLoaderOnButton(btn) {
    btn.disabled = false;
    if (btn._originalText) {
        btn.textContent = btn._originalText;
        delete btn._originalText;
    }
}

// On Bet button click: randomize mines and reset cards
betBtn.addEventListener('click', () => {
    showLoaderOnButton(betBtn);
    setTimeout(() => {
        hideLoaderOnButton(betBtn);
        if (!gameActive) {
            // Start game
            const mineCount = parseInt(minesSelect.value, 10);
            mineIndices = getRandomIndices(cards.length, mineCount);
            gameActive = true;
            resetCards();
            betBtn.textContent = 'Cashout';
            betBtn.classList.add('cashout');
            setBettingFieldsDisabled(true);
            // Set gems to 25 - mines and keep disabled
            gems = 25 - mineCount;
            gemsInput.value = gems;
            gemsInput.disabled = true;
            showBetGameUI(mineCount);
            profit = 0;
            updateProfit();
            // Set cashout button bg to #108F22 until first card click
            betBtn.style.backgroundColor = '#108F22';
        } else {
            // Cashout
            resetBetButton();
            resetCards();
        }
    }, 400);
});

// Card click logic
cards.forEach((card, idx) => {
    card.addEventListener('click', () => {
        if (!gameActive || card.classList.contains('revealed') || mineHit) return;

        // Show loader on Bet/Cashout button
        showLoaderOnButton(betBtn);

        // On first card click, revert cashout button bg to normal
        if (clickedIndices.length === 0) {
            betBtn.style.backgroundColor = ''; // Remove inline style, revert to CSS
        }

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
                    hideLoaderOnButton(betBtn); // Hide loader after all is done
                }, 500);
            } else {
                img.src = './assets/blue.png';
                card.innerHTML = '';
                card.appendChild(img);
                // Update gems and profit
                updateGems();
                updateProfit();
                hideLoaderOnButton(betBtn); // Hide loader after card is processed
            }
        }, 360);

    });
});

// Update gems field when mines selection changes (before bet starts)
minesSelect.addEventListener('input', () => {
    if (!gameActive) {
        const mines = parseInt(minesSelect.value, 10);
        gems = 25 - mines;
        gemsInput.value = gems;
        gemsInput.disabled = true;
    }
});

// Always prevent editing
gemsInput.addEventListener('input', (e) => {
    gemsInput.value = gems;
});
profitInput.addEventListener('input', (e) => {
    profitInput.value = profit; // Always prevent editing
});

// Pick random tile button logic
pickRandomBtn.addEventListener('click', () => {
    if (!gameActive || mineHit) return;
    // Pick any random card out of 25 (not just safe ones)
    const unclickedIndices = Array.from(cards).map((c, i) => (!c.classList.contains('revealed')) ? i : null).filter(i => i !== null);
    if (unclickedIndices.length === 0) return;
    const randIdx = unclickedIndices[Math.floor(Math.random() * unclickedIndices.length)];
    cards[randIdx].click();
});

// On page load, set gems and profit fields to initial value and disable editing
(() => {
    const mines = parseInt(minesSelect.value, 10);
    gems = 25 - mines;
    gemsInput.value = gems;
    gemsInput.disabled = true;
    profitInput.value = 0;
    profitInput.disabled = true;
})();
(() => {
    const mines = parseInt(minesSelect.value, 10);
    gems = 25 - mines;
    gemsInput.value = gems;
    gemsInput.disabled = true;
    profitInput.value = 0;
    profitInput.disabled = true;
})();







