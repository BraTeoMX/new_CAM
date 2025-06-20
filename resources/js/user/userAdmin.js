// Esperamos a que todo el contenido del DOM (la página) se haya cargado completamente.
document.addEventListener('DOMContentLoaded', function () {

    // --- MANEJO DEL MODAL DE CREACIÓN DE USUARIO ---

    // 1. Seleccionamos los elementos del DOM con los que vamos a interactuar.
    // El botón que abre el modal.
    const botonAbrirModal = document.getElementById('btn-open-usercreate');
    // El propio modal.
    const modalCrearUsuario = document.getElementById('modal-usercreate');
    // El botón de la 'X' para cerrar.
    const botonCerrarModal = document.getElementById('btn-close-usercreate');
    // El botón de 'Cancelar'.
    const botonCancelarModal = document.getElementById('btn-cancel-usercreate');

    // 2. Definimos las funciones que realizarán las acciones.
    // Función para abrir el modal.
    const abrirModal = () => {
        // Quitamos la clase 'hidden' para que el modal sea visible.
        modalCrearUsuario.classList.remove('hidden');
        // Añadimos 'flex' para que los estilos de centrado de Tailwind CSS funcionen.
        modalCrearUsuario.classList.add('flex');
    };

    // Función para cerrar el modal.
    const cerrarModal = () => {
        // Volvemos a añadir la clase 'hidden' para ocultarlo.
        modalCrearUsuario.classList.add('hidden');
        // Quitamos la clase 'flex'.
        modalCrearUsuario.classList.remove('flex');
    };

    // 3. Asignamos las funciones a los eventos de clic de cada botón.
    // Es una buena práctica verificar que los elementos existen antes de asignarles eventos.
    if (botonAbrirModal && modalCrearUsuario && botonCerrarModal && botonCancelarModal) {
        
        // Si se hace clic en "Nuevo Usuario", abrimos el modal.
        botonAbrirModal.addEventListener('click', abrirModal);

        // Si se hace clic en la 'X', cerramos el modal.
        botonCerrarModal.addEventListener('click', cerrarModal);

        // Si se hace clic en "Cancelar", también cerramos el modal.
        botonCancelarModal.addEventListener('click', cerrarModal);
    }
    
    // --- (Aquí continuaremos con la lógica para el formulario y el modal de edición) ---

});