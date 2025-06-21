// --- LÓGICA DEL JUEGO: ACADEMIA MÍTICA ---

// Este evento asegura que el script se ejecute solo cuando todo el HTML esté cargado.
document.addEventListener('DOMContentLoaded', () => {

    // --- BASES DE DATOS (Información del juego) ---
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

    // --- ESTADO DEL JUEGO (Variables que guardan el progreso) ---
    let gameState = {
        chosenRace: null,
        characterName: null,
        selectedAvatar: null
    };

    // --- ELEMENTOS DEL DOM (Accesos directos a partes del HTML) ---
    const screens = {
        raceSelection: document.getElementById('race-selection-screen'),
        characterCreation: document.getElementById('character-creation-screen')
    };
    const raceSelectionContainer = document.getElementById('race-selection-container');
    const placeholderPanel = document.getElementById('placeholder-panel');
    const raceDetailsContent = document.getElementById('race-details-content');
    const charNameInput = document.getElementById('char-name');
    const avatarSelectionContainer = document.getElementById('avatar-selection-container');
    const confirmCharacterBtn = document.getElementById('confirm-character-btn');
    const raceSubtitle = document.getElementById('race-subtitle');

    // --- FUNCIONES DE LÓGICA ---

    // Función para cambiar entre pantallas
    function showScreen(screenName) {
        Object.values(screens).forEach(screen => screen.classList.add('hidden'));
        screens[screenName].classList.remove('hidden');
    }

    // Función para mostrar los detalles de la raza seleccionada
    function displayRaceDetails(raceKey) {
        const race = racesData[raceKey];
        const createStatBar = (statName, value) => `
            <div class="mb-2"><div class="flex justify-between text-sm mb-1"><span class="font-bold text-gray-300">${statName}</span><span class="text-gray-400">${value}/10</span></div><div class="stat-bar-bg w-full h-2.5 rounded-full"><div class="stat-bar-fill h-2.5 rounded-full" style="width: ${value * 10}%"></div></div></div>`;

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
                <button id="confirm-race-btn" class="confirm-button font-bold py-3 px-8 rounded-lg text-xl font-title tracking-wider">Confirmar Linaje</button>
            </div>
        `;
        placeholderPanel.classList.add('hidden');
        raceDetailsContent.classList.remove('hidden');

        document.getElementById('confirm-race-btn').addEventListener('click', () => {
            gameState.chosenRace = raceKey;
            setupCharacterCreationScreen();
            showScreen('characterCreation');
        });
    }

    // Función para configurar la pantalla de creación de personaje
    function setupCharacterCreationScreen() {
        const raceKey = gameState.chosenRace;
        raceSubtitle.textContent = `Linaje: ${racesData[raceKey].name}`;
        avatarSelectionContainer.innerHTML = ''; // Limpiar avatares anteriores

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

    // Función para comprobar si el formulario de creación está completo
    function checkFormCompletion() {
        gameState.characterName = charNameInput.value.trim();
        confirmCharacterBtn.disabled = !(gameState.characterName && gameState.selectedAvatar);
    }
    
    // --- INICIALIZACIÓN ---

    // Poblar las tarjetas de selección de raza al cargar
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

    // Añadir eventos a los inputs del formulario de creación
    charNameInput.addEventListener('input', checkFormCompletion);
    confirmCharacterBtn.addEventListener('click', () => {
        alert(`¡Bienvenido, ${gameState.characterName}! Tu aventura como ${racesData[gameState.chosenRace].name} está por comenzar.`);
        // Aquí iría la lógica para iniciar el juego...
    });
});
