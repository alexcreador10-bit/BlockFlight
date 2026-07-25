import { CONFIG } from "../config.js";
import { Button } from "../ui/Button.js";
import { clamp, rectRedondeado } from "../utils/draw.js";

// ===== ESTADO: GAME OVER =====
// Muestra la puntuación final y el récord (guardado en localStorage), con un
// panel que aparece con una transición suave. Deja correr las partículas de la
// explosión de muerte para que la escena siga viva.

export class GameOverState {

    constructor(game){
        this.game = game;

        this.botonReintentar = new Button({
            x: CONFIG.ancho / 2 - 100, y: 338, ancho: 200, alto: 50,
            texto: "REINTENTAR", onClick: () => this._reintentar()
        });
        this.botonMenu = new Button({
            x: CONFIG.ancho / 2 - 100, y: 398, ancho: 200, alto: 50,
            texto: "MENÚ", color: "#607D8B", onClick: () => this._menu()
        });
    }

    enter(){
        this.nuevoRecord = this.game.registrarRecord();
        this.progresoEntrada = 0; // 0→1 para la animación del panel
    }

    _reintentar(){
        this.game.states.cambiar("play");
    }

    _menu(){
        this.game.states.cambiar("menu");
    }

    update(dt, step){
        this.progresoEntrada = clamp(this.progresoEntrada + step * 0.08, 0, 1);

        // Las partículas de la muerte siguen animándose.
        this.game.particles.update(step);

        this.botonReintentar.update(this.game.input);
        this.botonMenu.update(this.game.input);

        if(this.game.input.confirmarRecienPulsado() || this.game.input.reiniciarRecienPulsado()){
            this._reintentar();
        }
    }

    render(ctx){
        this.game.renderScene(ctx);

        const t = this.progresoEntrada;

        // Velo que se intensifica con la entrada.
        ctx.fillStyle = `rgba(0,0,0,${0.5 * t})`;
        ctx.fillRect(0, 0, CONFIG.ancho, CONFIG.alto);

        // Panel deslizante.
        const panelY = 150 + (1 - t) * 30;
        ctx.globalAlpha = t;

        ctx.fillStyle = "rgba(255,255,255,0.96)";
        rectRedondeado(ctx, CONFIG.ancho / 2 - 130, panelY, 260, 320, 18);
        ctx.fill();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#c0392b";
        ctx.font = `18px ${CONFIG.ui.fuenteTitulo}`;
        ctx.fillText("GAME OVER", CONFIG.ancho / 2, panelY + 40);

        ctx.fillStyle = "#333";
        ctx.font = `600 18px ${CONFIG.ui.fuente}`;
        ctx.fillText(`Puntos: ${this.game.puntos}`, CONFIG.ancho / 2, panelY + 90);
        ctx.fillText(`Récord: ${this.game.record}`, CONFIG.ancho / 2, panelY + 120);

        if(this.nuevoRecord){
            ctx.fillStyle = "#F39C12";
            ctx.font = `700 16px ${CONFIG.ui.fuente}`;
            ctx.fillText("¡NUEVO RÉCORD!", CONFIG.ancho / 2, panelY + 158);
        }

        this.botonReintentar.render(ctx);
        this.botonMenu.render(ctx);

        ctx.globalAlpha = 1;
    }
}
