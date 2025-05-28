document.addEventListener('DOMContentLoaded', () => {
    const btnOpen = document.getElementById('btn-open-usercreate');
    const btnClose = document.getElementById('btn-close-usercreate');
    const btnCancel = document.getElementById('btn-cancel-usercreate');
    const modal = document.getElementById('modal-usercreate');
    const form = document.getElementById('form-usercreate');
    const selectPuesto = document.getElementById('usercreate-puesto');

    // CSRF
    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : '';
    };

    if (!btnOpen || !btnClose || !btnCancel || !modal || !form || !selectPuesto) return;

    // Abrir modal y cargar puestos
    btnOpen.addEventListener('click', () => {
        selectPuesto.innerHTML = '<option value="">Cargando...</option>';
        fetch('/admin-control/puestos', {
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin'
        })
        .then(res => res.json())
        .then(puestos => {
            selectPuesto.innerHTML = '<option value="">Seleccione un puesto</option>' +
                puestos.map(p => `<option value="${p}">${p}</option>`).join('');
        })
        .catch(() => {
            selectPuesto.innerHTML = '<option value="">Error al cargar puestos</option>';
        });
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });

    // Cerrar modal
    btnClose.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        form.reset();
    });
    btnCancel.addEventListener('click', () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        form.reset();
    });

    // Enviar formulario
    form.addEventListener('submit', e => {
        e.preventDefault();
        const formData = {
            name: document.getElementById('usercreate-name').value,
            email: document.getElementById('usercreate-email').value,
            num_empleado: document.getElementById('usercreate-num_empleado').value,
            password: document.getElementById('usercreate-password').value,
            puesto: document.getElementById('usercreate-puesto').value
        };
        fetch('/admin-control/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'same-origin',
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) throw new Error('Error al crear usuario');
            return response.json();
        })
        .then(() => {
            Swal.fire('Agregado', 'Usuario creado correctamente', 'success');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            form.reset();
            // Opcional: recargar tabla si tienes acceso a fetchUsers()
            if (typeof fetchUsers === 'function') fetchUsers();
        })
        .catch(error => {
            console.error('Error creando usuario:', error);
            Swal.fire('Error', 'No se pudo crear el usuario.', 'error');
        });
    });
});
