// ===== CANVAS =====

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;


// ===== VARIABLES DEL JUEGO =====

let juegoTerminado = false;
let puntos = 0;


// ===== JUGADOR =====

const jugador = {

    x: 80,
    y: 250,

    ancho: 40,
    alto: 40,

    color: "#4CAF50",

    velocidadY: 0

};


// ===== OBSTACULOS =====

const obstaculos = [];


function crearObstaculo(){

    const altura = Math.random() * 200 + 100;

    const obstaculo = {

        x: 400,

        y: 550 - altura,

        ancho: 60,

        alto: altura,

        velocidadX: -3,

        contado: false

    };


    obstaculos.push(obstaculo);

}


setInterval(function(){

    if(!juegoTerminado){

        crearObstaculo();

    }

},2000);



// ===== SALTO =====

function saltar(){

    if(!juegoTerminado){

        jugador.velocidadY = -8;

    }

}


document.addEventListener("keydown", function(event){

    if(event.code === "Space"){

        saltar();

    }


    if(event.code === "KeyR"){

        reiniciar();

    }

});



// ===== COLISIONES =====

function comprobarColisiones(){

    for(let i = 0; i < obstaculos.length; i++){

        const obstaculo = obstaculos[i];


        if(

            jugador.x < obstaculo.x + obstaculo.ancho &&

            jugador.x + jugador.ancho > obstaculo.x &&

            jugador.y < obstaculo.y + obstaculo.alto &&

            jugador.y + jugador.alto > obstaculo.y

        ){

            juegoTerminado = true;

        }

    }

}



// ===== MOVIMIENTO OBSTACULOS =====

function moverObstaculos(){

    for(let i = 0; i < obstaculos.length; i++){

        const obstaculo = obstaculos[i];


        obstaculo.x += obstaculo.velocidadX;


        if(

            !obstaculo.contado &&

            obstaculo.x + obstaculo.ancho < jugador.x

        ){

            puntos++;

            obstaculo.contado = true;

        }

    }

}



// ===== REINICIAR =====

function reiniciar(){

    jugador.y = 250;

    jugador.velocidadY = 0;

    obstaculos.length = 0;

    puntos = 0;

    juegoTerminado = false;

}



// ===== DIBUJAR =====

function dibujar(){

    // cielo

    ctx.fillStyle="#87CEEB";

    ctx.fillRect(0,0,400,600);



    // suelo

    ctx.fillStyle="#3CB043";

    ctx.fillRect(0,550,400,50);


    ctx.fillStyle="#8B5A2B";

    ctx.fillRect(0,570,400,30);



    // jugador

    ctx.fillStyle=jugador.color;

    ctx.fillRect(

        jugador.x,

        jugador.y,

        jugador.ancho,

        jugador.alto

    );



    // obstáculos

    for(let i = 0; i < obstaculos.length; i++){

        const obstaculo = obstaculos[i];


        ctx.fillStyle="#8B5A2B";

        ctx.fillRect(

            obstaculo.x,

            obstaculo.y,

            obstaculo.ancho,

            obstaculo.alto

        );

    }



    // texto

    ctx.fillStyle="white";

    ctx.font="25px Arial";

    ctx.fillText("Puntos: "+puntos,20,40);



    if(juegoTerminado){

        ctx.fillStyle="black";

        ctx.font="35px Arial";

        ctx.fillText(

            "GAME OVER",

            70,

            280

        );


        ctx.font="20px Arial";

        ctx.fillText(

            "Pulsa R para reiniciar",

            80,

            320

        );

    }

}



// ===== GAME LOOP =====

function actualizar(){


    if(!juegoTerminado){


        // gravedad

        jugador.velocidadY += 0.3;


        // movimiento jugador

        jugador.y += jugador.velocidadY;



        // suelo

        if(jugador.y + jugador.alto > 550){

            jugador.y = 550 - jugador.alto;

            jugador.velocidadY = 0;

        }


        moverObstaculos();

        comprobarColisiones();

    }



    dibujar();


    requestAnimationFrame(actualizar);

}


actualizar();