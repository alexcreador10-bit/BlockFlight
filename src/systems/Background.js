import { CONFIG } from "../config.js";

// ===== FONDO =====
// Cielo con gradiente, nubes de bloques con parallax y suelo con textura que
// se desplaza para reforzar la sensación de movimiento. Es puramente estético
// y conserva la paleta original (azul cielo, hierba, tierra).

export class Background {

    constructor(){
        this.desplazamientoSuelo = 0;
        this.nubes = this._crearNubes();
    }

    _crearNubes(){
        const nubes = [];
        for(let i = 0; i < 4; i++){
            nubes.push({
                x: Math.random() * CONFIG.ancho,
                y: 40 + Math.random() * 160,
                escala: 0.6 + Math.random() * 0.8,
                velocidad: 0.2 + Math.random() * 0.3
            });
        }
        return nubes;
    }

    // velocidadJuego permite acoplar el scroll del suelo a la dificultad actual.
    update(step, velocidadJuego = 3){
        this.desplazamientoSuelo = (this.desplazamientoSuelo + velocidadJuego * step) % 40;

        for(const nube of this.nubes){
            nube.x -= nube.velocidad * step;
            if(nube.x < -80){
                nube.x = CONFIG.ancho + 40;
                nube.y = 40 + Math.random() * 160;
                nube.escala = 0.6 + Math.random() * 0.8;
            }
        }
    }

    render(ctx){
        this._dibujarCielo(ctx);
        this._dibujarNubes(ctx);
        this._dibujarSuelo(ctx);
    }

    _dibujarCielo(ctx){
        const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.suelo.y);
        grad.addColorStop(0, CONFIG.colores.cieloArriba);
        grad.addColorStop(1, CONFIG.colores.cieloAbajo);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CONFIG.ancho, CONFIG.alto);
    }

    _dibujarNubes(ctx){
        ctx.fillStyle = CONFIG.colores.nube;
        for(const nube of this.nubes){
            const s = nube.escala;
            // Nube "de bloques": tres cuadrados solapados.
            ctx.fillRect(nube.x, nube.y, 34 * s, 20 * s);
            ctx.fillRect(nube.x + 18 * s, nube.y - 12 * s, 28 * s, 24 * s);
            ctx.fillRect(nube.x + 40 * s, nube.y, 30 * s, 20 * s);
        }
    }

    _dibujarSuelo(ctx){
        const { y, altoHierba, yTierra, altoTierra } = CONFIG.suelo;

        // Hierba.
        ctx.fillStyle = CONFIG.colores.hierba;
        ctx.fillRect(0, y, CONFIG.ancho, altoHierba);

        // Franjas de hierba que se desplazan (feedback de velocidad).
        ctx.fillStyle = CONFIG.colores.hierbaOscura;
        for(let x = -40; x < CONFIG.ancho + 40; x += 40){
            ctx.fillRect(x - this.desplazamientoSuelo, y, 20, 6);
        }

        // Tierra.
        ctx.fillStyle = CONFIG.colores.tierra;
        ctx.fillRect(0, yTierra, CONFIG.ancho, altoTierra);
    }
}
