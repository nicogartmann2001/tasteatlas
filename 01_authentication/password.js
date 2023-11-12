import { supa } from "../00_tasteatlas/supabase.js";


// Loginfunktion
async function login() {
    const email = document.getElementById('loginEmailInput').value;
    const password = document.getElementById('loginPasswordInput').value;

    const { error } = await supa.auth.signIn({ email, password });

    if (error) {
        console.error("Error during login: ", error.message);
        loginfehler.textContent = 'E-Mail oder Passwort falsch';
    } else {
        console.log("Logged in as ", email);
    }
}

// Registrierungsfunktion
async function signUp() {
    const username = document.getElementById('usernameInput').value;
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;
    const loginfehler = document.getElementById('loginfehler');

    const { user, session, error } = await supa.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error("Error during sign up: ", error.message);
        loginfehler.textContent = 'Bitte gib in jedem Feld einen gültigen Wert ein';
    } else {
        // Wenn die Registrierung erfolgreich ist, können wird der Benutzernamen in die "profiles"-Tabelle geschrieben.
        const { data, error } = await supa.from('profiles').upsert([
            {
                id: user.id,
                full_name: username,
                mail: email,
            },
        ]);

        if (error) {
            console.error("Error saving user profile: ", error.message);
        } else {
            console.log("Signed up as ", email);
            // Registrierung erfolgreich, Formulare ausblenden und Willkommensnachricht anzeigen
            hideFormsAndShowWelcome(username);
        }
    }
}

//Willkommensnachricht
function hideFormsAndShowWelcome(username) {
    const registrationForm = document.getElementById('registrationForm');
    const welcomeMessage = document.getElementById('welcomeMessage');

    // Ausblenden des Registrierungsformulars
    registrationForm.style.display = 'none';
    toggleFormButton.style.display = 'none';
    formulartitel.style.display = 'none';

    // Anzeigen der Willkommensnachricht
    welcomeMessage.textContent = `Willkommen ${username}! Bitte bestätige deine E-Mail-Adresse.`;
    welcomeMessage.style.display = 'block';
}


 //Aktualisieren User Status
function updateUserStatus(user) {
    const userStatusElement = document.getElementById('userStatus');
}

// Herauslesen und anzeigen vom Userstatus
const initialUser = supa.auth.user();
updateUserStatus(initialUser);

// Event listeners für die buttons
document.getElementById('loginButton').addEventListener('click', login);
document.getElementById('signupButton').addEventListener('click', signUp);

// Listener für Änderungen am User status
supa.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
        console.log("User signed in: ", session.user);
        updateUserStatus(session.user);
        window.location.href = "index.html";
    } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        updateUserStatus(null);
        window.location.href = "login.html";
    }
});


// Event Listener um zwischen den Formularen zu wechseln
document.getElementById('toggleFormButton').addEventListener('click', toggleForm);

// Schaut welches Formular aktiv ist
let isLoginForm = true; // Angenommen, das Login-Formular ist initial aktiv

// Funktion zum Umschalten zwischen Login- und Registrierungsformular
function toggleForm() {
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');
    const toggleButton = document.getElementById('toggleFormButton');
    const titleElement = document.getElementById('formulartitel');
    const account = document.getElementById('account');
    const linie = document.getElementById('horizontal-line');

//Registierungsformular aktiv
    if (isLoginForm) {
        loginForm.style.display = 'none';
        registrationForm.style.display = 'block';
        toggleButton.textContent = 'Zum Login';
        titleElement.textContent = 'Join the World';
        account.textContent = 'Taste Atlas';
        linie.style.width = '28%';
        loginfehler.textContent = '';
    } 

    //Registierungsformular aktiv
    else {
        loginForm.style.display = 'block';
        registrationForm.style.display = 'none';
        toggleButton.textContent = 'Erstelle einen Account';
        titleElement.textContent = 'Taste Atlas';
        account.textContent = 'Taste the World';
        linie.style.width = '17%';
        loginfehler.textContent = '';
    }


    // Aktualisieren des Formulartyp 
    isLoginForm = !isLoginForm;
}












