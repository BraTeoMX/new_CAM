import { Livewire } from '../../vendor/livewire/livewire/dist/livewire.esm';
Livewire.start();
import './bootstrap';
import Alpine from 'alpinejs';

window.Alpine = Alpine;

Alpine.start();

// Function that generates a gradient for line charts
export const chartAreaGradient = (ctx, chartArea, colorStops) => {
    if (!ctx || !chartArea || !colorStops || colorStops.length === 0) {
        return 'transparent';
    }
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    colorStops.forEach(({ stop, color }) => {
        gradient.addColorStop(stop, color);
    });
    return gradient;
};

document.addEventListener('DOMContentLoaded', () => {
    // Light switcher
    const lightSwitches = document.querySelectorAll('.light-switch');
    if (lightSwitches.length > 0) {
        lightSwitches.forEach((lightSwitch, i) => {
            if (localStorage.getItem('dark-mode') === 'true') {
                lightSwitch.checked = true;
                document.documentElement.classList.add('dark');
                document.querySelector('html').style.colorScheme = 'dark';
            }
            lightSwitch.addEventListener('change', () => {
                const { checked } = lightSwitch;
                lightSwitches.forEach((el, n) => {
                    if (n !== i) {
                        el.checked = checked;
                    }
                });
                document.documentElement.classList.add('no-transition');
                if (lightSwitch.checked) {
                    document.documentElement.classList.add('dark');
                    document.querySelector('html').style.colorScheme = 'dark';
                    localStorage.setItem('dark-mode', 'true');
                    document.dispatchEvent(new CustomEvent('darkMode', { detail: { mode: 'on' } }));
                } else {
                    document.documentElement.classList.remove('dark');
                    document.querySelector('html').style.colorScheme = 'light';
                    localStorage.setItem('dark-mode', 'false');
                    document.dispatchEvent(new CustomEvent('darkMode', { detail: { mode: 'off' } }));
                }
                setTimeout(() => {
                    document.documentElement.classList.remove('no-transition');
                }, 1);
            });
        });
    }
});
import $ from 'jquery';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import moment from 'moment';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    encrypted: true,
});

let notificationCount = 0;

// Función para calcular el tiempo transcurrido desde la creación de la notificación
function timeAgo(time) {
    return moment(time).fromNow();
}

// Cargar notificaciones almacenadas en localStorage al cargar la página
$(document).ready(function() {
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notificationCount = storedNotifications.length;
    if (notificationCount > 0) {
        $('#notificationCount').text(notificationCount).show();
    }

    storedNotifications.forEach(notification => {
        $('#notificationList').prepend(`
            <li class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 cursor-pointer flex justify-between items-center" data-folio="${notification.folio}">
                <div>
                    <strong>Nueva OT: ${notification.folio}</strong><br>Modulo: ${notification.modulo}
                </div>
                <div class="text-xs text-gray-500">${timeAgo(notification.created_at)}</div>
            </li>
        `);
    });
});
window.Echo.channel('notifications')
    .listen('NewOrderNotification', (e) => {
        console.log('Notificación recibida:', e);

        // Verificar si la notificación ya existe en localStorage para evitar duplicados
        const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const notificationExists = storedNotifications.some(notification => notification.folio === e.folio);

        if (!notificationExists) {
            // Agregar la notificación al DOM usando jQuery al principio de la lista
            $('#notificationList').prepend(`
                <li class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 cursor-pointer flex justify-between items-center" data-folio="${e.folio}">
                    <div>
                        <strong>Nueva OT: ${e.folio}</strong><br>Modulo: ${e.modulo}
                    </div>
                    <div class="text-xs text-gray-500">${timeAgo(e.created_at)}</div>
                </li>
            `);

            // Actualizar el contador de notificaciones
            notificationCount++;
            $('#notificationCount').text(notificationCount).show();

            // Guardar la notificación en localStorage
            storedNotifications.push(e);
            localStorage.setItem('notifications', JSON.stringify(storedNotifications));
        }
    });

// Mostrar/ocultar el menú de notificaciones
$('#notificationButton').on('click', function() {
    const dropdown = $('#notificationDropdown');
    const isExpanded = $(this).attr('aria-expanded') === 'true';
    $(this).attr('aria-expanded', !isExpanded);
    dropdown.toggle();
});

// Cerrar el menú de notificaciones si se hace clic fuera
$(document).on('click', function(event) {
    if (!$(event.target).closest('#notificationButton, #notificationDropdown').length) {
        $('#notificationDropdown').hide();
        $('#notificationButton').attr('aria-expanded', 'false');
    }
});

// Mostrar notificación en modal y descontar del contador
$(document).on('click', '#notificationList li', function() {
    const folio = $(this).data('folio');
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notification = storedNotifications.find(notification => notification.folio === folio);

    // Mostrar notificación en el modal
    $('#notificationModalTitle').text(`Nueva OT: ${notification.folio}`);
    $('#notificationModalBody').html(`
        <p>Modulo: ${notification.modulo}</p>
        <p>Descripción: ${notification.descripcion}</p>
    `);
    $('#notificationModal').removeClass('hidden');
    // Eliminar la notificación del DOM y de localStorage
    $(this).remove();
    const updatedNotifications = storedNotifications.filter(notification => notification.folio !== folio);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
});

// Cerrar modal
$(document).on('click', '[data-modal-toggle="notificationModal"]', function() {
    $('#notificationModal').addClass('hidden');
});
//////////////////////////////
import Sortable from 'sortablejs';

// Selecciona el contenedor que contiene las cards o elementos
const sortableContainer = document.getElementById('DOMContentLoaded');

if (sortableContainer) {
    const sortable = new Sortable(sortableContainer, {
        animation: 150, // Animación durante el movimiento
        ghostClass: 'bg-gray-300', // Clase para el elemento "fantasma"
        onEnd: (event) => {
            // Captura los índices de arrastre
            console.log('Elemento movido de', event.oldIndex, 'a', event.newIndex);

            // Ejemplo para enviar al backend con fetch o Axios
            // Puedes enviar las posiciones actualizadas aquí
            const order = Array.from(sortableContainer.children).map((item, index) => ({
                id: item.dataset.id, // Asume que cada elemento tiene un atributo data-id
                position: index,
            }));
            console.log('Nuevo orden:', order);
        },
    });
}
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
