/**
 * Módulo de API para el sistema de chat V3
 */
export class ChatAPI {
    constructor() {
        this.baseURL = '/FormGuestV3';
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    }

    async refreshCsrfToken() {
        try {
            const response = await fetch('/refresh-csrf');
            if (!response.ok) {
                if (response.status === 419) {
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
                }
                return data.csrf_token;
            }
        } catch (error) {
            console.error('Error al refrescar token CSRF:', error);
            throw error;
        }
    }

    async getModules(search = '') {
        try {
            const response = await fetch(`${this.baseURL}/obtenerAreasModulos`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`Error al cargar módulos: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error en getModules:', error);
            throw new Error('No se pudieron cargar los módulos. Intente nuevamente.');
        }
    }

    async getOperators(module, search = '') {
        try {
            const params = new URLSearchParams({ modulo: module, search: search });
            const response = await fetch(`${this.baseURL}/obtener-operarios?${params}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`Error al cargar operarios: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error en getOperators:', error);
            throw new Error('No se pudieron cargar los operarios. Intente nuevamente.');
        }
    }

    async getProblemCatalog() {
        try {
            const response = await fetch(`${this.baseURL}/catalogo-problemas`, {
                method: 'GET',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`Error al cargar catálogo de problemas: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error en getProblemCatalog:', error);
            throw new Error('No se pudo cargar el catálogo de problemas. Intente nuevamente.');
        }
    }

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

            let data;
            try { data = await response.clone().json(); } catch (e) { data = await response.clone().text(); }
            console.log('Respuesta del backend V3:', data);

            if (!response.ok) throw new Error(data.message || 'Error desconocido al enviar ticket');
            return data;
        } catch (error) {
            console.error('Error en submitTicket:', error);
            throw error;
        }
    }

    async getModulesForFollowup() {
        try {
            if (window.axios) {
                const response = await window.axios.get(`${this.baseURL}/obtenerAreasModulosSeguimiento`);
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
export const chatAPI = new ChatAPI();
