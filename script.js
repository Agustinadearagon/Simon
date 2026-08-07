// ========== VARIABLES GLOBALES ==========
let modo = "facil";
let numJugadores = 1;
let jugadorActual = 1;
let secuencia = [];
let secuenciaJugador = [];
let ronda = 0;
let puedePulsar = false;
let audioContext = null;

const coloresFacil = ["verde", "rojo", "amarillo", "azul"];
const coloresDificil = ["magenta", "amarillo", "azul", "verde", "naranja", "morado"];

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
const pantallaJugadores = document.getElementById("pantalla-jugadores");
const pantallaJuego = document.getElementById("pantalla-juego");

const btnComenzar = document.getElementById("btn-comenzar");
const btnFacil = document.getElementById("btn-facil");
const btnDificil = document.getElementById("btn-dificil");
const btnVolver = document.getElementById("btn-volver");
const btn1Jugador = document.getElementById("btn-1jugador");
const btn2Jugadores = document.getElementById("btn-2jugadores");
const btnVolverJugadores = document.getElementById("btn-volver-jugadores");
const btnMenu = document.getElementById("btn-menu");

const botonEmpezar = document.getElementById("empezar");
const textoRonda = document.getElementById("ronda");
const textoRecord = document.getElementById("record");
const textoTurno = document.getElementById("texto-turno");
const textoJugadorActual = document.getElementById("jugador-actual");
const textoRecordContainer = document.getElementById("texto-record");
const mensaje = document.getElementById("mensaje");

const tableroFacil = document.getElementById("tablero-facil");
const tableroDificil = document.getElementById("tablero-dificil");

// ========== RÉCORD ==========
function getRecordKey() {
    return "simon-record-" + modo;
}

function cargarRecord() {
    const valor = parseInt(localStorage.getItem(getRecordKey()) || "0", 10);
    textoRecord.textContent = valor;
    return valor;
}

function guardarRecordSiMejor(rondaActual) {
    if (numJugadores === 2) return false;
    const actual = cargarRecord();
    if (rondaActual > actual) {
        localStorage.setItem(getRecordKey(), rondaActual);
        textoRecord.textContent = rondaActual;
        return true;
    }
    return false;
}

// ========== NAVEGACIÓN ==========
btnComenzar.addEventListener("click", () => {
    pantallaInicio.classList.add("oculta");
    pantallaDificultad.classList.remove("oculta");
});

btnVolver.addEventListener("click", () => {
    pantallaDificultad.classList.add("oculta");
    pantallaInicio.classList.remove("oculta");
});

btnFacil.addEventListener("click", () => {
    modo = "facil";
    numJugadores = 1;
    iniciarJuego();
});

btnDificil.addEventListener("click", () => {
    modo = "dificil";
    pantallaDificultad.classList.add("oculta");
    pantallaJugadores.classList.remove("oculta");
});

btnVolverJugadores.addEventListener("click", () => {
    pantallaJugadores.classList.add("oculta");
    pantallaDificultad.classList.remove("oculta");
});

btn1Jugador.addEventListener("click", () => {
    numJugadores = 1;
    iniciarJuego();
});

btn2Jugadores.addEventListener("click", () => {
    numJugadores = 2;
    iniciarJuego();
});

btnMenu.addEventListener("click", () => {
    resetearJuego();
    pantallaJuego.classList.add("oculta");
    pantallaInicio.classList.remove("oculta");
});

function iniciarJuego() {
    if (modo === "facil") {
        tableroFacil.classList.remove("oculta");
        tableroDificil.classList.add("oculta");
    } else {
        tableroFacil.classList.add("oculta");
        tableroDificil.classList.remove("oculta");
    }

    if (numJugadores === 2) {
        pantallaJuego.classList.add("modo-multijugador");
        textoTurno.classList.remove("oculta");
        textoRecordContainer.classList.add("oculta");
        jugadorActual = 1;
        textoJugadorActual.textContent = "1";
    } else {
        pantallaJuego.classList.remove("modo-multijugador");
        textoTurno.classList.add("oculta");
        textoRecordContainer.classList.remove("oculta");
        cargarRecord();
    }

    pantallaDificultad.classList.add("oculta");
    pantallaJugadores.classList.add("oculta");
    pantallaJuego.classList.remove("oculta");

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
    jugadorActual = 1;
    if (textoJugadorActual) textoJugadorActual.textContent = "1";
}

function empezarJuego() {
    secuencia = [];
    secuenciaJugador = [];
    ronda = 0;
    jugadorActual = 1;
    if (textoJugadorActual) textoJugadorActual.textContent = "1";
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
                if (numJugadores === 2) {
                    mensaje.textContent = "Jugador " + jugadorActual + " · Tu turno";
                } else {
                    mensaje.textContent = "Tu turno";
                }
            }, 250);
        }
    }, 650);
}

function iluminar(color) {
    let boton;
    if (modo === "facil") {
        boton = document.getElementById(color);
    } else {
        if (color === "amarillo") boton = document.getElementById("amarillo6");
        else if (color === "azul") boton = document.getElementById("azul6");
        else if (color === "verde") boton = document.getElementById("verde6");
        else boton = document.getElementById(color);
    }
    if (!boton) return;
    boton.classList.add("activo");
    setTimeout(() => boton.classList.remove("activo"), 300);
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
    ganancia.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.20);
    oscilador.start(audioContext.currentTime);
    oscilador.stop(audioContext.currentTime + 0.20);
}

function comprobarRespuesta() {
    const posicion = secuenciaJugador.length - 1;

    if (secuenciaJugador[posicion] !== secuencia[posicion]) {
        puedePulsar = false;
        botonEmpezar.disabled = false;
        botonEmpezar.textContent = "REINTENTAR";

        if (numJugadores === 2) {
            const ganador = jugadorActual === 1 ? 2 : 1;
            mensaje.textContent = "¡Jugador " + ganador + " gana! (Ronda " + ronda + ")";
        } else {
            const esNuevoRecord = guardarRecordSiMejor(ronda);
            mensaje.textContent = esNuevoRecord
                ? "¡Nuevo récord! Ronda: " + ronda
                : "¡Fallaste! Ronda: " + ronda;
        }
        return;
    }

    if (secuenciaJugador.length === secuencia.length) {
        puedePulsar = false;
        if (numJugadores === 2) {
            jugadorActual = jugadorActual === 1 ? 2 : 1;
            textoJugadorActual.textContent = jugadorActual;
            mensaje.textContent = "¡Bien! Turno del Jugador " + jugadorActual + "...";
        } else {
            mensaje.textContent = "¡Bien! Siguiente ronda...";
        }
        setTimeout(() => siguienteRonda(), 900);
    }
}
