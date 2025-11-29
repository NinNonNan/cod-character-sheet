# Scheda Personaggio - Chronicles of Darkness

Una scheda personaggio digitale e interattiva per il gioco di ruolo "Chronicles of Darkness" (nWoD), con salvataggio e caricamento dei dati online tramite Firebase.


*(Nota: Sostituisci questo link con uno screenshot reale del tuo progetto!)*

## Indice

- [Caratteristiche](#caratteristiche)
- [Come si Usa](#come-si-usa)
- [Tecnologie Utilizzate](#tecnologie-utilizzate)
- [Sviluppi Futuri](#sviluppi-futuri)

---

## Caratteristiche

Questo strumento è stato progettato per essere più di un semplice foglio di calcolo, offrendo un'esperienza interattiva e dinamica.

*   **Salvataggio Online**: I personaggi vengono salvati su **Firebase Firestore**. Ogni personaggio salvato genera un URL univoco (`?id=...`) che può essere usato per ricaricare la scheda da qualsiasi dispositivo.
*   **Due Layout di Scheda**:
    *   `character.html`: Un layout spazioso con un riquadro per l'immagine del personaggio.
    *   `character-compact.html`: Un layout più denso e compatto per chi preferisce avere tutto a portata di mano.
*   **Scheda Interattiva**:
    *   **Pallini Cliccabili**: Attributi, Abilità e Pregi possono essere modificati cliccando direttamente sui pallini.
    *   **Tracciati di Stato**: Salute, Volontà e Sanità Mentale hanno tracciati con stati multipli (danno contundente, letale, aggravato).
    *   **Specializzazioni Dinamiche**: Attivando una specializzazione su un'abilità, appare una sezione apposita per inserire i dettagli.
    *   **Pregi Dinamici**: È possibile aggiungere e rimuovere righe per i Pregi direttamente dall'interfaccia.
*   **Calcoli Automatici**:
    *   I tratti derivati (Salute, Volontà, Difesa, Iniziativa, Velocità) vengono calcolati e aggiornati automaticamente in base agli attributi.
    *   L'esperienza rimanente viene calcolata in tempo reale.
*   **Caricamento Immagine**: È possibile caricare un'immagine per il personaggio, che viene convertita in formato Base64 e salvata direttamente nel database insieme agli altri dati.
*   **Blocco Sezioni**: Ogni sezione può essere "bloccata" per prevenire modifiche accidentali.
*   **Estetica Ispirata**: Il design, con il font "Special Elite", si ispira a documenti battuti a macchina, per un'atmosfera più immersiva.

---

## Come si Usa

1.  **Pagina Iniziale**: Apri il file `index.html` (o visita la pagina su GitHub Pages). Da qui puoi:
    *   Creare una **Nuova Scheda Standard**.
    *   Creare una **Nuova Scheda Compatta**.
    *   (Manualmente) Aggiungere link ai tuoi personaggi salvati per un accesso rapido.

2.  **Creazione del Personaggio**: Compila la scheda cliccando sui pallini e inserendo i dati nei campi di testo.

3.  **Salvataggio**:
    *   Clicca sul pulsante **"Salva Personaggio"** in fondo alla pagina.
    *   La prima volta che salvi, verrà generato un nuovo ID per il personaggio e l'URL nella barra degli indirizzi del browser si aggiornerà (es. `.../character.html?id=ABC123xyz`).
    *   **Copia questo URL completo!** È il tuo link permanente per accedere e modificare quel personaggio.

4.  **Caricamento**: Per caricare un personaggio esistente, apri semplicemente l'URL univoco che hai salvato.

---

## Tecnologie Utilizzate

*   **HTML5**
*   **CSS3** (con Flexbox per il layout)
*   **JavaScript (ES6+)**
*   **Firebase Firestore**: Utilizzato come database NoSQL per il salvataggio dei dati dei personaggi.
*   **Font Awesome**: Per le icone (es. lucchetto).
*   **Google Fonts**: Per il font `Special Elite`.

---

## Sviluppi Futuri

La lista delle prossime funzionalità è tracciata nel file `TODO.md`. Le priorità attuali includono:

-   **Metadati per Anteprime Social**: Aggiungere tag Open Graph per migliorare la condivisione dei link sui social media.
-   **Layout Responsive**: Migliorare la visualizzazione su dispositivi mobili, facendo in modo che le colonne si impilino verticalmente.
-   **Sezione "Note"**: Aggiungere un'area di testo a tutta larghezza per appunti generici.
-   **Pulsante "Reset"**: Per riportare la scheda ai suoi valori di default.

---