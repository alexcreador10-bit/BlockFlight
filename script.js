// ===== BLOCK FLIGHT =====
// Juego arcade estilo "flappy": pilota el bloque entre las tuberías.

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;   // 400
const H = canvas.height;  // 600
const SUELO_Y = 550;      // altura del suelo

// ===== ESTADO DEL JUEGO =====
// "menu" -> "jugando" -> "fin"
let estado = "menu";
let puntos = 0;
let record = Number(localStorage.getItem("blockflight_record") || 0);

// ===== JUGADOR =====
const jugador = {
    x: 90,
    y: 250,
    ancho: 36,
    alto: 36,
    velocidadY: 0,
    color: "#4CAF50"
};

const GRAVEDAD = 0.42;
const IMPULSO = -7.4;

// ===== TUBERIAS =====
const tuberias = [];
const HUECO = 165;            // espacio libre entre tubería superior e inferior
const ANCHO_TUBERIA = 62;
let velocidadBase = 2.6;      // sube con la puntuación
let temporizadorSpawn = 0;

function crearTuberia() {
    const margen = 60;
    const centro = margen + Math.random() * (SUELO_Y - HUECO - margen * 2);
    tuberias.push({
        x: W,
        huecoY: centro,
        contada: false
    });
}

// ===== NUBES (parallax) =====
const nubes = [];
for (let i = 0; i < 5; i++) {
    nubes.push({
        x: Math.random() * W,
        y: 40 + Math.random() * 220,
        escala: 0.6 + Math.random() * 0.8,
        vel: 0.25 + Math.random() * 0.4
    });
}

// ===== PARTICULAS (al chocar) =====
const particulas = [];
function explotar(x, y) {
    for (let i = 0; i < 18; i++) {
        const ang = Math.random() * Math.PI * 2;
        const fuerza = 2 + Math.random() * 4;
        particulas.push({
            x, y,
            vx: Math.cos(ang) * fuerza,
            vy: Math.sin(ang) * fuerza - 1,
            vida: 1,
            color: Math.random() < 0.5 ? "#4CAF50" : "#ffd54f"
        });
    }
}
let destello = 0;

// ===== SUELO EN MOVIMIENTO =====
let sueloOffset = 0;

// ===== CONTROLES =====
function volar() {
    if (estado === "menu") {
        empezar();
        return;
    }
    if (estado === "jugando") {
        jugador.velocidadY = IMPULSO;
    } else if (estado === "fin") {
        reiniciar();
    }
}

function empezar() {
    estado = "jugando";
    jugador.velocidadY = IMPULSO;
}

function reiniciar() {
    jugador.y = 250;
    jugador.velocidadY = 0;
    tuberias.length = 0;
    particulas.length = 0;
    puntos = 0;
    velocidadBase = 2.6;
    temporizadorSpawn = 0;
    estado = "jugando";
    jugador.velocidadY = IMPULSO;
}

function terminar() {
    if (estado !== "jugando") return;
    estado = "fin";
    destello = 1;
    explotar(jugador.x + jugador.ancho / 2, jugador.y + jugador.alto / 2);
    if (puntos > record) {
        record = puntos;
        localStorage.setItem("blockflight_record", String(record));
    }
}

document.addEventListener("keydown", function (e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        volar();
    }
    if (e.code === "KeyR") {
        reiniciar();
    }
});

canvas.addEventListener("mousedown", function (e) { e.preventDefault(); volar(); });
canvas.addEventListener("touchstart", function (e) { e.preventDefault(); volar(); }, { passive: false });

// ===== LOGICA =====
function actualizarJugador() {
    jugador.velocidadY += GRAVEDAD;
    jugador.y += jugador.velocidadY;

    // techo
    if (jugador.y < 0) {
        jugador.y = 0;
        jugador.velocidadY = 0;
    }
    // suelo
    if (jugador.y + jugador.alto > SUELO_Y) {
        jugador.y = SUELO_Y - jugador.alto;
        terminar();
    }
}

function actualizarTuberias() {
    velocidadBase = 2.6 + Math.min(puntos * 0.06, 3.2);

    temporizadorSpawn--;
    if (temporizadorSpawn <= 0) {
        crearTuberia();
        temporizadorSpawn = Math.max(70, 110 - puntos); // más frecuentes al avanzar
    }

    for (let i = tuberias.length - 1; i >= 0; i--) {
        const t = tuberias[i];
        t.x -= velocidadBase;

        // puntuar
        if (!t.contada && t.x + ANCHO_TUBERIA < jugador.x) {
            puntos++;
            t.contada = true;
        }

        // colisión
        const dentroX = jugador.x + jugador.ancho > t.x && jugador.x < t.x + ANCHO_TUBERIA;
        const fueraHueco = jugador.y < t.huecoY || jugador.y + jugador.alto > t.huecoY + HUECO;
        if (dentroX && fueraHueco) {
            terminar();
        }

        if (t.x + ANCHO_TUBERIA < -10) {
            tuberias.splice(i, 1);
        }
    }
}

function actualizarAmbiente() {
    for (const n of nubes) {
        n.x -= n.vel;
        if (n.x < -60) {
            n.x = W + 40;
            n.y = 40 + Math.random() * 220;
        }
    }
    if (estado === "jugando") {
        sueloOffset = (sueloOffset + velocidadBase) % 40;
    }
    for (let i = particulas.length - 1; i >= 0; i--) {
        const p = particulas[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.vida -= 0.02;
        if (p.vida <= 0) particulas.splice(i, 1);
    }
    if (destello > 0) destello -= 0.05;
}

// ===== DIBUJO =====
function dibujarNube(x, y, s) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.beginPath();
    ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
    ctx.arc(x + 20 * s, y + 4 * s, 22 * s, 0, Math.PI * 2);
    ctx.arc(x + 44 * s, y, 16 * s, 0, Math.PI * 2);
    ctx.fill();
}

function dibujarJugador() {
    ctx.save();
    ctx.translate(jugador.x + jugador.ancho / 2, jugador.y + jugador.alto / 2);
    const ang = Math.max(-0.5, Math.min(1.1, jugador.velocidadY * 0.06));
    ctx.rotate(ang);
    const a = jugador.ancho, h = jugador.alto;

    // cuerpo
    ctx.fillStyle = jugador.color;
    ctx.fillRect(-a / 2, -h / 2, a, h);
    // borde
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#2e7d32";
    ctx.strokeRect(-a / 2, -h / 2, a, h);
    // ala
    ctx.fillStyle = "#a5d6a7";
    ctx.fillRect(-a / 2 + 4, 2, 12, 8);
    // ojo
    ctx.fillStyle = "#fff";
    ctx.fillRect(a / 2 - 14, -h / 2 + 7, 9, 9);
    ctx.fillStyle = "#10233b";
    ctx.fillRect(a / 2 - 9, -h / 2 + 9, 4, 5);
    ctx.restore();
}

function dibujarTuberia(t) {
    const grad = ctx.createLinearGradient(t.x, 0, t.x + ANCHO_TUBERIA, 0);
    grad.addColorStop(0, "#5aa02c");
    grad.addColorStop(0.5, "#82c34e");
    grad.addColorStop(1, "#4c8a24");

    // superior
    ctx.fillStyle = grad;
    ctx.fillRect(t.x, 0, ANCHO_TUBERIA, t.huecoY);
    ctx.fillRect(t.x - 4, t.huecoY - 18, ANCHO_TUBERIA + 8, 18);
    // inferior
    const yb = t.huecoY + HUECO;
    ctx.fillRect(t.x, yb, ANCHO_TUBERIA, SUELO_Y - yb);
    ctx.fillRect(t.x - 4, yb, ANCHO_TUBERIA + 8, 18);
    // bordes
    ctx.strokeStyle = "#2f5e17";
    ctx.lineWidth = 3;
    ctx.strokeRect(t.x, 0, ANCHO_TUBERIA, t.huecoY);
    ctx.strokeRect(t.x, yb, ANCHO_TUBERIA, SUELO_Y - yb);
}

function textoCentrado(txt, y, tam, color) {
    ctx.fillStyle = color;
    ctx.font = "bold " + tam + "px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(txt, W / 2, y);
    ctx.textAlign = "left";
}

function dibujar() {
    // cielo
    const cielo = ctx.createLinearGradient(0, 0, 0, H);
    cielo.addColorStop(0, "#7ec8ff");
    cielo.addColorStop(1, "#bfe6ff");
    ctx.fillStyle = cielo;
    ctx.fillRect(0, 0, W, H);

    // nubes
    for (const n of nubes) dibujarNube(n.x, n.y, n.escala);

    // tuberías
    for (const t of tuberias) dibujarTuberia(t);

    // partículas
    for (const p of particulas) {
        ctx.globalAlpha = Math.max(0, p.vida);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 5, 5);
    }
    ctx.globalAlpha = 1;

    // suelo (con textura en movimiento)
    ctx.fillStyle = "#3CB043";
    ctx.fillRect(0, SUELO_Y, W, 20);
    ctx.fillStyle = "#8B5A2B";
    ctx.fillRect(0, SUELO_Y + 20, W, H - SUELO_Y - 20);
    ctx.fillStyle = "#2f7d2f";
    for (let x = -sueloOffset; x < W; x += 40) {
        ctx.fillRect(x, SUELO_Y, 20, 8);
    }

    // jugador
    if (estado !== "fin" || Math.floor(Date.now() / 100) % 2 === 0) {
        dibujarJugador();
    }

    // marcador
    if (estado === "jugando") {
        textoCentrado(String(puntos), 70, 48, "#fff");
        ctx.textAlign = "center";
        ctx.font = "bold 48px 'Trebuchet MS', sans-serif";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(16,35,59,0.6)";
        ctx.strokeText(String(puntos), W / 2, 70);
        ctx.fillStyle = "#fff";
        ctx.fillText(String(puntos), W / 2, 70);
        ctx.textAlign = "left";
    }

    // pantallas
    if (estado === "menu") {
        panel();
        textoCentrado("BLOCK FLIGHT", 230, 40, "#fff");
        textoCentrado("Vuela entre las tuberías", 270, 18, "#e3f2fd");
        textoCentrado("Espacio · Click · Toca", 320, 20, "#ffd54f");
        textoCentrado("Récord: " + record, 360, 18, "#e3f2fd");
    } else if (estado === "fin") {
        panel();
        textoCentrado("GAME OVER", 220, 40, "#fff");
        textoCentrado("Puntos: " + puntos, 265, 24, "#ffd54f");
        textoCentrado("Récord: " + record, 300, 20, "#e3f2fd");
        textoCentrado("Pulsa R o toca para reiniciar", 350, 17, "#e3f2fd");
    }

    // destello al chocar
    if (destello > 0) {
        ctx.fillStyle = "rgba(255,255,255," + (destello * 0.6) + ")";
        ctx.fillRect(0, 0, W, H);
    }
}

function panel() {
    ctx.fillStyle = "rgba(16, 35, 59, 0.55)";
    ctx.fillRect(40, 180, W - 80, 210);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 180, W - 80, 210);
}

// ===== BUCLE PRINCIPAL =====
function loop() {
    if (estado === "jugando") {
        actualizarJugador();
        actualizarTuberias();
    }
    actualizarAmbiente();
    dibujar();
    requestAnimationFrame(loop);
}

loop();
