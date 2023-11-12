import { supa } from "./supabase.js";

console.log("00 JavaScript verbunden");

// Holt die Daten mit der gleichen id wie die aus der url
async function getGerichte() {
  const urlParams = new URLSearchParams(window.location.search);
  const regionId = urlParams.get('region_id');
  
  if (!regionId) {
    console.error('Fehler: region_id nicht in der URL gefunden.');
    return [];
  }
  
  try {
    const { data, error } = await supa
    .from("rezept")
    .select("id, Titel, Kurzbeschreibung, Beitragsbild, land_id(*), region_id)")
   .eq("region_id", parseInt(regionId));

    if (error) {
      console.error("Fehler beim Abrufen der Gerichte:", error);
      return [];
    }
    
    // Schleife durch die Rezepte und fügen Sie die Durchschnittsbewertung hinzu
    for (const gericht of data) {
      gericht.Durchschnittsbewertung = await getDurchschnittsbewertung(gericht.id);
    }
  
    return data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Gerichte:", error);
    return [];
  }
  
  }

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

    // Berechnen Durchschnitt
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
  
  
  // Funktion zum Anzeigen der Gerichte auf der Seite
async function displayGerichte() {
  const Gerichte = await getGerichte();
  const gerichteContainer = document.getElementById("Gerichte");

  Gerichte.forEach((gericht) => {
    // Erstellen Sie HTML-Elemente für jedes Gericht und fügen Sie sie zum Container hinzu
    const gerichtElement = document.createElement("div");
    gerichtElement.classList.add("gericht");

    // 1. Bild
    const bildElement = document.createElement("img");
    bildElement.src = gericht.Beitragsbild;
    gerichtElement.appendChild(bildElement);

    // 2. Rezeptitel
    const titelElement = document.createElement("h2");
    titelElement.textContent = gericht.Titel;
    gerichtElement.appendChild(titelElement);

    // 3. Bewertungssterne
    const bewertungElement = document.createElement("p");
    bewertungElement.innerHTML = "";

    // Berechnen der Durchschnittsbewertung
    const durchschnittsbewertung = parseFloat(gericht.Durchschnittsbewertung);

    for (let i = 1; i <= 5; i++) {
      const starIcon = document.createElement("i");
      starIcon.classList.add("filled-star");

      if (i <= durchschnittsbewertung) {
        starIcon.classList.add("filled");
      }

      bewertungElement.appendChild(starIcon);
    }

    gerichtElement.appendChild(bewertungElement);

    // 4. Kurzbeschreibung
    const beschreibungElement = document.createElement("p");
    beschreibungElement.textContent = gericht.Kurzbeschreibung;
    gerichtElement.appendChild(beschreibungElement);

    // Erstellen Link für jedes Gericht
    const gerichtsLink = document.createElement("a");
    gerichtsLink.href = `rezeptseite.html?rezeptId=${gericht.id}`;
    gerichtsLink.appendChild(gerichtElement);
    gerichteContainer.appendChild(gerichtsLink);
  });
}



let region = "Südasien"; // Setzen Sie den Standardwert hier

// Ruft die Regionen-ID aus der URL ab
const urlParams = new URLSearchParams(window.location.search);
const regionIdParameter = urlParams.get("region_id"); // 
const regiontitel = document.getElementById("regiontitel");


if (regionIdParameter) {
  // Holen der Regioneninformation anhand der Regionen-ID
  getRegionNameById(parseInt(regionIdParameter))
    .then((Region) => {
      region = Region;
      console.log("Die ausgewählte Region ist: " + region);
      regiontitel.textContent = region;
      seitentitel.textContent = region;

    })
    .catch((error) => {
      console.error("Fehler beim Abrufen des Regionennamens:", error);
    });
}

// Funktion zum Abrufen des Regionennamens anhand der Regionen-ID
async function getRegionNameById(regionId) {
  try {
    const { data, error } = await supa
      .from("region")
      .select("Region")
      .eq("id", regionId)
      .single();

    if (error) {
      console.error("Fehler beim Abrufen des Regionennamens:", error);
      return "Südasien"; 
    }

    return data.Region;
  } catch (error) {
    console.error("Fehler beim Abrufen des Regionennamens:", error);
    return "Südasien"; 
  }
}

  
  // Ruft die Funktion auf, um die Gerichte anzuzeigen
  displayGerichte();
  
