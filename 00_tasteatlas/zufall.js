import { supa } from "./supabase.js";

// Funktion zum Abrufen der Rezepte

async function getZufalligeGerichte() {
    try {
      const { data, error } = await supa
        .from("rezept")
        .select("id, Titel, Kurzbeschreibung, Beitragsbild")
        .range(0, 10000) // Wählt eine große Bereichsgrenze für zufällige Zeilen
        .order("id") 
  
      if (error) {
        console.error("Fehler beim Abrufen der zufälligen Gerichte:", error);
        return [];
      }
  
      // Mische die Zeilen zufällig
      const shuffledData = shuffleArray(data);
  
      return shuffledData.slice(0, 4); 
    } catch (error) {
      console.error("Fehler beim Abrufen der zufälligen Gerichte:", error);
      return [];
    }
  }
  
  // Funktion zum Mischen eines Arrays in zufälliger Reihenfolge
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  // Funktion zum Anzeigen der zufälligen Gerichte auf der Seite
  async function displayZufalligeGerichte() {
    const zufalligeGerichte = await getZufalligeGerichte();
    const gerichteContainer = document.getElementById("ZufalligeGerichteContainer");
  
    zufalligeGerichte.forEach((gericht) => {
        // Erstellt HTML-Elemente für jedes zufällige Gericht
        const gerichtElement = document.createElement("div");
        gerichtElement.classList.add("zufalliges-gericht");
      
        // 1. Bild
        const bildElement = document.createElement("img");
        bildElement.src = gericht.Beitragsbild;
        gerichtElement.appendChild(bildElement);
      
        // 2. Rezeptitel
        const titelElement = document.createElement("h2");
        titelElement.textContent = gericht.Titel;
        gerichtElement.appendChild(titelElement);
      
        // 3. Kurzbeschreibung
        const beschreibungElement = document.createElement("p");
        beschreibungElement.textContent = gericht.Kurzbeschreibung;
        gerichtElement.appendChild(beschreibungElement);
      
        // Erstellt  einen Link für jedes Gericht
        const gerichtsLink = document.createElement("a");
        gerichtsLink.href = `rezeptseite.html?rezeptId=${gericht.id}`;
        gerichtsLink.appendChild(gerichtElement); // Hier wird der Link um das Gerichtselement gewickelt
        gerichteContainer.appendChild(gerichtsLink);
      });
  }
  
  // Ruft die Funktion auf, um die zufälligen Gerichte anzuzeigen
  displayZufalligeGerichte();
  