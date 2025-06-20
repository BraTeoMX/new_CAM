// Esperamos a que todo el contenido del DOM (la página) se haya cargado completamente.
document.addEventListener('DOMContentLoaded', function () {

    // --- MANEJO DEL MODAL DE CREACIÓN DE USUARIO ---

    const botonAbrirModal = document.getElementById('btn-open-usercreate');
    const modalCrearUsuario = document.getElementById('modal-usercreate');
    const botonCerrarModal = document.getElementById('btn-close-usercreate');
    const botonCancelarModal = document.getElementById('btn-cancel-usercreate');

    // Función para abrir el modal
    const abrirModal = () => {
        modalCrearUsuario.classList.remove('hidden');
        modalCrearUsuario.classList.add('flex');
    };

    // Función para cerrar el modal
    const cerrarModal = () => {
        modalCrearUsuario.classList.add('hidden');
        modalCrearUsuario.classList.remove('flex');
    };

    if (botonAbrirModal && modalCrearUsuario && botonCerrarModal && botonCancelarModal) {
        botonAbrirModal.addEventListener('click', abrirModal);
        botonCerrarModal.addEventListener('click', cerrarModal);
        botonCancelarModal.addEventListener('click', cerrarModal);
    }


    // --- NUEVO: Cargar Puestos en el Select del Formulario de Creación ---

    // Seleccionamos el elemento <select> donde mostraremos los puestos.
    const selectPuesto = document.getElementById('usercreate-puesto');

    /**
     * Función asíncrona para obtener los puestos desde el servidor y 
     * poblar el elemento <select>.
     */
    async function cargarPuestos() {
        // Usamos un bloque try...catch para manejar posibles errores de red o del servidor.
        try {
            // Hacemos la petición GET a la ruta que definiste en Laravel.
            const response = await fetch('/UserAdmin/puestos');

            // Si la respuesta no es exitosa (ej. error 404 o 500), lanzamos un error.
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            // Convertimos la respuesta de JSON a un array de JavaScript.
            const puestos = await response.json();

            // Limpiamos el select de cualquier opción existente (como "Cargando...").
            selectPuesto.innerHTML = '';

            // (Opcional, pero recomendado) Agregamos una primera opción como placeholder.
            selectPuesto.add(new Option('Seleccione un puesto', ''));

            // Iteramos sobre el array de puestos que recibimos.
            puestos.forEach(puesto => {
                // Por cada puesto, creamos un nuevo elemento <option>.
                // new Option(texto, valor)
                const opcion = new Option(puesto, puesto);
                // Añadimos la nueva opción al final del select.
                selectPuesto.add(opcion);
            });

        } catch (error) {
            // Si algo falla en el bloque try, lo capturamos aquí.
            console.error('No se pudieron cargar los puestos:', error);
            // Mostramos un mensaje de error al usuario en el propio select.
            selectPuesto.innerHTML = '<option value="">Error al cargar puestos</option>';
        }
    }

    // Llamamos a la función para que se ejecute en cuanto la página cargue.
    cargarPuestos();

});