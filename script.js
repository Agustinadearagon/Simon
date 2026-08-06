// Colores disponibles
const colores = ["verde", "rojo", "amarillo", "azul"];

// Frecuencias de sonido (Simon clásico)
const frecuencias = {
    verde: 329.63,
    rojo: 261.63,
    amarillo: 220.00,
    azul: 164.81
};

// Variables del juego
let secuencia = [];
let secuenciaJugador = [];
let ronda = 0;
let puedePulsar = false;

// Audio
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Elementos del HTML
const botonEmpezar = document.getElementById("empezar");
const textoRonda = document.getElementById("ronda");
const mensaje = document.getElementById("mensaje");
const botones = document.querySelectorAll(".boton");

// Cuando se pulsa EMPEZAR
botonEmpezar.addEventListener("click", () => {
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
    empezarJuego();
});

// Cuando se pulsa un color
botones.forEach(boton => {
    boton.addEventListener("click", () => {
        if (!puedePulsar) return;

        const color = boton.dataset.color;

        iluminar(color);
        reproducirSonido(color);

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

    const colorAleatorio = colores[Math.floor(Math.random() * colores.length)];
    secuencia.push(colorAleatorio);

    mostrarSecuencia();
}

function mostrarSecuencia() {
    let i = 0;

    const intervalo = setInterval(() => {
        iluminar(secuencia[i]);
        reproducirSonido(secuencia[i]);

        i++;

        if (i >= secuencia.length) {
            clearInterval(intervalo);

            setTimeout(() => {
                puedePulsar = true;
                mensaje.textContent = "Tu turno";
            }, 300);
        }
    }, 650);
}

function iluminar(color) {
    const boton = document.getElementById(color);

    boton.classList.add("activo");

    setTimeout(() => {
        boton.classList.remove("activo");
    }, 300);
}

function reproducirSonido(color) {
    const oscilador = audioContext.createOscillator();
    const ganancia = audioContext.createGain();

    oscilador.type = "sine";
    oscilador.frequency.value = frecuencias[color];

    oscilador.connect(ganancia);
    ganancia.connect(audioContext.destination);

    ganancia.gain.setValueAtTime(0.18, audioContext.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.22
    );

    oscilador.start();
    oscilador.stop(audioContext.currentTime + 0.22);
}

function comprobarRespuesta() {
    const posicion = secuenciaJugador.length - 1;

    if (secuenciaJugador[posicion] !== secuencia[posicion]) {
        mensaje.textContent = "¡Fallaste! Ronda: " + ronda;
        botonEmpezar.disabled = false;
        botonEmpezar.textContent = "REINTENTAR";
        puedePulsar = false;
        return;
    }

    if (secuenciaJugador.length === secuencia.length) {
        mensaje.textContent = "¡Bien! Siguiente ronda...";
        puedePulsar = false;

        setTimeout(() => {
            siguienteRonda();
        }, 800);
    }
}
