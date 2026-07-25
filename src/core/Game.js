import { CONFIG } from "../config.js";
import { InputManager } from "./InputManager.js";
import { StateMachine } from "./StateMachine.js";
import { Storage } from "./Storage.js";
import { Player } from "../entities/Player.js";
import { ObstacleManager } from "../entities/ObstacleManager.js";
import { Background } from "../systems/Background.js";
import { ParticleSystem } from "../systems/ParticleSystem.js";
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

    _loop(ahora){
        let dt = ahora - this.ultimoTiempo;
        this.ultimoTiempo = ahora;

        // Recorta saltos grandes (cambio de pestaña) para no romper la física.
        dt = Math.min(dt, CONFIG.dtMaximoMs);
        const step = dt / (1000 / CONFIG.fpsReferencia);

        this.states.update(dt, step);
        this.states.render(this.ctx);
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
