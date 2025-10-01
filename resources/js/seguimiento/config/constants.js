/**
 * Constantes y configuración para el módulo de seguimiento de solicitudes
 * @module config/constants
 */

/**
 * IDs de elementos DOM
 */
export const DOM_IDS = {
    MODULO_SELECT: 'modulo-select',
    CONTAINER: 'seguimiento-ot-container',
    FILTROS_BAR: 'filtros-bar',
    SEARCH_INPUT: 'search-ot',
    STATUS_FILTER: 'filter-status',

    // Resumen
    OT_AUTONOMAS: 'ot-autonomas',
    OT_ASIGNADAS: 'ot-asignadas',
    OT_PROCESO: 'ot-proceso',
    OT_PENDIENTES: 'ot-pendientes',
    OT_ATENDIDAS: 'ot-atendidas',
    OT_TOTAL: 'ot-total',
};

/**
 * Clases CSS para estados
 */
export const ESTADO_CLASSES = {
    ASIGNADO: {
        texto: 'text-blue-800 bg-blue-100',
        ring: 'ring-blue-500'
    },
    'EN PROCESO': {
        texto: 'text-yellow-800 bg-yellow-100',
        ring: 'ring-yellow-500'
    },
    ATENDIDO: {
        texto: 'text-green-800 bg-green-100',
        ring: 'ring-green-500'
    },
    PENDIENTE: {
        texto: 'text-red-500 bg-red-100',
        ring: 'ring-red-500'
    },
    AUTONOMO: {
        texto: 'text-violet-800 bg-violet-100',
        ring: 'ring-violet-500'
    },
    DESCONOCIDO: {
        texto: 'text-gray-800 bg-gray-100',
        ring: 'ring-gray-400'
    }
};

/**
 * Endpoints de la API
 */
export const API_ENDPOINTS = {
    OBTENER_MODULOS: '/FollowOTV2/obtenerAreaModulos',
    OBTENER_RESUMEN: '/FollowOTV2/obtenerResumen',
    OBTENER_REGISTROS: '/FollowOTV2/obtenerRegistros',
    OBTENER_ESTADOS: '/FollowOTV2/obtenerCatalogoEstados',
    OBTENER_CLASES_MAQUINA: '/FollowOTV2/obtenerClasesMaquina',
    OBTENER_FALLAS: '/FollowOTV2/obtenerFallas',
    OBTENER_CAUSAS: '/FollowOTV2/obtenerCausas',
    OBTENER_ACCIONES: '/FollowOTV2/obtenerAcciones',
    INICIAR_ATENCION: '/FollowOTV2/iniciarAtencion',
    FINALIZAR_ATENCION: '/FollowOTV2/finalizarAtencion',
    ACTIVAR_BAHIA: '/FollowOTV2/activarBahia',
    FINALIZAR_BAHIA: '/FollowOTV2/finalizarBahia',
};

/**
 * Configuración de Select2
 */
export const SELECT2_CONFIG = {
    MODULO: {
        placeholder: 'Selecciona tu módulo de atención',
        allowClear: true
    },
    MODAL: {
        dropdownParent: '.swal2-popup'
    }
};

/**
 * Configuración de SweetAlert2 para modo oscuro
 */
export const SWAL_DARK_MODE_CONFIG = {
    background: '#1f2937',
    color: '#f9fafb',
    confirmButtonColor: '#3b82f6'
};

/**
 * Tiempos en milisegundos
 */
export const TIEMPOS = {
    ACTUALIZACION_TIMER: 1000, // 1 segundo
    MENSAJE_EXITO: 2000, // 2 segundos
    ADVERTENCIA_TIEMPO: 300, // 5 minutos en segundos
};

/**
 * Valores por defecto
 */
export const DEFAULTS = {
    TIEMPO_ESTIMADO_NA: '00:15:00',
    IMAGEN_AVATAR: '/images/Avatar.webp',
    IMAGEN_DEFAULT: '/fotos-usuarios/default-avatar.webp',
    TEXTO_PLACEHOLDER: '--',
};

/**
 * Opciones de encuesta de satisfacción
 */
export const OPCIONES_SATISFACCION = [
    { valor: '4', emoji: '🌟', texto: 'Excelente' },
    { valor: '3', emoji: '👍', texto: 'Bueno' },
    { valor: '2', emoji: '😐', texto: 'Regular' },
    { valor: '1', emoji: '👎', texto: 'Malo' },
];

/**
 * Clases CSS para temporizadores según tiempo restante
 */
export const TIMER_CLASSES = {
    NORMAL: ['text-gray-800', 'dark:text-gray-100'],
    ADVERTENCIA: ['text-yellow-500', 'dark:text-yellow-400'],
    AGOTADO: ['text-red-600', 'dark:text-red-500']
};

/**
 * Mensajes de error
 */
export const MENSAJES_ERROR = {
    CARGAR_MODULOS: 'No se pudieron cargar los módulos',
    CARGAR_ESTADOS: 'No se pudieron cargar los estados del filtro',
    CARGAR_RESUMEN: 'Error al cargar el resumen',
    CARGAR_REGISTROS: 'No se pudieron cargar los registros',
    CARGAR_CATALOGOS: 'No se pudieron cargar los catálogos para finalizar la atención',
    CARGAR_MAQUINA: 'No se pudieron cargar los datos de la máquina',
    INICIAR_ATENCION: 'Error al iniciar la atención',
    FINALIZAR_ATENCION: 'Error al finalizar la atención',
    ACTIVAR_BAHIA: 'No se pudo activar el tiempo de bahía',
    REANUDAR_BAHIA: 'No se pudo reanudar la atención',
    SERVIDOR: 'Error del servidor',
};

/**
 * Selectores CSS
 */
export const SELECTORS = {
    TIMER_DISPLAY: '.timer-display',
    INICIAR_BTN: '.iniciar-atencion-btn',
    FINALIZAR_BTN: '.detener-atencion-btn',
    ACTIVAR_BAHIA_BTN: '.activar-bahia-btn',
    REANUDAR_BAHIA_BTN: '.reanudar-bahia-btn',
};