import { supa } from "./supabase.js";

console.log("00 JavaScript verbunden");

// Funktion zum Abrufen der Durchschnittsbewertung für ein Rezept
async function getDurchschnittsbewertung(rezeptId) {
  try {
    const { data, error } = await supa
      .from("bewertungen")
      .select("sternenbewertung")
      .eq("rezept_id", rezeptId);

    if (error) {
      console.error("Fehler beim Abrufen der Bewertungen:", error);
      return 0; // Standard-Durchschnittsbewertung, falls keine Bewertungen vorhanden sind
    }

    // Berechnen des Durchschnitt
    if (data.length === 0) {
      return 0; // Keine Bewertungen vorhanden
    } else {
      const bewertungen = data.map((row) => row.sternenbewertung);
      const summe = bewertungen.reduce((acc, bewertung) => acc + bewertung, 0);
      const durchschnitt = summe / bewertungen.length;
      return durchschnitt;
    }
  } catch (error) {
    console.error("Fehler beim Abrufen der Durchschnittsbewertung:", error);
    return 0; // Standard-Durchschnittsbewertung bei Fehlern
  }
}

//Favoriten aus der Datenbank lesen
async function getFavoriten(userId) {
  try {
    const { data, error } = await supa
      .from("relationstabelle_favoriten")
      .select("rezept_id")
      .eq("user_id", userId);

    if (error) {
      console.error("Fehler beim Abrufen der Favoriten:", error);
      return [];
    }

    // Extrahieren der Rezept-IDs aus den Favoriten
    const rezeptIds = data.map((favorit) => favorit.rezept_id);

    // Abfrufen der Rezepte basierend auf den Rezept-IDs 
    const rezepte = await getRezepteByIds(rezeptIds);

    return rezepte;
  } catch (error) {
    console.error("Fehler beim Abrufen der Favoriten:", error);
    return [];
  }
}

// Funktion zum Abrufen von Rezepten basierend auf Rezept-IDs
async function getRezepteByIds(rezeptIds) {
  try {
    const { data, error } = await supa
      .from("rezept")
      .select("id, Titel, Kurzbeschreibung, Beitragsbild")
      .in("id", rezeptIds);

    if (error) {
      console.error("Fehler beim Abrufen der Rezepte:", error);
      return [];
    }

    // Schleife durch die Rezepte und hinzufügen der Durchschnittsbewertung 
    for (const rezept of data) {
      rezept.Durchschnittsbewertung = await getDurchschnittsbewertung(rezept.id);
    }

    return data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Rezepte:", error);
    return [];
  }
}

// Darstellen der Rezepte
async function displayFavoriten() {
  const user = supa.auth.user();
  if (!user) {
    console.error("Benutzer nicht angemeldet.");
    return;
  }
  const userId = user.id;

  const Favoriten = await getFavoriten(userId);
  const favoritenContainer = document.getElementById("Favoriten");

  if (Favoriten.length === 0) {
    // Keine Favoriten vorhanden, fügt einen Hinweis hinzu
    const hinweisText = document.createElement("h3");
    hinweisText.innerHTML = '<span id="hinweistext">Du hast noch keine Favoriten. Speichere dir Rezepte mithilfe des Herz oben rechts als Favorit, um sie hier zu sehen.</span>';
    favoritenContainer.appendChild(hinweisText);
  } 

//Erstellen der html Elemente
  Favoriten.forEach((rezept) => {
    // Erstellen Sie HTML-Elemente für jedes Favorit und fügen Sie sie zum Container hinzu
    const rezeptElement = document.createElement("div");
    rezeptElement.classList.add("rezept");

    const bildElement = document.createElement("img");
    bildElement.src = rezept.Beitragsbild;
    rezeptElement.appendChild(bildElement);

    const titelElement = document.createElement("h2");
    titelElement.textContent = rezept.Titel;
    rezeptElement.appendChild(titelElement);

     const durchschnittsbewertung = parseFloat(rezept.Durchschnittsbewertung);

     // Fügen Sie die Stern-Icons basierend auf der Durchschnittsbewertung hinzu
     const bewertungElement = document.createElement("p");
     bewertungElement.innerHTML = "";
 
     for (let i = 1; i <= 5; i++) {
       const starIcon = document.createElement("i");
       starIcon.classList.add("filled-star");
 
       if (i <= durchschnittsbewertung) {
         starIcon.classList.add("filled");
       }
 
       bewertungElement.appendChild(starIcon);
 
       rezeptElement.appendChild(bewertungElement);
     }


    const beschreibungElement = document.createElement("p");
    beschreibungElement.textContent = rezept.Kurzbeschreibung;
    rezeptElement.appendChild(beschreibungElement);


    // Erstellen des Link für jedes Rezept
    const rezeptLink = document.createElement("a");
    rezeptLink.href = `rezeptseite.html?rezeptId=${rezept.id}`;
    rezeptLink.appendChild(rezeptElement);
    favoritenContainer.appendChild(rezeptLink);
    

   

   

  });
}

// Rufen Sie die Funktion auf, um die Favoriten anzuzeigen
displayFavoriten();
