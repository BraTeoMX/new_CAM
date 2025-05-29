import { Carousel } from 'flowbite';

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('dashboard-topsmeca');
    if (!container) return;

    // Mostrar loading
    container.innerHTML = `<div class="flex justify-center items-center min-h-[120px] text-gray-400">Cargando...</div>`;

    try {
        const res = await fetch('/dashboard/tops');
        const data = await res.json();

        function renderTop(title, items, iconSvg, cardColor = "bg-white dark:bg-gray-800") {
            // Cambia min-h-[270px] por min-h-[80px] y ajusta paddings para hacerlo tipo banner/cintilla
            return `
                <div class="flex flex-col items-center justify-center rounded-xl shadow-md border border-gray-200 dark:border-gray-700 ${cardColor} p-2 w-full max-w-none h-full min-h-[120px]">
                    <div class="flex items-center justify-center mb-1">
                        <span class="inline-block">${iconSvg}</span>
                    </div>
                    <h2 class="text-base font-bold text-gray-800 dark:text-gray-100 mb-1 text-center">${title}</h2>
                    <div class="w-full grid grid-cols-3 gap-2">
                        ${items.map(i => `
                            <div class="flex flex-col items-center justify-center bg-transparent rounded hover:bg-emerald-50 dark:hover:bg-gray-700 transition text-sm py-1">
                                <span class="text-gray-700 dark:text-gray-200 truncate text-center">${i.label} </br> ${i.total} </br></span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Top máquinas - SVG de engranaje/máquina
        const maquinasIcon = `
            <svg class="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="currentColor" class="text-blue-100"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 8.6a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 15z"/>
            </svg>
        `;
        const maquinas = (data.maquinas || []).map(m => ({ label: m.Maquina, total: m.total }));

        // Top problemas
        const problemasIcon = `<svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" class="text-red-100"/><path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
        const problemas = (data.problemas || []).map(p => ({
            label: p.problema || p.Problema,
            total: p.total
        }));

        // Top módulos
        const modulosIcon = `<svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" class="text-emerald-100"/><path d="M4 9h16M9 4v16" stroke="currentColor" stroke-width="2"/></svg>`;
        const modulos = (data.modulos || []).map(m => ({ label: m.Modulo, total: m.total }));

        // Crear los tops
        const tops = [
            {
                html: renderTop('Top 3 Máquinas con más problemas', maquinas, maquinasIcon, "bg-blue-50 dark:bg-blue-900")
            },
            {
                html: renderTop('Top 3 Problemas más recurrentes', problemas, problemasIcon, "bg-red-50 dark:bg-red-900")
            },
            {
                html: renderTop('Top 3 Módulos con más tickets', modulos, modulosIcon, "bg-emerald-50 dark:bg-emerald-900")
            }
        ];

        // IDs para los elementos del carrusel
        const carouselId = 'tops-carousel';
        const indicatorIdPrefix = 'tops-carousel-indicator-';
        const itemIdPrefix = 'tops-carousel-item-';

        // Renderizar el carrusel de Flowbite con todos los elementos y controles
        container.innerHTML = `
            <div id="${carouselId}" class="relative w-full" data-carousel="slide">
                <div class="relative h-[120px] overflow-hidden rounded-lg w-full">
                    ${tops.map((top, idx) => `
                        <div id="${itemIdPrefix}${idx}" class="hidden duration-700 ease-in-out w-full h-[120px]" data-carousel-item${idx === 0 ? '="active"' : ''}>
                            <div class="flex justify-center items-center h-full w-full">${top.html}</div>
                        </div>
                    `).join('')}
                </div>
                <!-- Indicadores eliminados -->
                <button type="button" id="carousel-prev-btn" class="absolute top-0 start-0 z-30 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none" data-carousel-prev>
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-2 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                        <svg class="w-3 h-3 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
                        </svg>
                        <span class="sr-only">Previous</span>
                    </span>
                </button>
                <button type="button" id="carousel-next-btn" class="absolute top-0 end-0 z-30 flex items-center justify-center h-full px-2 cursor-pointer group focus:outline-none" data-carousel-next>
                    <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-2 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none">
                        <svg class="w-3 h-3 text-white dark:text-gray-800 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                        </svg>
                        <span class="sr-only">Next</span>
                    </span>
                </button>
                <button type="button" id="carousel-pause-btn" class="absolute top-1 right-1/2 translate-x-1/2 z-40 flex items-center justify-center px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full shadow text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-xs">
                    <span id="carousel-pause-icon" class="material-symbols-outlined">pause</span>
                </button>
            </div>
        `;

        // Esperar a que los elementos existan en el DOM antes de inicializar
        setTimeout(() => {
            const carouselElement = document.getElementById(carouselId);

            const items = tops.map((_, idx) => ({
                position: idx,
                el: document.getElementById(`${itemIdPrefix}${idx}`)
            }));

            const options = {
                defaultPosition: 0,
                interval: 10000,
                onNext: () => {},
                onPrev: () => {},
                onChange: () => {},
            };

            const instanceOptions = {
                id: carouselId,
                override: true
            };

            // Instanciar el carrusel
            const carousel = new Carousel(carouselElement, items, options, instanceOptions);

            // Botón de pausa/play
            let paused = false;
            const pauseBtn = document.getElementById('carousel-pause-btn');
            const pauseIcon = document.getElementById('carousel-pause-icon');
            let intervalId = setInterval(() => carousel.next(), options.interval);

            function startAuto() {
                if (!intervalId) {
                    intervalId = setInterval(() => carousel.next(), options.interval);
                }
            }
            function stopAuto() {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }

            pauseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (paused) {
                    startAuto();
                    pauseIcon.textContent = 'pause';
                } else {
                    stopAuto();
                    pauseIcon.textContent = 'play_arrow';
                }
                paused = !paused;
            });

            // Botones manuales
            document.getElementById('carousel-prev-btn').addEventListener('click', () => {
                carousel.prev();
                if (!paused) {
                    stopAuto();
                    startAuto();
                }
            });
            document.getElementById('carousel-next-btn').addEventListener('click', () => {
                carousel.next();
                if (!paused) {
                    stopAuto();
                    startAuto();
                }
            });

            // Asegurar transición fluida quitando y poniendo clases correctamente
            items.forEach((item, idx) => {
                item.el.addEventListener('transitionend', () => {
                    void item.el.offsetWidth;
                });
            });

        }, 0);

    } catch (e) {
        container.innerHTML = `<div class="text-red-500 p-4">No se pudo cargar el top.</div>`;
    }
});
