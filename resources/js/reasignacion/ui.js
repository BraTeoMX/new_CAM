// resources/js/reasignacion/ui.js

// Importamos las funciones que abrirán los modales desde nuestro módulo de modales.
import { openAssignModal, openDetailsModal } from './modals.js';

/**
 * Define los colores de Tailwind según el estado de la OT.
 * @param {string} status - El estado de la OT.
 * @returns {string} Clases de CSS para el color.
 */
function getStatusColor(status) {
    switch (status) {
        case 'SIN ASIGNAR': return 'bg-yellow-200 text-yellow-800';
        case 'ASIGNADO': return 'bg-blue-200 text-blue-800';
        case 'PROCESO': return 'bg-purple-200 text-purple-800';
        default: return 'bg-gray-200 text-gray-800';
    }
}

/**
 * Crea y devuelve un elemento HTML de tarjeta para una OT.
 * @param {object} ot - El objeto de datos de la OT.
 * @param {string} actionType - 'asignar' o 'detalles', para definir qué modal abrir.
 * @returns {HTMLElement} El elemento de la tarjeta.
 */
export function createOTCard(ot, actionType) {
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-transparent hover:border-blue-500 transition-all duration-200 cursor-pointer";
    card.setAttribute("data-id", ot.id);
    card.setAttribute("data-folio", ot.Folio);
    
    const statusColor = getStatusColor(ot.Status);
    
    card.innerHTML = `
        <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">Folio: ${ot.Folio}</h5>
        <p class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-400">Máquina: ${ot.Maquina}</p>
        <p class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-400">Mecánico: ${ot.Numero_Mecanico}</p>
        <p class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-400">Mecánico: ${ot.Mecanico}</p>
        <p class="mb-3 text-sm font-normal text-gray-600 dark:text-gray-300">Problema: ${ot.Problema}</p>
        <div class="flex justify-between items-center">
            <span class="inline-block px-3 py-1 text-xs font-medium rounded ${statusColor}">${ot.Status}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">${ot.fecha_creacion}</span>
        </div>
    `;

    // Añadir el listener apropiado según el tipo de acción
    card.addEventListener('click', () => {
        if (actionType === 'asignar') {
            openAssignModal(ot.id); // Usamos la función importada
        } else if (actionType === 'detalles') {
            openDetailsModal(ot); // Usamos la función importada
        }
    });

    return card;
}