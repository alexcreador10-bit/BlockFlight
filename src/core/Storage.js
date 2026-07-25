import { CONFIG } from "../config.js";

// ===== PERSISTENCIA DEL RÉCORD =====
// Envuelve localStorage con manejo de errores: si el navegador lo bloquea
// (modo privado, permisos), el juego sigue funcionando en memoria.

export class Storage {

    static leerRecord(){
        try {
            const valor = localStorage.getItem(CONFIG.almacenamiento.claveRecord);
            const numero = parseInt(valor, 10);
            return Number.isFinite(numero) ? numero : 0;
        } catch {
            return 0;
        }
    }

    static guardarRecord(puntos){
        try {
            localStorage.setItem(CONFIG.almacenamiento.claveRecord, String(puntos));
        } catch {
            // Silencioso a propósito: el récord es opcional, no debe romper el juego.
        }
    }
}
