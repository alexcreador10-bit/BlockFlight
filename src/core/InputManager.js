import { CONFIG } from "../config.js";

// ===== ENTRADA UNIFICADA (teclado + ratón + táctil) =====
// Traduce eventos de distintos dispositivos a un modelo común que los estados
// consultan cada frame. Las banderas "justo ahora" se limpian al final del
// frame para que cada pulsación se procese una sola vez.

export class InputManager {

    constructor(canvas){
        this.canvas = canvas;

        this.teclasAbajo = new Set();
        this.teclasRecienPulsadas = new Set();

        this.puntero = { x: 0, y: 0, abajo: false };
        this.punteroRecienAbajo = false;

        this._registrarEventos();
    }

    _registrarEventos(){
        window.addEventListener("keydown", (e) => {
            // Evita el scroll de la página al usar Espacio/flechas dentro del juego.
            if(["Space", "ArrowUp", "ArrowDown"].includes(e.code)){
                e.preventDefault();
            }
            if(!this.teclasAbajo.has(e.code)){
                this.teclasRecienPulsadas.add(e.code);
            }
            this.teclasAbajo.add(e.code);
        }, { passive: false });

        window.addEventListener("keyup", (e) => {
            this.teclasAbajo.delete(e.code);
        });

        // Ratón y táctil comparten la API de Pointer Events.
        this.canvas.addEventListener("pointerdown", (e) => {
            this._actualizarPuntero(e);
            this.puntero.abajo = true;
            this.punteroRecienAbajo = true;
            e.preventDefault();
        });

        this.canvas.addEventListener("pointermove", (e) => {
            this._actualizarPuntero(e);
        });

        window.addEventListener("pointerup", () => {
            this.puntero.abajo = false;
        });
    }

    // Convierte coordenadas de pantalla a coordenadas de diseño del canvas,
    // compensando el escalado CSS (clave para que los botones respondan bien
    // en móvil y en pantallas de distinto tamaño).
    _actualizarPuntero(e){
        const rect = this.canvas.getBoundingClientRect();
        this.puntero.x = (e.clientX - rect.left) * (CONFIG.ancho / rect.width);
        this.puntero.y = (e.clientY - rect.top) * (CONFIG.alto / rect.height);
    }

    _algunaTecla(codigos){
        return codigos.some((c) => this.teclasRecienPulsadas.has(c));
    }

    // --- Consultas semánticas que usan los estados ---

    saltarRecienPulsado(){
        return this._algunaTecla(CONFIG.teclas.saltar);
    }

    pausaRecienPulsada(){
        return this._algunaTecla(CONFIG.teclas.pausar);
    }

    confirmarRecienPulsado(){
        return this._algunaTecla(CONFIG.teclas.confirmar);
    }

    reiniciarRecienPulsado(){
        return this._algunaTecla(CONFIG.teclas.reiniciar);
    }

    // Se llama al final de cada frame, tras procesar la lógica.
    limpiarFrame(){
        this.teclasRecienPulsadas.clear();
        this.punteroRecienAbajo = false;
    }
}
