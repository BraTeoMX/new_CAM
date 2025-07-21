// Archivo: resources/js/dashboard/calendarSelects.js

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('month-selector-container');
    if (!container) return;

    function dispatchMonthChangeEvent(month) {
        const event = new CustomEvent('monthChanged', {
            detail: { month: month }
        });
        window.dispatchEvent(event);
        console.log(`📢 Anuncio: El mes cambió a ${month}`);
    }

    try {
        // 1. Llama a la nueva ruta para obtener los meses disponibles
        const response = await fetch('/dashboardV2/obtenerMeses');
        if (!response.ok) {
            throw new Error('Error al conectar con el servidor.');
        }
        const availableMonths = await response.json();

        // 2. Maneja el caso de que no haya registros en todo el año
        if (availableMonths.length === 0) {
            container.innerHTML = '<span class="text-sm font-semibold text-red-500">No hay datos para mostrar en el año actual.</span>';
            return;
        }

        // 3. Crea el elemento <select>
        const select = document.createElement('select');
        select.id = 'month-select';
        select.className = 'w-40 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 transition';

        const currentMonthNumber = new Date().getMonth() + 1;
        let currentMonthExists = false;

        // 4. Pobla el select con los meses obtenidos
        availableMonths.forEach(month => {
            const option = document.createElement('option');
            option.value = month.value;
            option.textContent = month.text.charAt(0).toUpperCase() + month.text.slice(1); // Pone la primera letra en mayúscula

            if (month.value === currentMonthNumber) {
                option.selected = true;
                currentMonthExists = true;
            }
            select.appendChild(option);
        });
        
        // Limpia el contenedor y prepara la nueva estructura
        container.innerHTML = `
            <label for="month-select" class="text-sm font-semibold text-gray-700 dark:text-gray-200">Mes:</label>
        `;
        container.appendChild(select);
        container.insertAdjacentHTML('beforeend', `<span class="text-gray-500 font-semibold">${new Date().getFullYear()}</span>`);


        // 5. Maneja el caso de que el mes actual no tenga registros
        if (!currentMonthExists) {
            // Si el mes actual no está, el <select> ya mostrará el más reciente (porque lo ordenamos DESC)
            // Agregamos un mensaje para el usuario.
            const noDataMessage = document.createElement('p');
            noDataMessage.className = 'text-xs text-amber-600 ml-4';
            noDataMessage.textContent = 'Nota: No hay registros para el mes actual. Mostrando el mes más reciente con datos.';
            container.appendChild(noDataMessage);
        }

        // 6. Añade un evento para cuando el usuario cambie de mes
        select.addEventListener('change', (event) => {
            const selectedMonth = event.target.value;
            // Llama a la función para anunciar el cambio
            dispatchMonthChangeEvent(selectedMonth); 
        });

        // 7. ¡MUY IMPORTANTE! Anuncia el mes inicial en la carga de la página
        // Esto asegura que todos los componentes carguen sus datos la primera vez.
        dispatchMonthChangeEvent(select.value);

    } catch (error) {
        container.innerHTML = '<span class="text-sm font-semibold text-red-500">No se pudo cargar el filtro.</span>';
        console.error('Error en calendarSelects.js:', error);
    }
});