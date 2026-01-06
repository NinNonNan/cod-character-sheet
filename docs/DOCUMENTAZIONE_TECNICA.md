# Documentazione Tecnica - CoD Character Sheet

## Panoramica Architettura
L'applicazione è una Single Page Application (SPA) multipagina costruita con tecnologie web standard (Vanilla JS, HTML5, CSS3) senza framework di frontend pesanti. La persistenza dei dati è gestita tramite **Google Firebase Firestore**.

## Struttura dei File

### HTML
*   `index.html`: Dashboard principale. Carica la lista dei personaggi da Firebase.
*   `character.html`: Layout standard a 3 colonne (Dati - Spazio - Immagine) per la sezione info.
*   `character-compact.html`: Layout a 2 colonne.

### CSS (`/css`)
Il CSS è modulare per separare struttura e stile.
*   **`base.css`**: Contiene tutte le regole di layout, posizionamento, Flexbox e logica strutturale. Gestisce la responsività delle colonne (`.col-wide`, `.col-narrow`) e gli stati funzionali (`.section-locked`).
*   **`themes/anni50.css`**: Contiene solo le definizioni estetiche: variabili di colore (`:root`), font (Special Elite), bordi, ombreggiature e stili specifici per i tracciati (gradienti per i danni).

### JavaScript (`/js`)
*   **`firebase-config.js`**: Contiene l'inizializzazione dell'app Firebase e l'esportazione dell'istanza `db` (Firestore).
*   **`script.js`**: Il core dell'applicazione. Gestisce:
    *   DOM Manipulation (creazione pallini, listener eventi).
    *   Logica di gioco (calcolo tratti derivati).
    *   CRUD su Firestore (Salvataggio/Caricamento).
    *   Gestione immagine (Base64).

### Localizzazione (`/language`)
*   **`it.js`**: Oggetto `window.LANG` contenente tutte le stringhe di testo. Il sistema sostituisce il contenuto degli elementi con attributo `data-i18n` al caricamento.

## Dettagli Implementativi

### Gestione Layout e Immagini
Il layout utilizza Flexbox.
*   **Immagine Adattiva**: Il contenitore dell'immagine `.character-image-box` utilizza `flex-grow: 1`, `flex-basis: 0` e `min-height: 0` per adattarsi passivamente all'altezza della colonna di testo adiacente, garantendo un allineamento perfetto senza spazi vuoti verticali.
*   **Object-fit**: L'immagine utilizza `object-fit: contain` per essere sempre interamente visibile.

### Logica di Calcolo (Tratti Derivati)
La funzione `calcolaTrattiDerivati()` in `script.js` implementa le regole:
```javascript
Iniziativa = Destrezza + Autocontrollo
Difesa = Min(Prontezza, Destrezza)
Velocità = Forza + Destrezza + 5
```
I listener sugli input (es. Taglia) e sui pallini (click) scatenano il ricalcolo immediato.

### Gestione Stati (Salute/Volontà)
I box dei tracciati gestiscono stati multipli tramite classi CSS:
*   Salute: `.bashing` (CSS gradient /), `.lethal` (CSS gradient X), `.aggravated` (CSS gradient *).
*   Volontà/Sanità: `.volonta-spesa` (Background pieno).

### Blocco Sezioni
La classe `.section-locked` viene applicata al tag `<section>`.
*   **CSS**: Disabilita `pointer-events` su input e bottoni.
*   **Visibilità**: Riduce l'opacità degli elementi grafici e nasconde i bottoni dei Pregi, ma mantiene l'opacità al 100% per i testi e i pallini pieni per garantire la leggibilità.

### Database (Firestore)
*   **Collezione**: `characters`
*   **Struttura Documento**:
    ```json
    {
      "nome": "String",
      "info": { "cronaca": "...", ... },
      "tratti": { "forza": 3, ... },
      "pregi": { "pregi-col-1": [{ "nome": "...", "valore": 2 }] },
      "tracciati": { "salute": ["bashing", "lethal", ""] },
      "imageUrl": "data:image/png;base64,..."
    }
    ```