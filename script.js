// ========== VARIABLES GLOBALES ==========
let modo = "facil"; // "facil" o "dificil"
let secuencia = [];
let secuenciaJugador = [];
let ronda = 0;
let puedePulsar = false;
let audioContext = null;

// Colores según modo
const coloresFacil = ["verde", "rojo", "amarillo", "azul"];
const coloresDificil = ["magenta", "amarillo", "azul", "verde", "naranja", "morado"];

// Frecuencias de cada color
const frecuencias = {
    verde: 329.63,
    rojo: 261.63,
    amarillo: 220.00,
    azul: 164.81,
    magenta: 392.00,
    naranja: 293.66,
    morado: 196.00
};

// ========== ELEMENTOS DEL DOM ==========
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaDificultad = document.getElementById("pantalla-dificultad");
const pantallaJuego = document.getElementById("pantalla-juego");

const btnComenzar = document.getElementById("btn-comenzar");
const btnFacil = document.getElementById("btn-facil");
const btnDificil = document.getElementById("btn-dificil");
const btnVolver = document.getElementById("btn-volver");
const btnMenu = document.getElementById("btn-menu");

const botonEmpezar = document.getElementById("empezar");
const textoRonda = document.getElementById("ronda");
const mensaje = document.getElementById("mensaje");

const tableroFacil = document.getElementById("tablero-facil");
const tableroDificil = document.getElementById("tablero-dificil");

// ========== NAVEGACIÓN ENTRE PANTALLAS ==========
btnComenzar.addEventListener("click", () => {
    pantallaInicio.classList.add("oculta");
    pantallaDificultad.classList.remove("oculta");
});

btnVolver.addEventListener("click", () => {
    pantallaDificultad.classList.add("oculta");
    pantallaInicio.classList.remove("oculta");
});

btnFacil.addEventListener("click", () => {
    iniciarModo("facil");
});

btnDificil.addEventListener("click", () => {
    iniciarModo("dificil");
});

btnMenu.addEventListener("click", () => {
    // Resetear juego y volver al inicio
    resetearJuego();
    pantallaJuego.classList.add("oculta");
    pantallaInicio.classList.remove("oculta");
});

function iniciarModo(dificultad) {
    modo = dificultad;

    // Mostrar el tablero correspondiente
    if (modo === "facil") {
        tableroFacil.classList.remove("oculta");
        tableroDificil.classList.add("oculta");
    } else {
        tableroFacil.classList.add("oculta");
        tableroDificil.classList.remove("oculta");
    }

    // Cambiar de pantalla
    pantallaDificultad.classList.add("oculta");
    pantallaJuego.classList.remove("oculta");

    // Preparar el juego
    resetearJuego();
    mensaje.textContent = "Pulsa EMPEZAR para jugar";
    botonEmpezar.disabled = false;
    botonEmpezar.textContent = "EMPEZAR";
}

// ========== LÓGICA DEL JUEGO ==========
botonEmpezar.addEventListener("click", () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
    empezarJuego();
});

// Eventos de los botones de color (se asignan a ambos tableros)
document.querySelectorAll(".boton, .boton-hex").forEach(boton => {
    boton.addEventListener("click", () => {
        if (!puedePulsar) return;

        const color = boton.dataset.color;
        iluminar(color);
        reproducirSonido(color);
        secuenciaJugador.push(color);
        comprobarRespuesta();
    });
});

function resetearJuego() {
    secuencia = [];
    secuenciaJugador = [];
    ronda = 0;
    puedePulsar = false;
    textoRonda.textContent = "0";
}

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

    const colores = modo === "facil" ? coloresFacil : coloresDificil;
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
            }, 250);
        }
    }, 650);
}

function iluminar(color) {
    // Buscar el botón correcto según el modo
    let boton;
    if (modo === "facil") {
        boton = document.getElementById(color);
    } else {
        // En difícil algunos ids tienen sufijo 6
        if (color === "amarillo") boton = document.getElementById("amarillo6");
        else if (color === "azul") boton = document.getElementById("azul6");
        else if (color === "verde") boton = document.getElementById("verde6");
        else boton = document.getElementById(color);
    }

    if (!boton) return;

    boton.classList.add("activo");
    setTimeout(() => {
        boton.classList.remove("activo");
    }, 300);
}

function reproducirSonido(color) {
    if (!audioContext) return;

    const oscilador = audioContext.createOscillator();
    const ganancia = audioContext.createGain();

    oscilador.type = "square";
    oscilador.frequency.value = frecuencias[color] || 220;

    oscilador.connect(ganancia);
    ganancia.connect(audioContext.destination);

    ganancia.gain.setValueAtTime(0.18, audioContext.currentTime);
    ganancia.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.20
    );

    oscilador.start(audioContext.currentTime);
    oscilador.stop(audioContext.currentTime + 0.20);
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
