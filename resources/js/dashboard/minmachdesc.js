/**
 * Módulo para el dashboard de Minutos por Maquina y Descanso.
 * Implementa Lazy Loading y una estructura de renderizado más eficiente.
 * Versión con el foco del buscador corregido.
 */
const MinMachDescModule = (function () {

    // --- ESTADO Y CONSTANTES PRIVADAS DEL MÓDULO ---
    const STORAGE_KEY = 'minmachdesc_data_v1';
    const STORAGE_TTL = 5 * 60 * 1000; // 5 minutos

    let state = {
        isInitialized: false,
        data: null,
        container: null
    };

    // --- FUNCIONES DE UTILIDAD (PRIVADAS) ---

    function saveToLocalStorage(key, data) {
        try {
            const payload = { data, ts: Date.now() };
            localStorage.setItem(key, JSON.stringify(payload));
        } catch (e) {
            console.warn("Could not save to localStorage:", e);
        }
    }

    function loadFromLocalStorage(key, ttl) {
        try {
            const payload = JSON.parse(localStorage.getItem(key));
            if (!payload || !payload.ts || !payload.data) return null;
            if (Date.now() - payload.ts > ttl) {
                localStorage.removeItem(key);
                return null;
            }
            return payload.data;
        } catch (e) { return null; }
    }

    function escapeHtml(str) {
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }

    function sortBy(arr, key, asc = true) {
        return arr.slice().sort((a, b) => {
            const valA = a[key] ?? '';
            const valB = b[key] ?? '';
            if (valA < valB) return asc ? -1 : 1;
            if (valA > valB) return asc ? 1 : -1;
            return 0;
        });
    }

    // --- RENDERIZADO DE UI (PRIVADAS) ---

    function renderTabs(data) {
        let tabHeaders = `
        <div class="sm:hidden">
            <label for="tabs" class="sr-only">Selecciona pestaña</label>
            <select id="tabs" class="bg-indigo-600 border-0 border-b border-gray-200 text-white text-sm rounded-t-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-indigo-700 dark:border-indigo-800 dark:placeholder-white dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-800">
                <option value="global">Global</option>
                ${data.plantas.map((p, i) => `<option value="planta${i}">${escapeHtml(p.planta)}</option>`).join('')}
            </select>
        </div>
        <ul class="hidden text-sm font-medium text-center divide-x divide-gray-200 rounded-lg sm:flex rtl:divide-x-reverse" id="fullWidthTab" role="tablist">
            <li class="w-full">
                <button id="global-tab" data-tabs-target="#global" type="button" role="tab" aria-controls="global" aria-selected="true" class="inline-block w-full p-4 rounded-ss-lg bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-white dark:focus:ring-indigo-900 font-medium transition">
                    <span class="material-symbols-rounded align-middle text-lg mr-1">dashboard</span> Global
                </button>
            </li>
            ${data.plantas.map((p, i) => {
                let icon = p.planta.toLowerCase().includes('ixtlahuaca') ? 'factory' : (p.planta.toLowerCase().includes('san bartolo') ? 'apartment' : 'location_on');
                return `
                <li class="w-full">
                    <button id="planta${i}-tab" data-tabs-target="#planta${i}" type="button" role="tab" aria-controls="planta${i}" aria-selected="false" class="inline-block w-full p-4 bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:text-white dark:focus:ring-indigo-900 font-medium transition">
                        <span class="material-symbols-rounded align-middle text-lg mr-1">${icon}</span> ${escapeHtml(p.planta)}
                    </button>
                </li>`;
            }).join('')}
        </ul>`;

        let globalContent = `
        <div class="p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800" id="global" role="tabpanel" aria-labelledby="global-tab">
            <dl class="flex flex-wrap justify-center items-stretch gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
                <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]"><span class="material-symbols-rounded text-4xl text-blue-500 mb-1">timer</span><dt class="mb-2 text-3xl font-extrabold text-center">${data.global.minutos}</dt><dd class="text-gray-500 dark:text-gray-400 text-center">Minutos Totales</dd></div>
                <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]"><span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span><dt class="mb-2 text-3xl font-extrabold text-center">${data.global.tickets}</dt><dd class="text-gray-500 dark:text-gray-400 text-center">Tickets</dd></div>
                <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]"><span class="material-symbols-outlined text-4xl text-purple-500 mb-1">function</span><dt class="mb-2 text-3xl font-extrabold text-center">${data.global.promedio_min}</dt><dd class="text-gray-500 dark:text-gray-400 text-center">Promedio Min/Ticket</dd></div>
            </dl>
            <div id="global-table"></div>
        </div>`;

        let plantasContent = data.plantas.map((p, i) => {
            let icon = p.planta.toLowerCase().includes('ixtlahuaca') ? 'factory' : (p.planta.toLowerCase().includes('san bartolo') ? 'apartment' : 'location_on');
            let promedio = p.tickets > 0 ? Math.round((p.minutos / p.tickets) * 100) / 100 : 0;
            return `
            <div class="hidden p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800" id="planta${i}" role="tabpanel" aria-labelledby="planta${i}-tab">
                <dl class="flex flex-wrap justify-center items-stretch gap-8 p-4 mx-auto text-gray-900 dark:text-white sm:p-8">
                    <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]"><span class="material-symbols-rounded text-4xl text-blue-500 mb-1">${icon}</span><dt class="mb-2 text-3xl font-extrabold text-center">${p.minutos}</dt><dd class="text-gray-500 dark:text-gray-400 text-center">Minutos Totales</dd></div>
                    <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]"><span class="material-symbols-rounded text-4xl text-green-500 mb-1">confirmation_number</span><dt class="mb-2 text-3xl font-extrabold text-center">${p.tickets}</dt><dd class="text-gray-500 dark:text-gray-400 text-center">Tickets</dd></div>
                    <div class="flex flex-col items-center justify-center flex-1 min-w-[180px]"><span class="material-symbols-outlined text-4xl text-purple-500 mb-1">function</span><dt class="mb-2 text-3xl font-extrabold text-center">${promedio}</dt><dd class="text-gray-500 dark:text-gray-400 text-center">Promedio Min/Ticket</dd></div>
                </dl>
                <div id="planta${i}-table"></div>
            </div>`;
        }).join('');

        let tabContent = `<div id="fullWidthTabContent" class="border-t border-gray-200 dark:border-gray-600">${globalContent}${plantasContent}</div>`;
        state.container.innerHTML = `<div class="w-full bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">${tabHeaders}${tabContent}</div>`;
    }

    function renderTable(data, containerId, columns) {
        let tableState = {
            page: 1, perPage: 10, sortKey: columns[0].key,
            sortAsc: true, search: '', fontSize: 14,
        };
        const container = document.getElementById(containerId);
        if (!container) return;

        function isDarkMode() { return document.documentElement.classList.contains('dark'); }
        if (!container._themeObserver) {
            const observer = new MutationObserver(() => render());
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
            container._themeObserver = observer;
        }

        function filterData() {
            let filtered = data;
            if (tableState.search) {
                const s = tableState.search.toLowerCase();
                filtered = filtered.filter(row => columns.some(col => (row[col.key] + '').toLowerCase().includes(s)));
            }
            return filtered;
        }

        function render() {
            let filtered = filterData();
            let sorted = sortBy(filtered, tableState.sortKey, tableState.sortAsc);
            let totalPages = Math.ceil(sorted.length / tableState.perPage);
            let page = Math.max(1, Math.min(tableState.page, totalPages || 1));
            let start = (page - 1) * tableState.perPage;
            let pageData = sorted.slice(start, start + tableState.perPage);

            container.innerHTML = `
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <div class="flex-1"><div class="flex gap-2 items-center mb-2">
                    <button type="button" class="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none" id="${containerId}-font-inc" title="Aumentar tamaño"><span class="material-symbols-rounded align-middle">zoom_in</span></button>
                    <button type="button" class="px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none" id="${containerId}-font-dec" title="Reducir tamaño"><span class="material-symbols-rounded align-middle">zoom_out</span></button>
                </div></div>
                <input type="text" autocomplete="off" placeholder="Buscar..." class="w-full sm:w-64 px-3 py-2 border rounded focus:ring focus:ring-indigo-200 dark:bg-gray-900 dark:text-white" id="${containerId}-search" value="${escapeHtml(tableState.search)}">
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">Mostrando ${pageData.length} de ${filtered.length}</div>
            </div>
            <div class="overflow-x-auto"><table class="min-w-full rounded-lg overflow-hidden border" style="font-size: ${tableState.fontSize}px;">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr>
                    ${columns.map(col => `<th scope="col" class="px-4 py-3 cursor-pointer select-none group" data-sort="${col.key}"><span>${col.label}</span><span class="inline-block align-middle ml-1 text-xs ${tableState.sortKey === col.key ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}">${tableState.sortKey === col.key ? (tableState.sortAsc ? '▲' : '▼') : ''}</span></th>`).join('')}
                </tr></thead>
                <tbody class="transition">
                    ${pageData.map(row => `<tr>${columns.map(col => `<td class="px-4 py-2 ${isDarkMode() ? 'text-white' : 'text-black'}">${escapeHtml(row[col.key] ?? '')}</td>`).join('')}</tr>`).join('')}
                </tbody>
            </table></div>
            <div class="flex justify-between items-center mt-2">
                <button class="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50" ${page === 1 ? 'disabled' : ''} id="${containerId}-prev">Anterior</button>
                <span class="text-xs text-gray-500 dark:text-gray-400">Página ${page} de ${totalPages || 1}</span>
                <button class="px-3 py-1 rounded bg-indigo-600 text-white disabled:opacity-50" ${page === totalPages || totalPages === 0 ? 'disabled' : ''} id="${containerId}-next">Siguiente</button>
            </div>`;

            // --- LA CORRECCIÓN CLAVE ESTÁ AQUÍ ---
            const searchInput = container.querySelector(`#${containerId}-search`);
            searchInput.addEventListener('input', e => {
                tableState.search = e.target.value;
                tableState.page = 1;
                render();

                // Este bloque se asegura de que el foco y el cursor vuelvan al input después de redibujar
                setTimeout(() => {
                    const newInput = container.querySelector(`#${containerId}-search`);
                    if (newInput) {
                        newInput.focus();
                        // Mueve el cursor al final del texto escrito
                        newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
                    }
                }, 0);
            });
            // --- FIN DE LA CORRECCIÓN ---

            container.querySelector(`#${containerId}-prev`).onclick = () => { if (tableState.page > 1) { tableState.page--; render(); } };
            container.querySelector(`#${containerId}-next`).onclick = () => { if (tableState.page < totalPages) { tableState.page++; render(); } };
            container.querySelector(`#${containerId}-font-inc`).onclick = () => { tableState.fontSize = Math.min(tableState.fontSize + 2, 32); render(); };
            container.querySelector(`#${containerId}-font-dec`).onclick = () => { tableState.fontSize = Math.max(tableState.fontSize - 2, 10); render(); };
            container.querySelectorAll('th[data-sort]').forEach(th => {
                th.onclick = (e) => {
                    const key = e.currentTarget.getAttribute('data-sort');
                    if (tableState.sortKey === key) tableState.sortAsc = !tableState.sortAsc;
                    else { tableState.sortKey = key; tableState.sortAsc = true; }
                    render();
                };
            });
        }
        render();
    }

    // --- LÓGICA DE INICIALIZACIÓN (LAZY) ---

    async function initializeComponent() {
        if (state.isInitialized) return;
        state.isInitialized = true;
        state.container.innerHTML = '<div class="min-h-[280px] flex items-center justify-center"><div class="animate-pulse text-gray-400">Cargando Módulo...</div></div>';

        let data = loadFromLocalStorage(STORAGE_KEY, STORAGE_TTL);
        if (!data) {
            try {
                const resp = await fetch('/dashboard/minmachdesc', { credentials: 'same-origin' });
                if (!resp.ok) throw new Error('Error de red');
                data = await resp.json();
                saveToLocalStorage(STORAGE_KEY, data);
            } catch (e) {
                state.container.innerHTML = '<div class="p-4 text-red-500 text-center">Error al cargar los datos del módulo.</div>';
                return;
            }
        }
        state.data = data;

        renderTabs(state.data);
        renderTable(state.data.global.detalle, 'global-table', [{ key: 'planta', label: 'Planta' }, { key: 'modulo', label: 'Módulo' }, { key: 'folio', label: 'Folio' }, { key: 'supervisor', label: 'Supervisor' }, { key: 'operario', label: 'Operario' }, { key: 'mecanicos', label: 'Mecanicos' }, { key: 'minutos', label: 'Minutos' }]);
        state.data.plantas.forEach((p, i) => renderTable(p.detalle, `planta${i}-table`, [{ key: 'modulo', label: 'Módulo' }, { key: 'folio', label: 'Folio' }, { key: 'supervisor', label: 'Supervisor' }, { key: 'operario', label: 'Operario' }, { key: 'mecanicos', label: 'Mecanicos' }, { key: 'minutos', label: 'Minutos' }]));

        function activateTab(tabId) {
            state.container.querySelectorAll('[role="tabpanel"]').forEach(el => el.classList.add('hidden'));
            state.container.querySelectorAll('[role="tab"]').forEach(el => {
                el.setAttribute('aria-selected', 'false');
                el.classList.remove('bg-indigo-800', 'font-bold');
            });
            const tabBtn = state.container.querySelector(`[data-tabs-target="#${tabId}"]`);
            const tabPanel = state.container.querySelector(`#${tabId}`);
            if (tabBtn) {
                tabBtn.setAttribute('aria-selected', 'true');
                tabBtn.classList.add('bg-indigo-800', 'font-bold');
            }
            if (tabPanel) tabPanel.classList.remove('hidden');
        }
        state.container.querySelectorAll('[role="tab"]').forEach(btn => btn.addEventListener('click', e => activateTab(btn.getAttribute('data-tabs-target').replace('#', ''))));
        const select = state.container.querySelector('#tabs');
        if (select) select.addEventListener('change', e => activateTab(e.target.value));
        activateTab('global');
    }

    // --- FUNCIÓN PÚBLICA DE INICIALIZACIÓN ---
    function init() {
        state.container = document.getElementById("minmachdesc-tabs-container");
        if (!state.container) return;
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initializeComponent();
                    observerInstance.unobserve(state.container);
                }
            });
        }, { threshold: 0.05 });
        observer.observe(state.container);
    }

    return {
        init: init
    };
})();

// --- PUNTO DE ENTRADA ÚNICO ---
// No olvides exportar el módulo si lo usas en un sistema de import/export
// export default MinMachDescModule;
document.addEventListener('DOMContentLoaded', MinMachDescModule.init);
