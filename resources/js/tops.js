document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('dashboard-topsmeca');
    if (!container) return;

    // Mostrar loading
    container.innerHTML = `<div class="flex justify-center items-center min-h-[180px] text-gray-400">Cargando...</div>`;

    try {
        const res = await fetch('/dashboard/tops');
        const data = await res.json();

        function renderTop(title, items, iconSvg, cardColor = "bg-white dark:bg-gray-800") {
            return `
                <div class="flex flex-col items-center justify-center rounded-xl shadow-md border border-gray-200 dark:border-gray-700 ${cardColor} p-5 w-full max-w-xs mx-auto h-full min-h-[270px]">
                    <div class="flex items-center justify-center mb-3">
                        <span class="inline-block">${iconSvg}</span>
                    </div>
                    <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">${title}</h2>
                    <ul class="w-full">
                        ${items.map(i => `
                            <li class="flex justify-between items-center py-1 px-2 rounded hover:bg-emerald-50 dark:hover:bg-gray-700 transition">
                                <span class="text-gray-700 dark:text-gray-200">${i.label}</span>
                                <span class="font-bold text-emerald-600 dark:text-emerald-400 text-lg">${i.total}</span>
                            </li>
                        `).join('')}
                    </ul>
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

        // Carousel logic
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

        let current = 0;
        let intervalId = null;

        function showTop(idx) {
            container.innerHTML = `
                <div class="flex justify-center items-center w-full h-full min-h-[270px] transition-opacity duration-500">
                    ${tops[idx].html}
                </div>
                <div class="flex justify-center gap-2 mt-2">
                    ${tops.map((_, i) =>
                        `<span class="inline-block w-3 h-3 rounded-full ${i === idx ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}"></span>`
                    ).join('')}
                </div>
                <div class="flex justify-center gap-4 mt-4">
                    <button id="prevBtn" class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition">
                        <span class="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button id="pauseBtn" class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition">
                        <span class="material-symbols-outlined">pause</span>
                    </button>
                    <button id = "nextBtn" class = "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition" >
                        <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            `;
        }

        function startCarousel() {
            intervalId = setInterval(() => {
                current = (current + 1) % tops.length;
                showTop(current);
            }, 5000);
        }

        function stopCarousel() {
            clearInterval(intervalId);
        }

        showTop(current);
        startCarousel();

        container.addEventListener('click', (event) => {
            if (event.target.closest('#prevBtn')) {
                stopCarousel();
                current = (current - 1 + tops.length) % tops.length;
                showTop(current);
                startCarousel();
            }
            if (event.target.closest('#nextBtn')) {
                stopCarousel();
                current = (current + 1) % tops.length;
                showTop(current);
                startCarousel();
            }
            if (event.target.closest('#pauseBtn')) {
                const pauseBtn = container.querySelector('#pauseBtn .material-symbols-outlined');
                if (intervalId) {
                    stopCarousel();
                    pauseBtn.textContent = 'play_arrow';
                } else {
                    startCarousel();
                    pauseBtn.textContent = 'pause';
                }
            }
        });

    } catch (e) {
        container.innerHTML = `<div class="text-red-500 p-4">No se pudo cargar el top.</div>`;
    }
});
