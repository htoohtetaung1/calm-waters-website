/* CALM WATERS - JavaScript */

// Game state object
let gameState = {
    coins: 0,
    fishCaught: 0,
    isFishing: false,
    currentBiome: 'sunny-lake',
    ownedItems: [],
    ownedBiomes: ['beachside'],
    musicVolume: 50,
    timePlayed: 0,
    goldSpent: 0,
    startTime: null
};

// Biome display names
const biomeNames = {
    'beachside': '☀️ Beachside',
    'mountain-lake': '⛰️ Mountain',
    'arctic': '🐻‍❄️ Arctic',
    'deep-ocean': '🌊 Deep Ocean'
};


function loadGameState() {
    const saved = localStorage.getItem('gameState');
    if (saved) {
        const data = JSON.parse(saved);
        gameState = { ...gameState, ...data };
        return true;
    }
    return false;
}

function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

// START PAGE FUNCTIONS

function handleStartPageLoad() {
    const playerName = localStorage.getItem('playerName');
    const newPlayerSection = document.getElementById('newPlayerSection');
    const returningPlayerSection = document.getElementById('returningPlayerSection');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const startForm = document.getElementById('startForm');
    const continueBtn = document.getElementById('continueBtn');
    const resetBtn = document.getElementById('resetBtn');

    if (playerName) {
        newPlayerSection.style.display = 'none';
        returningPlayerSection.style.display = 'block';
        welcomeMessage.textContent = `Welcome back, ${playerName}.`;
    } else {
        newPlayerSection.style.display = 'block';
        returningPlayerSection.style.display = 'none';
    }

    if (startForm) {
        startForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('playerName').value.trim();
            if (name) {
                localStorage.setItem('playerName', name);
                window.location.href = 'game.html';
            }
        });
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            window.location.href = 'game.html';
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            localStorage.removeItem('playerName');
            location.reload();
        });
    }
}

// GAME PAGE FUNCTIONS

function handleGamePageLoad() {
    loadGameState();
    
    const coinsText = document.getElementById('coinsText');
    const biomeDisplay = document.getElementById('biomeDisplay');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPopup = document.getElementById('settingsPopup');
    const volumeSlider = document.getElementById('volumeSlider');
    const resetBtn = document.getElementById('resetBtn');
    const resetModal = document.getElementById('resetModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmResetBtn = document.getElementById('confirmResetBtn');

    if (!settingsBtn) return;

    // Update UI
    function updateGameUI() {
        if (coinsText) coinsText.textContent = gameState.coins;
        if (biomeDisplay) biomeDisplay.textContent = biomeNames[gameState.currentBiome] || '☀️ Sunny';
    }

    updateGameUI();

    // Settings popup toggle
    settingsBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (settingsPopup) settingsPopup.classList.toggle('active');
    });

    // Close settings popup when clicking outside
    document.addEventListener('click', function(e) {
        if (settingsPopup && !e.target.closest('.right-panel')) {
            settingsPopup.classList.remove('active');
        }
    });

    // Volume slider
    if (volumeSlider) {
        volumeSlider.value = gameState.musicVolume;
        volumeSlider.addEventListener('input', function() {
            gameState.musicVolume = this.value;
            saveGameState();
        });
    }

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (resetModal) resetModal.classList.add('active');
        });
    }

    // Cancel reset
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (resetModal) resetModal.classList.remove('active');
        });
    }

    // Confirm reset
    if (confirmResetBtn) {
        confirmResetBtn.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = 'index.html';
        });
    }

    // Close modal when clicking outside
    if (resetModal) {
        resetModal.addEventListener('click', function(e) {
            if (e.target === resetModal) {
                resetModal.classList.remove('active');
            }
        });
    }

    // Auto-save every 5 seconds
    setInterval(saveGameState, 5000);
}


// SHOP PAGE FUNCTIONS

function handleShopPageLoad() {
    loadGameState();
    
    const coinsAmount = document.getElementById('coinsAmount');

    if (!coinsAmount) return;

    function updateShopDisplay() {
        coinsAmount.textContent = gameState.coins;
        updateBiomeButtons();
    }

    function updateBiomeButtons() {
        const biomeButtons = document.querySelectorAll('.biome-btn');
        biomeButtons.forEach(btn => {
            const biomeId = btn.getAttribute('data-biome');
            
            if (gameState.ownedBiomes.includes(biomeId)) {
                btn.classList.remove('select-btn');
                
                if (gameState.currentBiome === biomeId) {
                    btn.textContent = '✓ Selected';
                    btn.classList.add('selected');
                } else {
                    btn.textContent = 'Select';
                    btn.classList.remove('selected');
                    btn.onclick = () => selectBiome(biomeId, btn);
                }
            }
        });
    }

    window.buyBiome = function(biomeId, price, btn) {
        if (gameState.coins >= price && !gameState.ownedBiomes.includes(biomeId)) {
            gameState.coins -= price;
            gameState.ownedBiomes.push(biomeId);
            gameState.goldSpent += price;
            saveGameState();
            updateShopDisplay();
            btn.textContent = 'Select';
            btn.onclick = () => selectBiome(biomeId, btn);
        }
    };

    window.selectBiome = function(biomeId, btn) {
        if (gameState.ownedBiomes.includes(biomeId)) {
            gameState.currentBiome = biomeId;
            saveGameState();
            updateShopDisplay();
        }
    };

    window.buyItem = function(itemId, price) {
        if (gameState.coins >= price && !gameState.ownedItems.includes(itemId)) {
            gameState.coins -= price;
            gameState.ownedItems.push(itemId);
            gameState.goldSpent += price;
            saveGameState();
            updateShopDisplay();
        }
    };

    // Tab switching
    window.switchTab = function(tabName) {
        document.getElementById('rods-section').classList.remove('active');
        document.getElementById('biomes-section').classList.remove('active');

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        if (tabName === 'rods') {
            document.getElementById('rods-section').classList.add('active');
            document.querySelectorAll('.tab-btn')[0].classList.add('active');
        } else if (tabName === 'biomes') {
            document.getElementById('biomes-section').classList.add('active');
            document.querySelectorAll('.tab-btn')[1].classList.add('active');
        }
    };

    updateShopDisplay();
}


// STATS PAGE FUNCTIONS

function handleStatsPageLoad() {
    loadGameState();
    
    const timePlayed = document.getElementById('timePlayed');
    const fishCaught = document.getElementById('fishCaught');
    const goldGained = document.getElementById('goldGained');
    const goldSpent = document.getElementById('goldSpent');

    if (!timePlayed) return;

    function updateStatsDisplay() {
        if (timePlayed) timePlayed.textContent = formatTime(gameState.timePlayed);
        if (fishCaught) fishCaught.textContent = gameState.fishCaught;
        if (goldGained) goldGained.textContent = gameState.coins + gameState.goldSpent;
        if (goldSpent) goldSpent.textContent = gameState.goldSpent;
    }

    function saveTimeOnUnload() {
        if (gameState.startTime) {
            const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
            gameState.timePlayed += elapsed;
            gameState.startTime = Date.now();
        } else {
            gameState.startTime = Date.now();
        }
        saveGameState();
    }

    window.addEventListener('beforeunload', saveTimeOnUnload);

    updateStatsDisplay();
}


// PAGE INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    
    if (body.classList.contains('start-page')) {
        handleStartPageLoad();
    } else if (body.classList.contains('game-page')) {
        handleGamePageLoad();
    } else if (body.classList.contains('shop-page')) {
        handleShopPageLoad();
    } else if (body.classList.contains('stats-page')) {
        handleStatsPageLoad();
    }
});