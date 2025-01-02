import { Livewire } from '../../vendor/livewire/livewire/dist/livewire.esm';
Livewire.start();
import './bootstrap';
import '../css/sweetAlert2.min.css';

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

// Función para iniciar el temporizador
function startTimer(duration, display) {
    let timer = duration,
        minutes, seconds;
    const interval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);

        if (--timer < 0) {
            clearInterval(interval);
            showResolutionModal();
        }
    }, 1000);
}

// Mostrar modal de resolución al terminar el temporizador
function showResolutionModal() {
    Swal.fire({
        title: '¿Pudiste resolver el problema?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `Sí`,
        denyButtonText: `No`,
    }).then((result) => {
        if (result.isConfirmed) {
            updateTicketStatus('Autonomo');
        } else if (result.isDenied) {
            updateTicketStatus('Abierto');
        }
    });
}

// Función para actualizar el estado del ticket
function updateTicketStatus(status) {
    const folio = formData.folio;
    fetch(`/update-ticket-status/${folio}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': formData._token
            },
            body: JSON.stringify({ status })
        })
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Estado actualizado',
                    text: 'El estado del ticket ha sido actualizado.'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un error al actualizar el estado del ticket.'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error inesperado',
                text: 'Inténtalo de nuevo.'
            });
        });
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
                <div class="text-xs text-gray-500 timer" data-folio="${notification.folio}" data-duration="60">01:00</div>
            </li>
        `);
    });

    // Iniciar temporizadores
    $('.timer').each(function() {
        const duration = $(this).data('duration');
        startTimer(duration, $(this));
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
                    <div class="text-xs text-gray-500 timer" data-folio="${e.folio}" data-duration="60">01:00</div>
                </li>
            `);

            // Actualizar el contador de notificaciones
            notificationCount++;
            $('#notificationCount').text(notificationCount).show();

            // Guardar la notificación en localStorage
            storedNotifications.push(e);
            localStorage.setItem('notifications', JSON.stringify(storedNotifications));

            // Iniciar temporizador para la nueva notificación
            startTimer(60, $(`.timer[data-folio="${e.folio}"]`));
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
        <p>Tiempo restante: <span class="timer-modal" data-folio="${notification.folio}" data-duration="60">01:00</span></p>
    `);
    $('#notificationModal').removeClass('hidden');

    // Iniciar temporizador en el modal
    startTimer(60, $(`.timer-modal[data-folio="${notification.folio}"]`));

    // Eliminar la notificación del DOM y de localStorage
    $(this).remove();
    const updatedNotifications = storedNotifications.filter(notification => notification.folio !== folio);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

    // Actualizar el contador de notificaciones
    notificationCount--;
    if (notificationCount === 0) {
        $('#notificationCount').hide();
    } else {
        $('#notificationCount').text(notificationCount);
    }
});

// Cerrar modal
$(document).on('click', '[data-modal-toggle="notificationModal"]', function() {
    $('#notificationModal').addClass('hidden');
});