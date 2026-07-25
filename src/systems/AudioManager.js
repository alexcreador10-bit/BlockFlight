// ===== GESTOR DE AUDIO =====
// Música generada por procedimiento (Web Audio API) y efectos de sonido, sin
// archivos externos. El estilo es ambiental y calmado —inspirado en la música
// de mundos de bloques— usando una escala pentatónica y un tono suave.
// Todo el material sonoro es original y sintetizado en tiempo real.

const NOTAS_MELODIA = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81]; // Do mayor pentatónica (2 octavas)
const NOTAS_BAJO = [36, 41, 43, 45];                            // notas graves de acompañamiento

const CLAVE_SILENCIO = "blockflight.muted";

// Convierte una nota MIDI a frecuencia en Hz.
function frecuencia(midi){
    return 440 * Math.pow(2, (midi - 69) / 12);
}

export class AudioManager {

    constructor(){
        this.ctx = null;
        this.desbloqueado = false;
        this.timer = null;
        this.paso = 0;
        this.duracionPaso = 0.42; // segundos por paso rítmico (calmado)

        this.silenciado = this._leerSilencio();
    }

    _leerSilencio(){
        try { return localStorage.getItem(CLAVE_SILENCIO) === "1"; }
        catch { return false; }
    }

    _guardarSilencio(){
        try { localStorage.setItem(CLAVE_SILENCIO, this.silenciado ? "1" : "0"); }
        catch { /* opcional */ }
    }

    // Debe llamarse tras el primer gesto del usuario (los navegadores bloquean
    // el audio automático). Crea el contexto y arranca la música generativa.
    unlock(){
        if(this.desbloqueado) return;
        const AC = window.AudioContext || window.webkitAudioContext;
        if(!AC) return;

        this.ctx = new AC();
        if(this.ctx.state === "suspended") this.ctx.resume();

        // Cadena de mezcla: música y sfx pasan por un volumen maestro.
        this.master = this.ctx.createGain();
        this.master.gain.value = this.silenciado ? 0 : 1;
        this.master.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.16;
        const filtro = this.ctx.createBiquadFilter();
        filtro.type = "lowpass";
        filtro.frequency.value = 2200; // suaviza el tono, más cálido
        this.musicGain.connect(filtro).connect(this.master);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.35;
        this.sfxGain.connect(this.master);

        this.desbloqueado = true;
        this.paso = 0;
        this.siguienteTiempo = this.ctx.currentTime + 0.1;
        this._planificar();
    }

    toggleMute(){
        this.silenciado = !this.silenciado;
        this._guardarSilencio();
        if(this.master){
            // Rampa breve para evitar chasquidos al cambiar de volumen.
            const t = this.ctx.currentTime;
            this.master.gain.cancelScheduledValues(t);
            this.master.gain.setValueAtTime(this.master.gain.value, t);
            this.master.gain.linearRampToValueAtTime(this.silenciado ? 0 : 1, t + 0.08);
        }
    }

    // --- Música generativa: planificador con anticipación (lookahead) ---
    _planificar(){
        if(!this.ctx) return;
        while(this.siguienteTiempo < this.ctx.currentTime + 0.15){
            this._programarPaso(this.paso, this.siguienteTiempo);
            this.siguienteTiempo += this.duracionPaso;
            this.paso++;
        }
        this.timer = setTimeout(() => this._planificar(), 30);
    }

    _programarPaso(paso, t){
        // Melodía: nota suave y espaciada (deja silencios, como la música ambiental).
        if(Math.random() < 0.68){
            const midi = NOTAS_MELODIA[Math.floor(Math.random() * NOTAS_MELODIA.length)];
            this._nota(frecuencia(midi), t, 1.4, 0.9, "triangle", 0.01, 1.3);
        }
        // Bajo: cada 8 pasos, una nota grave larga que sostiene la armonía.
        if(paso % 8 === 0){
            const midi = NOTAS_BAJO[Math.floor(Math.random() * NOTAS_BAJO.length)];
            this._nota(frecuencia(midi), t, 3.2, 0.7, "sine", 0.05, 3.0);
        }
        // Destello agudo ocasional para dar brillo.
        if(Math.random() < 0.10){
            const midi = NOTAS_MELODIA[NOTAS_MELODIA.length - 1] + 12;
            this._nota(frecuencia(midi), t, 0.9, 0.4, "sine", 0.01, 0.8);
        }
    }

    // Sintetiza una nota con envolvente suave (ataque corto, caída exponencial).
    _nota(freq, inicio, duracion, nivel, tipo, ataque, caida, destino = this.musicGain){
        const osc = this.ctx.createOscillator();
        osc.type = tipo;
        osc.frequency.value = freq;

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.0001, inicio);
        g.gain.linearRampToValueAtTime(nivel, inicio + ataque);
        g.gain.exponentialRampToValueAtTime(0.0001, inicio + caida);

        osc.connect(g).connect(destino);
        osc.start(inicio);
        osc.stop(inicio + duracion + 0.05);
    }

    // --- Efectos de sonido ---
    playFlap(){
        if(!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(760, t + 0.09);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.5, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.14);
    }

    playScore(){
        if(!this.ctx) return;
        const t = this.ctx.currentTime;
        // Dos notas ascendentes agradables.
        this._nota(frecuencia(72), t, 0.2, 0.6, "square", 0.005, 0.18, this.sfxGain);
        this._nota(frecuencia(76), t + 0.09, 0.22, 0.6, "square", 0.005, 0.2, this.sfxGain);
    }

    playHit(){
        if(!this.ctx) return;
        const t = this.ctx.currentTime;
        // Golpe grave y seco.
        const osc = this.ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(55, t + 0.35);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.7, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        osc.connect(g).connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.42);
    }

    playClick(){
        if(!this.ctx) return;
        const t = this.ctx.currentTime;
        this._nota(320, t, 0.07, 0.4, "square", 0.004, 0.06, this.sfxGain);
    }
}
