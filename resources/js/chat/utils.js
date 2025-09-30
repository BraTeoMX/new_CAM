/**
 * Utilidades generales del sistema de chat
 * Funciones auxiliares reutilizables para manipulación de texto, formato de tiempo, etc.
 */

/**
 * Escapa caracteres HTML para prevenir inyección XSS
 * @param {string} text - Texto a escapar
 * @returns {string} Texto con caracteres HTML escapados
 */
export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Formatea segundos en formato MM:SS
 * @param {number} secs - Segundos a formatear
 * @returns {string} Tiempo formateado como "M:SS"
 */
export function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Genera un saludo basado en la hora del día
 * @returns {string} Saludo apropiado para la hora actual
 */
export function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Hola, buenos días ☀ !';
    if (hour >= 12 && hour < 19) return 'Hola, buenas tardes 🌤 !';
    return 'Hola, buenas noches 🌕!';
}

/**
 * Constantes para detección de saludos
 * Lista de palabras clave que se consideran saludos
 */
const GREETINGS = [
    'hola', 'buenos dias', 'buenas tardes', 'buenas noches',
    'saludos', 'hey', 'hi', 'hello', 'buen dia'
];

/**
 * Verifica si un mensaje contiene un saludo
 * @param {string} message - Mensaje a verificar
 * @returns {boolean} true si el mensaje contiene un saludo
 */
export function isGreeting(message) {
    const normalized = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return GREETINGS.some(greeting => normalized.includes(greeting));
}

/**
 * Convierte tiempo en formato string a segundos
 * Soporta formatos como "1:30", "00:01:30" o decimales como "1.5"
 * @param {string|number} input - Tiempo a convertir
 * @returns {number} Tiempo en segundos
 */
export function convertirATiempoEnSegundos(input) {
    if (typeof input === 'string' && input.includes(':')) {
        // Caso tipo "1:30" o "00:01:30"
        const partes = input.split(':').map(Number);
        let segundos = 0;

        if (partes.length === 2) {
            // "minutos:segundos"
            const [minutos, seg] = partes;
            segundos = (minutos * 60) + seg;
        } else if (partes.length === 3) {
            // "horas:minutos:segundos"
            const [horas, minutos, seg] = partes;
            segundos = (horas * 3600) + (minutos * 60) + seg;
        }

        return segundos;

    } else if (!isNaN(parseFloat(input))) {
        // Caso tipo decimal: 1.5 → 90 segundos
        return Math.round(parseFloat(input) * 60);
    }

    // Si el formato es inválido
    return 0;
}