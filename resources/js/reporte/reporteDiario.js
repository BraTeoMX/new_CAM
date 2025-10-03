// Import DataTable and extensions
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs5';
import 'datatables.net-buttons';
import 'datatables.net-buttons-bs5';
import 'datatables.net-buttons/js/buttons.html5';
import JSZip from 'jszip';

window.JSZip = JSZip;

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
                text: 'Excel'
            },
            {
                extend: 'csvHtml5',
                text: 'CSV'
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