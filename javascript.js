import { supa } from "../00_tasteatlas/supabase.js";


 //Aktualisieren User Status
 function updateUserStatus(user) {
    const userStatusElement = document.getElementById('userStatus');
}

// Herauslesen und anzeigen vom Userstatus
const initialUser = supa.auth.user();
updateUserStatus(initialUser);

// Änderungen User Status
supa.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
        console.log("User signed in: ", session.user);
        updateUserStatus(session.user);
        window.location.href = "../index.html";
    } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
        updateUserStatus(null);
        window.location.href = "../login.html";
    }
});

// Logout Funktion
async function logout() {
    const { error } = await supa.auth.signOut();
    if (error) {
        console.error("Error during logout:", error);
    } else {
        updateUserStatus(null);
        console.log("User logged out successfully.");
    }
}

// Buttons unter Profilicon
document.getElementById('logoutButton').addEventListener('click', logout);

const cornerImage = document.getElementById("profilicon");
const buttonContainer = document.getElementById("profilbuttons");

cornerImage.addEventListener("click", () => {
  if (buttonContainer.classList.contains("hidden")) {
    buttonContainer.classList.remove("hidden");
  } else {
    buttonContainer.classList.add("hidden");
  }
});


document.addEventListener('DOMContentLoaded', function () {
    const user = supa.auth.user();

    if (!user) {
      // Benutzer ist nicht angemeldet, leite ihn zur Login-Seite weiter
      window.location.href = '../login.html'; 
    }});
