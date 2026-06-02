/**
 * Modulo de API para el sistema de chat V3.
 * Mantiene cache en memoria para que Select2 trabaje con datos locales despues
 * de la primera carga y evita rondas de red repetidas en el mismo flujo.
 */
export class ChatAPI {
    constructor() {
        this.baseURL = '/FormGuestV3';
        this.csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        this.cache = new Map();
        this.controllers = new Map();
    }

    normalizeTerm(value = '') {
        return String(value).trim().toLowerCase();
    }

    filterByText(items, search, selector) {
        const term = this.normalizeTerm(search);
        if (!term) return items;

        return items.filter((item) => selector(item).toLowerCase().includes(term));
    }

    async fetchJson(cacheKey, url, options = {}) {
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        if (this.controllers.has(cacheKey)) {
            this.controllers.get(cacheKey).abort();
        }

        const controller = new AbortController();
        this.controllers.set(cacheKey, controller);

        const request = fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            signal: controller.signal,
            ...options
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`Error HTTP ${response.status}`);
                }

                return response.json();
            })
            .catch((error) => {
                this.cache.delete(cacheKey);
                throw error;
            })
            .finally(() => {
                this.controllers.delete(cacheKey);
            });

        this.cache.set(cacheKey, request);
        return request;
    }

    async refreshCsrfToken() {
        try {
            const response = await fetch('/refresh-csrf');
            if (!response.ok) {
                if (response.status === 419) {
                    window.location.reload();
                    throw new Error('Sesion expirada');
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
            const modules = await this.fetchJson('modules', `${this.baseURL}/obtenerAreasModulos`);
            return this.filterByText(modules, search, (item) => item.modulo || '');
        } catch (error) {
            console.error('Error en getModules:', error);
            throw new Error('No se pudieron cargar los modulos. Intente nuevamente.');
        }
    }

    async getOperators(module, search = '') {
        try {
            const params = new URLSearchParams({ modulo: module });
            const operators = await this.fetchJson(
                `operators:${module}`,
                `${this.baseURL}/obtener-operarios?${params}`
            );

            return this.filterByText(
                operators,
                search,
                (item) => `${item.nombre || ''} ${item.num_operario || ''}`
            );
        } catch (error) {
            console.error('Error en getOperators:', error);
            throw new Error('No se pudieron cargar los operarios. Intente nuevamente.');
        }
    }

    async getProblemCatalog(search = '') {
        try {
            const problems = await this.fetchJson('problem-catalog', `${this.baseURL}/catalogo-problemas`);
            return this.filterByText(problems, search, (item) => `${item.nombre || ''} ${item.descripcion || ''}`);
        } catch (error) {
            console.error('Error en getProblemCatalog:', error);
            throw new Error('No se pudo cargar el catalogo de problemas. Intente nuevamente.');
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
            try {
                data = await response.clone().json();
            } catch (error) {
                data = await response.clone().text();
            }

            console.log('Respuesta del backend V3:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Error desconocido al enviar ticket');
            }

            return data;
        } catch (error) {
            console.error('Error en submitTicket:', error);
            throw error;
        }
    }

    async getModulesForFollowup(search = '') {
        try {
            const modules = await this.fetchJson('followup-modules', `${this.baseURL}/obtenerAreasModulosSeguimiento`);
            return this.filterByText(modules, search, (item) => item.modulo || '');
        } catch (error) {
            console.error('Error en getModulesForFollowup:', error);
            throw new Error('No se pudieron cargar los modulos para seguimiento.');
        }
    }
}

export const chatAPI = new ChatAPI();
