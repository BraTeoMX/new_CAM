/**
 * Utilidades para manipulación del DOM
 * @module utils/domHelpers
 */

/**
 * Obtiene un elemento del DOM por su ID con validación
 * @param {string} id - El ID del elemento
 * @returns {HTMLElement|null} El elemento o null si no existe
 */
export function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Elemento con ID "${id}" no encontrado`);
    }
    return element;
}

/**
 * Obtiene múltiples elementos del DOM por selector
 * @param {string} selector - El selector CSS
 * @returns {NodeList} Lista de elementos encontrados
 */
export function getElements(selector) {
    return document.querySelectorAll(selector);
}

/**
 * Muestra un elemento removiendo la clase 'hidden'
 * @param {HTMLElement} element - El elemento a mostrar
 */
export function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
    }
}

/**
 * Oculta un elemento agregando la clase 'hidden'
 * @param {HTMLElement} element - El elemento a ocultar
 */
export function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

/**
 * Establece el contenido de texto de un elemento
 * @param {HTMLElement} element - El elemento
 * @param {string} text - El texto a establecer
 */
export function setTextContent(element, text) {
    if (element) {
        element.textContent = text;
    }
}

/**
 * Obtiene el token CSRF de la meta etiqueta
 * @returns {string} El token CSRF
 */
export function getCsrfToken() {
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (!metaTag) {
        console.error('Token CSRF no encontrado en el documento');
        return '';
    }
    return metaTag.getAttribute('content');
}

/**
 * Detecta si el modo oscuro está activo
 * @returns {boolean} true si el modo oscuro está activo
 */
export function isDarkMode() {
    return document.documentElement.classList.contains('dark');
}

/**
 * Limpia el contenido HTML de un elemento
 * @param {HTMLElement} element - El elemento a limpiar
 */
export function clearElement(element) {
    if (element) {
        element.innerHTML = '';
    }
}

/**
 * Inserta HTML al final de un elemento
 * @param {HTMLElement} element - El elemento contenedor
 * @param {string} html - El HTML a insertar
 */
export function appendHTML(element, html) {
    if (element) {
        element.insertAdjacentHTML('beforeend', html);
    }
}

/**
 * Deshabilita un botón
 * @param {HTMLElement} button - El botón a deshabilitar
 */
export function disableButton(button) {
    if (button) {
        button.disabled = true;
    }
}

/**
 * Habilita un botón
 * @param {HTMLElement} button - El botón a habilitar
 */
export function enableButton(button) {
    if (button) {
        button.disabled = false;
    }
}

/**
 * Obtiene el valor de un parámetro de la URL
 * @param {string} param - El nombre del parámetro
 * @returns {string|null} El valor del parámetro o null
 */
export function getURLParameter(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}