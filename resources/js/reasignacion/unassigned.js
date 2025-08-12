// resources/js/reasignacion/unassigned.js

// Importamos la función para crear tarjetas
import { createOTCard } from './ui.js';

const sinAsignarContainer = document.getElementById('ots-sin-asignar-container');

/**
 * Carga y muestra las OTs con estado "Sin Asignar" (estado 6).
 */
export async function cargarOtsSinAsignar() {
    sinAsignarContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Cargando OTs...</p>';
    try {
        const response = await fetch('/api/reasignacion/sin-asignar');
        if (!response.ok) throw new Error('Error en la respuesta del servidor.');
        const ots = await response.json();

        sinAsignarContainer.innerHTML = ''; // Limpiar contenedor

        if (ots.length === 0) {
            sinAsignarContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No hay OTs sin asignar.</p>';
            return;
        }

        ots.forEach(ot => {
            const card = createOTCard(ot, 'asignar');
            sinAsignarContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Error al cargar OTs sin asignar:', error);
        sinAsignarContainer.innerHTML = '<p class="text-red-500">No se pudieron cargar las OTs.</p>';
    }
}