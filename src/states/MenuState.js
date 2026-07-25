import { CONFIG } from "../config.js";
import { Button } from "../ui/Button.js";
import { rectRedondeado } from "../utils/draw.js";

// ===== ESTADO: MENÚ =====
// Pantalla de inicio con título, récord y botón de jugar. El fondo se anima y
// un bloque decorativo flota para dar vida a la escena.

export class MenuState {

    constructor(game){
        this.game = game;
        this.tiempo = 0;

        this.botonJugar = new Button({
            x: CONFIG.ancho / 2 - 90, y: 380, ancho: 180, alto: 56,
            texto: "JUGAR", onClick: () => this._jugar()
        });
    }

    enter(){
        this.tiempo = 0;
    }

    _jugar(){
        this.game.audio.playClick();
        this.game.states.cambiar("play");
    }

    update(dt, step){
        this.tiempo += step;
        this.game.background.update(step, CONFIG.dificultad.velocidadBase);

        this.botonJugar.update(this.game.input);

        if(this.game.input.confirmarRecienPulsado()){
            this._jugar();
        }
    }

    render(ctx){
        this.game.background.render(ctx);

        // Bloque flotante decorativo.
        const bobY = 210 + Math.sin(this.tiempo * 0.05) * 10;
        ctx.fillStyle = CONFIG.jugador.color;
        rectRedondeado(ctx, CONFIG.ancho / 2 - 22, bobY, 44, 44, 8);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.22)";
        rectRedondeado(ctx, CONFIG.ancho / 2 - 16, bobY + 6, 32, 16, 5);
        ctx.fill();

        // Título.
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#1b3a1c";
        ctx.font = `22px ${CONFIG.ui.fuenteTitulo}`;
        ctx.fillText("BLOCK", CONFIG.ancho / 2, 110);
        ctx.fillText("FLIGHT", CONFIG.ancho / 2, 148);

        // Récord.
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.font = `600 18px ${CONFIG.ui.fuente}`;
        ctx.fillText(`Récord: ${this.game.record}`, CONFIG.ancho / 2, 320);

        this.botonJugar.render(ctx);

        // Instrucciones.
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.font = `500 14px ${CONFIG.ui.fuente}`;
        ctx.fillText("Toca o pulsa ESPACIO para volar", CONFIG.ancho / 2, 470);
    }
}
