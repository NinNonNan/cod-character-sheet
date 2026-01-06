# Manuale Utente - Scheda Personaggio Chronicles of Darkness

Benvenuto nel manuale utente della Scheda Personaggio digitale per Chronicles of Darkness. Questa applicazione web permette di creare, gestire e salvare i tuoi personaggi in modo semplice e persistente.

## 1. Iniziare

### Accesso
Apri il file `index.html` nel tuo browser. Ti troverai di fronte all'**Archivio Personaggi**.
Da qui puoi:
*   **Creare una Nuova Scheda Standard**: Layout classico, spazioso, ideale per schermi desktop.
*   **Creare una Nuova Scheda Compatta**: Layout a due colonne, più denso.
*   **Caricare un Personaggio**: Se hai già salvato dei personaggi, appariranno nella lista "Personaggi Salvati".

## 2. Compilazione della Scheda

### Informazioni di Base
Inserisci i dati anagrafici (Nome, Cronaca, Concetto, ecc.) nei campi di testo.
*   **Nota**: La colonna dell'immagine si adatta automaticamente all'altezza di questa sezione.

### Attributi e Abilità
Il sistema utilizza i classici "pallini" (dots) del World of Darkness.
*   **Modifica**: Clicca su un pallino vuoto per riempire fino a quel livello. Clicca sull'ultimo pallino pieno per svuotarlo (ridurre il livello).
*   **Specializzazioni**: Nelle Abilità, clicca sul quadratino a sinistra del nome dell'abilità per attivare una specializzazione. Apparirà un campo di testo nella sezione "Specializzazioni" dove potrai scrivere i dettagli (es. "Pistole" per Armi da Fuoco).

### Pregi (Merits)
Questa sezione è dinamica.
*   **Aggiungere**: Usa il pulsante **`+`** per aggiungere una nuova riga pregio.
*   **Rimuovere**: Usa il pulsante **`-`** per rimuovere l'ultima riga della colonna.
*   **Compilazione**: Scrivi il nome del pregio e seleziona i pallini corrispondenti.

### Tratti Derivati (Salute, Volontà, Sanità)
Questi valori vengono calcolati automaticamente in base agli Attributi, ma i tracciati (le caselle) sono interattivi per segnare i danni o la spesa.

*   **Salute Fisica**: Clicca sulle caselle per ciclare tra gli stati di danno:
    1.  **/** (Contundente - Bashing)
    2.  **X** (Letale - Lethal)
    3.  **\*** (Aggravato - Aggravated)
    4.  Vuoto
*   **Volontà e Sanità**: Clicca per segnare i punti spesi o persi (casella piena).

### Immagine del Personaggio
*   Clicca sul riquadro a destra (o sull'icona `+`) per caricare un'immagine dal tuo dispositivo.
*   L'immagine verrà ridimensionata per rientrare nel riquadro senza essere tagliata (`contain`), con uno sfondo scuro per riempire gli spazi vuoti.

## 3. Funzionalità Avanzate

### Blocco Sezioni (Modalità Lettura)
Ogni sezione ha un'icona a forma di **occhio** in alto a destra.
*   **Clicca per bloccare**: La sezione diventa di sola lettura.
    *   I campi di testo non sono modificabili.
    *   I pulsanti `+` e `-` dei Pregi vengono nascosti.
    *   I pallini vuoti diventano semitrasparenti per migliorare la leggibilità.
    *   I pallini pieni e il testo rimangono perfettamente visibili (non sbiaditi).
*   **Clicca per sbloccare**: Ripristina la modalità modifica.

### Salvataggio e Caricamento
*   **Salva**: Clicca su "Salva Personaggio" in fondo alla pagina. I dati vengono salvati nel database online (Firebase).
*   **Link Univoco**: Dopo il primo salvataggio, l'URL del browser cambierà includendo un ID (es. `?id=...`). Copia e conserva questo link per riaprire la scheda in futuro.

## 4. Regole di Calcolo Automatico
La scheda applica le regole standard della 2a Edizione (CoD):
*   **Iniziativa**: Destrezza + Autocontrollo.
*   **Difesa**: Il minore tra Prontezza e Destrezza.
*   **Velocità**: Forza + Destrezza + 5.
*   **Salute**: Costituzione + Taglia.
*   **Volontà**: Fermezza + Autocontrollo.