/**
 * Funzione principale che viene eseguita dopo aver caricato le librerie di Firebase.
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURAZIONE E INIZIALIZZAZIONE FIREBASE ---
    // Questa è la TUA configurazione, come presente nel file.
    const firebaseConfig = {
        apiKey: "AIzaSyA-Vm3aVHy7m230s_YGuBYgL0MRlnF2hts",
        authDomain: "scheda-personaggio-cod.firebaseapp.com",
        projectId: "scheda-personaggio-cod",
        storageBucket: "scheda-personaggio-cod.appspot.com",
        messagingSenderId: "594233148940",
        appId: "1:594233148940:web:9c6321b433735084269029"
    };

    // Inizializza Firebase
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // --- 2. DEFINIZIONE DELLE VARIABILI E COSTANTI GLOBALI DELL'APP ---

    const MAX_DOTS_DEFAULT = 5;

    // Variabile per memorizzare l'URL dell'immagine caricata
    let imageUrlCorrente = null;

    // --- FUNZIONI DI INIZIALIZZAZIONE ---
    
    /**
     * Crea i pallini per tutti gli elementi con classe 'punti'.
     */
    function inizializzaTrattiSemplici() {
        const contenitori = document.querySelectorAll('.punti');
        contenitori.forEach(container => {
            const maxDots = parseInt(container.dataset.max) || MAX_DOTS_DEFAULT;
            container.innerHTML = ''; // Pulisce il contenitore

            for (let i = 1; i <= maxDots; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                // Per Integrità, i pallini oltre il 10° non sono cliccabili
                if (container.dataset.tratto === 'integrita' && i > 10) {
                    dot.classList.add('non-cliccabile');
                }
                dot.dataset.value = i;
                container.appendChild(dot);
            }

            container.addEventListener('click', gestisciClickPallino);
        });

        // Aggiungi listener per i quadrati di specializzazione
        document.querySelectorAll('.specializzazione').forEach(quadrato => {
            // Aggiungi il listener solo se non ne ha già uno
            if (quadrato.dataset.listenerAggiunto) return;

            quadrato.addEventListener('click', () => {
                quadrato.classList.toggle('filled');
                aggiornaElencoSpecializzazioni(); // Aggiorna la nuova sezione
            });
            quadrato.dataset.listenerAggiunto = 'true';
        });
    }
    
    /**
     * Crea le scale doppie (pallino + quadretto) per Salute e Volontà.
     */
    function inizializzaScaleDoppie() {
        const contenitori = document.querySelectorAll('.contenitore-doppia-scala');
        contenitori.forEach(container => {
            const tratto = container.dataset.tratto;
            const maxDots = parseInt(container.dataset.max) || 10;
            container.innerHTML = ''; // Pulisce il contenitore

            for (let i = 1; i <= maxDots; i++) {
                const colonna = document.createElement('div');
                colonna.classList.add('colonna-doppia');

                const dot = document.createElement('span');
                dot.classList.add('dot');
                dot.dataset.value = i;

                const box = document.createElement('div');
                box.classList.add('box');
                box.dataset.index = i - 1;

                colonna.appendChild(dot);
                colonna.appendChild(box);
                container.appendChild(colonna);
            }

            container.addEventListener('click', gestisciClickTracciato);
        });
    }
    
    /**
     * Inizializza la funzionalità di blocco/sblocco per le sezioni.
     */
    function inizializzaBloccoSezioni() {
        document.querySelectorAll('.lock-icon').forEach(icon => {
            icon.addEventListener('click', () => {
                const section = icon.closest('section');
                if (section) {
                    const isLocked = section.classList.toggle('section-locked');
                    // Cambia l'icona in base allo stato di blocco
                    icon.classList.toggle('fa-eye', !isLocked);
                    icon.classList.toggle('fa-eye-slash', isLocked);

                    // Logica personalizzata per i box in Tratti Principali quando la sezione viene bloccata/sbloccata
                    if (section.id === 'tratti-principali') {
                        section.querySelectorAll('.contenitore-doppia-scala').forEach(scala => {
                            const dots = scala.querySelectorAll('.dot');
                            const boxes = scala.querySelectorAll('.box');

                            boxes.forEach((box, index) => {
                                const correspondingDot = dots[index];
                                // Un box è "oltre il limite" se il pallino corrispondente non è pieno.
                                const isBeyondMax = !correspondingDot.classList.contains('filled');
                                
                                // Aggiungi la classe 'box-bloccato' solo se la sezione è bloccata E il box è oltre il limite.
                                // Altrimenti, assicurati che sia rimossa.
                                if (isLocked && isBeyondMax) {
                                    box.classList.add('box-bloccato');
                                } else {
                                    box.classList.remove('box-bloccato');
                                }
                            });
                        });
                    }
                }
            });
        });
    }
    
    /**
     * Inizializza i pulsanti per aggiungere dinamicamente i pregi.
     */
    function inizializzaAggiuntaPregi() {
        document.querySelectorAll('.aggiungi-pregio-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const colonnaId = btn.dataset.colonna;
                const contenitorePregi = document.getElementById(colonnaId);
                if (contenitorePregi) {
                    creaRigaPregio(contenitorePregi);
                }
            });
        });
    }
    
    /**
     * Inizializza i pulsanti per rimuovere l'ultimo pregio aggiunto in una colonna.
     */
    function inizializzaRimozionePregi() {
        document.querySelectorAll('.rimuovi-pregio-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const colonnaId = btn.dataset.colonna;
                const contenitorePregi = document.getElementById(colonnaId);
                if (contenitorePregi) {
                    // Trova l'ultima riga di pregio nella colonna e la rimuove
                    const righePregio = contenitorePregi.querySelectorAll('.riga-tratto');
                    if (righePregio.length > 0) {
                        righePregio[righePregio.length - 1].remove();
                    }
                }
            });
        });
    }
    
    /**
     * Inizializza la logica per il caricamento dell'immagine del personaggio.
     */
    function inizializzaCaricamentoImmagine() {
        const imageContainer = document.getElementById('character-image-container');
        const imageUploadInput = document.getElementById('image-upload');
        const imagePreview = document.getElementById('character-image-preview');

        if (!imageContainer || !imageUploadInput || !imagePreview) return;

        // Quando si clicca sul box, si attiva l'input nascosto
        imageContainer.addEventListener('click', () => {
            imageUploadInput.click();
        });

        // Quando un file viene selezionato
        imageUploadInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                // Mostra un'anteprima locale istantanea
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.src = e.target.result;
                    imageContainer.classList.add('has-image');
                };
                reader.readAsDataURL(file);

            }
        });
    }    
    
    function mostraImmagineCaricata(url) {
        const imageContainer = document.getElementById('character-image-container');
        const imagePreview = document.getElementById('character-image-preview');
        imagePreview.src = url;
        imageContainer.classList.add('has-image');
    }    
    /**
     * Crea e aggiunge una nuova riga per un pregio in una colonna.
     * @param {HTMLElement} contenitore - L'elemento che conterrà la nuova riga.
     * @param {string} [nome=''] - Il nome del pregio (per il caricamento).
     * @param {number} [valore=0] - Il valore del pregio (per il caricamento).
     */
    function creaRigaPregio(contenitore, nome = '', valore = 0) {
        const riga = document.createElement('div');
        // Usiamo la stessa classe delle abilità per uniformità di stile
        riga.className = 'riga-tratto';

        // Aggiungiamo uno span vuoto per allineare i pregi con le abilità (che hanno la specializzazione)
        const placeholderSpecializzazione = document.createElement('span');
        placeholderSpecializzazione.className = 'specializzazione'; // Usa la stessa classe per la dimensione
        placeholderSpecializzazione.style.visibility = 'hidden'; // Lo rende invisibile ma occupa spazio

        const inputNome = document.createElement('input');
        inputNome.type = 'text';
        inputNome.placeholder = 'Nome Pregio';
        inputNome.value = nome;
        inputNome.className = 'nome-pregio'; // Classe per lo stile specifico

        const punti = document.createElement('div');
        punti.className = 'punti';
        punti.dataset.tratto = `pregio-${Date.now()}-${Math.random()}`;

        riga.append(placeholderSpecializzazione, inputNome, punti);
        contenitore.appendChild(riga);

        // Inizializza i pallini per la nuova riga e imposta il valore caricato
        inizializzaSingoloTratto(punti, valore);
    }
    
    /**
     * Inizializza i pallini per un singolo contenitore.
     * @param {HTMLElement} container - Il contenitore .punti da inizializzare.
     * @param {number} [valoreIniziale=0] - Il valore da impostare dopo l'inizializzazione.
     */
    function inizializzaSingoloTratto(container, valoreIniziale = 0) {
        const maxDots = parseInt(container.dataset.max) || MAX_DOTS_DEFAULT;
        container.innerHTML = ''; // Pulisce il contenitore

        for (let i = 1; i <= maxDots; i++) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dot.dataset.value = i;
            container.appendChild(dot);
        }

        container.addEventListener('click', gestisciClickPallino);
        aggiornaPallini(container, valoreIniziale);
    }
    
    /**
     * Gestisce il click su un contenitore di pallini.
     * @param {Event} event L'evento del click.
     */
    function gestisciClickPallino(event) {
        const target = event.target;
        if (!target.classList.contains('dot')) return;

        const container = target.parentElement;
        const dots = container.querySelectorAll('.dot');
        const value = parseInt(target.dataset.value);
        const currentValue = Array.from(dots).filter(d => d.classList.contains('filled')).length;

        // Impedisci il click sui pallini non cliccabili (per Integrità > 10)
        if (target.classList.contains('non-cliccabile')) return;


        // Se si clicca sul pallino già attivo, si azzera il valore
        const newValue = (value === currentValue) ? 0 : value;

        aggiornaPallini(container, newValue);

        // Dopo aver aggiornato un attributo, ricalcola i tratti derivati
        calcolaTrattiDerivati();
    }
    
    /**
     * Aggiorna lo stato visuale dei pallini in un contenitore.
     * @param {HTMLElement} container Il div .punti che contiene i pallini.
     * @param {number} value Il nuovo valore da visualizzare.
     */
    function aggiornaPallini(container, value) {
        const dots = container.querySelectorAll('.dot');
        dots.forEach(dot => {
            if (parseInt(dot.dataset.value) <= value) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });

        // Aggiorna lo stato della specializzazione associata
        aggiornaStatoSpecializzazione(container.closest('.riga-tratto'), value);
    }
    
    // --- FUNZIONI PER TRATTI DERIVATI E TRACCIATI ---
    
    /**
     * Legge gli attributi e calcola i valori derivati come Salute e Volontà.
     */
    function calcolaTrattiDerivati() {
        // Attributi base
        const costituzione = getValoreTratto('costituzione'); // Stamina
        const fermezza = getValoreTratto('fermezza');         // Resolve
        const autocontrollo = getValoreTratto('autocontrollo');
        const prontezza = getValoreTratto('prontezza');       // Wits
        const destrezza = getValoreTratto('destrezza');       // Dexterity
        const forza = getValoreTratto('forza');               // Strength
        const taglia = parseInt(document.getElementById('taglia').value) || 5;
        
        // Calcoli
        const saluteMaxCalc = costituzione + taglia;
        const volontaMaxCalc = fermezza + autocontrollo;
        const sanitaMaxCalc = fermezza + autocontrollo + 5;
        const iniziativaCalc = prontezza + autocontrollo;
        const difesaCalc = Math.min(prontezza, destrezza);
        const velocitaCalc = forza + destrezza + 5;

        // Aggiorna la scala a pallini (visiva)
        // Questi pallini rappresentano il valore massimo calcolato
        const dotsSalute = document.querySelectorAll('#scala-salute .dot');
        dotsSalute.forEach(dot => dot.classList.toggle('filled', parseInt(dot.dataset.value) <= saluteMaxCalc));
        const dotsVolonta = document.querySelectorAll('#scala-volonta .dot');
        dotsVolonta.forEach(dot => dot.classList.toggle('filled', parseInt(dot.dataset.value) <= volontaMaxCalc));
        const dotsSanita = document.querySelectorAll('#scala-sanita .dot');
        dotsSanita.forEach(dot => dot.classList.toggle('filled', parseInt(dot.dataset.value) <= sanitaMaxCalc));

        // Aggiorna i valori calcolati
        document.getElementById('valore-iniziativa').textContent = iniziativaCalc;
        document.getElementById('valore-difesa').textContent = difesaCalc;
        document.getElementById('valore-velocita').textContent = velocitaCalc;
    }
    
    /**
     * Recupera il valore numerico di un tratto dai suoi pallini.
     * @param {string} nomeTratto Il valore di data-tratto.
     * @returns {number} Il valore del tratto.
     */
    function getValoreTratto(nomeTratto) {
        const container = document.querySelector(`.punti[data-tratto="${nomeTratto}"]`);
        if (!container) return 0;
        const filledDots = container.querySelectorAll('.dot.filled').length;
        // Per Integrità, il valore effettivo non può superare 10
        if (nomeTratto === 'integrita') {
            return Math.min(10, filledDots);
        }
        return filledDots;
    }
    
    /**
     * Gestisce il click su un quadretto di un tracciato (Salute, Volontà o Integrità).
     */
    function gestisciClickTracciato(event) {
        const target = event.target;
        if (!target.classList.contains('box')) return;

        // Impedisci il click se il box è bloccato
        if (target.classList.contains('box-bloccato')) return;

        const container = target.closest('.contenitore-doppia-scala');
        const tratto = container.dataset.tratto;

        if (tratto === 'salute') {
            const stati = ['vuoto', 'bashing', 'lethal', 'aggravated'];
            let statoCorrente = 'vuoto';

            if (target.classList.contains('bashing')) statoCorrente = 'bashing';
            else if (target.classList.contains('lethal')) statoCorrente = 'lethal';
            else if (target.classList.contains('aggravated')) statoCorrente = 'aggravated';

            const indexProssimoStato = (stati.indexOf(statoCorrente) + 1) % stati.length;
            const prossimoStato = stati[indexProssimoStato];

            target.classList.remove('bashing', 'lethal', 'aggravated');
            if (prossimoStato !== 'vuoto') {
                target.classList.add(prossimoStato);
            }
        } else if (tratto === 'volonta') {
            target.classList.toggle('volonta-spesa');
        } else if (tratto === 'sanita') {
            target.classList.toggle('sanita-spesa');
        }
    }
        
    /**
     * Abilita o disabilita la casella di specializzazione in base al valore dell'abilità.
     * @param {HTMLElement} rigaTratto La riga che contiene sia l'abilità che la specializzazione.
     * @param {number} valoreAbilita Il valore corrente dell'abilità.
     */
    function aggiornaStatoSpecializzazione(rigaTratto, valoreAbilita) {
        if (!rigaTratto) return;
        const specializzazione = rigaTratto.querySelector('.specializzazione');
        if (!specializzazione) return;

        if (valoreAbilita === 0) {
            specializzazione.classList.add('disabilitata');
        } else {
            specializzazione.classList.remove('disabilitata');
        }
    }
    
    /**
     * Aggiorna la sezione "Specializzazioni" in base alle caselle spuntate nelle abilità.
     */
    function aggiornaElencoSpecializzazioni() {
        const sezioneSpecializzazioni = document.getElementById('specializzazioni-attive');
        const contenitore = document.getElementById('contenitore-specializzazioni');
        const specializzazioniSpuntate = document.querySelectorAll('#abilita .specializzazione.filled');

        // Se non ci sono specializzazioni spuntate, nascondi l'intera sezione e svuota il contenuto.
        if (specializzazioniSpuntate.length === 0) {
            sezioneSpecializzazioni.style.display = 'none';
            contenitore.innerHTML = '';
            return;
        }

        // Altrimenti, mostra la sezione e popola il contenuto.
        sezioneSpecializzazioni.style.display = 'block';
        contenitore.innerHTML = ''; // Pulisce la sezione prima di ripopolarla

        specializzazioniSpuntate.forEach(checkSpecializzazione => {
            const rigaAbilita = checkSpecializzazione.closest('.riga-tratto');
            const nomeAbilita = rigaAbilita.querySelector('label').textContent;
            const tratto = rigaAbilita.querySelector('.punti').dataset.tratto;

            const rigaSpec = document.createElement('div');
            rigaSpec.className = 'riga-specializzazione';

            const label = document.createElement('label');
            label.textContent = `${nomeAbilita}:`;

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = `Dettagli specializzazione...`;
            input.dataset.trattoSpec = tratto; // Usa il data-tratto per un ID univoco

            rigaSpec.append(label, input);
            contenitore.appendChild(rigaSpec);
        });
    }
    
    /**
     * Calcola e aggiorna l'esperienza rimanente.
     */
    function calcolaEsperienza() {
        const totale = parseInt(document.getElementById('esperienza-totale').value) || 0;
        const spesa = parseInt(document.getElementById('esperienza-spesa').value) || 0;
        const rimanente = totale - spesa;
        document.getElementById('esperienza-rimanente').textContent = rimanente;
    }
    
    // --- FUNZIONI DI SALVATAGGIO E CARICAMENTO ---
    
    // Variabile globale per tenere traccia dell'ID del personaggio attualmente caricato
    let personaggioIdCorrente = null;

    // Variabile per memorizzare l'ultimo stato salvato/caricato della scheda
    let statoSalvato = '';

    /**
     * Raccoglie tutti i dati dalla scheda e li restituisce come un oggetto.
     */
    function raccogliDatiScheda() {
        const personaggio = { // Raccoglie i dati comuni a entrambe le schede
            nome: document.getElementById('nome')?.value || '',
            cronaca: document.getElementById('cronaca')?.value || '',
            concetto: document.getElementById('concetto')?.value || '',
            virtu: document.getElementById('virtu')?.value || '',
            vizio: document.getElementById('vizio')?.value || '',
            taglia: document.getElementById('taglia')?.value || 5,
            armatura: document.getElementById('armatura')?.value || 0,
            tratti: {},
            specializzazioni: {},
            testoSpecializzazioni: {},
            pregi: { 'pregi-col-1': [], 'pregi-col-2': [], 'pregi-col-3': [] },
            sezioniBloccate: {},
            tracciati: {}
        };

        // Raccoglie dati specifici della scheda standard, se presenti
        const giocatoreInput = document.getElementById('giocatore');
        if (giocatoreInput) personaggio.giocatore = giocatoreInput.value;

        const etaInput = document.getElementById('eta');
        if (etaInput) personaggio.eta = etaInput.value;

        const fazioneInput = document.getElementById('fazione');
        if (fazioneInput) personaggio.fazione = fazioneInput.value;

        const expTotaleInput = document.getElementById('esperienza-totale');
        if (expTotaleInput) personaggio.esperienzaTotale = expTotaleInput.value;

        const expSpesaInput = document.getElementById('esperienza-spesa');
        if (expSpesaInput) personaggio.esperienzaSpesa = expSpesaInput.value;

        document.querySelectorAll('.punti').forEach(c => { personaggio.tratti[c.dataset.tratto] = getValoreTratto(c.dataset.tratto); });
        document.querySelectorAll('#abilita .riga-tratto').forEach(r => {
            const tratto = r.querySelector('.punti').dataset.tratto;
            personaggio.specializzazioni[tratto] = r.querySelector('.specializzazione').classList.contains('filled');
        });
        document.querySelectorAll('#contenitore-specializzazioni input').forEach(i => { personaggio.testoSpecializzazioni[i.dataset.trattoSpec] = i.value; });
        document.querySelectorAll('.contenitore-pregi').forEach(c => {
            c.querySelectorAll('.riga-tratto').forEach(r => {
                const nome = r.querySelector('input').value;
                const valore = r.querySelectorAll('.punti .dot.filled').length;
                if (nome) personaggio.pregi[c.id].push({ nome, valore });
            });
        });
        document.querySelectorAll('section[id]').forEach(s => { personaggio.sezioniBloccate[s.id] = s.classList.contains('section-locked'); });

        const salvaStatoTracciato = id => Array.from(document.querySelectorAll(`#${id} .box`)).map(box => {
            if (box.classList.contains('bashing')) return 'bashing';
            if (box.classList.contains('lethal')) return 'lethal';
            if (box.classList.contains('aggravated')) return 'aggravated';
            if (box.classList.contains('volonta-spesa')) return 'speso';
            if (box.classList.contains('sanita-spesa')) return 'speso-sanita';
            return 'vuoto';
        });
        personaggio.tracciati.salute = salvaStatoTracciato('scala-salute');
        personaggio.tracciati.volonta = salvaStatoTracciato('scala-volonta');
        personaggio.tracciati.sanita = salvaStatoTracciato('scala-sanita');

        return personaggio;
    }

    /**
     * Popola l'intera scheda usando un oggetto dati del personaggio.
     * @param {object} personaggio L'oggetto con i dati del personaggio.
     */
    function popolaSchedaConDati(personaggio) { // Rinominiamo per chiarezza
        // Disabilita temporaneamente il controllo delle modifiche mentre si popola la scheda
        document.body.removeEventListener('input', controllaModifiche);
        document.body.removeEventListener('click', controllaModifiche);
        document.getElementById('nome').value = personaggio.nome || '';
        document.getElementById('cronaca').value = personaggio.cronaca || '';
        document.getElementById('concetto').value = personaggio.concetto || '';
        
        // Campi presenti solo in character.html
        const giocatoreInput = document.getElementById('giocatore');
        if (giocatoreInput) giocatoreInput.value = personaggio.giocatore || '';
        const etaInput = document.getElementById('eta');
        if (etaInput) etaInput.value = personaggio.eta || '';
        const fazioneInput = document.getElementById('fazione');
        if (fazioneInput) fazioneInput.value = personaggio.fazione || '';

        document.getElementById('virtu').value = personaggio.virtu || '';
        document.getElementById('vizio').value = personaggio.vizio || '';
        document.getElementById('taglia').value = personaggio.taglia || 5;
        document.getElementById('armatura').value = personaggio.armatura || 0;
        
        const expTotaleInput = document.getElementById('esperienza-totale');
        if (expTotaleInput) expTotaleInput.value = personaggio.esperienzaTotale || 0;
        const expSpesaInput = document.getElementById('esperienza-spesa');
        if (expSpesaInput) expSpesaInput.value = personaggio.esperienzaSpesa || 0;

        if (personaggio.imageUrl) {
            // Se l'URL inizia con 'data:image', è una stringa Base64. Altrimenti è un vecchio URL di storage.
            mostraImmagineCaricata(personaggio.imageUrl);
        }

        if (personaggio.tratti) {
            for (const tratto in personaggio.tratti) {
                const container = document.querySelector(`.punti[data-tratto="${tratto}"]`);
                if (container) aggiornaPallini(container, personaggio.tratti[tratto]);
            }
        }

        if (personaggio.specializzazioni) {
            for (const tratto in personaggio.specializzazioni) {
                const riga = document.querySelector(`.punti[data-tratto="${tratto}"]`)?.closest('.riga-tratto');
                if (riga) riga.querySelector('.specializzazione').classList.toggle('filled', personaggio.specializzazioni[tratto]);
            }
        }

        aggiornaElencoSpecializzazioni();
        if (personaggio.testoSpecializzazioni) {
            for (const tratto in personaggio.testoSpecializzazioni) {
                const input = document.querySelector(`#contenitore-specializzazioni input[data-tratto-spec="${tratto}"]`);
                if (input) input.value = personaggio.testoSpecializzazioni[tratto];
            }
        }

        document.querySelectorAll('.contenitore-pregi').forEach(c => c.innerHTML = '');
        if (personaggio.pregi) {
            for (const colonnaId in personaggio.pregi) {
                const contenitore = document.getElementById(colonnaId);
                if (contenitore) personaggio.pregi[colonnaId].forEach(p => creaRigaPregio(contenitore, p.nome, p.valore));
            }
        }

        if (personaggio.sezioniBloccate) {
            for (const sectionId in personaggio.sezioniBloccate) {
                const section = document.getElementById(sectionId);
                if (section) {
                    const isLocked = personaggio.sezioniBloccate[sectionId];
                    section.classList.toggle('section-locked', isLocked);
                    const icon = section.querySelector('.lock-icon');
                    icon.classList.toggle('fa-eye', !isLocked);
                    icon.classList.toggle('fa-eye-slash', isLocked);
                }
            }
        }

        calcolaTrattiDerivati();

        // Calcola l'esperienza rimanente dopo aver caricato i dati
        if (expTotaleInput) calcolaEsperienza();

        if (personaggio.tracciati) {
            const caricaStatoTracciato = (id, stati) => {
                if (!stati) return;
                document.querySelectorAll(`#${id} .box`).forEach((box, index) => {
                    box.className = 'box'; // Pulisce il box
                    if (stati[index] && stati[index] !== 'vuoto') {
                        let classe = stati[index] === 'speso' ? 'volonta-spesa' : stati[index] === 'speso-sanita' ? 'sanita-spesa' : stati[index];
                        box.classList.add(classe);
                    }
                });
            };
            caricaStatoTracciato('scala-salute', personaggio.tracciati.salute);
            caricaStatoTracciato('scala-volonta', personaggio.tracciati.volonta);
            caricaStatoTracciato('scala-sanita', personaggio.tracciati.sanita);
        }
    }

    // --- 3. LOGICA SPECIFICA PER PAGINA ---

    // Funzione per caricare i personaggi nella lista di index.html
    async function caricaListaPersonaggi() {
        const listaElement = document.getElementById('lista-personaggi');
        try {
            const querySnapshot = await db.collection("characters").get();
            listaElement.innerHTML = ''; // Pulisci la lista

            if (querySnapshot.empty) {
                listaElement.innerHTML = '<li>Nessun personaggio trovato nel database.</li>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const personaggio = doc.data();
                const nomePersonaggio = personaggio.nome || 'Personaggio senza nome';
                const li = document.createElement('li');
                // Il link punta a character.html per la visualizzazione completa
                li.innerHTML = `<a href="character.html?id=${doc.id}">${nomePersonaggio}</a>`;
                listaElement.appendChild(li);
            });
        } catch (error) {
            console.error("Errore nel caricamento dei personaggi da Firebase: ", error);
            listaElement.innerHTML = '<li>Errore nel caricamento dei personaggi. Controlla la console.</li>';
        }
    }

    /**
     * Carica un personaggio dal database Firestore in base all'ID nell'URL.
     */
    async function caricaPersonaggioDaURL() {
        console.log("Avvio di caricaPersonaggioDaURL...");
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (id) {
            personaggioIdCorrente = id;
            const docRef = db.collection("characters").doc(id); // Usa la collezione "characters"
            const docSnap = await docRef.get(); // Usa il metodo .get() della versione compat

            if (docSnap.exists) {
                console.log("Personaggio caricato dal DB:", docSnap.data());
                popolaSchedaConDati(docSnap.data());
                return true; // Indica che il caricamento è avvenuto con successo
            } else {
                alert("Personaggio non trovato! L'ID nell'URL potrebbe essere errato.");
                personaggioIdCorrente = null; // Resetta l'ID se non valido
                return false; // Indica che il caricamento è fallito
            }
        }
        return false; // Nessun ID nell'URL, quindi nessun caricamento
    }

    /**
     * Salva il personaggio corrente nel database Firestore.
     * Se è un nuovo personaggio, ne crea uno. Se esiste già, lo aggiorna.
     */
    async function salvaPersonaggioSuServer() {
        console.log("Pulsante 'Salva Personaggio' cliccato. Inizio processo di salvataggio...");
        console.log("Ottenuto riferimento al database Firestore.");

        const datiPersonaggio = raccogliDatiScheda();
        console.log("Dati della scheda raccolti:", datiPersonaggio);

        try {
            if (personaggioIdCorrente) {
                // Aggiorna un personaggio esistente
                console.log(`Aggiornamento personaggio esistente con ID: ${personaggioIdCorrente}`);
                await db.collection("personaggi").doc(personaggioIdCorrente).set(datiPersonaggio);
                statoSalvato = JSON.stringify(datiPersonaggio); // Aggiorna lo stato salvato
                document.getElementById('salva-btn').disabled = true; // Disabilita il pulsante dopo il salvataggio
                alert("Personaggio aggiornato con successo!");
            } else {
                // Crea un nuovo personaggio
                console.log("Creazione di un nuovo personaggio...");
                const docRef = await db.collection("characters").add(datiPersonaggio);
                personaggioIdCorrente = docRef.id;
                statoSalvato = JSON.stringify(datiPersonaggio); // Aggiorna lo stato salvato
                document.getElementById('salva-btn').disabled = true; // Disabilita il pulsante dopo il salvataggio
                console.log(`Nuovo personaggio creato con ID: ${personaggioIdCorrente}`);
                // Aggiorna l'URL nel browser senza ricaricare la pagina
                const nuovaUrl = `${window.location.pathname}?id=${personaggioIdCorrente}`;
                window.history.pushState({ path: nuovaUrl }, '', nuovaUrl);
                console.log(`URL aggiornato a: ${nuovaUrl}`);
                alert(`Personaggio salvato! Condividi questo link per mostrarlo ad altri.`);
            }
        } catch (e) {
            console.error("Errore durante il salvataggio: ", e);
            alert("Si è verificato un errore durante il salvataggio.");
        }
    }

    /**
     * Confronta lo stato attuale della scheda con l'ultimo stato salvato
     * e abilita/disabilita il pulsante di salvataggio di conseguenza.
     */
    function controllaModifiche() {
        const statoAttuale = JSON.stringify(raccogliDatiScheda());
        const salvaBtn = document.getElementById('salva-btn');
        
        // Abilita il pulsante solo se lo stato attuale è diverso da quello salvato
        salvaBtn.disabled = (statoAttuale === statoSalvato);
    }

    // --- 4. ESECUZIONE E BINDING DEGLI EVENTI ---

    // Esegui le inizializzazioni comuni a tutte le schede
    inizializzaTrattiSemplici();
    inizializzaScaleDoppie();
    inizializzaRimozionePregi(); // Aggiunto per inizializzare i nuovi pulsanti
    inizializzaAggiuntaPregi();
    inizializzaBloccoSezioni();
    inizializzaCaricamentoImmagine();
    // Calcola i valori iniziali
    calcolaTrattiDerivati();

    // Aggiungi listener per il campo Taglia per ricalcolare quando cambia
    const tagliaInput = document.getElementById('taglia');
    if (tagliaInput) tagliaInput.addEventListener('input', calcolaTrattiDerivati);

    // Esegui le inizializzazioni specifiche per la scheda standard
    if (document.getElementById('character-image-container')) {
        const expTotaleInput = document.getElementById('esperienza-totale');
        if (expTotaleInput) expTotaleInput.addEventListener('input', calcolaEsperienza);
        const expSpesaInput = document.getElementById('esperienza-spesa');
        if (expSpesaInput) expSpesaInput.addEventListener('input', calcolaEsperienza);
        calcolaEsperienza();
    }

    // Nascondi la sezione specializzazioni se è vuota all'avvio
    if (document.getElementById('specializzazioni-attive')) {
        aggiornaElencoSpecializzazioni();
        // Disabilita tutte le specializzazioni all'avvio, dato che le abilità sono a 0
        document.querySelectorAll('#abilita .riga-tratto').forEach(riga => {
            aggiornaStatoSpecializzazione(riga, 0);
        });
    }

    // Esegui la logica specifica per la pagina corrente
    if (document.getElementById('lista-personaggi')) {
        // Siamo su index.html
        caricaListaPersonaggi();
    } else if (window.location.pathname.includes('character.html') || window.location.pathname.includes('character-compact.html')) {
        // Siamo su una delle due schede personaggio
        caricaPersonaggioDaURL().then(finalizzaStatoIniziale);
    }
    
    /**
     * Imposta lo stato corrente della scheda come "pulito" (salvato)
     * e attiva i listener per rilevare le modifiche.
     */
    function finalizzaStatoIniziale() {
        console.log("Finalizzazione dello stato iniziale della scheda.");
        statoSalvato = JSON.stringify(raccogliDatiScheda());
        document.getElementById('salva-btn').disabled = true;
        document.body.addEventListener('input', controllaModifiche);
        document.body.addEventListener('click', controllaModifiche);
    }

    // Prova a caricare un personaggio e, una volta finito, finalizza lo stato.
    caricaPersonaggioDaURL().then(finalizzaStatoIniziale);

    // --- FINE CODICE ORIGINALE DELL'APP ---
}

/**
 * Funzione per caricare dinamicamente uno script.
 * @param {string} src L'URL dello script da caricare.
 * @returns {Promise} Una promise che si risolve quando lo script è caricato.
 */
function caricaScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Carica le librerie di Firebase in sequenza, poi avvia l'applicazione.
caricaScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js")
    .then(() => caricaScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"))
    .then(avviaApp)
    .catch(err => console.error("Errore nel caricamento delle librerie Firebase:", err));
