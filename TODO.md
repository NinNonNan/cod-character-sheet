# TODO List - Scheda Personaggio CoD

Questo file tiene traccia delle funzionalità da implementare e dei bug da correggere.

## Funzionalità da Aggiungere

- [ ] **Aggiungere Metadati per Anteprime Social (Open Graph)**
  - [ ] **Definire i contenuti:**
    - Titolo (`og:title`): Es. "Scheda Personaggio - Chronicles of Darkness"
    - Descrizione (`og:description`): Es. "Crea, modifica e condividi la tua scheda personaggio per Chronicles of Darkness online."
    - Immagine (`og:image`): Creare un'immagine di anteprima rappresentativa (es. uno screenshot stilizzato della scheda). La dimensione consigliata è 1200x630px.
  - [ ] **Implementare i tag nel `<head>`:** Aggiungere i tag `<meta>` necessari ai file `index.html` e `index-2-colonne.html`.
    - `og:title`
    - `og:description`
    - `og:image`
    - `og:url` (dovrà puntare all'URL del progetto su GitHub Pages)
    - `og:type` (impostato a `website`)
  - [ ] **Implementare i tag per Twitter Cards:** Per una migliore integrazione con Twitter.
    - `twitter:card` (impostato a `summary_large_image`)
    - `twitter:title`
    - `twitter:description`
    - `twitter:image`

- [ ] **Rendere il layout responsive:** Su schermi piccoli, le colonne (specialmente in "Tratti Principali") dovrebbero impilarsi verticalmente.
- [ ] **Aggiungere una sezione "Note":** Un'area di testo a tutta larghezza per appunti generici sul personaggio.
- [ ] **Aggiungere un pulsante "Reset":** Per riportare la scheda ai suoi valori di default.