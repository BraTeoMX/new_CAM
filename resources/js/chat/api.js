/**
 * Módulo de API para el sistema de chat
 * Centraliza todas las llamadas al backend con manejo de errores consistente
 */
export class ChatAPI {
    constructor() {
        this.baseURL = '/FormGuestV2';
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    }

    /**
     * Actualiza el token CSRF desde el servidor
     * @returns {Promise<string>} Token CSRF actualizado
     */
    async refreshCsrfToken() {
        try {
            const response = await fetch('/refresh-csrf');
            if (!response.ok) {
                if (response.status === 419) {
                    // Sesión expirada, recargar página
                    window.location.reload();
                    throw new Error('Sesión expirada');
                }
                throw new Error('Error al refrescar token CSRF');
            }
            const data = await response.json();
            if (data.csrf_token) {
                const metaTag = document.querySelector('meta[name="csrf-token"]');
                if (metaTag) {
                    metaTag.content = data.csrf_token;
                    this.csrfToken = data.csrf_token;
                    console.log('Token CSRF actualizado con éxito.');
                }
                return data.csrf_token;
            }
        } catch (error) {
            console.error('Error al refrescar token CSRF:', error);
            throw error;
        }
    }

    /**
     * Obtiene la lista de módulos/áreas disponibles
     * @param {string} search - Término de búsqueda opcional
     * @returns {Promise<Array>} Lista de módulos
     */
    async getModules(search = '') {
        try {
            const response = await fetch(`${this.baseURL}/obtenerAreasModulos`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al cargar módulos: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error en getModules:', error);
            throw new Error('No se pudieron cargar los módulos. Intente nuevamente.');
        }
    }

    /**
     * Obtiene la lista de operarios para un módulo específico
     * @param {string} module - Nombre del módulo
     * @param {string} search - Término de búsqueda opcional
     * @returns {Promise<Array>} Lista de operarios
     */
    async getOperators(module, search = '') {
        try {
            const params = new URLSearchParams({
                modulo: module,
                search: search
            });

            const response = await fetch(`${this.baseURL}/obtener-operarios?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al cargar operarios: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error en getOperators:', error);
            throw new Error('No se pudieron cargar los operarios. Intente nuevamente.');
        }
    }

    /**
     * Obtiene el catálogo completo de problemas
     * @returns {Promise<Array>} Lista de problemas
     */
    async getProblemCatalog() {
        try {
            const response = await fetch(`${this.baseURL}/catalogo-problemas`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al cargar catálogo de problemas: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error en getProblemCatalog:', error);
            throw new Error('No se pudo cargar el catálogo de problemas. Intente nuevamente.');
        }
    }

    /**
     * Envía un ticket al backend
     * @param {object} formData - Datos del formulario del ticket
     * @returns {Promise<object>} Respuesta del servidor
     */
    async submitTicket(formData) {
        try {
            const response = await fetch(`${this.baseURL}/ticketsOT`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': this.csrfToken
                },
                body: JSON.stringify(formData)
            });

            // Loguear respuesta para debugging
            let data;
            try {
                data = await response.clone().json();
            } catch (e) {
                data = await response.clone().text();
            }
            console.log('Respuesta del backend:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error desconocido al enviar ticket');
            }

            return data;
        } catch (error) {
            console.error('Error en submitTicket:', error);
            throw error;
        }
    }

    /**
     * Obtiene módulos para seguimiento (usando axios por compatibilidad)
     * @returns {Promise<Array>} Lista de módulos para seguimiento
     */
    async getModulesForFollowup() {
        try {
            // Usar axios si está disponible, sino fallback a fetch
            if (window.axios) {
                const response = await window.axios.get(`${this.baseURL}/obtenerAreasModulos`);
                return response.data;
            } else {
                return await this.getModules();
            }
        } catch (error) {
            console.error('Error en getModulesForFollowup:', error);
            throw new Error('No se pudieron cargar los módulos para seguimiento.');
        }
    }
}

// Instancia singleton de la API
export const chatAPI = new ChatAPI();