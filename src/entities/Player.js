import { CONFIG } from "../config.js";
import { lerp, clamp, rectRedondeado } from "../utils/draw.js";

// ===== JUGADOR =====
// Bloque con física de aleteo. La inclinación (tilt) se interpola según la
// velocidad vertical para dar sensación de peso sin cambiar la mecánica.

export class Player {

    constructor(){
        this.reiniciar();
    }

    reiniciar(){
        this.x = CONFIG.jugador.xInicial;
        this.y = CONFIG.jugador.yInicial;
        this.ancho = CONFIG.jugador.ancho;
        this.alto = CONFIG.jugador.alto;
        this.velocidadY = 0;
        this.tilt = 0;
    }

    saltar(){
        this.velocidadY = CONFIG.fisica.impulsoSalto;
    }

    update(step){
        this.velocidadY = clamp(
            this.velocidadY + CONFIG.fisica.gravedad * step,
            -Infinity,
            CONFIG.fisica.velocidadYmaxima
        );
        this.y += this.velocidadY * step;

        // Suelo: descansa sobre el piso (comportamiento original, no letal).
        const yMaxima = CONFIG.suelo.y - this.alto;
        if(this.y > yMaxima){
            this.y = yMaxima;
            this.velocidadY = 0;
        }

        // Techo: mantiene el bloque visible en pantalla.
        if(this.y < 0){
            this.y = 0;
            if(this.velocidadY < 0) this.velocidadY = 0;
        }

        // Inclinación proporcional a la velocidad, suavizada.
        const tiltObjetivo = clamp(
            this.velocidadY / CONFIG.fisica.velocidadYmaxima,
            -1, 1
        ) * CONFIG.jugador.tiltMaximo;
        this.tilt = lerp(this.tilt, tiltObjetivo, CONFIG.jugador.tiltVelocidad);
    }

    // Área de colisión ligeramente reducida respecto al sprite: más justo.
    get hitbox(){
        const m = CONFIG.jugador.margenColision;
        return {
            x: this.x + m,
            y: this.y + m,
            ancho: this.ancho - m * 2,
            alto: this.alto - m * 2
        };
    }

    render(ctx){
        const cx = this.x + this.ancho / 2;
        const cy = this.y + this.alto / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.tilt);

        const w = this.ancho;
        const h = this.alto;

        // Cuerpo del bloque.
        ctx.fillStyle = CONFIG.jugador.color;
        rectRedondeado(ctx, -w / 2, -h / 2, w, h, 8);
        ctx.fill();

        // Brillo interior (da volumen manteniendo el estilo de bloque).
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        rectRedondeado(ctx, -w / 2 + 5, -h / 2 + 5, w - 10, h / 2 - 4, 5);
        ctx.fill();

        // Ojo: pequeño detalle de carácter, sin salir de la estética.
        ctx.fillStyle = "#1b3a1c";
        ctx.beginPath();
        ctx.arc(w / 2 - 12, -h / 2 + 14, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
