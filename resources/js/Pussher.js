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
$(document).ready(function () {
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

        // Crear y mostrar el toast
        const toast = document.createElement('div');
        toast.innerHTML = `
            <div id="toast-notification" class="fixed top-5 right-5 w-full max-w-xs p-4 text-gray-900 bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:text-gray-300 animate-slide-in" role="alert">
                <div class="flex items-center mb-3">
                    <span class="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Nueva notificación</span>
                    <button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white justify-center items-center shrink-0 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-notification" aria-label="Close">
                        <span class="sr-only">Cerrar</span>
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                    </button>
                </div>
                <div class="flex items-center">
                    <div class="relative inline-block shrink-0">
                        <img class="w-12 h-12 rounded-full" src="/images/Avatar.webp" alt="AvatarIA"/>
                        <span class="absolute bottom-0 right-0 inline-flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                            <svg class="w-3 h-3 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18" fill="currentColor">
                                <path d="M18 4H16V9C16 10.0609 15.5786 11.0783 14.8284 11.8284C14.0783 12.5786 13.0609 13 12 13H9L6.846 14.615C7.17993 14.8628 7.58418 14.9977 8 15H11.667L15.4 17.8C15.5731 17.9298 15.7836 18 16 18C16.2652 18 16.5196 17.8946 16.7071 17.7071C16.8946 17.5196 17 17.2652 17 17V15H18C18.5304 15 19.0391 14.7893 19.4142 14.4142C19.7893 14.0391 20 13.5304 20 13V6C20 5.46957 19.7893 4.96086 19.4142 4.58579C19.0391 4.21071 18.5304 4 18 4Z" fill="currentColor"/>
                                <path d="M12 0H2C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V9C0 9.53043 0.210714 10.0391 0.585786 10.4142C0.960859 10.7893 1.46957 11 2 11H3V13C3 13.1857 3.05171 13.3678 3.14935 13.5257C3.24698 13.6837 3.38668 13.8114 3.55279 13.8944C3.71889 13.9775 3.90484 14.0126 4.08981 13.996C4.27477 13.9793 4.45143 13.9114 4.6 13.8L8.333 11H12C12.5304 11 13.0391 10.7893 13.4142 10.4142C13.7893 10.0391 14 9.53043 14 9V2C14 1.46957 13.7893 0.960859 13.4142 0.585786C13.0391 0.210714 12.5304 0 12 0Z" fill="currentColor"/>
                            </svg>
                            <span class="sr-only">Message icon</span>
                        </span>
                    </div>
                    <div class="ms-3 text-sm font-normal">
                        <div class="text-sm font-semibold text-gray-900 dark:text-white">Asistente IA</div>
                        <div class="text-sm font-normal">Nuevo ticket generado: ${e.folio}</div>
                        <span class="text-xs font-medium text-blue-600 dark:text-blue-500">hace unos segundos</span>
                    </div>
                </div>
            </div>
        `;

        // Agregar el toast al body
        document.body.appendChild(toast.firstElementChild);

        // Configurar el botón de cierre
        const closeButton = toast.querySelector('[data-dismiss-target="#toast-notification"]');
        const toastElement = toast.firstElementChild;

        closeButton.addEventListener('click', () => {
            toastElement.classList.add('animate-fade-out');
            setTimeout(() => toastElement.remove(), 300);
        });

        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            if (toastElement.parentElement) {
                toastElement.classList.add('animate-fade-out');
                setTimeout(() => toastElement.remove(), 300);
            }
        }, 5000);

        // Continuar con el código existente para almacenar la notificación
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
$('#notificationButton').on('click', function () {
    const dropdown = $('#notificationDropdown');
    const isExpanded = $(this).attr('aria-expanded') === 'true';
    $(this).attr('aria-expanded', !isExpanded);
    dropdown.toggle();
});

// Cerrar el menú de notificaciones si se hace clic fuera
$(document).on('click', function (event) {
    if (!$(event.target).closest('#notificationButton, #notificationDropdown').length) {
        $('#notificationDropdown').hide();
        $('#notificationButton').attr('aria-expanded', 'false');
    }
});

// Mostrar notificación en modal y descontar del contador
$(document).on('click', '#notificationList li', function () {
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

    // Actualizar el contador
    notificationCount = updatedNotifications.length;
    if (notificationCount > 0) {
        $('#notificationCount').text(notificationCount);
    } else {
        $('#notificationCount').hide();
    }
});

// Cerrar modal y actualizar contador
$(document).on('click', '[data-modal-toggle="notificationModal"]', function () {
    $('#notificationModal').addClass('hidden');

    // Verificar y actualizar el contador
    const storedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notificationCount = storedNotifications.length;

    if (notificationCount > 0) {
        $('#notificationCount').text(notificationCount).show();
    } else {
        $('#notificationCount').hide();
    }

    // Si no hay notificaciones, ocultar también el dropdown
    if (notificationCount === 0) {
        $('#notificationDropdown').hide();
        $('#notificationButton').attr('aria-expanded', 'false');
    }
});
