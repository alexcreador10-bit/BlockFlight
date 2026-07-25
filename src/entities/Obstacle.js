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

    render(ctx){
        // Cuerpo.
        ctx.fillStyle = CONFIG.obstaculo.color;
        ctx.fillRect(this.x, this.y, this.ancho, this.alto);

        // Cima más clara: sugiere volumen manteniendo el marrón de bloque.
        ctx.fillStyle = CONFIG.obstaculo.colorCima;
        ctx.fillRect(this.x, this.y, this.ancho, 10);

        // Borde derecho en sombra para dar profundidad.
        ctx.fillStyle = CONFIG.obstaculo.colorBorde;
        ctx.fillRect(this.x + this.ancho - 6, this.y, 6, this.alto);
    }
}
