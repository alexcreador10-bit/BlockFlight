import { CONFIG } from "../config.js";
import { Button } from "../ui/Button.js";

// ===== ESTADO: PAUSA =====
// Congela la partida (renderiza la escena sin actualizarla) y superpone un
// panel translúcido con botones para reanudar o volver al menú.

export class PauseState {

    constructor(game){
        this.game = game;

        this.botonReanudar = new Button({
            x: CONFIG.ancho / 2 - 90, y: 300, ancho: 180, alto: 52,
            texto: "REANUDAR", onClick: () => this._reanudar()
        });
        this.botonMenu = new Button({
            x: CONFIG.ancho / 2 - 90, y: 366, ancho: 180, alto: 52,
            texto: "MENÚ", color: "#607D8B", onClick: () => this._menu()
        });
    }

    _reanudar(){
        this.game.states.reanudar("play");
    }

    _menu(){
        this.game.states.cambiar("menu");
    }

    update(){
        this.botonReanudar.update(this.game.input);
        this.botonMenu.update(this.game.input);

        // La misma tecla de pausa reanuda.
        if(this.game.input.pausaRecienPulsada() || this.game.input.confirmarRecienPulsado()){
            this._reanudar();
        }
    }

    render(ctx){
        // Escena congelada de fondo.
        this.game.renderScene(ctx);

        // Velo oscuro.
        ctx.fillStyle = "rgba(0,0,0,0.45)";
        ctx.fillRect(0, 0, CONFIG.ancho, CONFIG.alto);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.font = `20px ${CONFIG.ui.fuenteTitulo}`;
        ctx.fillText("PAUSA", CONFIG.ancho / 2, 220);

        this.botonReanudar.render(ctx);
        this.botonMenu.render(ctx);
    }
}
