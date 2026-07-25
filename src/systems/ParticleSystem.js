import { CONFIG } from "../config.js";

// ===== SISTEMA DE PARTÍCULAS =====
// Partículas cuadradas (coherentes con la estética de bloques) para el aleteo,
// la suma de puntos y la explosión de muerte. Tope de partículas y descarte
// por vida => sin fugas de memoria.

export class ParticleSystem {

    constructor(){
        this.particulas = [];
    }

    reiniciar(){
        this.particulas.length = 0;
    }

    _emitir(config){
        if(this.particulas.length >= CONFIG.particulas.maximo) return;
        this.particulas.push(config);
    }

    estallido(x, y, { cantidad, color, velocidad, tamano, vida, gravedad }){
        for(let i = 0; i < cantidad; i++){
            const angulo = Math.random() * Math.PI * 2;
            const fuerza = velocidad * (0.4 + Math.random() * 0.6);
            this._emitir({
                x, y,
                vx: Math.cos(angulo) * fuerza,
                vy: Math.sin(angulo) * fuerza,
                tamano: tamano * (0.6 + Math.random() * 0.6),
                color,
                vida,
                vidaMaxima: vida,
                gravedad: gravedad ? CONFIG.particulas.gravedad : 0
            });
        }
    }

    saltoDe(jugador){
        this.estallido(jugador.x + jugador.ancho / 2, jugador.y + jugador.alto, {
            cantidad: 6, color: "rgba(255,255,255,0.9)",
            velocidad: 2.5, tamano: 4, vida: 22, gravedad: false
        });
    }

    puntoEn(x, y){
        this.estallido(x, y, {
            cantidad: 10, color: "#FFD54A",
            velocidad: 3, tamano: 5, vida: 30, gravedad: true
        });
    }

    muerteDe(jugador){
        this.estallido(jugador.x + jugador.ancho / 2, jugador.y + jugador.alto / 2, {
            cantidad: 26, color: CONFIG.jugador.color,
            velocidad: 5, tamano: 7, vida: 45, gravedad: true
        });
    }

    update(step){
        for(let i = this.particulas.length - 1; i >= 0; i--){
            const p = this.particulas[i];
            p.vy += p.gravedad * step;
            p.x += p.vx * step;
            p.y += p.vy * step;
            p.vida -= step;
            if(p.vida <= 0){
                this.particulas.splice(i, 1);
            }
        }
    }

    render(ctx){
        for(const p of this.particulas){
            ctx.globalAlpha = Math.max(0, p.vida / p.vidaMaxima);
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.tamano / 2, p.y - p.tamano / 2, p.tamano, p.tamano);
        }
        ctx.globalAlpha = 1;
    }
}
