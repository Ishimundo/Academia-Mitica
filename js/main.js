// =================================================================
// ARCHIVO: js/main.js
// RESPONSABILIDAD: Punto de entrada. Orquestar los módulos y eventos.
// =================================================================
import { handleLogin, handleRegistration, handleLogout } from './auth.js';
import { getCharacter, saveCharacter, updateCharacterRewards } from './firestore.js';
import { racesData, avatarData, enemiesData, locationsData } from './gameData.js';
// La lógica de combate y UI se mantendrá aquí por simplicidad, pero podría moverse a sus propios módulos.

// --- 1. ESTADO GLOBAL ---
let gameState = {};
let combatState = {};
const resetGameState = () => { gameState = { currentUser: null, characterData: null, chosenRace: null, characterName: null, selectedAvatar: null }; };

// --- 2. SELECTORES DEL DOM ---
const screens = { auth: document.getElementById('auth-screen'), raceSelection: document.getElementById('race-selection-screen'), characterCreation: document.getElementById('character-creation-screen'), game: document.getElementById('game-screen') };
const loginForm = document.getElementById('login-form'), registerForm = document.getElementById('register-form'),
      loginTab = document.getElementById('login-tab'), registerTab = document.getElementById('register-tab'),
      authError = document.getElementById('auth-error'), logoutBtn = document.getElementById('logout-btn'),
      raceSelectionContainer = document.getElementById('race-selection-container'), raceDetailsContent = document.getElementById('race-details-content'),
      placeholderPanel = document.getElementById('placeholder-panel'), charNameInput = document.getElementById('char-name'),
      avatarSelectionContainer = document.getElementById('avatar-selection-container'), confirmCharacterBtn = document.getElementById('confirm-character-btn'),
      raceSubtitle = document.getElementById('race-subtitle'), navMenu = document.getElementById('navigation-menu'),
      explorationOverlay = document.getElementById('exploration-screen-overlay'), closeExplorationBtn = document.getElementById('close-exploration-btn'),
      locationListContainer = document.getElementById('location-list'), playerInfoPanel = {
          avatar: document.getElementById('player-avatar'), nameLevel: document.getElementById('player-name-level'),
          race: document.getElementById('player-race'), hpBar: document.getElementById('player-hp-bar'),
          mpBar: document.getElementById('player-mp-bar')
      };
const combatScreenElements = {
    overlay: document.getElementById('combat-screen-overlay'), log: document.getElementById('combat-log'),
    playerName: document.getElementById('combat-player-name'), playerHP: document.getElementById('combat-player-hp'),
    playerMP: document.getElementById('combat-player-mp'), playerAvatar: document.getElementById('combat-player-avatar'),
    enemyName: document.getElementById('combat-enemy-name'), enemyHP: document.getElementById('combat-enemy-hp'),
    enemySprite: document.getElementById('combat-enemy-sprite'), actionsMenu: document.getElementById('combat-actions-menu'),
    attackBtn: document.getElementById('combat-attack-btn'), skillsBtn: document.getElementById('combat-skills-btn'),
    skillsMenu: document.getElementById('skills-menu-overlay'), skillsList: document.getElementById('skills-list'),
    closeSkillsBtn: document.getElementById('close-skills-btn')
};
const victoryScreenElements = {
    overlay: document.getElementById('victory-rewards-overlay'), panel: document.getElementById('victory-rewards-panel'),
    xp: document.getElementById('xp-reward'), ecos: document.getElementById('ecos-reward'),
    closeBtn: document.getElementById('close-victory-panel-btn')
};

// --- 3. FUNCIONES DE LÓGICA Y UI ---

function showScreen(screenName) { Object.values(screens).forEach(screen => screen.classList.add('hidden')); screens[screenName].classList.remove('hidden'); }
function switchAuthTab(tab) { /* ... lógica de pestañas ... */ }

function updatePlayerHub() {
    if (!gameState.characterData) return;
    const data = gameState.characterData;
    const raceInfo = racesData[data.race];
    playerInfoPanel.avatar.src = data.avatar;
    playerInfoPanel.nameLevel.textContent = `${data.name} - Nv. ${data.level}`;
    playerInfoPanel.race.textContent = raceInfo.name;
    playerInfoPanel.hpBar.style.width = `100%`;
    playerInfoPanel.mpBar.style.width = `100%`;
}

function startGame() { showScreen('game'); updatePlayerHub(); }

async function onLoginSuccess(user) {
    gameState.currentUser = user;
    const character = await getCharacter(user.uid);
    if (character) {
        gameState.characterData = character;
        startGame();
    } else {
        showScreen('raceSelection');
    }
}

function displayRaceDetails(raceKey) {
    const race = racesData[raceKey];
    const createStatBar = (statName, value) => `<div class="mb-2"><div class="flex justify-between text-sm mb-1"><span class="font-bold text-gray-300">${statName.toUpperCase()}</span><span class="text-gray-400">${value}/10</span></div><div class="stat-bar-bg w-full h-2.5 rounded-full"><div class="stat-bar-fill h-2.5 rounded-full" style="width: ${value * 10}%"></div></div></div>`;
    raceDetailsContent.innerHTML = `<img src="${race.image}" alt="Imagen de ${race.name}" class="w-full h-48 object-cover rounded-lg mb-4"><h3 class="text-3xl font-title text-yellow-400 mb-2">${race.name}</h3><p class="text-gray-400 italic mb-6">${race.description}</p><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><h4 class="font-title text-xl mb-3 text-white">Estadísticas Base</h4>${Object.entries(race.stats).map(([key, value]) => createStatBar(key, value)).join('')}</div><div class="space-y-4"><div><h4 class="font-title text-xl mb-2 text-white">Habilidades Iniciales</h4><ul class="list-disc list-inside text-gray-400">${race.abilities.map(a => `<li>${a.name}</li>`).join('')}</ul></div></div></div><div class="text-center mt-8"><button id="confirm-race-btn" class="action-button">Confirmar Linaje</button></div>`;
    placeholderPanel.classList.add('hidden');
    raceDetailsContent.classList.remove('hidden');
    document.getElementById('confirm-race-btn').addEventListener('click', () => {
        gameState.chosenRace = raceKey;
        setupCharacterCreationScreen();
        showScreen('characterCreation');
    });
}

function setupCharacterCreationScreen() {
    const raceKey = gameState.chosenRace;
    raceSubtitle.textContent = `Linaje: ${racesData[raceKey].name}`;
    avatarSelectionContainer.innerHTML = '';
    avatarData[raceKey].forEach((avatarUrl) => {
        const card = document.createElement('div');
        card.className = 'avatar-card';
        card.innerHTML = `<img src="${avatarUrl}" class="w-full h-full object-cover rounded-lg">`;
        card.addEventListener('click', () => {
            gameState.selectedAvatar = avatarUrl;
            document.querySelectorAll('.avatar-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            checkFormCompletion();
        });
        avatarSelectionContainer.appendChild(card);
    });
    checkFormCompletion();
}

function checkFormCompletion() {
    gameState.characterName = charNameInput.value.trim();
    confirmCharacterBtn.disabled = !(gameState.characterName && gameState.selectedAvatar);
}

// --- TODA LA LÓGICA DE COMBATE Y EXPLORACIÓN ---
function openExplorationScreen() {
    locationListContainer.innerHTML = '';
    locationsData.forEach(location => {
        const card = document.createElement('div');
        card.className = 'location-card';
        card.innerHTML = `<img src="${location.image}" alt="Imagen de ${location.name}"><div class="location-card-content"><h3>${location.name}</h3><p>${location.description}</p><span class="location-difficulty ${location.difficultyColor}">Peligro: ${location.difficulty}</span></div>`;
        card.addEventListener('click', () => {
            closeExplorationScreen();
            if (location.id === 'whispering_woods') { startCombat('slime'); } 
            else { alert(`La zona "${location.name}" aún no está disponible.`); }
        });
        locationListContainer.appendChild(card);
    });
    explorationOverlay.classList.remove('hidden');
}
function closeExplorationScreen() { explorationOverlay.classList.add('hidden'); }
// ... (Toda la lógica de combate de la versión anterior va aquí: startCombat, updateCombatUI, etc.)

// --- 4. INICIALIZACIÓN Y EVENT LISTENERS ---
function init() {
    resetGameState();
    
    // Auth listeners
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await handleLogin(e.target['login-email'].value, e.target['login-password'].value);
        if (result.user) onLoginSuccess(result.user);
        else authError.textContent = result.error;
    });
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await handleRegistration(e.target['register-email'].value, e.target['register-password'].value);
        if (result.user) onLoginSuccess(result.user);
        else authError.textContent = result.error;
    });
    logoutBtn.addEventListener('click', handleLogout);
    
    // Character creation listeners
    Object.keys(racesData).forEach(key => {
        const race = racesData[key];
        const card = document.createElement('div');
        card.className = 'race-card p-4 flex items-center space-x-4';
        card.innerHTML = `<img src="${race.image}" alt="Icono" class="w-20 h-20 rounded-md object-cover border-2 border-gray-600"><div><h3 class="text-xl font-title text-white">${race.name}</h3><p class="text-sm text-gray-400">${race.description.substring(0, 50)}...</p></div>`;
        card.addEventListener('click', () => {
            document.querySelectorAll('.race-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            displayRaceDetails(key);
        });
        raceSelectionContainer.appendChild(card);
    });
    charNameInput.addEventListener('input', checkFormCompletion);
    confirmCharacterBtn.addEventListener('click', async () => {
        if (!confirmCharacterBtn.disabled) {
            const characterData = await saveCharacter(gameState.currentUser.uid, {
                characterName: gameState.characterName,
                chosenRace: gameState.chosenRace,
                selectedAvatar: gameState.selectedAvatar
            });
            if(characterData) {
                gameState.characterData = characterData;
                startGame();
            }
        }
    });

    // Game listeners
    navMenu.addEventListener('click', (event) => {
        if (event.target.classList.contains('nav-button')) {
            const action = event.target.textContent.trim();
            if (action === '🗺️ Explorar') { openExplorationScreen(); } 
            else { alert(`Funcionalidad para "${action}" próximamente.`); }
        }
    });
    closeExplorationBtn.addEventListener('click', closeExplorationScreen);

    // Combat listeners
    // ...

    showScreen('auth');
}

init();
