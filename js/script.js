/* CALM WATERS - JavaScript */

// Game state object
let gameState = {
    coins: 0,
    fishCaught: 0,
    isFishing: false,
    currentBiome: 'beachside',
    ownedItems: ['wooden-rod'],
    ownedBiomes: ['beachside'],
    musicVolume: 50,
    sfxVolume: 30,
    timePlayed: 0,
    goldSpent: 0,
    totalGoldEarned: 0,
    startTime: null
};

// Biome display names 
const biomeNames = {
    'beachside': '☀️ Beachside',
    'mountain-lake': '⛰️ Mountain Lake',
    'arctic': '🐻‍❄️ Arctic',
    'deep-ocean': '🌊 Deep Ocean'
};

// Biome base gold values
const biomeBaseGold = {
    'beachside': 1,
    'mountain-lake': 2,
    'arctic': 3,
    'deep-ocean': 4
};

// Rod multiplier values
const rodMultipliers = {
    'wooden-rod': 1,
    'bamboo-rod': 2,
    'carbon-rod': 3,
    'legendary-rod': 5
};

// Biome assets map 
const biomeAssets = {
    'beachside': {
        img: 'assets/img/beachside.jpg',
        music: 'assets/audio/bg-music.mp3'
    },
    'mountain-lake': {
        img: 'assets/img/lake.jpg',
        music: 'assets/audio/bg-music.mp3'
    },
    'arctic': {
        img: 'assets/img/arctic.jpg',
        music: 'assets/audio/bg-music.mp3'
    },
    'deep-ocean': {
        img: 'assets/img/deep_ocean.png',
        music: 'assets/audio/bg-music.mp3'
    }
};

// Global variable for background music
let bgMusicAudio;

// --- COOKIE UTILITY FUNCTIONS ---
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999; path=/';
}

function playSound(src) {
    const audio = new Audio(src);
    audio.volume = gameState.sfxVolume / 100;
    audio.play().catch(e => console.log('Sound failed:', e));
}

function loadGameState() {
    const saved = getCookie('gameState');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gameState = { ...gameState, ...data };
            return true;
        } catch (e) {
            console.error("Failed to parse cookie data");
        }
    }
    return false;
}

function saveGameState() {
    setCookie('gameState', JSON.stringify(gameState), 365);
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
}

// --- GLOBAL GAME MECHANICS ---

// Calculate current gold per second based on Biome and best Rod
function getGoldPerSecond() {
    const baseGold = biomeBaseGold[gameState.currentBiome] || 1;
    let multiplier = 1;

    // Automatically apply the best rod multiplier the player owns
    if (gameState.ownedItems.includes('legendary-rod')) multiplier = rodMultipliers['legendary-rod'];
    else if (gameState.ownedItems.includes('carbon-rod')) multiplier = rodMultipliers['carbon-rod'];
    else if (gameState.ownedItems.includes('bamboo-rod')) multiplier = rodMultipliers['bamboo-rod'];

    return baseGold * multiplier;
}

// Updates gold display on whatever page is currently open
function updateGlobalUI() {
    const displayCoins = Math.floor(gameState.coins); // Hide decimals from the player

    const coinsText = document.getElementById('coinsText');
    if (coinsText) coinsText.textContent = displayCoins;
    if (coinsText) {
        const popup = document.createElement('span');
        popup.textContent = `+${Math.floor(getGoldPerSecond())}`;
        playSound('assets/audio/coin.mp3');
        popup.className = 'gold-popup';
        coinsText.parentElement.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }

    const coinsAmount = document.getElementById('coinsAmount');
    if (coinsAmount) coinsAmount.textContent = displayCoins;

    const goldGained = document.getElementById('goldGained');
    if (goldGained) goldGained.textContent = Math.floor(gameState.totalGoldEarned);
}

//initiate the to-do list
function initTodoList() {
    const toggle = document.getElementById('todoToggle');
    const dropdown = document.getElementById('todoDropdown');
    const arrow = toggle.querySelector('.todo-arrow');
    const addBtn = document.getElementById('todoAddBtn');
    const input = document.getElementById('todoInput');
    const list = document.getElementById('todoList');

    if (!toggle) return;

    // Toggle dropdown
    toggle.addEventListener('click', function() {
        dropdown.classList.toggle('open');
        arrow.classList.toggle('open');
    });

    // Add task on button click
    addBtn.addEventListener('click', addTask);

    // Add task on Enter key
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') addTask();
    });

    function addTask() {
        const text = input.value.trim();
        if (!text) return;

        const li = document.createElement('li');
        li.className = 'todo-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        const span = document.createElement('span');
        span.textContent = text;

        checkbox.addEventListener('change', function() {
            li.classList.add('completing');
            setTimeout(() => {
                li.classList.add('removing');
                setTimeout(() => li.remove(), 400);
            }, 500);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        list.appendChild(li);
        input.value = '';
        input.focus();
    }
}

// Starts passive loops (gold and autosave)
function startGlobalLoops() {
    // Passive Gold Loop
    setInterval(() => {
        // Only run if not on start page
        if (!document.body.classList.contains('start-page')) {
            gameState.coins += getGoldPerSecond();
            const gif = document.getElementById('fishingGif');
            if (gif) {
                const popup = document.createElement('span');
                popup.className = 'fish-popup';
                popup.textContent = `+🐟`;
                gif.parentElement.appendChild(popup);
                setTimeout(() => popup.remove(), 1500);
            }
            updateGlobalUI();
            gameState.fishCaught += 1;
            gameState.totalGoldEarned += getGoldPerSecond();
        }
    }, 3000);

    // Auto-save Loop
    setInterval(saveGameState, 5000);
}

// Function to update biome visuals and start audio
function updateVisualsAndAudio() {
    const currentBiomeId = gameState.currentBiome;
    const assets = biomeAssets[currentBiomeId];

    if (!assets) return;

    // 1. Update Background Image (only on game-page)
    const body = document.body;
    if (body.classList.contains('game-page')) {
        body.style.backgroundImage = `url('${assets.img}')`;
        body.style.backgroundSize = 'cover';
        body.style.backgroundPosition = 'center';
        body.style.backgroundRepeat = 'no-repeat';
        body.style.backgroundAttachment = 'scroll';
    }

    // 2. Setup Background Music (no music on index page)
    if (!body.classList.contains('start-page')) {
        if (!bgMusicAudio) {
            bgMusicAudio = new Audio(assets.music);
            bgMusicAudio.loop = true;
        } else {
            if (!bgMusicAudio.src.includes(assets.music)) {
                bgMusicAudio.src = assets.music;
            }
        }

        bgMusicAudio.volume = gameState.musicVolume / 100;

        // Attempt to play. Browsers usually allow this on game.html if the user clicked a link to get here.
        let playPromise = bgMusicAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Audio blocked by browser. Will play on first click anywhere on the page.");
            });
        }
    }
}

// START PAGE FUNCTIONS
function handleStartPageLoad() {
    const playerName = getCookie('playerName');
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
        startForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = document.getElementById('playerName').value.trim();
            if (name) {
                setCookie('playerName', name, 365);
                window.location.href = 'game.html';
            }
        });
    }

    if (continueBtn) {
        continueBtn.addEventListener('click', function () {
            window.location.href = 'game.html';
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            eraseCookie('playerName');
            eraseCookie('gameState');
            location.reload();
        });
    }
}

// GAME PAGE FUNCTIONS
function handleGamePageLoad() {
    gameState.startTime = Date.now();
    const biomeDisplay = document.getElementById('biomeDisplay');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPopup = document.getElementById('settingsPopup');
    const volumeSlider = document.getElementById('volumeSlider');
    const resetBtn = document.getElementById('resetBtn');
    const resetModal = document.getElementById('resetModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const confirmResetBtn = document.getElementById('confirmResetBtn');


    if (biomeDisplay) biomeDisplay.textContent = biomeNames[gameState.currentBiome] || '☀️ Beachside';

    // Settings popup toggle
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (settingsPopup) settingsPopup.classList.toggle('active');
        });
    }

    // Close settings popup when clicking outside
    document.addEventListener('click', function (e) {
        if (settingsPopup && !e.target.closest('.right-panel')) {
            settingsPopup.classList.remove('active');
        }
    });

    // Volume slider
    if (volumeSlider) {
        volumeSlider.value = gameState.musicVolume;
        volumeSlider.addEventListener('input', function () {
            gameState.musicVolume = parseInt(this.value);
            if (bgMusicAudio) {
                bgMusicAudio.volume = this.value / 100;
                // If audio was blocked on load, start it now on this user interaction
                if (bgMusicAudio.paused) {
                    bgMusicAudio.play().catch(e => console.log("Audio failed:", e));
                }
            }
            saveGameState();
        });
    }

    const sfxSlider = document.getElementById('sfxSlider');
    if (sfxSlider) {
        sfxSlider.value = gameState.sfxVolume;
        sfxSlider.addEventListener('input', function () {
            gameState.sfxVolume = parseInt(this.value);
            saveGameState();
        });
    }

    // Reset buttons logic
    if (resetBtn) {
        resetBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (resetModal) resetModal.classList.add('active');
        });
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function () {
            if (resetModal) resetModal.classList.remove('active');
        });
    }
    if (confirmResetBtn) {
        confirmResetBtn.addEventListener('click', function () {
            eraseCookie('gameState');
            eraseCookie('playerName');
            gameState = {
                coins: 0,
                fishCaught: 0,
                isFishing: false,
                currentBiome: 'beachside',
                ownedItems: [],
                ownedBiomes: ['beachside'],
                musicVolume: 50,
                sfxVolume: 30,
                timePlayed: 0,
                goldSpent: 0,
                totalGoldEarned: 0,
                startTime: null
            };
            window.location.href = 'index.html';
        });
    }
    if (resetModal) {
        resetModal.addEventListener('click', function (e) {
            if (e.target === resetModal) {
                resetModal.classList.remove('active');
            }
        });
    }
    startAdviceTicker();
    initTodoList();
}

// SHOP PAGE FUNCTIONS
function handleShopPageLoad() {
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

    function updateRodButtons() {
        const buyButtons = document.querySelectorAll('.buy-btn');
        buyButtons.forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick');
            // Extract item ID from the onclick string (e.g., 'wooden-rod')
            const match = onclickAttr.match(/'([^']+)'/);
            if (match && match[1]) {
                const itemId = match[1];
                if (gameState.ownedItems.includes(itemId)) {
                    btn.textContent = 'Owned';
                    btn.disabled = true;
                    btn.style.opacity = '0.5';
                    btn.style.cursor = 'not-allowed';
                }
            }
        });
    }

    window.buyBiome = function (biomeId, price, btn) {
        if (gameState.coins >= price && !gameState.ownedBiomes.includes(biomeId)) {
            gameState.coins -= price;
            gameState.ownedBiomes.push(biomeId);
            playSound('assets/audio/newbiome.mp3');
            gameState.goldSpent += price;
            saveGameState();
            updateGlobalUI();
            updateBiomeButtons();
        }
    };

    window.selectBiome = function (biomeId, btn) {
        if (gameState.ownedBiomes.includes(biomeId)) {
            gameState.currentBiome = biomeId;
            saveGameState();
            updateGlobalUI();
            updateBiomeButtons();
            updateVisualsAndAudio();
        }
    };

    window.buyItem = function (itemId, price) {
        if (gameState.coins >= price && !gameState.ownedItems.includes(itemId)) {
            gameState.coins -= price;
            gameState.ownedItems.push(itemId);
            playSound('assets/audio/newrod.mp3');
            gameState.goldSpent += price;
            saveGameState();
            updateGlobalUI();
            updateRodButtons();
        }
    };

    window.switchTab = function (tabName) {
        document.getElementById('rods-section').classList.remove('active');
        document.getElementById('biomes-section').classList.remove('active');
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

        if (tabName === 'rods') {
            document.getElementById('rods-section').classList.add('active');
            document.querySelectorAll('.tab-btn')[0].classList.add('active');
        } else if (tabName === 'biomes') {
            document.getElementById('biomes-section').classList.add('active');
            document.querySelectorAll('.tab-btn')[1].classList.add('active');
        }
    };

    updateBiomeButtons();
    updateRodButtons();
}

// STATS PAGE FUNCTIONS
function handleStatsPageLoad() {
    const timePlayed = document.getElementById('timePlayed');
    const fishCaught = document.getElementById('fishCaught');
    const goldSpent = document.getElementById('goldSpent');

    function updateStatsDisplay() {
        if (timePlayed) timePlayed.textContent = formatTime(gameState.timePlayed);
        if (fishCaught) fishCaught.textContent = gameState.fishCaught;
        if (goldSpent) goldSpent.textContent = gameState.goldSpent;
        // Note: Gold is handled by updateGlobalUI()
    }

    updateStatsDisplay();
    setInterval(updateStatsDisplay, 1000);
}

function startAdviceTicker() {
    async function fetchAdvice() {
        try {
            const res = await fetch('https://api.adviceslip.com/advice');
            const data = await res.json();
            const ticker = document.getElementById('adviceTicker');
            if (ticker) ticker.textContent = data.slip.advice;
        } catch (e) {
            console.log('Advice fetch failed:', e);
        }
    }

    fetchAdvice();
    // fetch advice every 1 minute
    setInterval(fetchAdvice, 60000);
}

// PAGE INITIALIZATION
document.addEventListener('DOMContentLoaded', function () {
    // Load data, music, and loops
    loadGameState();
    updateVisualsAndAudio();
    startGlobalLoops();

    // 4. Force audio start on first click if browser blocked autoplay
    document.body.addEventListener('click', function () {
        if (bgMusicAudio && bgMusicAudio.paused && !document.body.classList.contains('start-page')) {
            bgMusicAudio.play().catch(e => console.log("Audio failed:", e));
        }
    }, { once: true });

    //Run page-specific loading
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

    //Do a first sweep of UI updates
    updateGlobalUI();
});

// Time tracking for Stats Page
window.addEventListener('beforeunload', function() {
    if (gameState.startTime) {
        const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
        gameState.timePlayed += elapsed;
    }
    saveGameState();
});