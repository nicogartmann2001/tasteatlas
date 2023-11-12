  import { supa } from "./supabase.js";

  // Deklariert selectedRating außerhalb der Funktionen, um sie im gesamten Modul sichtbar zu machen
  let selectedRating = 0;
  let ratingSubmitted = false; // Neues Flag für die Bewertung
  let currentDate;
  let zutatenInfos = []; // Fügt diese globale Variable hinzu


  // Überprüfen, ob eine Bewertung im LocalStorage vorhanden ist
  const storedRating = localStorage.getItem('userRating');
  if (storedRating !== null) {
    selectedRating = parseInt(storedRating);
    // Setzen Sie die ausgewählten Sterne basierend auf storedRating
  }

  // Überprüfen, ob ein Datum im LocalStorage vorhanden ist
  const storedDate = localStorage.getItem('userRatingDate');
  if (storedDate !== null) {
    currentDate = storedDate;
    // Verwenden Sie storedDate, um das Datum zu setzen
  }

  // Liest die Rezept ID aus der URL und ruft die Funktionen auf-------------------------------
  document.addEventListener('DOMContentLoaded', function () {
    const user = supa.auth.user();

    if (!user) {
      // Benutzer ist nicht angemeldet, leite ihn zur Login-Seite weiter
      window.location.href = '../login.html'; 
    } else {
      // Extrahiere die Rezept-ID aus der URL
      const urlParams = new URLSearchParams(window.location.search);
      const rezeptId = urlParams.get('rezeptId');
      
      if (rezeptId) {
        // Rufe die Bewertungsfunktion auf, wenn eine Rezept-ID vorhanden ist
        displayRezept(rezeptId);

        // Rufe die Durchschnittsbewertungsfunktion auf, um die Bewertung anzuzeigen
        updateDurchschnittsbewertung(rezeptId);
      }
    }
  });

  // Zugriff auf die Datenbank tabellen --------------------------------------
  async function selectRezeptById(rezeptId) {
    const { data, error } = await supa
      .from("rezept")
      .select("id, Titel, Beitragsbild, land_id(*), Anleitung, Vegetarisch, Vegan")
      .eq("id", rezeptId)
      .single();

    return data;
  }

  // Funktion zum Abrufen der Zutateninformationen für ein Rezept
  async function getZutatenForRezept(rezeptId) {
    const { data, error } = await supa
      .from("relationstabelle_rezepte")
      .select("Menge, einheit_id, zutaten_id")
      .eq("rezept_id", rezeptId);

    return data;
  }

  // Funktion zum Abrufen von Einheitendaten anhand ihrer ID
  async function getEinheitById(einheitId) {
    const { data, error } = await supa
      .from("einheit")
      .select("Einheitname")
      .eq("id", einheitId)
      .single();

    if (error) {
      console.error("Fehler beim Abrufen der Einheitendaten:", error);
      return null;
    }

    return data;
  }

  // Funktion zum Abrufen von Zutatendaten anhand ihrer ID
  async function getZutatById(zutatenId) {
    const { data, error } = await supa
      .from("zutaten")
      .select("Zutatname")
      .eq("id", zutatenId)
      .single();

    if (error) {
      console.error("Fehler beim Abrufen der Zutatendaten:", error);
      return null;
    }

    return data;
  }



  // Anzeigen der Rezeptdetails -------------------------------------------------------------------
  async function displayRezept(rezeptId) {
    const rezept = await selectRezeptById(rezeptId);
    let zutatenInfos = await getZutatenForRezept(rezeptId);



    if (rezept) {
      // Verknüpfte Daten aus der "land" Tabelle
      const landName = rezept.land_id.landname;


      // Verknüpfte Daten aus der "rezepte" Tabelle
      const zutaten = await Promise.all(zutatenInfos.map(async (zutatInfo) => {
        const menge = zutatInfo.Menge;
        const einheitId = zutatInfo.einheit_id;
        const zutatenId = zutatInfo.zutaten_id;

        const einheit = await getEinheitById(einheitId);
        const zutat = await getZutatById(zutatenId);
        

        return `<span class="menge">${menge}</span> ${einheit.Einheitname} ${zutat.Zutatname}`;
      }));

      const zutatenListe = await Promise.all(zutaten);

      const zutatenContainer = document.getElementById("rezept-zutaten");
      zutatenContainer.innerHTML = "";

      zutatenListe.forEach((zutatText) => {
        const zutatElement = document.createElement("p");
        zutatElement.innerHTML = zutatText;
        zutatenContainer.appendChild(zutatElement);
      });

    
      // Rezept wird ins html eingefügt -------------------------------------------------------------------
      document.title = `${rezept.Titel} | Taste Atlas`;
      document.getElementById("rezept-titel").textContent = rezept.Titel;
      document.getElementById("rezept-land").textContent = `${landName}`;
      document.getElementById("rezept-anleitung").innerHTML = `${rezept.Anleitung}`;
      document.getElementById("rezept-vegetarisch").textContent = rezept.Vegetarisch ? "Vegetarisch" : "";
      document.getElementById("rezept-vegan").textContent = rezept.Vegan ? "Vegan" : "";



    // Bewertung---------------------------------------------------------------------------------
  const selectionStars = document.querySelectorAll('.selection-star');
  const userStars = document.querySelectorAll('.user-star');

  selectionStars.forEach((star, index) => {
    star.addEventListener('click', (e) => {
      const rating = parseInt(e.target.getAttribute('data-rating'));
      selectedRating = rating;

      selectionStars.forEach((s, sIndex) => {
        if (sIndex <= index) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
    });
  });

  const bewertungSendButton = document.getElementById('bewertung-send-button');

  // Entferne zuerst den Event-Listener, falls er vorhanden ist
  bewertungSendButton.removeEventListener('click', bewertungSendHandler);

  // Füge den Event-Listener erneut hinzu
  bewertungSendButton.addEventListener('click', bewertungSendHandler);

  // Hier ist die Event-Listener-Funktion zum senden
  async function bewertungSendHandler() {
    if (selectedRating === 0) {
      return; // Beende die Funktion, wenn keine Bewertung ausgewählt wurde
    }

    const kommentar = document.getElementById('bewertungs-kommentar').value;
    const rezeptId = rezept.id;
    const user_id = supa.auth.user().id;

    // Holen des aktuellen Datums
    const currentDate = new Date().toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Senden der Bewertung
    sendBewertung(rezeptId, user_id, selectedRating, kommentar, currentDate);
    

    // Setze das Flag für die Bewertung auf true
    ratingSubmitted = true;

    // Direkt nach dem Senden der Bewertung, füge die Bewertung im HTML hinzu
    const bewertungenContainer = document.getElementById("bewertungen-container");
    const bewertungDiv = document.createElement("div");
    bewertungDiv.classList.add("bewertung");
    bewertungDiv.classList.add("recipe-card");

    // Erstelle HTML-Inhalte für Bewertung und Kommentar
    const bewertungText = document.createElement("p");
    bewertungText.textContent = "" + "★".repeat(selectedRating);

    const kommentarText = document.createElement("p");
    kommentarText.textContent = `${kommentar}`;

    const zeitpunktText = document.createElement("p");
    zeitpunktText.textContent = currentDate; 

    bewertungDiv.appendChild(zeitpunktText);
    bewertungDiv.appendChild(bewertungText);
    bewertungDiv.appendChild(kommentarText);

    bewertungenContainer.appendChild(bewertungDiv);

    // Zurücksetzen der ausgewählten Bewertung und des Kommentarfelds nach dem Senden
    selectedRating = 0;
    selectionStars.forEach((s) => s.classList.remove('selected'));
    document.getElementById('bewertungs-kommentar').value = "";

    // Speichern der Bewertung und des Datums im LocalStorage
    localStorage.setItem('userRating', selectedRating);
    localStorage.setItem('userRatingDate', currentDate);
  }


  // Aktualisiere die Durchschnittsbewertung nach dem Senden der Bewertung
    updateDurchschnittsbewertung(rezeptId);
  }

  //Beitragsbild-------------------------------------------------------------------------------------------

  // Hier wird der Link zum Bild aus der JavaScript-Variable geholt
  const rezeptBildLink = rezept.Beitragsbild;

  // Hier greifen wir auf das img-Element im HTML zu
  const bildElement = document.getElementById('rezeptBild');

  // Wir setzen den Link zum Bild im img-Element
  bildElement.src = rezeptBildLink;
}

  // sendBewertung-Funktion----------------------------------------------------------------------------------
  async function sendBewertung(rezeptId, user_id, sternenbewertung, kommentar, created_at) {
    try {
      const { data, error } = await supa
        .from('bewertungen')
        .upsert([
          {
            rezept_id: rezeptId,
            user_id: user_id,
            sternenbewertung: sternenbewertung,
            kommentar: kommentar,
            created_at: created_at, // Füge das aktuelle Datum hinzu
          },
        ]);

      if (error) {
        console.error('Fehler beim Speichern der Bewertung:', error);
      } else {
        console.log('Bewertung erfolgreich gespeichert:', data);
        alert('Danke für deine Bewertung');
        // Aktualisiert die Durchschnittsbewertung und zeige sie auf der Webseite an.
      }
    } catch (error) {
      console.error('Fehler beim Senden der Bewertung an den Server:', error);
    }
  }

  //Durchschnittsbewertung------------------------------------------------------------------------------------
  async function updateDurchschnittsbewertung(rezeptId) {
    try {
      // Abfrage, um alle Bewertungen für das spezifische Rezept abzurufen
      const { data, error } = await supa
        .from("bewertungen")
        .select("sternenbewertung")
        .eq("rezept_id", rezeptId);

      if (error) {
        console.error("Fehler beim Abrufen der Bewertungen:", error);
        return;
      }

      // Berechnet den Durchschnitt der Bewertungen
      const bewertungen = data.map((row) => row.sternenbewertung);
      const summe = bewertungen.reduce((acc, bewertung) => acc + bewertung, 0);
      const durchschnitt = bewertungen.length > 0 ? summe / bewertungen.length : 0;

      // Aktualisiere die Durchschnittsbewertung nach dem Senden der Bewertung
      const averageStars = document.querySelectorAll('.average-star');
      averageStars.forEach((star, index) => {
        if (index < durchschnitt) {
          star.classList.add('selected');
        } else {
          star.classList.remove('selected');
        }
      });
    } catch (error) {
      console.error('Fehler beim Abrufen der Durchschnittsbewertung:', error);
    }
  }



  // Benutzerbewertungen und Kommentaren ---------------------------------------------------------------------
  async function displayBewertungenUndKommentare(rezeptId) {
    try {
      const { data, error } = await supa
        .from("bewertungen")
        .select("sternenbewertung, kommentar, user_id, created_at")
        .eq("rezept_id", rezeptId);

      if (error) {
        console.error("Fehler beim Abrufen der Bewertungen:", error);
        return;
      }

      const bewertungenContainer = document.getElementById("bewertungen-container");
      bewertungenContainer.innerHTML = ""; // Leere den Container, um ihn neu zu füllen

      data.forEach((bewertung) => {
        const bewertungDiv = document.createElement("div");
        bewertungDiv.classList.add("bewertung");
        bewertungDiv.classList.add("recipe-card");

        // Erstelle HTML-Inhalte für Bewertung und Kommentar
        const sternenbewertung = bewertung.sternenbewertung;
        const kommentar = bewertung.kommentar;

        const bewertungText = document.createElement("p");
        bewertungText.textContent = ``;

        // Füge die Sternen für die Bewertung hinzu
        for (let i = 1; i <= sternenbewertung; i++) {
          const starIcon = document.createElement("i");
          starIcon.classList.add("fas", "fa-star");
          bewertungText.appendChild(starIcon);
        }

        // Füge den Kommentar hinzu
        const kommentarText = document.createElement("p");
        kommentarText.textContent = `${kommentar}`;
        
        const zeitpunktText = document.createElement("p");
        zeitpunktText.textContent = bewertung.created_at;

        bewertungDiv.appendChild(zeitpunktText);
        bewertungDiv.appendChild(bewertungText);
        bewertungDiv.appendChild(kommentarText);
        
        bewertungenContainer.appendChild(bewertungDiv);
      });
    } catch (error) {
      console.error('Fehler beim Abrufen der Bewertungen und Kommentare:', error);
    }
  }


  // Favoritenfunktion ------------------------------------------------------------------------------------------
  const user = supa.auth.user();
  const userId = user.id;

  // Funktion um Favoriten hinzuzufügen
  async function addToFavorites(userId, rezeptId) {
    try {
      const { data, error } = await supa
        .from("relationstabelle_favoriten")
        .upsert([{ user_id: userId, rezept_id: rezeptId }]);

      if (error) {
        console.error("Fehler beim Hinzufügen zum Favoriten:", error);
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen zum Favoriten:", error);
    }
  }

  // Funktion um Favoriten zu entfernen
  async function removeFromFavorites(userId, rezeptId) {
    try {
      const { data, error } = await supa
        .from("relationstabelle_favoriten")
        .delete()
        .eq("user_id", userId)
        .eq("rezept_id", rezeptId);

      favoriteButton.classList.remove("active"); // Entfernen der "active"-Klasse, um das Herzsymbol zurückzusetzen

      if (error) {
        console.error("Fehler beim Entfernen aus den Favoriten:", error);
      }
    } catch (error) {
      console.error("Fehler beim Entfernen aus den Favoriten:", error);
    }
  }

  // Funktion, um zu überprüfen, ob das Rezept bereits als Favorit gespeichert ist
  async function isRecipeFavorite(userId, rezeptId) {
    try {
      const { data, error } = await supa
        .from("relationstabelle_favoriten")
        .select()
        .eq("user_id", userId)
        .eq("rezept_id", rezeptId);

      if (error) {
        console.error("Fehler bei der Überprüfung der Favoriten:", error);
        return false; // Annahme: Bei Fehlern wird das Rezept als nicht markiert betrachtet
      }

      return data.length > 0;
    } catch (error) {
      console.error("Fehler bei der Überprüfung der Favoriten:", error);
      return false;
    }
  }

  // Funktion zum Aktualisieren des Erscheinungsbilds des Favoriten-Buttons basierend auf dem Favoritenstatus
  async function updateFavoriteButtonAppearance(userId, rezeptId) {
    const favoriteButton = document.querySelector(".favorite-button");
    if (await isRecipeFavorite(userId, rezeptId)) {
      favoriteButton.classList.add("active"); // Herz-Symbol ist rot
    } else {
      favoriteButton.classList.remove("active"); // Herz-Symbol ist nicht rot
    }
  }

  // Definition der toggleFavorite-Funktion
  async function toggleFavorite(userId, rezeptId) {
    try {
      if (await isRecipeFavorite(userId, rezeptId)) {
        await removeFromFavorites(userId, rezeptId);
      } else {
        await addToFavorites(userId, rezeptId);
      }

      updateFavoriteButtonAppearance(userId, rezeptId);
    } catch (error) {
      console.error("Fehler beim Umschalten des Favoritenstatus:", error);
    }
  }

  // Event-Handler für den Klick auf den Favoriten-Button (Umschalten)
  const favoriteButton = document.querySelector(".favorite-button");
  favoriteButton.addEventListener("click", async () => {
    toggleFavorite(userId, rezeptId);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const rezeptId = urlParams.get('rezeptId');

  // Initialer Aufruf, um den Favoritenstatus beim Laden der Seite festzulegen
  updateFavoriteButtonAppearance(userId, rezeptId);


  /*Personenanpassung ----------------------------------------------------------------*/

  // Finde die relevanten HTML-Elemente
  const minusButton = document.getElementById('minus-button');
  const plusButton = document.getElementById('plus-button');
  const personenAnzahlElement = document.getElementById('personen-anzahl');

// Standardmäßige Personenanzahl
let personenAnzahl = 2;

// Event-Listener für den Plus-Button
plusButton.addEventListener('click', () => {
  personenAnzahl++;
  updatePersonenAnzahl();
  updateZutatenMengenPlus();
});

// Event-Listener für den Minus-Button
minusButton.addEventListener('click', () => {
  if (personenAnzahl > 1) {
    personenAnzahl--;
    updatePersonenAnzahl();
    updateZutatenMengenMinus();
  }
});


// Funktion, um die Personenanzahl im HTML zu aktualisieren
function updatePersonenAnzahl() {
  personenAnzahlElement.textContent = personenAnzahl;
}

// Funktion zur Aktualisierung der Zutatenmengen basierend auf der Personenanzahl bei Plus
async function updateZutatenMengenPlus() {
  const personenvorher = personenAnzahl - 1 ;
  const mengeSpans = document.querySelectorAll('.menge');

  mengeSpans.forEach((span) => {
    // Holt die ursprüngliche Menge aus dem Textinhalt des Spans
    const urspruenglicheMenge = parseFloat(span.textContent);
    
    // Berechnet die aktualisierte Menge
    const aktualisierteMenge = urspruenglicheMenge / personenvorher * personenAnzahl;

    // Anzahl der Dezimalstellen ermitteln
    const anzahlDezimalstellen = aktualisierteMenge.toString().includes('.') ? aktualisierteMenge.toString().split('.')[1].length : 0;
    
    // Setzen des Textinhalt des Spans auf die aktualisierte Menge
    span.textContent = aktualisierteMenge.toFixed(anzahlDezimalstellen); // Anpassung der Dezimalstellen nach Bedarf
  });
}

// Funktion zur Aktualisierung der Zutatenmengen basierend auf der Personenanzahl bei Minus
async function updateZutatenMengenMinus() {
  const personenvorher = personenAnzahl + 1 ;
  const mengeSpans = document.querySelectorAll('.menge');

  mengeSpans.forEach((span) => {
    // Holt die ursprüngliche Menge aus dem Textinhalt des Spans
    const urspruenglicheMenge = parseFloat(span.textContent);
    
    // Berechnet die aktualisierte Menge
    const aktualisierteMenge = urspruenglicheMenge / personenvorher * personenAnzahl;

    // Anzahl der Dezimalstellen ermitteln
    const anzahlDezimalstellen = aktualisierteMenge.toString().includes('.') ? aktualisierteMenge.toString().split('.')[1].length : 0;
    
    // Setzen des Textinhalts des Spans auf die aktualisierte Menge
    span.textContent = aktualisierteMenge.toFixed(anzahlDezimalstellen); // Anpassung der Dezimalstellen nach Bedarf
  });
}


  // Aufrufen der Funktionen mit der gewünschte rezept ID

  if (rezeptId) {
    displayRezept(rezeptId);
    displayBewertungenUndKommentare(rezeptId);
  }
