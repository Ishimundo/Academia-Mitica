// =================================================================
// ARCHIVO: js/firestore.js
// RESPONSABILIDAD: Interactuar con la base de datos Firestore.
// =================================================================
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "[https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js](https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js)";
import { app } from './firebase.js';
import { racesData } from './gameData.js';

const db = getFirestore(app);

export async function getCharacter(userId) {
    const characterDoc = await getDoc(doc(db, "characters", userId));
    if (characterDoc.exists()) {
        return characterDoc.data();
    }
    return null;
}

export async function saveCharacter(userId, characterDetails) {
    const { characterName, chosenRace, selectedAvatar } = characterDetails;
    const characterData = {
        name: characterName,
        race: chosenRace,
        avatar: selectedAvatar,
        level: 1,
        xp: 0,
        ecos: 0,
        stats: racesData[chosenRace].stats
    };
    try {
        await setDoc(doc(db, "characters", userId), characterData);
        return characterData;
    } catch (error) {
        console.error("Error saving character:", error);
        return null;
    }
}

export async function updateCharacterRewards(userId, rewards) {
    const userRef = doc(db, "characters", userId);
    await updateDoc(userRef, {
        xp: increment(rewards.xp),
        ecos: increment(rewards.ecos)
    });
}