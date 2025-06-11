import Carousel from 'flowbite/lib/esm/components/carousel';

/**
 * Módulo para el carrusel de "Tops" del dashboard.
 * Implementa Lazy Loading para no cargar hasta que el componente sea visible.
 */
const TopsCarouselModule = (function () {

    // --- ESTADO Y CONSTANTES PRIVADAS DEL MÓDULO ---
    const TOPS_STORAGE_KEY = 'dashboard_tops_data_v1';
    const TOPS_STORAGE_TTL = 5 * 60 * 1000; // 5 minutos

    const state = {
        isInitialized: false,
        container: null,
        topsData: null,
    };

    // --- FUNCIONES DE UTILIDAD ---
    function saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
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
        } catch (e) {
            return null;
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // --- LÓGICA DE RENDERIZADO ---
    function renderTop(title, items, iconSvg, cardColor = "bg-white dark:bg-gray-800") {
        return `
        <div class="flex flex-col items-center justify-center rounded-xl shadow-md border border-gray-200 dark:border-gray-700 ${cardColor} p-2 w-full max-w-none h-full min-h-[120px]">
            <div class="flex items-center justify-center mb-1">
                <span class="inline-block">${iconSvg}</span>
            </div>
            <h2 class="text-base font-bold text-gray-800 dark:text-gray-100 mb-1 text-center">${escapeHtml(title)}</h2>
            <div class="w-full grid grid-cols-3 gap-2">
                ${items.map(i => `
                    <div class="flex flex-col items-center justify-center bg-transparent rounded hover:bg-emerald-50 dark:hover:bg-gray-700 transition text-sm py-1">
                        <span class="text-gray-700 dark:text-gray-200 truncate text-center">${escapeHtml(i.label)} </br> ${escapeHtml(i.total)} </br></span>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    // --- FUNCIÓN DE INICIALIZACIÓN (LAZY) ---
    async function initializeComponent() {
        // Previene la reinicialización
        if (state.isInitialized) return;
        state.isInitialized = true;

        console.log("Tops Carousel: Component is visible, initializing...");
        state.container.innerHTML = `<div class="flex justify-center items-center min-h-[120px] text-gray-400 animate-pulse">Cargando...</div>`;

        // 1. Cargar datos (de caché o fetch)
        state.topsData = loadFromLocalStorage(TOPS_STORAGE_KEY, TOPS_STORAGE_TTL);
        if (!state.topsData) {
            try {
                const res = await fetch('/dashboard/tops', { credentials: 'same-origin' });
                if (!res.ok) throw new Error("Network response was not ok.");
                state.topsData = await res.json();
                saveToLocalStorage(TOPS_STORAGE_KEY, state.topsData);
            } catch (e) {
                console.error("Tops Carousel: Failed to fetch data", e);
                state.container.innerHTML = `<div class="text-red-500 p-4 text-center">No se pudo cargar el top.</div>`;
                return;
            }
        }

        // 2. Procesar datos para renderizar
        const maquinasIcon = `<svg class="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="currentColor" class="text-blue-100"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 8.6a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 15z"/></svg>`;
        const maquinas = (state.topsData.maquinas || []).map(m => ({ label: m.Maquina, total: m.total }));

        const problemasIcon = `<svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" class="text-red-100"/><path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
        const problemas = (state.topsData.problemas || []).map(p => ({ label: p.problema || p.Problema, total: p.total }));

        const modulosIcon = `<svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" class="text-emerald-100"/><path d="M4 9h16M9 4v16" stroke="currentColor" stroke-width="2"/></svg>`;
        const modulos = (state.topsData.modulos || []).map(m => ({ label: m.Modulo, total: m.total }));

        const tops = [
            { html: renderTop('Top 3 Máquinas con más problemas', maquinas, maquinasIcon, "bg-blue-50 dark:bg-blue-900") },
            { html: renderTop('Top 3 Problemas más recurrentes', problemas, problemasIcon, "bg-red-50 dark:bg-red-900") },
            { html: renderTop('Top 3 Módulos con más tickets', modulos, modulosIcon, "bg-emerald-50 dark:bg-emerald-900") }
        ];

        // 3. Renderizar el carrusel
        const carouselId = 'tops-carousel';
        const itemIdPrefix = 'tops-carousel-item-';

        state.container.innerHTML = `
            <div id="${carouselId}" class="relative w-full" data-carousel="slide">
                <div class="relative h-[120px] overflow-hidden rounded-lg w-full">
                    ${tops.map((top, idx) => `<div id="${itemIdPrefix}${idx}" class="hidden duration-700 ease-in-out w-full h-[120px]" data-carousel-item${idx === 0 ? '="active"' : ''}><div class="flex justify-center items-center h-full w-full">${top.html}</div></div>`).join('')}
                </div>
                <button type="button" id="carousel-prev-btn" class="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none" data-carousel-prev> <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-2 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none"><svg class="w-3 h-3 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/></svg><span class="sr-only">Previous</span></span> </button>
                <button type="button" id="carousel-next-btn" class="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none" data-carousel-next> <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-2 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none"><svg class="w-3 h-3 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/></svg><span class="sr-only">Next</span></span> </button>
                <button type="button" id="carousel-pause-btn" class="absolute top-1 right-1/2 translate-x-1/2 z-40 flex items-center justify-center px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full shadow text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-xs"><span id="carousel-pause-icon" class="material-symbols-outlined text-sm">pause</span></button>
            </div>`;

        // 4. Inicializar el carrusel de Flowbite
        setTimeout(() => {
            const carouselElement = document.getElementById(carouselId);
            if (!carouselElement) return;

            const items = tops.map((_, idx) => ({
                position: idx,
                el: document.getElementById(`${itemIdPrefix}${idx}`)
            }));
            const carousel = new Carousel(carouselElement, items, { interval: 10000 }, { id: carouselId, override: true });

            // Tu lógica de pausa/play personalizada
            let paused = false;
            let autoInterval = setInterval(() => carousel.next(), 10000);

            const pauseBtn = document.getElementById('carousel-pause-btn');
            const pauseIcon = document.getElementById('carousel-pause-icon');

            pauseBtn.addEventListener('click', () => {
                paused = !paused;
                if (paused) {
                    clearInterval(autoInterval);
                    pauseIcon.textContent = 'play_arrow';
                } else {
                    autoInterval = setInterval(() => carousel.next(), 10000);
                    pauseIcon.textContent = 'pause';
                }
            });
        }, 0);
    }

    // --- FUNCIÓN PÚBLICA DE INICIALIZACIÓN ---
    function init() {
        state.container = document.getElementById('dashboard-topsmeca');
        if (!state.container) return;

        // Configurar el "vigilante"
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Cargar el componente cuando es visible
                    initializeComponent();
                    // Dejar de vigilar para ahorrar recursos
                    observerInstance.unobserve(state.container);
                }
            });
        }, { threshold: 0.1 }); // Activar cuando el 10% del componente sea visible

        // Empezar a vigilar el contenedor
        observer.observe(state.container);
    }

    // Exponer el método público `init`
    return {
        init: init
    };
})();

// --- PUNTO DE ENTRADA ÚNICO ---
document.addEventListener('DOMContentLoaded', TopsCarouselModule.init);
