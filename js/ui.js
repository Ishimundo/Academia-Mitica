// =================================================================
// ARCHIVO: js/ui.js
// RESPONSABILIDAD: Todas las manipulaciones del DOM y la interfaz.
// =================================================================

// Este archivo es grande, pero su única tarea es actualizar lo que se ve en pantalla.

export const screens = {
    auth: document.getElementById('auth-screen'),
    raceSelection: document.getElementById('race-selection-screen'),
    characterCreation: document.getElementById('character-creation-screen'),
    game: document.getElementById('game-screen')
};

export function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

export function updatePlayerHub(characterData, raceInfo) {
    // ... lógica para actualizar el hub ...
}

export function openExplorationScreen(locationsData, onLocationSelect) {
    // ... lógica para mostrar el panel de exploración y sus tarjetas ...
}

export function closeExplorationScreen() {
    // ... lógica para cerrar el panel ...
}

// ... aquí irían TODAS las demás funciones de UI:
// updateCombatUI, showCombatLog, openSkillsMenu, closeSkillsMenu,
// showVictoryScreen, displayRaceDetails, setupCharacterCreationScreen, etc.
// Por brevedad, se omiten aquí pero estarían en este archivo.