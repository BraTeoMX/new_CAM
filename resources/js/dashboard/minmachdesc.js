// --- GLOBAL ARRAYS Y CONSTANTES ---
const MINMACHDESC_STORAGE_KEY = 'minmachdesc_data_v1';
const MINMACHDESC_STORAGE_TTL = 5 * 60 * 1000; // 5 minutos

let minmachdescData = null;

// --- FUNCIONES DE UTILIDAD ---

/**
 * Guarda los datos en localStorage con timestamp.
 */
function saveToLocalStorage(key, data) {
    try {
        const payload = {
            data,
            ts: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
        // Si falla, no hacer nada (posible storage lleno o modo privado)
    }
}

/**
 * Carga los datos de localStorage si no están expirados.
 */
function loadFromLocalStorage(key, ttl) {
    try {
        const payload = JSON.parse(localStorage.getItem(key));
        if (!payload || !payload.ts || !payload.data) return null;
        if (Date.now() - payload.ts > ttl) return null;
        return payload.data;
    } catch (e) {
        return null;
    }
}

/**
 * Sanitiza texto para evitar XSS.
 */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Ordena un array por clave.
 */
function sortBy(arr, key, asc = true) {
    return arr.slice().sort((a, b) => {
        if (a[key] < b[key]) return asc ? -1 : 1;
        if (a[key] > b[key]) return asc ? 1 : -1;
        return 0;
    });
}

// --- RENDERIZADO DE UI ---

/**
 * Renderiza los tabs y su contenido.
 */
function renderTabs(container, data) {
    // Construir tabs
    let tabHeaders = `
    <div class="sm:hidden">
        <label for="tabs" class="sr-only">Selecciona pestaña</label>
        <select id="tabs" class="bg-indigo-600 border-0 border-b border-gray-200 text-white text-sm rounded-t-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-indigo-700 dark:border-indigo-800 dark:placeholder-white dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-800">
            <option value="global">Global</option>
            ${data.plantas.map((p, i) => {
                let icon = '';
                if (p.planta.toLowerCase().includes('ixtlahuaca')) icon = 'factory';
                else if (p.planta.toLowerCase().includes('san bartolo')) icon = 'apartment';
                else icon = 'location_on';
                return `<option value="planta${i}">${escapeHtml(p.planta)}</option>`;
            }).join('')}
        </select>
    </div>
    <ul class="hidden text-sm font-medium text-center divide-x divide-gray-200 rounded-lg sm:flex rtl:divide-x-reverse" id="fullWidthTab" data-tabs-toggle="#fullWidthTabContent" role="tablist">
        <li class="w-full">
            <button id="global-tab" data-tabs-target="#global" type="button" role="tab" aria-controls="global" aria-selected="true"
                class="inline-block w-full p-4 rounded-ss-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-white dark:focus:ring-indigo-900 font-medium transition">
                <span class="material-symbols-rounded align-middle text-lg mr-1">dashboard</span> Global
            </button>
        </li>
        ${data.plantas.map((p, i) => {
            let icon = '';
            if (p.planta.toLowerCase().includes('ixtlahuaca')) icon = 'factory';
            else if (p.planta.toLowerCase().includes('san bartolo')) icon = 'apartment';
            else icon = 'location_on';
            return `
            <li class="w-full">
                <button id="planta${i}-tab" data-tabs-target="#planta${i}" type="button" role="tab" aria-controls="planta${i}" aria-selected="false"
                    class="inline-block w-full p-4 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-white dark:focus:ring-indigo-900 font-medium transition">
                    <span class="material-symbols-rounded align-middle text-lg mr-1">${icon}</span> ${escapeHtml(p.planta)}
                </button>
            </li>
            `;
        }).join('')}
    </ul>
    `;

    // Global tab content
    let globalContent = `
    <div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800" id="global" role="tabpanel" aria-labelledby="global-tab">
        <dl class="flex flex-wrap justify-center items-stretch gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-blue-500 mb-1">timer</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${data.global.minutos}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Minutos Totales</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${data.global.tickets}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Tickets</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-outlined text-4xl text-purple-500 mb-1">function</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${data.global.promedio_min}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Promedio Min/Ticket</dd>
            </div>
        </dl>
        <div id="global-table"></div>
    </div>
    `;

    // Plantas tab content
    let plantasContent = data.plantas.map((p, i) => {
        let icon = '';
        if (p.planta.toLowerCase().includes('ixtlahuaca')) icon = 'factory';
        else if (p.planta.toLowerCase().includes('san bartolo')) icon = 'apartment';
        else icon = 'location_on';

        // Calcular promedio minutos por ticket para la planta
        let promedio = p.tickets > 0 ? Math.round((p.minutos / p.tickets) * 100) / 100 : 0;

        return `
    <div class="hidden p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800" id="planta${i}" role="tabpanel" aria-labelledby="planta${i}-tab">
        <dl class="flex flex-wrap justify-center items-stretch gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-blue-500 mb-1">${icon}</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${p.minutos}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Minutos Totales</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${p.tickets}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Tickets</dd>
            </div>
            <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]">
                <span class="material-symbols-outlined text-4xl text-purple-500 mb-1">function</span>
                <dt class="mb-2 text-3xl font-extrabold text-center">${promedio}</dt>
                <dd class="text-gray-500 dark:text-gray-400 text-center">Promedio Min/Ticket</dd>
            </div>
        </dl>
        <div id="planta${i}-table"></div>
    </div>
    `;
    }).join('');

    // Tabs content wrapper
    let tabContent = `
    <div id="fullWidthTabContent" class="border-t border-gray-200 dark:border-gray-600">
        ${globalContent}
        ${plantasContent}
    </div>
    `;

    // Render all
    container.innerHTML = `
        <div class="w-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            ${tabHeaders}
            ${tabContent}
        </div>
    `;
}

/**
 * Renderiza una tabla con paginación, búsqueda y ordenamiento.
 */
function renderTable(data, containerId, columns) {
    let state = {
        page: 1,
        perPage: 10,
        sortKey: columns[0].key,
        sortAsc: true,
        search: '',
        fontSize: 14, // px, tamaño base
    };

    const container = document.getElementById(containerId);
    if (!container) return;

    // Detecta el tema actual
    function isDarkMode() {
        return document.documentElement.classList.contains('dark');
    }

    // Observa cambios de tema y vuelve a renderizar la tabla si cambia
    if (!container._themeObserver) {
        const observer = new MutationObserver(() => render());
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        container._themeObserver = observer;
    }

    function filterData() {
        let filtered = data;
        if (state.search) {
            const s = state.search.toLowerCase();
            filtered = filtered.filter(row =>
                columns.some(col => (row[col.key] + '').toLowerCase().includes(s))
            );
        }
        return filtered;
    }

    function render() {
        let filtered = filterData();
        let sorted = sortBy(filtered, state.sortKey, state.sortAsc);
        let totalPages = Math.ceil(sorted.length / state.perPage);
        let page = Math.max(1, Math.min(state.page, totalPages || 1));
        let start = (page - 1) * state.perPage;
        let pageData = sorted.slice(start, start + state.perPage);

        // Botones de tamaño de letra
        let fontBtns = `
        <div class="flex gap-2 items-center mb-2">
            <button type="button" class="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none" id="${containerId}-font-inc" title="Aumentar tamaño de letra">
                <span class="material-symbols-rounded align-middle">zoom_in</span>
            </button>
            <button type="button" class="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none" id="${containerId}-font-dec" title="Reducir tamaño de letra">
                <span class="material-symbols-rounded align-middle">zoom_out</span>
            </button>
        </div>
        `;

        // Buscador
        let html = `
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
            <div class="flex-1">${fontBtns}</div>
            <input type="text" autocomplete="off" placeholder="Buscar..." class="w-full sm:w-64 px-3 py-2 border rounded focus:ring focus:ring-indigo-200 dark:bg-gray-900 dark:text-white" id="${containerId}-search" value="${state.search}">
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                Mostrando ${pageData.length} de ${filtered.length} resultados
            </div>
        </div>
        <div class="overflow-x-auto">
        <table class="min-w-full rounded-lg overflow-hidden border"
            style="font-size: ${state.fontSize}px;">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    ${columns.map(col => `
                        <th scope="col" class="px-4 py-3 cursor-pointer select-none group" data-sort="${col.key}">
                            <span>${col.label}</span>
                            <span class="inline-block align-middle ml-1 text-xs ${state.sortKey === col.key ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}">
                                ${state.sortKey === col.key ? (state.sortAsc ? '▲' : '▼') : ''}
                            </span>
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody class="transition">
                ${pageData.map(row => `
                    <tr>
                        ${columns.map(col => `
                            <td class="px-4 py-2 ${isDarkMode() ? 'text-white' : 'text-black'}">
                                ${escapeHtml(row[col.key] ?? '')}
                            </td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
        <div class="flex justify-between items-center mt-2">
            <button class="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50" ${page === 1 ? 'disabled' : ''} id="${containerId}-prev">Anterior</button>
            <span class="text-xs text-gray-500 dark:text-gray-400">Página ${page} de ${totalPages || 1}</span>
            <button class="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50" ${page === totalPages || totalPages === 0 ? 'disabled' : ''} id="${containerId}-next">Siguiente</button>
        </div>
        `;

        container.innerHTML = html;

        // Eventos
        container.querySelectorAll('th[data-sort]').forEach(th => {
            th.onclick = () => {
                const key = th.getAttribute('data-sort');
                if (state.sortKey === key) state.sortAsc = !state.sortAsc;
                else {
                    state.sortKey = key;
                    state.sortAsc = true;
                }
                render();
            };
        });
        // Buscador
        const searchInput = container.querySelector(`#${containerId}-search`);
        searchInput.addEventListener('input', e => {
            state.search = e.target.value;
            state.page = 1;
            render();
            setTimeout(() => {
                const newInput = container.querySelector(`#${containerId}-search`);
                if (newInput) newInput.focus();
                if (newInput && typeof newInput.selectionStart === 'number') {
                    newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
                }
            }, 0);
        });
        // Paginación
        container.querySelector(`#${containerId}-prev`).onclick = () => {
            if (state.page > 1) {
                state.page--;
                render();
            }
        };
        container.querySelector(`#${containerId}-next`).onclick = () => {
            if (state.page < totalPages) {
                state.page++;
                render();
            }
        };
        // Font size
        container.querySelector(`#${containerId}-font-inc`).onclick = () => {
            state.fontSize = Math.min(state.fontSize + 2, 32);
            render();
        };
        container.querySelector(`#${containerId}-font-dec`).onclick = () => {
            state.fontSize = Math.max(state.fontSize - 2, 10);
            render();
        };
    }

    render();
}

// --- LOGICA PRINCIPAL ---

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.querySelector('#minmachdesc-tabs-container');
    if (!container) return;

    // Loader rápido
    container.innerHTML = '<div class="minmachdesc-tabs-loader min-h-[280px] flex items-center justify-center"><div class="animate-pulse text-gray-400">Cargando...</div></div>';

    // 1. Intenta cargar de localStorage
    minmachdescData = loadFromLocalStorage(MINMACHDESC_STORAGE_KEY, MINMACHDESC_STORAGE_TTL);

    // 2. Si no hay datos o están expirados, pide al backend
    let fetched = false;
    if (!minmachdescData) {
        try {
            const resp = await fetch('/dashboard/minmachdesc', { credentials: 'same-origin' });
            if (!resp.ok) throw new Error('Error de red');
            minmachdescData = await resp.json();
            saveToLocalStorage(MINMACHDESC_STORAGE_KEY, minmachdescData);
            fetched = true;
        } catch (e) {
            container.innerHTML = '<div class="text-red-500">Error al cargar datos</div>';
            return;
        }
    }

    // 3. Renderiza tabs y contenido
    renderTabs(container, minmachdescData);

    // 4. Renderiza tablas
    renderTable(
        minmachdescData.global.detalle,
        'global-table',
        [
            { key: 'planta', label: 'Planta' },
            { key: 'modulo', label: 'Módulo' },
            { key: 'folio', label: 'Folio' },
            { key: 'supervisor', label: 'Supervisor' },
            { key: 'operario', label: 'Operario' },
            { key: 'mecanicos', label: 'Mecanicos' },
            { key: 'minutos', label: 'Minutos' },
        ]
    );
    minmachdescData.plantas.forEach((p, i) => {
        renderTable(
            p.detalle,
            `planta${i}-table`,
            [
            { key: 'modulo', label: 'Módulo' },
            { key: 'folio', label: 'Folio' },
            { key: 'supervisor', label: 'Supervisor' },
            { key: 'operario', label: 'Operario' },
            { key: 'mecanicos', label: 'Mecanicos' },
            { key: 'minutos', label: 'Minutos' },
            ]
        );
    });

    // 5. Tabs JS (igual que antes)
    // Flowbite tabs JS (simple manual toggle)
    function activateTab(tabId) {
        // Hide all tab panels
        container.querySelectorAll('[role="tabpanel"]').forEach(el => el.classList.add('hidden'));
        // Reset all tabs
        container.querySelectorAll('[role="tab"]').forEach(el => {
            el.setAttribute('aria-selected', 'false');
            el.classList.remove(
                'bg-indigo-800', 'dark:bg-indigo-900', 'text-white', 'font-bold'
            );
            el.classList.add(
                'bg-indigo-600', 'dark:bg-indigo-700', 'text-white'
            );
        });
        // Show selected tab panel
        const tabBtn = container.querySelector(`[data-tabs-target="#${tabId}"]`);
        const tabPanel = container.querySelector(`#${tabId}`);
        if (tabBtn) {
            tabBtn.setAttribute('aria-selected', 'true');
            tabBtn.classList.remove('bg-indigo-600', 'dark:bg-indigo-700');
            tabBtn.classList.add('bg-indigo-800', 'dark:bg-indigo-900', 'font-bold', 'text-white');
        }
        if (tabPanel) tabPanel.classList.remove('hidden');
    }
    // Desktop
    container.querySelectorAll('[role="tab"]').forEach(btn => {
        btn.addEventListener('click', e => {
            activateTab(btn.getAttribute('data-tabs-target').replace('#', ''));
        });
    });
    // Mobile
    const select = container.querySelector('#tabs');
    if (select) {
        select.addEventListener('change', e => {
            activateTab(e.target.value);
        });
    }
    // Activar global por default
    activateTab('global');
});