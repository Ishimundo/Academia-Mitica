document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. CONFIGURACIÓN DE FIREBASE
    // =================================================================
    // PEGA AQUÍ EL OBJETO firebaseConfig QUE COPIASTE DE TU CONSOLA DE FIREBASE
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
        doc, setDoc, getDoc 
    } = window.firebase;
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // 2. BASES DE DATOS DEL JUEGO
    const racesData = {
        vampiro: { name: "Vampiro", stats: { FUE: 3, AGI: 5, VIT: 4, INT: 7, CAR: 6 }},
        hombrelobo: { name: "Hombre Lobo", stats: { FUE: 8, AGI: 6, VIT: 6, INT: 2, CAR: 3 }},
        sirena: { name: "Sirena / Tritón", stats: { FUE: 2, AGI: 4, VIT: 5, INT: 6, CAR: 8 }},
        kitsune: { name: "Kitsune", stats: { FUE: 2, AGI: 7, VIT: 3, INT: 8, CAR: 5 }}
    };
    const locationsData = [
        { id: 'whispering_woods', name: 'Bosque de los Susurros', description: 'Un antiguo bosque donde los árboles parecen contar historias de tiempos olvidados.', image: 'https://placehold.co/400x200/228B22/FFFFFF?text=Bosque', difficulty: 'Fácil', difficultyColor: 'bg-green-600' },
        { id: 'forbidden_library', name: 'Biblioteca Prohibida', description: 'Contiene grimorios poderosos, pero está protegida por guardianes mágicos y acertijos.', image: 'https://placehold.co/400x200/8B4513/FFFFFF?text=Biblioteca', difficulty: 'Normal', difficultyColor: 'bg-yellow-600' },
        { id: 'astral_arena', name: 'Arena Astral', description: 'Una dimensión de bolsillo creada para duelos y entrenamiento de combate.', image: 'https://placehold.co/400x200/483D8B/FFFFFF?text=Arena', difficulty: 'Variable', difficultyColor: 'bg-purple-600' }
    ];

    // 3. ESTADO DEL JUEGO Y ELEMENTOS DEL DOM
    let gameState = {};
    const resetGameState = () => { gameState = { currentUser: null, characterData: null, chosenRace: null, characterName: null, selectedAvatar: null, dialogueIndex: 0 }; };
    resetGameState();

    const screens = {
        auth: document.getElementById('auth-screen'),
        raceSelection: document.getElementById('race-selection-screen'),
        characterCreation: document.getElementById('character-creation-screen'),
        game: document.getElementById('game-screen')
    };

    const loginForm = document.getElementById('login-form'), registerForm = document.getElementById('register-form'),
          loginTab = document.getElementById('login-tab'), registerTab = document.getElementById('register-tab'),
          authError = document.getElementById('auth-error'), logoutBtn = document.getElementById('logout-btn'),
          navMenu = document.getElementById('navigation-menu'),
          explorationOverlay = document.getElementById('exploration-screen-overlay'),
          closeExplorationBtn = document.getElementById('close-exploration-btn'),
          locationListContainer = document.getElementById('location-list'),
          playerInfoPanel = {
              avatar: document.getElementById('player-avatar'), nameLevel: document.getElementById('player-name-level'),
              race: document.getElementById('player-race'), hpBar: document.getElementById('player-hp-bar'),
              mpBar: document.getElementById('player-mp-bar')
          };

    // 4. FUNCIONES PRINCIPALES
    function showScreen(screenName) { Object.values(screens).forEach(screen => screen.classList.add('hidden')); screens[screenName].classList.remove('hidden'); }
    function switchAuthTab(tab) { /* ... lógica de pestañas ... */ }
    
    function updatePlayerHub() {
        if (!gameState.characterData) return;
        const data = gameState.characterData;
        const raceInfo = racesData[data.race];
        playerInfoPanel.avatar.src = data.avatar;
        playerInfoPanel.nameLevel.textContent = `${data.name} - Nv. ${data.level}`;
        playerInfoPanel.race.textContent = raceInfo.name;
        const maxHP = 50 + (data.stats.VIT * 10);
        const maxMP = 50 + (data.stats.INT * 10);
        playerInfoPanel.hpBar.style.width = `100%`;
        playerInfoPanel.mpBar.style.width = `100%`;
    }

    function startGame() {
        showScreen('game');
        updatePlayerHub();
        // El diálogo ya no aparece al inicio, se puede activar por eventos
    }

    // Funciones de Autenticación y Datos
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
    async function handleLogout() {
        try {
            await signOut(auth);
            resetGameState();
            showScreen('auth');
        } catch (error) { console.error("Error al cerrar sesión: ", error); }
    }
    async function saveCharacter() {
        if (!gameState.currentUser) return;
        const characterData = {
            name: gameState.characterName, race: gameState.chosenRace,
            avatar: gameState.selectedAvatar, level: 1,
            stats: racesData[gameState.chosenRace].stats
        };
        try {
            await setDoc(doc(db, "characters", gameState.currentUser.uid), characterData);
            gameState.characterData = characterData;
            startGame();
        } catch (error) { console.error("Error al guardar personaje: ", error); }
    }

    // Funciones de UI de Creación y Exploración
    function displayRaceDetails(raceKey) { /* ... Lógica para mostrar detalles ... */ }
    function setupCharacterCreationScreen() { /* ... Lógica para preparar pantalla ... */ }
    function checkFormCompletion() { /* ... Lógica de validación ... */ }

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
                    <span class="location-difficulty ${location.difficultyColor}">
                        Peligro: ${location.difficulty}
                    </span>
                </div>`;
            card.addEventListener('click', () => {
                alert(`Viajando a: ${location.name}. ¡La aventura comenzará aquí!`);
                closeExplorationScreen();
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
    
    navMenu.addEventListener('click', (event) => {
        if (event.target.classList.contains('nav-button')) {
            const action = event.target.textContent.trim();
            if (action === '🗺️ Explorar') {
                openExplorationScreen();
            } else {
                alert(`Funcionalidad para "${action}" próximamente.`);
            }
        }
    });
    closeExplorationBtn.addEventListener('click', closeExplorationScreen);

    // Lógica para poblar la selección de raza (simplificado para brevedad)
    const raceSelectionContainer = document.getElementById('race-selection-container');
    Object.keys(racesData).forEach(key => {
        const card = document.createElement('div');
        // ... Lógica para crear las tarjetas de raza
        raceSelectionContainer.appendChild(card);
    });

    showScreen('auth');
});

