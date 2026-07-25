import { CONFIG } from "../config.js";
import { InputManager } from "./InputManager.js";
import { StateMachine } from "./StateMachine.js";
import { Storage } from "./Storage.js";
import { Player } from "../entities/Player.js";
import { ObstacleManager } from "../entities/ObstacleManager.js";
import { Background } from "../systems/Background.js";
import { ParticleSystem } from "../systems/ParticleSystem.js";
import { AudioManager } from "../systems/AudioManager.js";
import { MenuState } from "../states/MenuState.js";
import { PlayState } from "../states/PlayState.js";
import { PauseState } from "../states/PauseState.js";
import { GameOverState } from "../states/GameOverState.js";

// ===== JUEGO (raíz) =====
// Posee el canvas, el bucle principal, la entrada, la máquina de estados y los
// datos compartidos de la partida. Es la única fuente de verdad del estado
// del juego; los estados leen y modifican estos objetos.

export class Game {

    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this._configurarCanvas();

        this.input = new InputManager(canvas);
        this.audio = new AudioManager();

        // Área táctil/clic del icono de silencio (esquina superior derecha).
        this.iconoMute = { x: CONFIG.ancho - 40, y: 16, ancho: 28, alto: 24 };

        // Datos compartidos de la partida.
        this.background = new Background();
        this.particles = new ParticleSystem();
        this.player = new Player();
        this.obstacles = new ObstacleManager();
        this.puntos = 0;
        this.record = Storage.leerRecord();

        // Estados.
        this.states = new StateMachine();
        this.states.registrar("menu", new MenuState(this));
        this.states.registrar("play", new PlayState(this));
        this.states.registrar("pause", new PauseState(this));
        this.states.registrar("gameover", new GameOverState(this));

        this.ultimoTiempo = performance.now();
        this.states.cambiar("menu");

        window.addEventListener("resize", () => this._configurarCanvas());
    }

    // Buffer a resolución de diseño escalada por densidad de píxeles (nitidez
    // en pantallas retina/móvil). Todo el dibujo usa coordenadas de diseño.
    _configurarCanvas(){
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = CONFIG.ancho * dpr;
        this.canvas.height = CONFIG.alto * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    reiniciarPartida(){
        this.player.reiniciar();
        this.obstacles.reiniciar();
        this.particles.reiniciar();
        this.puntos = 0;
    }

    registrarRecord(){
        if(this.puntos > this.record){
            this.record = this.puntos;
            Storage.guardarRecord(this.record);
            return true; // nuevo récord
        }
        return false;
    }

    // Dibuja la escena de juego (fondo, obstáculos, jugador, partículas y HUD).
    // Reutilizado por PlayState y, congelado, por Pause y GameOver.
    renderScene(ctx){
        this.background.render(ctx);
        this.obstacles.render(ctx);
        this.player.render(ctx);
        this.particles.render(ctx);
        this._renderHUD(ctx);
    }

    _renderHUD(ctx){
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `700 44px ${CONFIG.ui.fuente}`;

        ctx.fillStyle = CONFIG.colores.hudSombra;
        ctx.fillText(String(this.puntos), CONFIG.ancho / 2 + 2, 62);
        ctx.fillStyle = CONFIG.colores.hud;
        ctx.fillText(String(this.puntos), CONFIG.ancho / 2, 60);
    }

    _gestionarAudio(){
        // El audio solo puede iniciarse tras un gesto del usuario.
        if(this.input.hayInteraccion()) this.audio.unlock();

        // Silencio con la tecla M.
        if(this.input.silencioRecienPulsado()) this.audio.toggleMute();

        // Silencio al tocar el icono: se consume el toque para no saltar.
        if(this.input.punteroRecienAbajo){
            const p = this.input.puntero;
            const b = this.iconoMute;
            if(p.x >= b.x - 6 && p.x <= b.x + b.ancho + 6 &&
               p.y >= b.y - 6 && p.y <= b.y + b.alto + 6){
                this.audio.toggleMute();
                this.input.consumirPuntero();
            }
        }
    }

    _renderIconoMute(ctx){
        const { x, y, alto } = this.iconoMute;
        const medio = y + alto / 2;

        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";

        // Cuerpo del altavoz.
        ctx.beginPath();
        ctx.moveTo(x, medio - 5);
        ctx.lineTo(x + 6, medio - 5);
        ctx.lineTo(x + 13, medio - 11);
        ctx.lineTo(x + 13, medio + 11);
        ctx.lineTo(x + 6, medio + 5);
        ctx.lineTo(x, medio + 5);
        ctx.closePath();
        ctx.fill();

        if(this.audio.silenciado){
            // Aspa cuando está silenciado.
            ctx.beginPath();
            ctx.moveTo(x + 18, medio - 6);
            ctx.lineTo(x + 27, medio + 6);
            ctx.moveTo(x + 27, medio - 6);
            ctx.lineTo(x + 18, medio + 6);
            ctx.stroke();
        } else {
            // Ondas de sonido.
            ctx.beginPath();
            ctx.arc(x + 15, medio, 5, -0.6, 0.6);
            ctx.moveTo(x + 15, medio - 9);
            ctx.arc(x + 15, medio, 9, -0.6, 0.6);
            ctx.stroke();
        }
        ctx.restore();
    }

    _loop(ahora){
        let dt = ahora - this.ultimoTiempo;
        this.ultimoTiempo = ahora;

        // Recorta saltos grandes (cambio de pestaña) para no romper la física.
        dt = Math.min(dt, CONFIG.dtMaximoMs);
        const step = dt / (1000 / CONFIG.fpsReferencia);

        this._gestionarAudio();

        this.states.update(dt, step);
        this.states.render(this.ctx);
        this._renderIconoMute(this.ctx);
        this.input.limpiarFrame();

        requestAnimationFrame((t) => this._loop(t));
    }

    iniciar(){
        requestAnimationFrame((t) => {
            this.ultimoTiempo = t;
            this._loop(t);
        });
    }
}
