const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

let supervisores = [];
let mecanicos = [];

document.addEventListener('DOMContentLoaded', async () => {

    $('#select-supervisor').select2({
        placeholder: 'Selecciona un módulo',
        width: '100%',
        allowClear: true
    });

    $('#select-mecanico').select2({
        placeholder: 'Selecciona un mecánico',
        width: '100%',
        allowClear: true
    });

    const selectSupervisor = document.getElementById('select-supervisor');
    const selectMecanico = document.getElementById('select-mecanico');
    const btnAnadir = document.getElementById('btn-anadir-vinculacion');
    const tablaBody = document.getElementById('tabla-vinculacion-body');

    // Obtener datos
    supervisores = await fetch('/vinculacion/obtenerSupervisores').then(res => res.json());
    mecanicos = await fetch('/vinculacion/obtenerMecanicos').then(res => res.json());

    // Llenar select de supervisores
    supervisores.forEach(s => {
        $('#select-supervisor').append(
            $('<option>', {
                value: JSON.stringify(s),
                text: `${s.modulo} - ${s.nombre}`
            })
        );
    });
    $('#select-supervisor').trigger('change');

    // Evento al cambiar el supervisor
    $('#select-mecanico').empty().append('<option value="">Selecciona un mecánico</option>');
        $('#select-mecanico').prop('disabled', true);
        btnAnadir.disabled = true;

        if (!selected) return;

        const supervisor = JSON.parse(selected);
        const planta = supervisor.planta;

        const filtrados = mecanicos.filter(m => m.planta === planta);

        filtrados.forEach(m => {
            $('#select-mecanico').append(
                $('<option>', {
                    value: JSON.stringify(m),
                    text: `${m.numero_empleado} - ${m.nombre}`
                })
            );
        });
        $('#select-mecanico').prop('disabled', false).trigger('change');

    // Habilitar botón solo si hay selección válida
    selectMecanico.addEventListener('change', () => {
        btnAnadir.disabled = !selectMecanico.value;
    });

    // Añadir a tabla
    btnAnadir.addEventListener('click', () => {
        const supervisor = JSON.parse(selectSupervisor.value);
        const mecanico = JSON.parse(selectMecanico.value);

        const row = `
            <tr>
                <td class="px-4 py-2">${supervisor.modulo}</td>
                <td class="px-4 py-2">${supervisor.nombre}</td>
                <td class="px-4 py-2">${mecanico.nombre}</td>
                <td class="px-4 py-2">${mecanico.planta}</td>
            </tr>
        `;
        tablaBody.insertAdjacentHTML('beforeend', row);

        // Reset seleccionables
        selectMecanico.innerHTML = '<option value="">Selecciona un mecánico</option>';
        selectMecanico.disabled = true;
        selectSupervisor.value = '';
        btnAnadir.disabled = true;
    });
});
