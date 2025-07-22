import Carousel from 'flowbite/lib/esm/components/carousel';

/**
 * Módulo para el carrusel de "Tops" del dashboard V2.
 * Muestra el TOP 5 de problemas, módulos y máquinas.
 * Intervalo de 5 segundos, con controles manuales y de pausa/play.
 */
const DashboardTopsModule = (function () {

    // --- ESTADO Y CONSTANTES PRIVADAS ---
    const API_ENDPOINT = '/dashboardV2/tops'; // Asegúrate que el endpoint es el correcto
    const CAROUSEL_INTERVAL = 5000; // Intervalo de 5 segundos

    const state = {
        isInitialized: false,
        container: null,
        carouselInstance: null,
        carouselIntervalId: null,
        isPaused: false,
    };

    // --- FUNCIONES DE UTILIDAD ---
    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    }
    
    // --- LÓGICA DE RENDERIZADO (CORREGIDA) ---
    // CAMBIO 2: Se ajusta la lógica de renderizado para mostrar el nombre y debajo el total.
    function renderTopCard(title, items, iconSvg, cardColor) {
        let content;
        if (!items || items.length === 0) {
            content = `<div class="col-span-5 flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No hay datos disponibles</div>`;
        } else {
            content = items.map(item => `
                <div class="flex flex-col items-center justify-center bg-transparent rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition text-sm py-1 px-1 h-full">
                    <span class="text-xs text-gray-600 dark:text-gray-300 text-center w-full" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span>
                    <span class="font-bold text-base text-gray-800 dark:text-gray-100">${escapeHtml(item.total)}</span>
                </div>
            `).join('');
        }
        
        return `
        <div class="flex flex-col items-center justify-between rounded-xl shadow-md border border-gray-200 dark:border-gray-700 ${cardColor} p-3 w-full max-w-none h-full min-h-[120px]">
            <div class="flex items-center justify-start mb-2 w-full">
                <span class="inline-block mr-2">${iconSvg}</span>
                <h2 class="text-sm font-bold text-gray-800 dark:text-gray-100 text-left">${escapeHtml(title)}</h2>
            </div>
            <div class="w-full grid grid-cols-5 gap-2">
                ${content}
            </div>
        </div>`;
    }

    // --- FUNCIÓN DE INICIALIZACIÓN (LAZY) ---
    async function fetchAndRenderTops(params = {}) {
        if (!state.container) return;

        // Muestra el estado de carga cada vez que se actualiza
        state.container.innerHTML = `<div class="flex justify-center items-center min-h-[120px] text-gray-400 animate-pulse">Actualizando Ranking...</div>`;

        // Limpia el intervalo anterior para evitar múltiples ciclos corriendo a la vez
        if (state.carouselIntervalId) clearInterval(state.carouselIntervalId);

        let topsData;
        try {
            // --- CAMBIO 2: Se añaden los parámetros a la URL de la API ---
            const urlParams = new URLSearchParams();
            if (params.month) {
                urlParams.append('month', params.month);
            }
            
            const fullUrl = `${API_ENDPOINT}?${urlParams.toString()}`;
            console.log(`TopsCarousel 🚀: Pidiendo datos a ${fullUrl}`);

            const headers = { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
            const res = await fetch(fullUrl, { headers });
            if (!res.ok) throw new Error(`La respuesta del servidor no fue OK: ${res.status}`);
            topsData = await res.json();

        } catch (e) {
            console.error("Tops Carousel: Falló la obtención de datos", e);
            state.container.innerHTML = `<div class="text-red-500 p-4 text-center">No se pudo cargar el ranking.</div>`;
            return;
        }

        // --- El resto de esta función es la lógica de renderizado que ya tenías ---
        const maquinasIcon = `<svg class="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 16v-2m8-8h2M4 12H2m15.364 6.364l1.414 1.414M4.222 4.222l1.414 1.414m12.728 0l-1.414 1.414M5.636 18.364l-1.414 1.414M12 18a6 6 0 100-12 6 6 0 000 12z" /></svg>`;
        const maquinas = (topsData.top_maquinas || []).slice(0, 5).map(m => ({ label: m.maquina, total: m.total }));

        const problemasIcon = `<svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
        const problemas = (topsData.top_problemas || []).slice(0, 5).map(p => ({ label: p.tipo_problema, total: p.total }));

        const modulosIcon = `<svg class="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>`;
        const modulos = (topsData.top_modulos || []).slice(0, 5).map(m => ({ label: m.modulo, total: m.total }));

        const tops = [
            { html: renderTopCard('Top 5 Máquinas con mas Fallas', maquinas, maquinasIcon, "bg-blue-50 dark:bg-blue-900") },
            { html: renderTopCard('Top 5 Problemas Recurrentes', problemas, problemasIcon, "bg-red-50 dark:bg-red-900") },
            { html: renderTopCard('Top 5 Módulos con mas Tickets', modulos, modulosIcon, "bg-emerald-50 dark:bg-emerald-900") }
        ];

        const carouselId = 'tops-v2-carousel';
        const itemIdPrefix = 'tops-v2-item-';
        state.container.innerHTML = `
            <div id="${carouselId}" class="relative w-full" data-carousel="slide">
                <div class="relative h-[130px] overflow-hidden rounded-lg w-full">
                    ${tops.map((top, idx) => `<div id="${itemIdPrefix}${idx}" class="hidden duration-700 ease-in-out w-full h-[120px]" data-carousel-item${idx === 0 ? '="active"' : ''}><div class="flex justify-center items-center h-full w-full">${top.html}</div></div>`).join('')}
                </div>
                <button type="button" class="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none" data-carousel-prev> <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-gray-900/30 group-hover:bg-white/50 dark:group-hover:bg-gray-700/60 group-focus:ring-2 group-focus:ring-white dark:group-focus:ring-gray-800/70"><svg class="w-3 h-3 text-gray-800 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/></svg></span></button>
                <button type="button" class="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none" data-carousel-next> <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-gray-900/30 group-hover:bg-white/50 dark:group-hover:bg-gray-700/60 group-focus:ring-2 group-focus:ring-white dark:group-focus:ring-gray-800/70"><svg class="w-3 h-3 text-gray-800 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/></svg></span></button>
                <button type="button" id="carousel-pause-btn" class="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center p-1 bg-gray-200 dark:bg-gray-700 rounded-full shadow-md text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"><span id="carousel-pause-icon" class="material-symbols-outlined" style="font-size: 16px;">pause</span></button>
            </div>`;

        setTimeout(() => {
            const carouselElement = document.getElementById(carouselId);
            if (!carouselElement) return;
            const items = tops.map((_, idx) => ({ position: idx, el: document.getElementById(`${itemIdPrefix}${idx}`) }));
            state.carouselInstance = new Carousel(carouselElement, items, { interval: CAROUSEL_INTERVAL }, { id: carouselId, override: true });
            const startAutoCycle = () => {
                clearInterval(state.carouselIntervalId);
                state.carouselIntervalId = setInterval(() => { if (state.carouselInstance) state.carouselInstance.next(); }, CAROUSEL_INTERVAL);
            };
            startAutoCycle();
            const pauseBtn = document.getElementById('carousel-pause-btn');
            const pauseIcon = document.getElementById('carousel-pause-icon');
            if (pauseBtn && pauseIcon) {
                pauseBtn.addEventListener('click', () => {
                    state.isPaused = !state.isPaused;
                    if (state.isPaused) {
                        clearInterval(state.carouselIntervalId);
                        pauseIcon.textContent = 'play_arrow';
                    } else {
                        startAutoCycle();
                        pauseIcon.textContent = 'pause';
                    }
                });
            }
        }, 0);
    }

    async function initializeComponent() {
        if (state.isInitialized) return;
        state.isInitialized = true;

        // --- CAMBIO 3: La función de inicialización ahora solo prepara y escucha ---
        
        // 1. Muestra un mensaje de carga inicial.
        state.container.innerHTML = `<div class="flex justify-center items-center min-h-[120px] text-gray-400 animate-pulse">Cargando Ranking...</div>`;

        // 2. Se suscribe al evento 'monthChanged'.
        window.addEventListener('monthChanged', (e) => {
            const selectedMonth = e.detail.month; // Mes en formato 1-12
            console.log(`TopsCarousel 👂: Recibido mes ${selectedMonth}`);
            fetchAndRenderTops({ month: selectedMonth });
        });

        // La carga inicial se disparará automáticamente cuando 'calendarSelects.js'
        // emita el primer evento al cargar la página.
    }

    // --- FUNCIÓN PÚBLICA DE INICIALIZACIÓN ---
    function init() {
        state.container = document.getElementById('dashboard-topsmeca');
        if (!state.container) return;
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    initializeComponent();
                    observerInstance.unobserve(state.container);
                }
            });
        }, { threshold: 0.1 });
        observer.observe(state.container);
    }

    return { init: init };
})();

// --- PUNTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', DashboardTopsModule.init);