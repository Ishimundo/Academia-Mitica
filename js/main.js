document.addEventListener('DOMContentLoaded', () => {

    // 1. CONFIGURACIÓN DE FIREBASE
    const firebaseConfig = {
        apiKey: "AIzaSyCyxCW_rfI0eUnxy5dJojOCzCEa_JX85YI",
        authDomain: "academia-mitica.firebaseapp.com",
        projectId: "academia-mitica",
        storageBucket: "academia-mitica.firebasestorage.app",
        messagingSenderId: "423081540506",
        appId: "1:423081540506:web:5d5a0c699889628c7c5823"
    };
    const { 
        initializeApp, getAuth, createUserWithEmailAndPassword, 
        signInWithEmailAndPassword, signOut, getFirestore, 
        doc, setDoc, getDoc, updateDoc, increment 
    } = window.firebase;
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // 2. BASES DE DATOS DEL JUEGO
    const racesData = {
        vampiro: { name: "Vampiro", description: "Seres nocturnos, elegantes y con un encanto sobrenatural.", image: "https://placehold.co/500x300/483D8B/FFFFFF?text=Vampiro", stats: { FUE: 3, AGI: 5, VIT: 4, INT: 7, CAR: 6 }, abilities: [ { id: 'drain_kiss', name: 'Beso Drenador', cost: 10, power: 15, type: 'magic', description: 'Un beso que absorbe la energía vital del enemigo.' } ]},
        hombrelobo: { name: "Hombre Lobo", description: "Guerreros feroces que canalizan su bestia interior.", image: "https://placehold.co/500x300/8B4513/FFFFFF?text=Hombre+Lobo", stats: { FUE: 8, AGI: 6, VIT: 6, INT: 2, CAR: 3 }, abilities: [ { id: 'wild_claw', name: 'Zarpazo Salvaje', cost: 0, power: 8, type: 'physical', description: 'Un ataque brutal que usa FUE.' } ]},
        sirena: { name: "Sirena / Tritón", description: "Criaturas marinas con voces cautivadoras y dominio sobre el agua.", image: "https://placehold.co/500x300/008B8B/FFFFFF?text=Sirena", stats: { FUE: 2, AGI: 4, VIT: 5, INT: 6, CAR: 8 }, abilities: [ { id: 'healing_song', name: 'Canto Sanador', cost: 12, power: 30, type: 'heal', description: 'Una melodía que restaura tus PV.' } ]},
        kitsune: { name: "Kitsune", description: "Espíritus zorro astutos, maestros de la ilusión y el fuego espectral.", image: "https://placehold.co/500x300/FF4500/FFFFFF?text=Kitsune", stats: { FUE: 2, AGI: 7, VIT: 3, INT: 8, CAR: 5 }, abilities: [ { id: 'fox_fire', name: 'Fuego Fatuo', cost: 9, power: 18, type: 'magic', description: 'Invoca llamas espirituales que queman al enemigo.' } ]}
    };
    const avatarData = {
        vampiro: ['https://placehold.co/200x200/483D8B/FFFFFF?text=Avatar+V1', 'https://placehold.co/200x200/5D4A9C/FFFFFF?text=Avatar+V2'],
        hombrelobo: ['https://placehold.co/200x200/8B4513/FFFFFF?text=Avatar+HL1', 'https://placehold.co/200x200/A0522D/FFFFFF?text=Avatar+HL2'],
        sirena: ['https://placehold.co/200x200/008B8B/FFFFFF?text=Avatar+S1', 'https://placehold.co/200x200/20B2AA/FFFFFF?text=Avatar+S2'],
        kitsune: ['https://placehold.co/200x200/FF4500/FFFFFF?text=Avatar+K1', 'https://placehold.co/200x200/FF6347/FFFFFF?text=Avatar+K2']
    };
    const enemiesData = {
        'slime': {
            name: 'Limo del Pantano',
            sprite: 'https://placehold.co/250x250/2E8B57/FFFFFF?text=Limo',
            stats: { FUE: 3, VIT: 4, AGI: 2, maxHP: 60, currentHP: 60 },
            rewards: { xp: 10, ecos: 5 }
        }
    };
    const locationsData = [
        { id: 'whispering_woods', name: 'Bosque de los Susurros', description: 'Un antiguo bosque donde los árboles parecen contar historias de tiempos olvidados.', image: 'https://placehold.co/400x200/228B22/FFFFFF?text=Bosque', difficulty: 'Fácil', difficultyColor: 'bg-green-600' },
        { id: 'forbidden_library', name: 'Biblioteca Prohibida', description: 'Contiene grimorios poderosos, pero está protegida por guardianes mágicos y acertijos.', image: 'https://placehold.co/400x200/8B4513/FFFFFF?text=Biblioteca', difficulty: 'Normal', difficultyColor: 'bg-yellow-600' },
        { id: 'astral_arena', name: 'Arena Astral', description: 'Una dimensión de bolsillo creada para duelos y entrenamiento de combate.', image: 'https://placehold.co/400x200/483D8B/FFFFFF?text=Arena', difficulty: 'Variable', difficultyColor: 'bg-purple-600' }
    ];

    // 3. ESTADO DEL JUEGO Y ELEMENTOS DEL DOM
    let gameState = {}, combatState = {};
    const resetGameState = () => { gameState = { currentUser: null, characterData: null, chosenRace: null, characterName: null, selectedAvatar: null }; };
    resetGameState();

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

    // 4. FUNCIONES
    function showScreen(screenName) { Object.values(screens).forEach(screen => screen.classList.add('hidden')); screens[screenName].classList.remove('hidden'); }
    function switchAuthTab(tab) {
        authError.textContent = '';
        if (tab === 'login') {
            loginTab.classList.add('active'); registerTab.classList.remove('active');
            loginForm.classList.remove('hidden'); registerForm.classList.add('hidden');
        } else {
            loginTab.classList.remove('active'); registerTab.classList.add('active');
            loginForm.classList.add('hidden'); registerForm.classList.remove('hidden');
        }
    }
    
    // --- LÓGICA DE JUEGO PRINCIPAL ---
    function updatePlayerHub() {
        console.log("Attempting to update player hub.");
        if (!gameState.characterData) {
            console.error("Hub Error: characterData is missing in gameState.");
            return;
        }
        const data = gameState.characterData;
        const raceInfo = racesData[data.race];
        if (!raceInfo) {
            console.error(`Hub Error: Race key "${data.race}" not found.`);
            return;
        }

        playerInfoPanel.avatar.src = data.avatar;
        playerInfoPanel.nameLevel.textContent = `${data.name} - Nv. ${data.level}`;
        playerInfoPanel.race.textContent = raceInfo.name;
        const maxHP = 50 + (data.stats.VIT * 10);
        const maxMP = 30 + (data.stats.INT * 5);
        playerInfoPanel.hpBar.style.width = `100%`;
        playerInfoPanel.mpBar.style.width = `100%`;
        console.log("Player hub updated successfully.");
    }

    function startGame() {
        console.log("Starting game with data:", gameState.characterData);
        showScreen('game');
        try {
            updatePlayerHub();
        } catch (error) {
            console.error("CRITICAL ERROR on startGame:", error);
        }
    }

    // --- FUNCIONES DE AUTENTICACIÓN Y DATOS ---
    async function handleLogin(event) {
        event.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, loginForm.querySelector('#login-email').value, loginForm.querySelector('#login-password').value);
            console.log("Login successful for user:", userCredential.user.uid);
            gameState.currentUser = userCredential.user;
            const characterDoc = await getDoc(doc(db, "characters", gameState.currentUser.uid));
            if (characterDoc.exists()) {
                console.log("Character document found.");
                gameState.characterData = characterDoc.data();
                startGame();
            } else {
                console.log("No character document found. Proceeding to creation.");
                showScreen('raceSelection');
            }
        } catch (error) { authError.textContent = "Error: " + error.code; console.error("Login failed:", error); }
    }
    async function handleRegistration(event) {
        event.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, registerForm.querySelector('#register-email').value, registerForm.querySelector('#register-password').value);
            console.log("Registration successful for user:", userCredential.user.uid);
            gameState.currentUser = userCredential.user;
            showScreen('raceSelection');
        } catch (error) { authError.textContent = "Error: " + error.code; console.error("Registration failed:", error); }
    }
    async function handleLogout() { try { await signOut(auth); resetGameState(); showScreen('auth'); } catch (error) { console.error("Error signing out:", error); } }
    async function saveCharacter() {
        if (!gameState.currentUser) return;
        const characterData = {
            name: gameState.characterName, race: gameState.chosenRace,
            avatar: gameState.selectedAvatar, level: 1, xp: 0, ecos: 0,
            stats: racesData[gameState.chosenRace].stats
        };
        try {
            await setDoc(doc(db, "characters", gameState.currentUser.uid), characterData);
            gameState.characterData = characterData;
            startGame();
        } catch (error) { console.error("Error saving character:", error); }
    }

    // --- FUNCIONES DE CREACIÓN DE PERSONAJE ---
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
    
    // --- LÓGICA DE COMBATE Y EXPLORACIÓN ---
    function updateCombatUI() { /* ... código sin cambios ... */ }
    function showCombatLog(message, duration = 2000) { /* ... código sin cambios ... */ }
    function executePlayerAction(actionFn) { /* ... código sin cambios ... */ }
    function playerAttack() { /* ... código sin cambios ... */ }
    function playerUseSkill(skill) { /* ... código sin cambios ... */ }
    function enemyTurn() { /* ... código sin cambios ... */ }
    function checkCombatStatus() { /* ... código sin cambios ... */ }
    async function endCombat(isVictory) { /* ... código sin cambios ... */ }
    function showVictoryScreen(rewards) { /* ... código sin cambios ... */ }
    function startCombat(enemyId) { /* ... código sin cambios ... */ }
    function openSkillsMenu() { /* ... código sin cambios ... */ }
    function closeSkillsMenu() { /* ... código sin cambios ... */ }

    function openExplorationScreen() {
        locationListContainer.innerHTML = ''; // Limpiar lista anterior
        locationsData.forEach(location => {
            const card = document.createElement('div');
            card.className = 'location-card';
            card.innerHTML = `
                <img src="${location.image}" alt="Imagen de ${location.name}">
                <div class="location-card-content">
                    <h3>${location.name}</h3>
                    <p>${location.description}</p>
                    <span class="location-difficulty ${location.difficultyColor}">Peligro: ${location.difficulty}</span>
                </div>`;
            card.addEventListener('click', () => {
                closeExplorationScreen();
                if (location.id === 'whispering_woods') {
                    startCombat('slime');
                } else {
                    alert(`La zona "${location.name}" aún no está disponible.`);
                }
            });
            locationListContainer.appendChild(card);
        });
        explorationOverlay.classList.remove('hidden');
    }
    function closeExplorationScreen() { explorationOverlay.classList.add('hidden'); }

    // 5. INICIALIZACIÓN Y EVENT LISTENERS
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    registerTab.addEventListener('click', () => switchAuthTab('register'));
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegistration);
    logoutBtn.addEventListener('click', handleLogout);
    
    confirmCharacterBtn.addEventListener('click', () => { if (!confirmCharacterBtn.disabled) saveCharacter(); });
    charNameInput.addEventListener('input', checkFormCompletion);
    
    navMenu.addEventListener('click', (event) => {
        if (event.target.classList.contains('nav-button')) {
            const action = event.target.textContent.trim();
            if (action === '🗺️ Explorar') { openExplorationScreen(); } 
            else { alert(`Funcionalidad para "${action}" próximamente.`); }
        }
    });
    closeExplorationBtn.addEventListener('click', closeExplorationScreen);

    combatScreenElements.attackBtn.addEventListener('click', () => executePlayerAction(playerAttack));
    combatScreenElements.skillsBtn.addEventListener('click', openSkillsMenu);
    combatScreenElements.closeSkillsBtn.addEventListener('click', closeSkillsMenu);
    
    victoryScreenElements.closeBtn.addEventListener('click', () => {
        victoryScreenElements.overlay.classList.add('hidden');
        victoryScreenElements.panel.classList.remove('visible');
        combatScreenElements.overlay.classList.remove('visible');
        updatePlayerHub();
    });

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

    showScreen('auth');
});
```

### **Qué hacer ahora**

1.  **Reemplaza** el contenido de tu archivo `js/main.js` con el código de arriba.
2.  **Sube los cambios a GitHub** como hemos hecho antes (con `git add .`, `git commit -m "Fix: Corrige error de carga post-login"` y `git push origin main`).
3.  **Prueba de nuevo.**

Esta vez, el flujo debería funcionar. Si por alguna razón sigue fallando, te pediré que hagas algo más:

* En tu navegador, presiona **F12** para abrir las **Herramientas de Desarrollador**.
* Ve a la pestaña que dice **"Consola" (Console)**.
* Intenta iniciar sesión de nuevo y, si falla, aparecerán mensajes de error en rojo en esa consola. Esos mensajes son los que nos dirán exactamente dónde está el problema.

Crucemos los dedos para que esta versión corregida solucione el problema de una vez. ¡Lamento mucho los inconvenient