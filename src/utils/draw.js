// ===== HELPERS DE DIBUJO Y MATEMÁTICAS =====

// Interpolación lineal: útil para animaciones suaves (tilt, transiciones).
export function lerp(a, b, t){
    return a + (b - a) * t;
}

export function clamp(valor, min, max){
    return Math.min(Math.max(valor, min), max);
}

// Rectángulo con esquinas redondeadas. Fallback manual para navegadores sin
// ctx.roundRect (mantiene compatibilidad amplia).
export function rectRedondeado(ctx, x, y, ancho, alto, radio){
    const r = Math.min(radio, ancho / 2, alto / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + ancho, y, x + ancho, y + alto, r);
    ctx.arcTo(x + ancho, y + alto, x, y + alto, r);
    ctx.arcTo(x, y + alto, x, y, r);
    ctx.arcTo(x, y, x + ancho, y, r);
    ctx.closePath();
}

// Colisión AABB genérica entre dos rectángulos {x, y, ancho, alto}.
export function haySolapamiento(a, b){
    return (
        a.x < b.x + b.ancho &&
        a.x + a.ancho > b.x &&
        a.y < b.y + b.alto &&
        a.y + a.alto > b.y
    );
}
