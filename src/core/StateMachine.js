// ===== MÁQUINA DE ESTADOS =====
// Gestiona la transición entre pantallas del juego (menú, jugando, pausa,
// game over). Cada estado implementa: enter(), exit(), update(), render().

export class StateMachine {

    constructor(){
        this.estados = new Map();
        this.actual = null;
        this.nombreActual = null;
    }

    registrar(nombre, estado){
        this.estados.set(nombre, estado);
    }

    cambiar(nombre, datos = {}){
        const siguiente = this.estados.get(nombre);
        if(!siguiente){
            throw new Error(`Estado desconocido: ${nombre}`);
        }

        if(this.actual && typeof this.actual.exit === "function"){
            this.actual.exit();
        }

        this.actual = siguiente;
        this.nombreActual = nombre;

        if(typeof this.actual.enter === "function"){
            this.actual.enter(datos);
        }
    }

    // Reanuda un estado ya inicializado sin llamar a enter(): se usa para
    // volver de la pausa sin reiniciar la partida en curso.
    reanudar(nombre){
        const siguiente = this.estados.get(nombre);
        if(!siguiente) throw new Error(`Estado desconocido: ${nombre}`);
        this.actual = siguiente;
        this.nombreActual = nombre;
    }

    update(dt, step){
        if(this.actual && typeof this.actual.update === "function"){
            this.actual.update(dt, step);
        }
    }

    render(ctx){
        if(this.actual && typeof this.actual.render === "function"){
            this.actual.render(ctx);
        }
    }
}
