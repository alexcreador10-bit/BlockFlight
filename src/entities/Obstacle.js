import { CONFIG } from "../config.js";

// ===== OBSTÁCULO =====
// Columna que emerge del suelo y avanza hacia la izquierda. Modelo de datos
// ligero; el movimiento y el ciclo de vida los gestiona ObstacleManager.

export class Obstacle {

    constructor(velocidad){
        const altura = Math.random() * CONFIG.obstaculo.alturaVariable
            + CONFIG.obstaculo.alturaMinima;

        this.x = CONFIG.ancho;
        this.y = CONFIG.suelo.y - altura;
        this.ancho = CONFIG.obstaculo.ancho;
        this.alto = altura;
        this.velocidadX = -velocidad;
        this.contado = false;
    }

    update(step){
        this.x += this.velocidadX * step;
    }

    get fueraDePantalla(){
        return this.x + this.ancho < 0;
    }

    // Se dibuja como una columna de bloques apilados (estética Minecraft):
    // cuadrícula de celdas con biselado claro/oscuro por celda.
    render(ctx){
        const cel = 20; // tamaño de cada bloque

        // Cuerpo.
        ctx.fillStyle = CONFIG.obstaculo.color;
        ctx.fillRect(this.x, this.y, this.ancho, this.alto);

        // Biselado por celda: luz arriba-izquierda, sombra abajo-derecha.
        for(let fy = this.y; fy < this.y + this.alto; fy += cel){
            for(let fx = this.x; fx < this.x + this.ancho; fx += cel){
                const w = Math.min(cel, this.x + this.ancho - fx);
                const h = Math.min(cel, this.y + this.alto - fy);

                ctx.fillStyle = "rgba(255,255,255,0.10)";
                ctx.fillRect(fx, fy, w, 2);           // luz superior
                ctx.fillRect(fx, fy, 2, h);           // luz izquierda

                ctx.fillStyle = "rgba(0,0,0,0.18)";
                ctx.fillRect(fx, fy + h - 2, w, 2);   // sombra inferior
                ctx.fillRect(fx + w - 2, fy, 2, h);   // sombra derecha
            }
        }

        // Cima más clara (remate del bloque superior).
        ctx.fillStyle = CONFIG.obstaculo.colorCima;
        ctx.fillRect(this.x, this.y, this.ancho, 6);
    }
}
