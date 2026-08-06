// Colores disponibles
const colores = ["verde", "rojo", "amarillo", "azul"];

// Variables del juego
let secuencia = [];
let secuenciaJugador = [];
let ronda = 0;
let puedePulsar = false;

// Elementos del HTML
const botonEmpezar = document.getElementById("empezar");
const textoRonda = document.getElementById("ronda");
const mensaje = document.getElementById("mensaje");
const botones = document.querySelectorAll(".boton");

// Cuando se pulsa EMPEZAR
botonEmpezar.addEventListener("click", empezarJuego);

// Cuando se pulsa un color
botones.forEach(boton => {
    boton.addEventListener("click", () => {
        if (!puedePulsar) return;

        const color = boton.dataset.color;
        iluminar(color);
        secuenciaJugador.push(color);
        comprobarRespuesta();
    });
});

function empezarJuego() {
    secuencia = [];
    secuenciaJugador = [];
    ronda = 0;
    botonEmpezar.disabled = true;
    mensaje.textContent = "Observa la secuencia...";
    siguienteRonda();
}

function siguienteRonda() {
    puedePulsar = false;
    secuenciaJugador = [];
    ronda++;
    textoRonda.textContent = ronda;

    // Añadir un color aleatorio a la secuencia
    const colorAleatorio = colores[Math.floor(Math.random() * 4)];
    secuencia.push(colorAleatorio);

    // Mostrar la secuencia
    mostrarSecuencia();
}

function mostrarSecuencia() {
    let i = 0;

    const intervalo = setInterval(() => {
        iluminar(secuencia[i]);
        i++;

        if (i >= secuencia.length) {
            clearInterval(intervalo);
            puedePulsar = true;
            mensaje.textContent = "Tu turno";
        }
    }, 800);
}

function iluminar(color) {
    const boton = document.getElementById(color);
    boton.classList.add("activo");

    setTimeout(() => {
        boton.classList.remove("activo");
    }, 400);
}

function comprobarRespuesta() {
    const posicion = secuenciaJugador.length - 1;

    // Si el jugador se equivoca
    if (secuenciaJugador[posicion] !== secuencia[posicion]) {
        mensaje.textContent = "¡Fallaste! Ronda: " + ronda;
        botonEmpezar.disabled = false;
        botonEmpezar.textContent = "REINTENTAR";
        puedePulsar = false;
        return;
    }

    // Si el jugador acertó toda la secuencia
    if (secuenciaJugador.length === secuencia.length) {
        mensaje.textContent = "¡Bien! Siguiente ronda...";
        puedePulsar = false;

        setTimeout(() => {
            siguienteRonda();
        }, 1000);
    }
}
