// =================================================================
// ARCHIVO: js/auth.js
// RESPONSABILIDAD: Manejar la autenticación de usuarios con Firebase.
// =================================================================
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { app } from './firebase.js';

const auth = getAuth(app);

export async function handleLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user };
    } catch (error) {
        return { error: error.code };
    }
}

export async function handleRegistration(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user };
    } catch (error) {
        return { error: error.code };
    }
}

export async function handleLogout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error("Error signing out:", error);
        return { error: error.code };
    }
}