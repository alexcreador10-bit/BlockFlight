import { CONFIG } from "../config.js";
import { rectRedondeado, lerp } from "../utils/draw.js";

// ===== BOTÓN INTERACTIVO =====
// Reutilizable en cualquier estado. Responde a ratón y táctil (usa las
// coordenadas de diseño ya normalizadas por InputManager) con feedback de
// hover/press mediante una escala animada.

export class Button {

    constructor({ x, y, ancho, alto, texto, onClick, color = "#4CAF50", colorTexto = "#ffffff" }){
        this.x = x;
        this.y = y;
        this.ancho = ancho;
        this.alto = alto;
        this.texto = texto;
        this.onClick = onClick;
        this.color = color;
        this.colorTexto = colorTexto;
        this.escala = 1;
        this.hover = false;
    }

    contiene(px, py){
        return (
            px >= this.x && px <= this.x + this.ancho &&
            py >= this.y && py <= this.y + this.alto
        );
    }

    // Devuelve true si se activó en este frame.
    update(input){
        this.hover = this.contiene(input.puntero.x, input.puntero.y);
        const objetivo = this.hover ? 1.05 : 1;
        this.escala = lerp(this.escala, objetivo, 0.2);

        if(this.hover && input.punteroRecienAbajo){
            if(this.onClick) this.onClick();
            return true;
        }
        return false;
    }

    render(ctx){
        const cx = this.x + this.ancho / 2;
        const cy = this.y + this.alto / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(this.escala, this.escala);

        // Sombra inferior (efecto de botón físico).
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        rectRedondeado(ctx, -this.ancho / 2, -this.alto / 2 + 4, this.ancho, this.alto, 12);
        ctx.fill();

        // Cuerpo.
        ctx.fillStyle = this.color;
        rectRedondeado(ctx, -this.ancho / 2, -this.alto / 2, this.ancho, this.alto, 12);
        ctx.fill();

        // Brillo superior.
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        rectRedondeado(ctx, -this.ancho / 2 + 4, -this.alto / 2 + 4, this.ancho - 8, this.alto / 2 - 4, 8);
        ctx.fill();

        // Texto.
        ctx.fillStyle = this.colorTexto;
        ctx.font = `600 20px ${CONFIG.ui.fuente}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.texto, 0, 1);

        ctx.restore();
    }
}
