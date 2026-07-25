// ===== CONFIGURACIÓN CENTRAL =====
// Todo valor "mágico" del juego vive aquí. Ajustar el balance, los colores o
// la dificultad no debería requerir tocar la lógica: solo este archivo.

export const CONFIG = {

    // Resolución de diseño (el buffer real se escala por devicePixelRatio).
    // Toda la lógica y el dibujo trabajan en este espacio de coordenadas.
    ancho: 400,
    alto: 600,

    // Referencia temporal: la física está calibrada a 60 fps y se normaliza
    // con delta-time para comportarse igual en cualquier frecuencia de pantalla.
    fpsReferencia: 60,
    dtMaximoMs: 50, // recorta saltos de tiempo tras cambiar de pestaña

    suelo: {
        y: 550,          // línea superior del suelo (colisión con el piso)
        altoHierba: 50,
        altoTierra: 30,
        yTierra: 570
    },

    jugador: {
        xInicial: 80,
        yInicial: 250,
        ancho: 40,
        alto: 40,
        color: "#4CAF50",
        // Margen interno del área de colisión: hace el juego más justo sin
        // cambiar el tamaño visible del bloque.
        margenColision: 4,
        tiltMaximo: 0.55,     // radianes de inclinación al caer/subir
        tiltVelocidad: 0.12   // suavizado de la inclinación (0-1)
    },

    fisica: {
        gravedad: 0.3,
        impulsoSalto: -8,
        velocidadYmaxima: 11  // limita la caída para que siga siendo jugable
    },

    obstaculo: {
        ancho: 60,
        alturaMinima: 100,
        alturaVariable: 200,
        color: "#8B5A2B",
        colorBorde: "#6E4520",
        colorCima: "#A56B34"
    },

    // Dificultad progresiva: parte de los valores originales y se endurece
    // gradualmente con la puntuación, con topes para que no sea imposible.
    dificultad: {
        velocidadBase: 3,
        velocidadMaxima: 6,
        puntosPorIncremento: 5,   // cada N puntos sube la velocidad
        incrementoVelocidad: 0.35,

        intervaloBaseMs: 2000,
        intervaloMinimoMs: 1100,
        reduccionIntervaloMs: 70  // por cada incremento de dificultad
    },

    particulas: {
        maximo: 220,
        gravedad: 0.25
    },

    colores: {
        cieloArriba: "#8FD3F4",
        cieloAbajo: "#B7E5FF",
        hierba: "#3CB043",
        hierbaOscura: "#2F8C36",
        tierra: "#8B5A2B",
        nube: "rgba(255, 255, 255, 0.85)",
        hud: "#ffffff",
        hudSombra: "rgba(0, 0, 0, 0.25)"
    },

    ui: {
        fuente: "'Poppins', 'Trebuchet MS', system-ui, sans-serif",
        fuenteTitulo: "'Press Start 2P', 'Poppins', system-ui, sans-serif"
    },

    // Controles: varias teclas por acción para accesibilidad.
    teclas: {
        saltar: ["Space", "ArrowUp", "KeyW"],
        pausar: ["KeyP", "Escape"],
        confirmar: ["Space", "Enter"],
        reiniciar: ["KeyR"]
    },

    almacenamiento: {
        claveRecord: "blockflight.record"
    }
};
