// resources/js/reasignacion/reasignacion.js

// Importamos las funciones principales de nuestros módulos
import { cargarOtsSinAsignar } from './unassigned.js';
import { initializeSearch } from './search.js';
import { initializeModals } from './modals.js';

// Espera a que el DOM esté completamente cargado para ejecutar nuestro código
document.addEventListener('DOMContentLoaded', () => {
    
    // Inicializa la lógica del formulario de búsqueda y el calendario.
    initializeSearch();
    
    // Inicializa toda la lógica de los modales.
    // Le pasamos `cargarOtsSinAsignar` como un "callback" para que se ejecute 
    // después de una asignación exitosa y así refrescar la lista.
    initializeModals(cargarOtsSinAsignar);
    
    // Carga la lista inicial de OTs que no tienen asignación.
    cargarOtsSinAsignar();

});