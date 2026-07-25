import { Game } from "./core/Game.js";

// ===== PUNTO DE ENTRADA =====
// Crea el juego cuando el canvas está disponible y arranca el bucle principal.

function iniciar(){
    const canvas = document.getElementById("gameCanvas");
    const juego = new Game(canvas);
    juego.iniciar();
}

if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", iniciar);
} else {
    iniciar();
}
