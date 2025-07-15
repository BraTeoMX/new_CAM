// Se ejecuta cuando todo el contenido del HTML ha sido cargado.
document.addEventListener('DOMContentLoaded', function() {

    // 1. Seleccionamos el elemento <select> del DOM.
    const moduloSelect = document.getElementById('modulo-select');

    // 2. Inicializamos la librería Select2.
    $(moduloSelect).select2({
        placeholder: 'Selecciona tu módulo de atención',
        allowClear: true
    });

    // --- CORRECCIÓN CLAVE ---
    // Reemplazamos el addEventListener nativo por el método .on() de jQuery,
    // que es la forma recomendada para escuchar eventos de Select2.
    $(moduloSelect).on('change', function() {
        const moduloSeleccionado = this.value; // Obtenemos el valor seleccionado

        if (moduloSeleccionado) {
            actualizarResumen(moduloSeleccionado);
        } else {
            resetearResumen();
        }
    });
    // --- FIN DE LA CORRECCIÓN ---


    // --- FUNCIONES ---

    /**
     * Carga los módulos desde nuestro backend al iniciar la página.
     */
    async function cargarModulos() {
        try {
            const response = await fetch('/FollowOTV2/obtenerAreaModulos');
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
            
            const modulos = await response.json();
            
            modulos.forEach(modulo => {
                const option = new Option(modulo, modulo);
                moduloSelect.appendChild(option);
            });
            
            // Notificamos a Select2 que hemos añadido nuevas opciones.
            $(moduloSelect).trigger('change.select2');

        } catch (error) {
            console.error("No se pudieron cargar los módulos:", error);
        }
    }

    /**
     * Obtiene los datos del resumen y actualiza la vista.
     * @param {string} modulo - El módulo seleccionado.
     */
    async function actualizarResumen(modulo) {
        try {
            resetearResumen();

            // Añadimos un console.log aquí para depurar en el navegador.
            console.log(`Haciendo fetch a: /FollowOTV2/obtenerResumen/${modulo}`);

            const response = await fetch(`/FollowOTV2/obtenerResumen/${modulo}`);
            if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

            const resumen = await response.json();

            document.getElementById('ot-autonomas').textContent = resumen.AUTONOMO ?? 0;
            document.getElementById('ot-asignadas').textContent = resumen.ASIGNADO ?? 0;
            document.getElementById('ot-proceso').textContent = resumen['EN PROCESO'] ?? 0;
            document.getElementById('ot-pendientes').textContent = resumen.PENDIENTE ?? 0;
            document.getElementById('ot-atendidas').textContent = resumen.ATENDIDO ?? 0;
            document.getElementById('ot-total').textContent = resumen.TOTAL ?? 0;

        } catch (error) {
            console.error("Error al cargar el resumen:", error);
        }
    }

    /**
     * Pone todos los contadores de la barra de resumen en 0.
     */
    function resetearResumen() {
        document.getElementById('ot-autonomas').textContent = '0';
        document.getElementById('ot-asignadas').textContent = '0';
        document.getElementById('ot-proceso').textContent = '0';
        document.getElementById('ot-pendientes').textContent = '0';
        document.getElementById('ot-atendidas').textContent = '0';
        document.getElementById('ot-total').textContent = '0';
    }


    // 5. Llamamos a la función inicial para cargar los módulos.
    cargarModulos();

});