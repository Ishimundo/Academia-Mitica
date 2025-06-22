// =================================================================
// ARCHIVO: js/gameData.js
// RESPONSABILIDAD: Contener todos los datos estáticos del juego.
// =================================================================
export const racesData = {
    vampiro: { name: "Vampiro", description: "Seres nocturnos, elegantes y con un encanto sobrenatural.", image: "[https://placehold.co/500x300/483D8B/FFFFFF?text=Vampiro](https://placehold.co/500x300/483D8B/FFFFFF?text=Vampiro)", stats: { FUE: 3, AGI: 5, VIT: 4, INT: 7, CAR: 6 }, abilities: [ { id: 'drain_kiss', name: 'Beso Drenador', cost: 10, power: 15, type: 'magic', description: 'Un beso que absorbe la energía vital del enemigo.' } ]},
    hombrelobo: { name: "Hombre Lobo", description: "Guerreros feroces que canalizan su bestia interior.", image: "[https://placehold.co/500x300/8B4513/FFFFFF?text=Hombre+Lobo](https://placehold.co/500x300/8B4513/FFFFFF?text=Hombre+Lobo)", stats: { FUE: 8, AGI: 6, VIT: 6, INT: 2, CAR: 3 }, abilities: [ { id: 'wild_claw', name: 'Zarpazo Salvaje', cost: 0, power: 8, type: 'physical', description: 'Un ataque brutal que usa FUE.' } ]},
    sirena: { name: "Sirena / Tritón", description: "Criaturas marinas con voces cautivadoras y dominio sobre el agua.", image: "[https://placehold.co/500x300/008B8B/FFFFFF?text=Sirena](https://placehold.co/500x300/008B8B/FFFFFF?text=Sirena)", stats: { FUE: 2, AGI: 4, VIT: 5, INT: 6, CAR: 8 }, abilities: [ { id: 'healing_song', name: 'Canto Sanador', cost: 12, power: 30, type: 'heal', description: 'Una melodía que restaura tus PV.' } ]},
    kitsune: { name: "Kitsune", description: "Espíritus zorro astutos, maestros de la ilusión y el fuego espectral.", image: "[https://placehold.co/500x300/FF4500/FFFFFF?text=Kitsune](https://placehold.co/500x300/FF4500/FFFFFF?text=Kitsune)", stats: { FUE: 2, AGI: 7, VIT: 3, INT: 8, CAR: 5 }, abilities: [ { id: 'fox_fire', name: 'Fuego Fatuo', cost: 9, power: 18, type: 'magic', description: 'Invoca llamas espirituales que queman al enemigo.' } ]}
};
export const avatarData = {
    vampiro: ['[https://placehold.co/200x200/483D8B/FFFFFF?text=Avatar+V1](https://placehold.co/200x200/483D8B/FFFFFF?text=Avatar+V1)', '[https://placehold.co/200x200/5D4A9C/FFFFFF?text=Avatar+V2](https://placehold.co/200x200/5D4A9C/FFFFFF?text=Avatar+V2)'],
    hombrelobo: ['[https://placehold.co/200x200/8B4513/FFFFFF?text=Avatar+HL1](https://placehold.co/200x200/8B4513/FFFFFF?text=Avatar+HL1)', '[https://placehold.co/200x200/A0522D/FFFFFF?text=Avatar+HL2](https://placehold.co/200x200/A0522D/FFFFFF?text=Avatar+HL2)'],
    sirena: ['[https://placehold.co/200x200/008B8B/FFFFFF?text=Avatar+S1](https://placehold.co/200x200/008B8B/FFFFFF?text=Avatar+S1)', '[https://placehold.co/200x200/20B2AA/FFFFFF?text=Avatar+S2](https://placehold.co/200x200/20B2AA/FFFFFF?text=Avatar+S2)'],
    kitsune: ['[https://placehold.co/200x200/FF4500/FFFFFF?text=Avatar+K1](https://placehold.co/200x200/FF4500/FFFFFF?text=Avatar+K1)', '[https://placehold.co/200x200/FF6347/FFFFFF?text=Avatar+K2](https://placehold.co/200x200/FF6347/FFFFFF?text=Avatar+K2)']
};
export const enemiesData = {
    'slime': {
        name: 'Limo del Pantano',
        sprite: '[https://placehold.co/250x250/2E8B57/FFFFFF?text=Limo](https://placehold.co/250x250/2E8B57/FFFFFF?text=Limo)',
        stats: { FUE: 3, VIT: 4, AGI: 2, maxHP: 60, currentHP: 60 },
        rewards: { xp: 10, ecos: 5 }
    }
};
export const locationsData = [
    { id: 'whispering_woods', name: 'Bosque de los Susurros', description: 'Un antiguo bosque donde los árboles parecen contar historias de tiempos olvidados.', image: '[https://placehold.co/400x200/228B22/FFFFFF?text=Bosque](https://placehold.co/400x200/228B22/FFFFFF?text=Bosque)', difficulty: 'Fácil', difficultyColor: 'bg-green-600' },
    { id: 'forbidden_library', name: 'Biblioteca Prohibida', description: 'Contiene grimorios poderosos, pero está protegida por guardianes mágicos y acertijos.', image: '[https://placehold.co/400x200/8B4513/FFFFFF?text=Biblioteca](https://placehold.co/400x200/8B4513/FFFFFF?text=Biblioteca)', difficulty: 'Normal', difficultyColor: 'bg-yellow-600' },
    { id: 'astral_arena', name: 'Arena Astral', description: 'Una dimensión de bolsillo creada para duelos y entrenamiento de combate.', image: '[https://placehold.co/400x200/483D8B/FFFFFF?text=Arena](https://placehold.co/400x200/483D8B/FFFFFF?text=Arena)', difficulty: 'Variable', difficultyColor: 'bg-purple-600' }
];