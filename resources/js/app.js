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

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    encrypted: true,
});

let notificationCount = 0;

window.Echo.channel('notifications')
    .listen('NewOrderNotification', (e) => {
        console.log('Notificación recibida:', e);

        // Verificar si la notificación ya existe para evitar duplicados
        if (!$('#notificationList').find(`[data-folio="${e.folio}"]`).length) {
            // Agregar la notificación al DOM usando jQuery
            $('#notificationList').append(`
                <li class="px-4 py-2 border-b border-gray-200 dark:border-gray-700" data-folio="${e.folio}">
                    <strong>Nueva OT: ${e.folio}</strong><br>Modulo: ${e.modulo}<br>Operador: ${e.nombre}
                </li>
            `);

            // Actualizar el contador de notificaciones
            notificationCount++;
            $('#notificationCount').text(notificationCount).show();
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