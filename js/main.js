// =================================================================
// ARCHIVO: js/main.js
// RESPONSABILIDAD: Punto de entrada. Orquestar los módulos.
// =================================================================
import { handleLogin, handleRegistration, handleLogout } from './auth.js';
import { getCharacter, saveCharacter, updateCharacterRewards } from './firestore.js';
import { racesData, avatarData, enemiesData, locationsData } from './gameData.js';

// --- Estado Global ---
let gameState = {};
const resetGameState = () => { gameState = { currentUser: null, characterData: null, chosenRace: null, characterName: null, selectedAvatar: null }; };

// --- Selectores del DOM ---
const screens = { auth: document.getElementById('auth-screen'), raceSelection: document.getElementById('race-selection-screen'), characterCreation: document.getElementById('character-creation-screen'), game: document.getElementById('game-screen') };
// ... (todos los demás selectores)

// --- Lógica de UI (Temporalmente aquí, se movería a ui.js) ---
function showScreen(screenName) { Object.values(screens).forEach(screen => screen.classList.add('hidden')); screens[screenName].classList.remove('hidden'); }
// ... (todas las demás funciones de UI)

// --- Lógica de Combate (Temporalmente aquí, se movería a combat.js) ---
// ... (toda la lógica de combate)

// --- Flujo Principal ---
async function onLogin(user) {
    gameState.currentUser = user;
    const character = await getCharacter(user.uid);
    if (character) {
        gameState.characterData = character;
        startGame();
    } else {
        showScreen('raceSelection');
    }
}

function startGame() {
    showScreen('game');
    // updatePlayerHub(); // Esta función usaría gameState.characterData
}

// --- Event Listeners ---
function init() {
    // Auth listeners
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const result = await handleLogin(e.target['login-email'].value, e.target['login-password'].value);
        if (result.user) {
            onLogin(result.user);
        } else {
            document.getElementById('auth-error').textContent = result.error;
        }
    });
    // ... otros listeners

    resetGameState();
    showScreen('auth');
}

// --- Inicializar la App ---
init();