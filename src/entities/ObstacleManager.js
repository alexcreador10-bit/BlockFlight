import { CONFIG } from "../config.js";
import { Obstacle } from "./Obstacle.js";
import { haySolapamiento } from "../utils/draw.js";

// ===== GESTOR DE OBSTÁCULOS =====
// Responsable de generar, mover, dibujar y RECICLAR obstáculos, además de
// puntuar y detectar colisiones. La generación usa un acumulador de tiempo
// (no setInterval) para que respete la pausa y el delta-time.

export class ObstacleManager {

    constructor(){
        this.reiniciar();
    }

    reiniciar(){
        this.obstaculos = [];
        this.acumuladorSpawnMs = 0;
    }

    // Dificultad progresiva derivada de la puntuación.
    _nivel(puntos){
        const d = CONFIG.dificultad;
        return Math.floor(puntos / d.puntosPorIncremento);
    }

    _velocidad(puntos){
        const d = CONFIG.dificultad;
        return Math.min(
            d.velocidadBase + this._nivel(puntos) * d.incrementoVelocidad,
            d.velocidadMaxima
        );
    }

    _intervaloSpawn(puntos){
        const d = CONFIG.dificultad;
        return Math.max(
            d.intervaloBaseMs - this._nivel(puntos) * d.reduccionIntervaloMs,
            d.intervaloMinimoMs
        );
    }

    // Devuelve los puntos ganados en este frame (0 o los que se sumen).
    update(dt, step, puntos, alEmitirPunto){
        const velocidad = this._velocidad(puntos);

        // Generación temporizada.
        this.acumuladorSpawnMs += dt;
        if(this.acumuladorSpawnMs >= this._intervaloSpawn(puntos)){
            this.acumuladorSpawnMs = 0;
            this.obstaculos.push(new Obstacle(velocidad));
        }

        let ganados = 0;

        // Recorrido inverso: permite eliminar in situ sin romper el índice.
        for(let i = this.obstaculos.length - 1; i >= 0; i--){
            const obstaculo = this.obstaculos[i];
            obstaculo.update(step);

            if(!obstaculo.contado && obstaculo.x + obstaculo.ancho < CONFIG.jugador.xInicial){
                obstaculo.contado = true;
                ganados++;
                if(alEmitirPunto) alEmitirPunto(obstaculo);
            }

            // Limpieza automática de memoria: fuera de pantalla => se descarta.
            if(obstaculo.fueraDePantalla){
                this.obstaculos.splice(i, 1);
            }
        }

        return ganados;
    }

    colisionaCon(hitbox){
        return this.obstaculos.some((o) => haySolapamiento(hitbox, o));
    }

    render(ctx){
        for(const obstaculo of this.obstaculos){
            obstaculo.render(ctx);
        }
    }
}
