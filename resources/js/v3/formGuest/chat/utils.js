/**
 * Utilidades generales del sistema de chat
 * Funciones auxiliares reutilizables para manipulación de texto, formato de tiempo, etc.
 */

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

export function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getTimeBasedGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Hola, buenos días ☀ !';
    if (hour >= 12 && hour < 19) return 'Hola, buenas tardes 🌤 !';
    return 'Hola, buenas noches 🌕!';
}

const GREETINGS = [
    'hola', 'buenos dias', 'buenas tardes', 'buenas noches',
    'saludos', 'hey', 'hi', 'hello', 'buen dia'
];

export function isGreeting(message) {
    const normalized = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return GREETINGS.some(greeting => normalized.includes(greeting));
}

export function convertirATiempoEnSegundos(input) {
    if (typeof input === 'string' && input.includes(':')) {
        const partes = input.split(':').map(Number);
        let segundos = 0;

        if (partes.length === 2) {
            const [minutos, seg] = partes;
            segundos = (minutos * 60) + seg;
        } else if (partes.length === 3) {
            const [horas, minutos, seg] = partes;
            segundos = (horas * 3600) + (minutos * 60) + seg;
        }

        return segundos;
    } else if (!isNaN(parseFloat(input))) {
        return Math.round(parseFloat(input) * 60);
    }
    return 0;
}
