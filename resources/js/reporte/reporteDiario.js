// Initialize DataTable variable
let table;

$(document).ready(function () {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    $('#fecha').val(today);

    // Initialize DataTable
    table = $('#reporteTable').DataTable({
        ajax: {
            url: '/reporte/diario/obtenerReporteDiarioMaquinas',
            type: 'GET',
            data: function (d) {
                d.date = $('#fecha').val();
                d.planta = $('#planta').val();
            },
            dataSrc: ''
        },
        columns: [
            { data: 'modulo' },
            { data: 'numero_empleado_operario' },
            { data: 'nombre_operario' },
            { data: 'numero_empleado_supervisor' },
            { data: 'nombre_supervisor' },
            { data: 'tiempo_ejecucion' },
            { data: 'clase_maquina' },
            { data: 'numero_maquina' }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
        },
        dom: 'Bfrtip',
        buttons: [
            {
                extend: 'excelHtml5',
                title: function () {
                    const fecha = $('#fecha').val();
                    const dateObj = new Date(fecha);
                    const options = { day: 'numeric', month: 'long', year: 'numeric' };
                    const formattedDate = dateObj.toLocaleDateString('es-ES', options);
                    return 'Reporte de Maquinas descompuestas ' + formattedDate;
                },
                className: 'btn btn-success'
            },
            {
                extend: 'csvHtml5',
                title: function () {
                    const fecha = $('#fecha').val();
                    const dateObj = new Date(fecha);
                    const options = { day: 'numeric', month: 'long', year: 'numeric' };
                    const formattedDate = dateObj.toLocaleDateString('es-ES', options);
                    return 'Reporte de Maquinas descompuestas ' + formattedDate;
                },
                className: 'btn btn-primary'
            }
        ],
        responsive: true,
        paging: true,
        searching: true,
        ordering: true
    });

    // Handle consultar button
    $('#consultar-btn').on('click', function () {
        const fecha = $('#fecha').val();
        const planta = $('#planta').val();

        if (!fecha || !planta) {
            alert('Por favor, selecciona una fecha y una planta.');
            return;
        }

        table.ajax.reload();
    });
});