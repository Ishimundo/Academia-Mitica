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
    
    function updatePlayerHub() {
        if (!gameState.characterData) return;
        const data = gameState.characterData;
        const raceInfo = racesData[data.race];
        playerInfoPanel.avatar.src = data.avatar;
        playerInfoPanel.nameLevel.textContent = `${data.name} - Nv. ${data.level}`;
        playerInfoPanel.race.textContent = raceInfo.name;
        const maxHP = 50 + (data.stats.VIT * 10);
        const maxMP = 30 + (data.stats.INT * 5);
        playerInfoPanel.hpBar.style.width = `100%`;
        playerInfoPanel.mpBar.style.width = `100%`;
    }

    function startGame() { showScreen('game'); updatePlayerHub(); }

    async function handleLogin(event) {
        event.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, document.getElementById('login-email').value, document.getElementById('login-password').value);
            gameState.currentUser = userCredential.user;
            const characterDoc = await getDoc(doc(db, "characters", gameState.currentUser.uid));
            if (characterDoc.exists()) {
                gameState.characterData = characterDoc.data();
                startGame();
            } else {
                showScreen('raceSelection');
            }
        } catch (error) { authError.textContent = "Error: " + error.code; }
    }
    async function handleRegistration(event) {
        event.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, document.getElementById('register-email').value, document.getElementById('register-password').value);
            gameState.currentUser = userCredential.user;
            showScreen('raceSelection');
        } catch (error) { authError.textContent = "Error: " + error.code; }
    }
    async function handleLogout() { try { await signOut(auth); resetGameState(); showScreen('auth'); } catch (error) { console.error("Error al cerrar sesión: ", error); } }
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
        } catch (error) { console.error("Error al guardar personaje: ", error); }
    }

    // --- LÓGICA DE COMBATE ---
    function updateCombatUI() {
        if (!combatState.player) return;
        const playerHPPct = Math.max(0, (combatState.player.currentHP / combatState.player.maxHP) * 100);
        combatScreenElements.playerHP.style.width = `${playerHPPct}%`;
        const playerMPPct = Math.max(0, (combatState.player.currentPM / combatState.player.maxPM) * 100);
        combatScreenElements.playerMP.style.width = `${playerMPPct}%`;
        const enemyHPPct = Math.max(0, (combatState.enemy.currentHP / combatState.enemy.maxHP) * 100);
        combatScreenElements.enemyHP.style.width = `${enemyHPPct}%`;
    }

    function showCombatLog(message, duration = 2000) {
        const log = combatScreenElements.log;
        log.textContent = message;
        log.style.opacity = '1';
        setTimeout(() => { log.style.opacity = '0'; }, duration - 100);
    }

    function executePlayerAction(actionFn) {
        combatScreenElements.actionsMenu.classList.add('hidden');
        actionFn();
        if (!checkCombatStatus()) {
            setTimeout(enemyTurn, 1500);
        }
    }
    
    function playerAttack() {
        const damage = Math.max(1, (combatState.player.FUE * 4) - combatState.enemy.VIT);
        combatState.enemy.currentHP -= damage;
        showCombatLog(`${combatState.player.name} ataca por ${damage} de daño!`);
        document.querySelector('.enemy-panel').classList.add('taking-damage');
        setTimeout(() => document.querySelector('.enemy-panel').classList.remove('taking-damage'), 300);
        updateCombatUI();
    }

    function playerUseSkill(skill) {
        if (combatState.player.currentPM < skill.cost) {
            showCombatLog('¡No tienes suficientes PM!', 1500);
            combatScreenElements.actionsMenu.classList.remove('hidden');
            return;
        }
        closeSkillsMenu();
        combatState.player.currentPM -= skill.cost;
        let logMessage = '';
        if(skill.type === 'magic') {
            const damage = Math.max(1, skill.power + (combatState.player.INT * 2) - combatState.enemy.VIT);
            combatState.enemy.currentHP -= damage;
            logMessage = `${combatState.player.name} usa ${skill.name} por ${damage} de daño mágico!`;
        } else if (skill.type === 'physical') {
            const damage = Math.max(1, skill.power + (combatState.player.FUE * 2) - combatState.enemy.VIT);
            combatState.enemy.currentHP -= damage;
            logMessage = `${combatState.player.name} usa ${skill.name} por ${damage} de daño físico!`;
        } else if (skill.type === 'heal') {
            const healing = Math.max(1, skill.power + (combatState.player.CAR * 2));
            combatState.player.currentHP = Math.min(combatState.player.maxHP, combatState.player.currentHP + healing);
            logMessage = `${combatState.player.name} usa ${skill.name} y se cura ${healing} PV!`;
        }
        showCombatLog(logMessage);
        updateCombatUI();
    }
    
    function enemyTurn() {
        if (combatState.isOver) return;
        const damage = Math.max(1, (combatState.enemy.FUE * 4) - combatState.player.VIT);
        combatState.player.currentHP -= damage;
        showCombatLog(`${combatState.enemy.name} ataca por ${damage} de daño!`);
        document.querySelector('.player-panel').classList.add('taking-damage');
        setTimeout(() => document.querySelector('.player-panel').classList.remove('taking-damage'), 300);
        updateCombatUI();
        if (!checkCombatStatus()) {
            combatScreenElements.actionsMenu.classList.remove('hidden');
        }
    }

    function checkCombatStatus() {
        if (combatState.enemy.currentHP <= 0) {
            combatState.isOver = true;
            endCombat(true);
            return true;
        } else if (combatState.player.currentHP <= 0) {
            combatState.isOver = true;
            endCombat(false);
            return true;
        }
        return false;
    }
    
    async function endCombat(isVictory) {
        combatScreenElements.actionsMenu.classList.add('hidden');
        const message = isVictory ? '¡VICTORIA!' : 'HAS SIDO DERROTADO';
        showCombatLog(message, 3000);

        if (isVictory) {
            const rewards = combatState.enemy.rewards;
            const userRef = doc(db, "characters", gameState.currentUser.uid);
            await updateDoc(userRef, { xp: increment(rewards.xp), ecos: increment(rewards.ecos) });
            gameState.characterData.xp = (gameState.characterData.xp || 0) + rewards.xp;
            gameState.characterData.ecos = (gameState.characterData.ecos || 0) + rewards.ecos;
            setTimeout(() => showVictoryScreen(rewards), 2000);
        } else {
            setTimeout(() => { combatScreenElements.overlay.classList.remove('visible'); }, 3000);
        }
    }

    function showVictoryScreen(rewards) {
        victoryScreenElements.xp.textContent = rewards.xp;
        victoryScreenElements.ecos.textContent = rewards.ecos;
        victoryScreenElements.overlay.classList.remove('hidden');
        setTimeout(() => victoryScreenElements.panel.classList.add('visible'), 50);
    }

    function startCombat(enemyId) {
        const enemyTemplate = enemiesData[enemyId];
        const playerData = gameState.characterData;
        combatState = {
            player: { ...playerData.stats, name: playerData.name, avatar: playerData.avatar, maxHP: 50 + (playerData.stats.VIT * 10), currentHP: 50 + (playerData.stats.VIT * 10), maxPM: 30 + (playerData.stats.INT * 5), currentPM: 30 + (playerData.stats.INT * 5) },
            enemy: { ...enemyTemplate.stats, name: enemyTemplate.name, sprite: enemyTemplate.sprite, rewards: enemyTemplate.rewards },
            isOver: false
        };
        
        combatScreenElements.playerAvatar.src = combatState.player.avatar;
        combatScreenElements.enemySprite.src = combatState.enemy.sprite;
        combatScreenElements.playerName.textContent = combatState.player.name;
        combatScreenElements.enemyName.textContent = combatState.enemy.name;
        updateCombatUI();
        
        combatScreenElements.overlay.classList.add('visible');
        showCombatLog(`¡Un ${combatState.enemy.name} salvaje aparece!`, 2000);
        
        setTimeout(() => { combatScreenElements.actionsMenu.classList.remove('hidden'); }, 2500);
    }
    
    function openSkillsMenu() {
        const skillsList = combatScreenElements.skillsList;
        skillsList.innerHTML = '';
        const playerSkills = racesData[gameState.characterData.race].abilities;

        playerSkills.forEach(skill => {
            const button = document.createElement('button');
            button.className = 'skill-button';
            button.disabled = combatState.player.currentPM < skill.cost;
            button.innerHTML = `<div class="skill-header"><span>${skill.name}</span><span class="skill-cost">${skill.cost} PM</span></div><p class="skill-description">${skill.description}</p>`;
            button.addEventListener('click', () => executePlayerAction(() => playerUseSkill(skill)));
            skillsList.appendChild(button);
        });
        combatScreenElements.skillsMenu.classList.remove('hidden');
    }
    function closeSkillsMenu() { combatScreenElements.skillsMenu.classList.add('hidden'); }
    
    function openExplorationScreen() {
        locationListContainer.innerHTML = '';
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
