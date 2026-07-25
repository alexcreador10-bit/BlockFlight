import { CONFIG } from "../config.js";

// ===== ESTADO: JUGANDO =====
// Orquesta la partida en curso: entrada, física, obstáculos, puntuación,
// partículas y detección de fin de juego. Los datos viven en Game (fuente
// única de verdad), este estado solo los hace avanzar.

export class PlayState {

    constructor(game){
        this.game = game;
    }

    enter(){
        this.game.reiniciarPartida();
    }

    update(dt, step){
        const g = this.game;

        if(g.input.pausaRecienPulsada()){
            g.states.cambiar("pause");
            return;
        }

        if(g.input.saltarRecienPulsado() || g.input.punteroRecienAbajo){
            g.player.saltar();
            g.particles.saltoDe(g.player);
            g.audio.playFlap();
        }

        g.player.update(step);

        const ganados = g.obstacles.update(dt, step, g.puntos, (obstaculo) => {
            g.particles.puntoEn(obstaculo.x + obstaculo.ancho, obstaculo.y);
            g.audio.playScore();
        });
        g.puntos += ganados;

        const velocidad = CONFIG.dificultad.velocidadBase
            + Math.floor(g.puntos / CONFIG.dificultad.puntosPorIncremento)
            * CONFIG.dificultad.incrementoVelocidad;
        g.background.update(step, Math.min(velocidad, CONFIG.dificultad.velocidadMaxima));

        g.particles.update(step);

        if(g.obstacles.colisionaCon(g.player.hitbox)){
            g.particles.muerteDe(g.player);
            g.audio.playHit();
            g.states.cambiar("gameover");
        }
    }

    render(ctx){
        this.game.renderScene(ctx);
    }
}
