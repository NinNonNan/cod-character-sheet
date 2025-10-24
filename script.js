// script.js

// Quando la pagina è completamente caricata, eseguiamo questo codice
document.addEventListener('DOMContentLoaded', () => {

    const MAX_DOTS_DEFAULT = 5;

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
            quadrato.addEventListener('click', () => {
                quadrato.classList.toggle('filled');
            });
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
                }
            });
        });
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
    
    // Aggiungi un listener per il campo Taglia per ricalcolare quando cambia
    document.getElementById('taglia').addEventListener('input', calcolaTrattiDerivati);

    // --- FUNZIONI DI SALVATAGGIO E CARICAMENTO ---

    const salvaBtn = document.getElementById('salva-btn');
    const caricaBtn = document.getElementById('carica-btn');

    salvaBtn.addEventListener('click', () => {
        const personaggio = {
            // Info di base
            nome: document.getElementById('nome').value,
            cronaca: document.getElementById('cronaca').value,
            concetto: document.getElementById('concetto').value,
            virtu: document.getElementById('virtu').value,
            vizio: document.getElementById('vizio').value,
            taglia: document.getElementById('taglia').value,
            armatura: document.getElementById('armatura').value,
            tratti: {}
        };

        // Raccoglie i valori da tutti i pallini
        document.querySelectorAll('.punti').forEach(container => {
            const tratto = container.dataset.tratto;
            personaggio.tratti[tratto] = getValoreTratto(tratto);
        });

        // Salva lo stato delle specializzazioni
        personaggio.specializzazioni = {};
        document.querySelectorAll('#abilita .riga-tratto').forEach(riga => {
            const tratto = riga.querySelector('.punti').dataset.tratto;
            const isSpecialized = riga.querySelector('.specializzazione').classList.contains('filled');
            personaggio.specializzazioni[tratto] = isSpecialized;
        });

        // Salva lo stato di blocco delle sezioni
        personaggio.sezioniBloccate = {};
        document.querySelectorAll('section').forEach(section => {
            if (section.id) {
                personaggio.sezioniBloccate[section.id] = section.classList.contains('section-locked');
            }
        });

        // Salva lo stato dei tracciati
        // Funzione helper per salvare lo stato dei box
        function salvaStatoTracciato(idContenitore) {
            const stati = [];
            document.querySelectorAll(`#${idContenitore} .box`).forEach(box => {
                if (box.classList.contains('bashing')) stati.push('bashing'); // Salute
                else if (box.classList.contains('lethal')) stati.push('lethal');
                else if (box.classList.contains('aggravated')) stati.push('aggravated');
                else if (box.classList.contains('volonta-spesa')) stati.push('speso'); // Volontà
                else if (box.classList.contains('sanita-spesa')) stati.push('speso-sanita'); // Sanità
                else stati.push('vuoto'); // Aggiunto stato vuoto per un salvataggio completo
            });
            return stati;
        }

        personaggio.tracciati = {
            salute: salvaStatoTracciato('scala-salute'),
            volonta: salvaStatoTracciato('scala-volonta'),
            sanita: salvaStatoTracciato('scala-sanita')
        }; // Integrità non è più una doppia scala, quindi non va salvata qui
        // Salva anche il valore massimo calcolato dei pallini
        personaggio.tratti['salute-max'] = document.querySelectorAll('#scala-salute .dot.filled').length;
        personaggio.tratti['volonta-max'] = document.querySelectorAll('#scala-volonta .dot.filled').length;
        personaggio.tratti['sanita-max'] = document.querySelectorAll('#scala-sanita .dot.filled').length;

        localStorage.setItem('personaggioCoD', JSON.stringify(personaggio));
        alert('Personaggio salvato con successo!');
    });

    caricaBtn.addEventListener('click', () => {
        const personaggioJSON = localStorage.getItem('personaggioCoD');

        if (personaggioJSON) {
            const personaggio = JSON.parse(personaggioJSON);

            // Popola i campi di testo
            document.getElementById('nome').value = personaggio.nome || '';
            document.getElementById('cronaca').value = personaggio.cronaca || '';
            document.getElementById('concetto').value = personaggio.concetto || '';
            document.getElementById('virtu').value = personaggio.virtu || '';
            document.getElementById('vizio').value = personaggio.vizio || '';
            document.getElementById('taglia').value = personaggio.taglia || 5;
            document.getElementById('armatura').value = personaggio.armatura || 0;

            // Popola i pallini
            if (personaggio.tratti) {
                for (const tratto in personaggio.tratti) {
                    const container = document.querySelector(`.punti[data-tratto="${tratto}"]`);
                    if (container) {
                        aggiornaPallini(container, personaggio.tratti[tratto]);
                    }
                }
            }

            // Popola le specializzazioni
            if (personaggio.specializzazioni) {
                for (const tratto in personaggio.specializzazioni) {
                    const riga = document.querySelector(`.punti[data-tratto="${tratto}"]`).closest('.riga-tratto');
                    if (riga) {
                        const quadrato = riga.querySelector('.specializzazione');
                        quadrato.classList.toggle('filled', personaggio.specializzazioni[tratto]);
                    }
                }
            }

            // Ripristina lo stato di blocco delle sezioni
            if (personaggio.sezioniBloccate) {
                for (const sectionId in personaggio.sezioniBloccate) {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        const isLocked = personaggio.sezioniBloccate[sectionId];
                        section.classList.toggle('section-locked', isLocked);
                        // Aggiorna anche l'icona al caricamento
                        const icon = section.querySelector('.lock-icon');
                        icon.classList.toggle('fa-eye', !isLocked);
                        icon.classList.toggle('fa-eye-slash', isLocked);
                    }
                }
            }

            // Ricalcola i valori massimi di salute/volontà e integrità corrente
            calcolaTrattiDerivati();

            // Ripristina lo stato dei tracciati
            if (personaggio.tracciati) {
                // Funzione helper per caricare lo stato dei box
                function caricaStatoTracciato(idContenitore, stati) {
                    if (!stati) return;
                    const boxes = document.querySelectorAll(`#${idContenitore} .box`);
                    stati.forEach((stato, index) => {
                        if (boxes[index] && stato !== 'vuoto') {
                            let classeDaAggiungere = stato;
                            if (stato === 'speso') classeDaAggiungere = 'volonta-spesa';
                            else if (stato === 'speso-sanita') classeDaAggiungere = 'sanita-spesa';
                            // Pulisce classi precedenti prima di aggiungere la nuova per evitare conflitti
                            boxes[index].classList.remove('bashing', 'lethal', 'aggravated', 'volonta-spesa', 'sanita-spesa');
                            boxes[index].classList.add(classeDaAggiungere);
                        }
                    });
                }
                caricaStatoTracciato('scala-salute', personaggio.tracciati.salute);
                caricaStatoTracciato('scala-volonta', personaggio.tracciati.volonta);
                caricaStatoTracciato('scala-sanita', personaggio.tracciati.sanita);
            }

            alert('Personaggio caricato!'); // Spostato qui per essere eseguito solo se il caricamento ha successo
        } else {
            alert('Nessun personaggio salvato trovato.');
        } // Chiusura corretta dell'else
    });

    // Esegui le inizializzazioni all'avvio
    inizializzaTrattiSemplici();
    inizializzaScaleDoppie();
    inizializzaBloccoSezioni();
    // Calcola i valori iniziali
    calcolaTrattiDerivati();
});