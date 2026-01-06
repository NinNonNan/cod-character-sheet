/*************************************************
 * FIREBASE
 *************************************************/
// Configurazione e inizializzazione gestite in js/firebase-config.js
// La variabile 'db' è globale.
const COLLECTION = "characters";

/*************************************************
 * GLOBALI
 *************************************************/
const MAX_DOTS_DEFAULT = 5;
let personaggioIdCorrente = null;
let statoSalvato = "";
let imageUrlCorrente = null;

/*************************************************
 * AVVIO APP
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {
    console.log(window.LANG?.msg_dom_loaded || "DOM caricato...");
    localizzaPagina(); // Applica le traduzioni
    inizializzaTrattiSemplici();
    inizializzaScaleDoppie();
    inizializzaAggiuntaPregi();
    inizializzaRimozionePregi();
    inizializzaBloccoSezioni();
    inizializzaCaricamentoImmagine();
    calcolaTrattiDerivati();

    // Listener per i quadrati di specializzazione nelle abilità
    document.querySelectorAll('.specializzazione').forEach(sq => {
        sq.addEventListener('click', () => {
            sq.classList.toggle('filled');
            aggiornaElencoSpecializzazioni();
        });
    });
    
    // Listener per ricalcolo esperienza
    const expInputs = document.querySelectorAll('#esperienza-totale, #esperienza-spesa');
    expInputs.forEach(input => input.addEventListener('input', calcolaEsperienza));

    // Listener per aggiornamento Salute quando cambia la Taglia
    const tagliaInput = document.getElementById('taglia');
    if (tagliaInput) tagliaInput.addEventListener('input', calcolaTrattiDerivati);

    if (document.getElementById("lista-personaggi")) {
        caricaListaPersonaggi();
    }

    if (window.location.pathname.includes("character")) {
        caricaPersonaggioDaURL().then(finalizzaStatoIniziale);
    }

    const salvaBtn = document.getElementById("salva-btn");
    if (salvaBtn) salvaBtn.addEventListener("click", salvaPersonaggioSuServer);
});

/*************************************************
 * LOCALIZZAZIONE
 *************************************************/
function localizzaPagina() {
    if (!window.LANG) return;
    
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (window.LANG[key]) {
            // Se è un input button o submit, cambia value, altrimenti textContent
            // Gestiamo qui solo textContent per semplicità sugli elementi di testo
            el.textContent = window.LANG[key];
        }
    });
}

/*************************************************
 * INIZIALIZZAZIONI UI
 *************************************************/
function inizializzaTrattiSemplici() {
    document.querySelectorAll(".punti").forEach(container => {
        const max = parseInt(container.dataset.max) || MAX_DOTS_DEFAULT;
        container.innerHTML = "";
        for (let i = 1; i <= max; i++) {
            const dot = document.createElement("span");
            dot.className = "dot";
            dot.dataset.value = i;
            // Aggiunge l'icona Font Awesome
            const icon = document.createElement("i");
            icon.className = "far fa-circle";
            dot.appendChild(icon);
            container.appendChild(dot);
        }
        container.addEventListener("click", gestisciClickPallino);
    });
}

function inizializzaScaleDoppie() {
    document.querySelectorAll(".contenitore-doppia-scala").forEach(container => {
        const max = parseInt(container.dataset.max) || 10;
        container.innerHTML = "";
        for (let i = 1; i <= max; i++) {
            const col = document.createElement("div");
            col.className = "colonna-doppia";

            const dot = document.createElement("span");
            dot.className = "dot";
            dot.dataset.value = i;
            // Aggiunge l'icona Font Awesome anche qui
            const icon = document.createElement("i");
            icon.className = "far fa-circle";
            dot.appendChild(icon);

            const box = document.createElement("div");
            box.className = "box";

            col.append(dot, box);
            container.appendChild(col);
        }
        container.addEventListener("click", gestisciClickTracciato);
    });
}

function inizializzaBloccoSezioni() {
    document.querySelectorAll(".lock-icon").forEach(icon => {
        icon.addEventListener("click", () => {
            const section = icon.closest("section");
            const locked = section.classList.toggle("section-locked");
            icon.classList.toggle("fa-eye", !locked);
            icon.classList.toggle("fa-eye-slash", locked);
        });
    });
}

function inizializzaAggiuntaPregi() {
    document.querySelectorAll(".aggiungi-pregio-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const cont = document.getElementById(btn.dataset.colonna);
            if (cont) creaRigaPregio(cont);
        });
    });
}

function inizializzaRimozionePregi() {
    document.querySelectorAll(".rimuovi-pregio-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const cont = document.getElementById(btn.dataset.colonna);
            const righe = cont?.querySelectorAll(".riga-tratto");
            if (righe?.length) righe[righe.length - 1].remove();
        });
    });
}

function creaRigaPregio(contenitore, nome = '', valore = 0) {
    const riga = document.createElement('div');
    riga.className = 'riga-tratto';

    // Placeholder per allineamento
    const placeholder = document.createElement('span');
    placeholder.className = 'specializzazione';
    placeholder.style.visibility = 'hidden';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = window.LANG?.placeholder_merit || 'Nome Pregio';
    input.className = 'nome-pregio';
    input.value = nome;

    const punti = document.createElement('div');
    punti.className = 'punti';
    punti.dataset.tratto = `pregio-${Date.now()}-${Math.random()}`;
    punti.dataset.max = 5;

    riga.append(placeholder, input, punti);
    contenitore.appendChild(riga);

    // Inizializza i pallini per questa nuova riga
    inizializzaTrattiSempliciPerElemento(punti, valore);
}

/*************************************************
 * IMMAGINE
 *************************************************/
function inizializzaCaricamentoImmagine() {
    const input = document.getElementById("image-upload");
    const preview = document.getElementById("character-image-preview");
    const container = document.getElementById("character-image-container");

    if (!input || !preview || !container) return;

    container.addEventListener("click", () => input.click());

    input.addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file?.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = ev => {
            imageUrlCorrente = ev.target.result;
            preview.src = imageUrlCorrente;
            container.classList.add("has-image");
        };
        reader.readAsDataURL(file);
    });
}

/*************************************************
 * CLICK E LOGICA
 *************************************************/
function inizializzaTrattiSempliciPerElemento(container, valoreIniziale = 0) {
    const max = parseInt(container.dataset.max) || 5;
    container.innerHTML = "";
    for (let i = 1; i <= max; i++) {
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.dataset.value = i;
        const icon = document.createElement("i");
        icon.className = "far fa-circle";
        dot.appendChild(icon);
        container.appendChild(dot);
    }
    container.addEventListener("click", gestisciClickPallino);
    if (valoreIniziale > 0) aggiornaPallini(container, valoreIniziale);
}

function gestisciClickPallino(e) {
    // Usa closest per intercettare il click anche sull'icona <i> interna
    const dot = e.target.closest(".dot");
    if (!dot) return;

    const container = dot.parentElement;
    const value = parseInt(dot.dataset.value);
    const current = container.querySelectorAll(".dot.filled").length;
    
    // Se clicco sull'ultimo pallino attivo, lo spengo (valore - 1), altrimenti imposto il nuovo valore
    aggiornaPallini(container, value === current ? value - 1 : value);
    calcolaTrattiDerivati();
}

function aggiornaPallini(container, value) {
    container.querySelectorAll(".dot").forEach(dot => {
        const isFilled = parseInt(dot.dataset.value) <= value;
        dot.classList.toggle("filled", isFilled);
        const icon = dot.querySelector("i");
        if (icon) {
            icon.className = isFilled ? "fas fa-circle" : "far fa-circle";
        }
    });
}

function gestisciClickTracciato(e) {
    if (!e.target.classList.contains("box")) return;
    
    const container = e.target.closest('.contenitore-doppia-scala');
    const tratto = container.dataset.tratto;
    const box = e.target;

    if (tratto === 'salute') {
        // Rotazione stati: Vuoto -> Bashing (/) -> Lethal (X) -> Aggravated (*) -> Vuoto
        if (box.classList.contains('bashing')) {
            box.classList.remove('bashing'); box.classList.add('lethal');
        } else if (box.classList.contains('lethal')) {
            box.classList.remove('lethal'); box.classList.add('aggravated');
        } else if (box.classList.contains('aggravated')) {
            box.classList.remove('aggravated');
        } else {
            box.classList.add('bashing');
        }
    } else if (tratto === 'sanita') {
        box.classList.toggle('sanita-spesa');
    } else {
        box.classList.toggle('volonta-spesa');
    }
}

/*************************************************
 * DERIVATI
 *************************************************/
function getValoreTratto(tratto) {
    return document.querySelectorAll(`.punti[data-tratto="${tratto}"] .dot.filled`).length;
}

function calcolaTrattiDerivati() {
    const iniziativa = getValoreTratto("destrezza") + getValoreTratto("autocontrollo");
    const difesa = Math.min(getValoreTratto("prontezza"), getValoreTratto("destrezza"));
    const velocita = getValoreTratto("forza") + getValoreTratto("destrezza") + 5;

    if (document.getElementById("valore-iniziativa"))
        document.getElementById("valore-iniziativa").textContent = iniziativa;
    if (document.getElementById("valore-difesa"))
        document.getElementById("valore-difesa").textContent = difesa;
    if (document.getElementById("valore-velocita"))
        document.getElementById("valore-velocita").textContent = velocita;
        
    // Aggiorna limiti visivi su Salute e Volontà
    aggiornaLimiteTracciato('scala-salute', getValoreTratto("costituzione") + (parseInt(document.getElementById('taglia')?.value)||5));
    aggiornaLimiteTracciato('scala-volonta', getValoreTratto("fermezza") + getValoreTratto("autocontrollo"));
    aggiornaLimiteTracciato('scala-sanita', getValoreTratto("fermezza") + getValoreTratto("autocontrollo") + 5); // Esempio logica sanità
}

function aggiornaLimiteTracciato(id, max) {
    const container = document.getElementById(id);
    if(!container) return;
    container.querySelectorAll('.dot').forEach(dot => {
        const isFilled = parseInt(dot.dataset.value) <= max;
        dot.classList.toggle('filled', isFilled);
        const icon = dot.querySelector("i");
        if (icon) {
            icon.className = isFilled ? "fas fa-circle" : "far fa-circle";
        }
    });
}

function calcolaEsperienza() {
    const tot = parseInt(document.getElementById('esperienza-totale')?.value) || 0;
    const spesa = parseInt(document.getElementById('esperienza-spesa')?.value) || 0;
    const rim = document.getElementById('esperienza-rimanente');
    if(rim) rim.textContent = tot - spesa;
}

function aggiornaElencoSpecializzazioni() {
    const container = document.getElementById('contenitore-specializzazioni');
    if (!container) return;
    container.innerHTML = '';
    
    document.querySelectorAll('#abilita .specializzazione.filled').forEach(sq => {
        const riga = sq.closest('.riga-tratto');
        const label = riga.querySelector('label').textContent;
        const tratto = riga.querySelector('.punti').dataset.tratto;
        
        const div = document.createElement('div');
        div.className = 'riga-specializzazione';
        const placeholder = window.LANG?.placeholder_spec || "Dettagli...";
        div.innerHTML = `<label>${label}:</label><input type="text" data-tratto-spec="${tratto}" placeholder="${placeholder}">`;
        container.appendChild(div);
    });
    
    const section = document.getElementById('specializzazioni-attive');
    if(section) section.style.display = container.children.length ? 'block' : 'none';
}

/*************************************************
 * DATI
 *************************************************/
function raccogliDatiScheda() {
    const p = {
        nome: document.getElementById("nome")?.value || "",
        imageUrl: imageUrlCorrente,
        tratti: {},
        info: {},
        pregi: {},
        specializzazioni: {}, // Booleani (checkbox)
        testoSpecializzazioni: {}, // Testo dettagli
        tracciati: {}
    };

    // Info di base
    ['cronaca', 'concetto', 'giocatore', 'eta', 'fazione', 'virtu', 'vizio', 'taglia', 'armatura', 'esperienza-totale', 'esperienza-spesa'].forEach(id => {
        const el = document.getElementById(id);
        if(el) p.info[id] = el.value;
    });

    // Tratti (pallini)
    document.querySelectorAll(".punti").forEach(c => {
        // Ignora i pregi generati dinamicamente qui, li gestiamo a parte
        if(!c.dataset.tratto.startsWith('pregio-')) {
            p.tratti[c.dataset.tratto] = c.querySelectorAll(".dot.filled").length;
        }
    });

    // Pregi
    document.querySelectorAll('.contenitore-pregi').forEach(cont => {
        p.pregi[cont.id] = [];
        cont.querySelectorAll('.riga-tratto').forEach(r => {
            const nome = r.querySelector('input').value;
            const val = r.querySelectorAll('.dot.filled').length;
            if(nome) p.pregi[cont.id].push({ nome, valore: val });
        });
    });

    // Specializzazioni
    document.querySelectorAll('#abilita .specializzazione.filled').forEach(sq => {
        const tratto = sq.closest('.riga-tratto').querySelector('.punti').dataset.tratto;
        p.specializzazioni[tratto] = true;
    });
    document.querySelectorAll('#contenitore-specializzazioni input').forEach(inp => {
        p.testoSpecializzazioni[inp.dataset.trattoSpec] = inp.value;
    });

    // Tracciati (Salute, Volontà, ecc.)
    document.querySelectorAll('.contenitore-doppia-scala').forEach(c => {
        p.tracciati[c.dataset.tratto] = Array.from(c.querySelectorAll('.box')).map(b => b.className.replace('box', '').trim());
    });

    return p;
}

function popolaSchedaConDati(p) {
    document.getElementById("nome").value = p.nome || "";
    if (p.imageUrl) {
        imageUrlCorrente = p.imageUrl;
        const preview = document.getElementById("character-image-preview");
        if (preview) preview.src = p.imageUrl;
        const container = document.getElementById("character-image-container");
        if (container) container.classList.add("has-image");
    }

    for (const t in p.tratti) {
        const c = document.querySelector(`.punti[data-tratto="${t}"]`);
        if (c) aggiornaPallini(c, p.tratti[t]);
    }

    if (p.info) {
        for (const id in p.info) {
            const el = document.getElementById(id);
            if(el) el.value = p.info[id];
        }
    }

    // Pulisci e ricrea pregi
    document.querySelectorAll('.contenitore-pregi').forEach(c => c.innerHTML = '');
    if (p.pregi) {
        for (const col in p.pregi) {
            const cont = document.getElementById(col);
            if(cont) {
                p.pregi[col].forEach(item => creaRigaPregio(cont, item.nome, item.valore));
            }
        }
    }

    // Specializzazioni
    document.querySelectorAll('.specializzazione').forEach(s => s.classList.remove('filled'));
    if (p.specializzazioni) {
        for (const t in p.specializzazioni) {
            const c = document.querySelector(`.punti[data-tratto="${t}"]`);
            if(c) c.closest('.riga-tratto').querySelector('.specializzazione').classList.add('filled');
        }
    }
    aggiornaElencoSpecializzazioni();
    if (p.testoSpecializzazioni) {
        for (const t in p.testoSpecializzazioni) {
            const inp = document.querySelector(`input[data-tratto-spec="${t}"]`);
            if(inp) inp.value = p.testoSpecializzazioni[t];
        }
    }

    // Tracciati
    if (p.tracciati) {
        for (const t in p.tracciati) {
            const c = document.querySelector(`.contenitore-doppia-scala[data-tratto="${t}"]`);
            if(c) {
                const boxes = c.querySelectorAll('.box');
                p.tracciati[t].forEach((cls, idx) => {
                    if(boxes[idx] && cls) boxes[idx].className = `box ${cls}`;
                });
            }
        }
    }
    
    calcolaTrattiDerivati();
    calcolaEsperienza();
}

/*************************************************
 * FIRESTORE
 *************************************************/
async function salvaPersonaggioSuServer() {
    if (!db) {
        alert(window.LANG?.msg_db_unavailable || "Database non disponibile.");
        return;
    }
    const dati = raccogliDatiScheda();

    if (personaggioIdCorrente) {
        await db.collection(COLLECTION).doc(personaggioIdCorrente).set(dati);
    } else {
        const ref = await db.collection(COLLECTION).add(dati);
        personaggioIdCorrente = ref.id;
        history.replaceState(null, "", `?id=${ref.id}`);
    }

    statoSalvato = JSON.stringify(dati);
    document.getElementById("salva-btn").disabled = true;
    alert(window.LANG?.msg_saved || "Salvato!");
}

async function caricaPersonaggioDaURL() {
    if (!db) return;
    const id = new URLSearchParams(location.search).get("id");
    if (!id) return;
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (doc.exists) {
        personaggioIdCorrente = id;
        popolaSchedaConDati(doc.data());
    }
}

async function caricaListaPersonaggi() {
    if (!db) return;
    const lista = document.getElementById("lista-personaggi");
    if(!lista) return;
    lista.innerHTML = `<li>${window.LANG?.msg_loading_list || "Caricamento..."}</li>`;
    
    try {
        const snap = await db.collection(COLLECTION).get();
        lista.innerHTML = "";
        if(snap.empty) lista.innerHTML = `<li>${window.LANG?.msg_no_chars || "Nessun personaggio trovato."}</li>`;
        snap.forEach(doc => {
            const d = doc.data();
            lista.innerHTML += `<li><a href="character.html?id=${doc.id}">${d.nome || (window.LANG?.default_char_name || "Senza Nome")}</a></li>`;
        });
    } catch(e) {
        console.error(e);
        lista.innerHTML = `<li>${window.LANG?.msg_load_error || "Errore caricamento."}</li>`;
    }
}

/*************************************************
 * MODIFICHE
 *************************************************/
function finalizzaStatoIniziale() {
    statoSalvato = JSON.stringify(raccogliDatiScheda());
    document.body.addEventListener("input", controllaModifiche);
}

function controllaModifiche() {
    document.getElementById("salva-btn").disabled =
        JSON.stringify(raccogliDatiScheda()) === statoSalvato;
}
