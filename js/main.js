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

    // Usamos las funciones de Firebase que importamos en el HTML
    const { 
        initializeApp, getAuth, createUserWithEmailAndPassword, 
        signInWithEmailAndPassword, signOut, getFirestore, 
        doc, setDoc, getDoc 
    } = window.firebase;

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // =================================================================
    // 2. BASES DE DATOS DEL JUEGO
    // =================================================================
    const racesData = {
        vampiro: { name: "Vampiro", description: "Seres nocturnos, elegantes y con un encanto sobrenatural.", image: "https://placehold.co/500x300/483D8B/FFFFFF?text=Vampiro", stats: { FUE: 3, AGI: 5, VIT: 4, INT: 7, CAR: 6 }, passive: "Sanguijuela Vital: Recupera PV al infligir daño con habilidades.", abilities: ["Beso del Chupasangre", "Encanto"], affinities: { strong: "Psíquico, Veneno", weak: "Fuego, Sagrado" }},
        hombrelobo: { name: "Hombre Lobo", description: "Guerreros feroces que canalizan su bestia interior.", image: "https://placehold.co/500x300/8B4513/FFFFFF?text=Hombre+Lobo", stats: { FUE: 8, AGI: 6, VIT: 6, INT: 2, CAR: 3 }, passive: "Furia Lunar: Aumenta FUE y AGI con PV bajos.", abilities: ["Zarpazo Salvaje", "Aullido Intimidante"], affinities: { strong: "Naturaleza, Hielo", weak: "Plata, Fuego" }},
        sirena: { name: "Sirena / Tritón", description: "Criaturas marinas con voces cautivadoras y dominio sobre el agua.", image: "https://placehold.co/500x300/008B8B/FFFFFF?text=Sirena", stats: { FUE: 2, AGI: 4, VIT: 5, INT: 6, CAR: 8 }, passive: "Afinidad Acuática: Habilidades de Agua cuestan menos PM.", abilities: ["Canto Melódico", "Chorro de Agua"], affinities: { strong: "Fuego", weak: "Eléctrico, Naturaleza" }},
        kitsune: { name: "Kitsune", description: "Espíritus zorro astutos, maestros de la ilusión y el fuego espectral.", image: "https://placehold.co/500x300/FF4500/FFFFFF?text=Kitsune", stats: { FUE: 2, AGI: 7, VIT: 3, INT: 8, CAR: 5 }, passive: "Paso Ilusorio: Probabilidad innata de evadir ataques.", abilities: ["Fuego Fatuo", "Engaño"], affinities: { strong: "Tierra, Viento", weak: "Psíquico, Agua" }}
    };
    const avatarData = {
        vampiro: ['https://placehold.co/200x200/483D8B/FFFFFF?text=Avatar+V1', 'https://placehold.co/200x200/5D4A9C/FFFFFF?text=Avatar+V2'],
        hombrelobo: ['https://placehold.co/200x200/8B4513/FFFFFF?text=Avatar+HL1', 'https://placehold.co/200x200/A0522D/FFFFFF?text=Avatar+HL2'],
        sirena: ['https://placehold.co/200x200/008B8B/FFFFFF?text=Avatar+S1', 'https://placehold.co/200x200/20B2AA/FFFFFF?text=Avatar+S2'],
        kitsune: ['https://placehold.co/200x200/FF4500/FFFFFF?text=Avatar+K1', 'https://placehold.co/200x200/FF6347/FFFFFF?text=Avatar+K2']
    };

    // =================================================================
    // 3. ESTADO DEL JUEGO Y ELEMENTOS DEL DOM
    // =================================================================
    let gameState = {};
    const resetGameState = () => {
        gameState = {
            currentUser: null,
            characterData: null,
            chosenRace: null,
            characterName: null,
            selectedAvatar: null,
            dialogueIndex: 0
        };
    };
    resetGameState(); // Inicializa el estado del juego

    const screens = {
        auth: document.getElementById('auth-screen'),
        raceSelection: document.getElementById('race-selection-screen'),
        characterCreation: document.getElementById('character-creation-screen'),
        game: document.getElementById('game-screen')
    };

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const authError = document.getElementById('auth-error');
    const logoutBtn = document.getElementById('logout-btn');
    const raceSelectionContainer = document.getElementById('race-selection-container');
    const raceDetailsContent = document.getElementById('race-details-content');
    const placeholderPanel = document.getElementById('placeholder-panel');
    const charNameInput = document.getElementById('char-name');
    const avatarSelectionContainer = document.getElementById('avatar-selection-container');
    const confirmCharacterBtn = document.getElementById('confirm-character-btn');
    const raceSubtitle = document.getElementById('race-subtitle');
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueName = document.getElementById('character-name-display');
    const dialogueText = document.getElementById('dialogue-text');

    // =================================================================
    // 4. FUNCIONES
    // =================================================================

    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.add('hidden'));
        screens[screenName].classList.remove('hidden');
    }

    function switchAuthTab(tab) {
        authError.textContent = '';
        if (tab === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
        }
    }
    
    function displayRaceDetails(raceKey) {
        const race = racesData[raceKey];
        const createStatBar = (statName, value) => `<div class="mb-2"><div class="flex justify-between text-sm mb-1"><span class="font-bold text-gray-300">${statName.toUpperCase()}</span><span class="text-gray-400">${value}/10</span></div><div class="stat-bar-bg w-full h-2.5 rounded-full"><div class="stat-bar-fill h-2.5 rounded-full" style="width: ${value * 10}%"></div></div></div>`;
        raceDetailsContent.innerHTML = `
            <img src="${race.image}" alt="Imagen de ${race.name}" class="w-full h-48 object-cover rounded-lg mb-4">
            <h3 class="text-3xl font-title text-yellow-400 mb-2">${race.name}</h3>
            <p class="text-gray-400 italic mb-6">${race.description}</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 class="font-title text-xl mb-3 text-white">Estadísticas Base</h4>
                    ${Object.entries(race.stats).map(([key, value]) => createStatBar(key, value)).join('')}
                </div>
                <div class="space-y-4">
                    <div><h4 class="font-title text-xl mb-2 text-white">Habilidad Pasiva</h4><p class="text-gray-400"><span class="font-bold text-cyan-400">${race.passive.split(':')[0]}:</span> ${race.passive.split(':')[1]}</p></div>
                    <div><h4 class="font-title text-xl mb-2 text-white">Habilidades</h4><ul class="list-disc list-inside text-gray-400">${race.abilities.map(a => `<li>${a}</li>`).join('')}</ul></div>
                </div>
            </div>
            <div class="text-center mt-8">
                <button id="confirm-race-btn" class="action-button">Confirmar Linaje</button>
            </div>`;
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
    }

    function checkFormCompletion() {
        gameState.characterName = charNameInput.value.trim();
        confirmCharacterBtn.disabled = !(gameState.characterName && gameState.selectedAvatar);
    }
    
    const dialogueScript = [
        { character: "Director", text: "Bienvenido de nuevo, {{PLAYER_NAME}}. Veo que has llegado sin problemas." },
        { character: "???", text: "Aunque... percibo algo... diferente en ti. Un potencial que no había sentido en siglos." },
        { character: "TÚ", text: "(Un escalofrío recorre mi espalda. ¿A qué se refiere?)" },
        { character: "Director", text: "Sea como sea, tu aventura continúa. No nos decepciones." },
        { character: "Sistema", text: "Ahora eres libre de explorar. Usa el mapa para ir a tus clases o socializar." }
    ];

    function displayNextDialogueLine() {
        if (gameState.dialogueIndex >= dialogueScript.length) {
            dialogueBox.classList.add('hidden');
            return;
        }
        if (dialogueBox.classList.contains('hidden')) {
            dialogueBox.classList.remove('hidden');
        }
        const currentLine = dialogueScript[gameState.dialogueIndex];
        const characterName = currentLine.character === "TÚ" ? gameState.characterData.name : currentLine.character;
        dialogueName.textContent = characterName;
        dialogueText.textContent = currentLine.text.replace('{{PLAYER_NAME}}', gameState.characterData.name);
        gameState.dialogueIndex++;
    }

    function startGame() {
        showScreen('game');
        gameState.dialogueIndex = 0;
        displayNextDialogueLine();
    }

    async function handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            gameState.currentUser = userCredential.user;
            const characterDoc = await getDoc(doc(db, "characters", gameState.currentUser.uid));
            if (characterDoc.exists()) {
                gameState.characterData = characterDoc.data();
                startGame();
            } else {
                showScreen('raceSelection');
            }
        } catch (error) {
            authError.textContent = "Error: " + error.code;
        }
    }

    async function handleRegistration(event) {
        event.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            gameState.currentUser = userCredential.user;
            showScreen('raceSelection');
        } catch (error) {
            authError.textContent = "Error: " + error.code;
        }
    }

    async function saveCharacter() {
        if (!gameState.currentUser) return;
        const characterData = {
            name: gameState.characterName,
            race: gameState.chosenRace,
            avatar: gameState.selectedAvatar,
            level: 1,
            stats: racesData[gameState.chosenRace].stats
        };
        try {
            await setDoc(doc(db, "characters", gameState.currentUser.uid), characterData);
            gameState.characterData = characterData;
            startGame();
        } catch (error) {
            console.error("Error al guardar personaje: ", error);
        }
    }

    async function handleLogout() {
        try {
            await signOut(auth);
            resetGameState();
            showScreen('auth');
            console.log("Sesión cerrada exitosamente.");
        } catch (error) {
            console.error("Error al cerrar sesión: ", error);
        }
    }

    // =================================================================
    // 5. INICIALIZACIÓN Y EVENT LISTENERS
    // =================================================================
    
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    registerTab.addEventListener('click', () => switchAuthTab('register'));
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegistration);
    logoutBtn.addEventListener('click', handleLogout);

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
    confirmCharacterBtn.addEventListener('click', () => {
        if (!confirmCharacterBtn.disabled) {
            saveCharacter();
        }
    });
    dialogueBox.addEventListener('click', displayNextDialogueLine);

    showScreen('auth');
});