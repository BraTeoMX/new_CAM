// Se ejecuta cuando todo el contenido del HTML ha sido cargado.
document.addEventListener('DOMContentLoaded', function() {

    // 1. Seleccionamos el elemento <select> del DOM.
    const moduloSelect = document.getElementById('modulo-select');

    // 2. Inicializamos la librería Select2 en nuestro elemento.
    // Esto le da el estilo y la funcionalidad de búsqueda.
    $(moduloSelect).select2({
        placeholder: 'Selecciona tu módulo de atención',
        allowClear: true // Permite que el campo se vacíe
    });

    // 3. Definimos una función para cargar los módulos desde nuestro backend.
    async function cargarModulos() {
        try {
            // Hacemos la petición a la ruta que definimos en Laravel.
            const response = await fetch('/FollowOTV2/obtenerAreaModulos');

            // Si la respuesta del servidor no es exitosa (ej. error 500), lanzamos un error.
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            // Convertimos la respuesta JSON en un array de JavaScript.
            const modulos = await response.json();

            // 4. Llenamos el select con los datos recibidos.
            modulos.forEach(modulo => {
                // Creamos un nuevo elemento <option> por cada módulo.
                // new Option(textoVisible, valorDelOption)
                const option = new Option(modulo, modulo);
                // Añadimos la nueva opción al final del select.
                moduloSelect.appendChild(option);
            });

            // IMPORTANTE: Es necesario notificar a Select2 que hemos añadido nuevas opciones
            // para que las muestre correctamente.
            $(moduloSelect).trigger('change.select2');

        } catch (error) {
            console.error("No se pudieron cargar los módulos:", error);
            // Aquí podrías mostrar un mensaje de error al usuario si lo deseas.
        }
    }

    // 5. Llamamos a la función para que se ejecute al cargar la página.
    cargarModulos();

});
