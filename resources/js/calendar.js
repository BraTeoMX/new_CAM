import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

document.addEventListener('DOMContentLoaded', function () {
    let calendarEl = document.getElementById('calendar');

    if (calendarEl) {
        let calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, interactionPlugin],
            initialView: 'dayGridMonth',
            events: '/api/events', // Ruta donde cargar eventos desde el backend
            selectable: true,
            editable: true,
            dateClick: function(info) {
                alert('Día seleccionado: ' + info.dateStr);
            }
        });

        calendar.render();
    }
});
