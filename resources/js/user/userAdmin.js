document.addEventListener('DOMContentLoaded', function () {

    const botonAbrirModal = document.getElementById('btn-open-usercreate');
    const modalCrearUsuario = document.getElementById('modal-usercreate');
    const botonCerrarModal = document.getElementById('btn-close-usercreate');
    const botonCancelarModal = document.getElementById('btn-cancel-usercreate');

    const abrirModal = () => {
        modalCrearUsuario.classList.remove('hidden');
        modalCrearUsuario.classList.add('flex');
    };

    const cerrarModal = () => {
        modalCrearUsuario.classList.add('hidden');
        modalCrearUsuario.classList.remove('flex');
    };

    if (botonAbrirModal && modalCrearUsuario && botonCerrarModal && botonCancelarModal) {
        botonAbrirModal.addEventListener('click', abrirModal);
        botonCerrarModal.addEventListener('click', cerrarModal);
        botonCancelarModal.addEventListener('click', cerrarModal);
    }

    const selectPuesto = document.getElementById('usercreate-puesto');

    async function cargarPuestos() {
        try {
            const response = await fetch('/UserAdmin/puestos');

            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status}`);
            }

            const puestos = await response.json();
            selectPuesto.innerHTML = '';

            selectPuesto.add(new Option('Seleccione un puesto', ''));
            puestos.forEach(puesto => {
                const opcion = new Option(puesto, puesto);
                selectPuesto.add(opcion);
            });

        } catch (error) {
            console.error('No se pudieron cargar los puestos:', error);
            selectPuesto.innerHTML = '<option value="">Error al cargar puestos</option>';
        }
    }

    cargarPuestos();

});