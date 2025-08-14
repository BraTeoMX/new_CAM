// resources/js/reasignacion/ui.js

// ... (la función getStatusColor no cambia)
import { openAssignModal, openDetailsModal } from './modals.js';

function getStatusColor(status) {
    switch (status) {
        case 'SIN ASIGNAR': return 'bg-yellow-200 text-yellow-800';
        case 'ASIGNADO': return 'bg-blue-200 text-blue-800';
        case 'PROCESO': return 'bg-purple-200 text-purple-800';
        default: return 'bg-gray-200 text-gray-800';
    }
}


export function createOTCard(ot, actionType) {
    const card = document.createElement("div");
    card.className = "bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-transparent hover:border-blue-500 transition-all duration-200 cursor-pointer";
    card.setAttribute("data-id", ot.id);
    card.setAttribute("data-folio", ot.Folio);
    
    // Asumimos que la API devuelve 'Numero_Mecanico' y 'Mecanico'. Usamos || 'N/A' para evitar errores si son null.
    const numeroMecanico = ot.Numero_Mecanico || 'N/A';
    const nombreMecanico = ot.Mecanico || 'N/A';
    const statusColor = getStatusColor(ot.Status);
    
    card.innerHTML = `
        <h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">Folio: ${ot.Folio}</h5>
        <p class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-400">Máquina: ${ot.Maquina}</p>
        <p class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-400"># Mecánico: ${numeroMecanico}</p>
        <p class="mb-1 text-sm font-semibold text-gray-700 dark:text-gray-400">Mecánico: ${nombreMecanico}</p>
        <p class="mb-3 text-sm font-normal text-gray-600 dark:text-gray-300">Problema: ${ot.Problema}</p>
        <div class="flex justify-between items-center">
            <span class="inline-block px-3 py-1 text-xs font-medium rounded ${statusColor}">${ot.Status}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">${ot.fecha_creacion}</span>
        </div>
    `;

    // --- INICIO DE LA MODIFICACIÓN ---
    // Añadir el listener apropiado según el tipo de acción
    card.addEventListener('click', () => {
        if (actionType === 'asignar') {
            // Ahora pasamos el objeto 'ot' COMPLETO. Esto es clave.
            openAssignModal(ot); 
        } else if (actionType === 'detalles') {
            openDetailsModal(ot);
        }
    });
    // --- FIN DE LA MODIFICACIÓN ---

    return card;
}