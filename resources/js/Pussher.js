import $ from "jquery";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import moment from "moment";

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: "pusher",
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
    const storedNotifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
    );
    notificationCount = storedNotifications.length;
    if (notificationCount > 0) {
        $("#notificationCount").text(notificationCount).show();
    }

    storedNotifications.forEach((notification) => {
        $("#notificationList").prepend(`
                  <div class="divide-y divide-gray-100 dark:divide-gray-700">
                <li class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 cursor-pointer flex justify-between items-center" data-folio="${
                    notification.folio
                }">
        <div class="shrink-0">
                <img class="w-12 h-12 rounded-full" src="/images/Avatar.webp" alt="AvatarIA"/>
        </div>
                <div class="w-full ps-3">
                 <div class="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                        <strong>Nueva OT: ${
                            notification.folio
                        }</strong><br>Modulo: ${notification.modulo}
                    </div>
                    <div class="text-xs text-blue-600 dark:text-blue-500">${timeAgo(
                        notification.created_at
                    )}</div>
                </div>
                </li>
                </div>
        `);
    });
});

window.Echo.channel("notifications").listen(
    "NewOrderNotification",
    async (e) => {
        console.log("Notificación recibida:", e);

        // Reproducir sonido de notificación de manera más robusta
        try {
            const audio = new Audio("/sound/notification.mp3");
            audio.volume = 0.5;
            await audio
                .play()
                .catch((error) =>
                    console.log("Error reproduciendo audio:", error)
                );
        } catch (error) {
            console.log("Error al cargar el audio:", error);
        }

        // Primero verificar si la notificación ya existe
        const storedNotifications = JSON.parse(
            localStorage.getItem("notifications") || "[]"
        );
        const notificationExists = storedNotifications.some(
            (notification) => notification.folio === e.folio
        );

        // Crear el toast primero
        const toast = document.createElement("div");
        toast.innerHTML = `
            <div id="toast-notification" class="fixed top-5 right-5 w-full max-w-xs p-4 text-gray-900 bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:text-gray-300 animate-slide-in transition-opacity duration-300 opacity-0" role="alert">
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
                    </div>
                    <div class="ms-3 text-sm font-normal">
                        <div class="text-sm font-semibold text-gray-900 dark:text-white">Asistente IA</div>
                        <div class="text-sm font-normal">Nuevo ticket generado: ${
                            e.folio
                        }</div>
                        <span class="text-xs font-medium text-blue-600 dark:text-blue-500">${timeAgo(
                            e.created_at
                        )}</span>
                    </div>
                </div>
            </div>
        `;

        // Agregar el toast al DOM
        const toastElement = toast.firstElementChild;
        document.body.appendChild(toastElement);

        // Forzar un reflow para asegurar la transición
        toastElement.offsetHeight;

        // Hacer visible el toast
        requestAnimationFrame(() => {
            toastElement.style.opacity = "1";
        });

        // Configurar el botón de cierre después de que el toast esté en el DOM
        const closeButton = toastElement.querySelector(
            '[data-dismiss-target="#toast-notification"]'
        );
        if (closeButton) {
            closeButton.addEventListener("click", () => {
                toastElement.style.opacity = "0";
                setTimeout(() => toastElement.remove(), 500);
            });
        }

        // Auto-cerrar después de 3 segundos
        setTimeout(() => {
            if (toastElement && toastElement.parentElement) {
                toastElement.style.opacity = "0";
                setTimeout(() => {
                    if (toastElement.parentElement) {
                        toastElement.remove();
                    }
                }, 500);
            }
        }, 5000);

        // Actualizar las notificaciones solo si es nueva
        if (!notificationExists) {
            // Actualizar el contador y la lista primero
            notificationCount++;
            $("#notificationCount").text(notificationCount).show();

            // Agregar la notificación al DOM
            $("#notificationList").prepend(`
                <div class="divide-y divide-gray-100 dark:divide-gray-700">
                <li class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 cursor-pointer flex justify-between items-center" data-folio="${
                    e.folio
                }">
        <div class="shrink-0">
                <img class="w-12 h-12 rounded-full" src="/images/Avatar.webp" alt="AvatarIA"/>
        </div>
                <div class="w-full ps-3">
                 <div class="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                        <strong>Nueva OT: ${e.folio}</strong><br>Modulo: ${
                e.modulo
            }
                    </div>
                    <div class="text-xs text-blue-600 dark:text-blue-500">${timeAgo(
                        e.created_at
                    )}</div>
                </div>
                </li>
                </div>
            `);

            // Guardar en localStorage
            storedNotifications.push(e);
            localStorage.setItem(
                "notifications",
                JSON.stringify(storedNotifications)
            );
        }
    }
);

// Mostrar/ocultar el menú de notificaciones
$("#notificationButton").on("click", function () {
    const dropdown = $("#notificationDropdown");
    const isExpanded = $(this).attr("aria-expanded") === "true";
    $(this).attr("aria-expanded", !isExpanded);
    dropdown.toggle();
});

// Cerrar el menú de notificaciones si se hace clic fuera
$(document).on("click", function (event) {
    if (
        !$(event.target).closest("#notificationButton, #notificationDropdown")
            .length
    ) {
        $("#notificationDropdown").hide();
        $("#notificationButton").attr("aria-expanded", "false");
    }
});

// Mostrar notificación en modal y descontar del contador
$(document).on("click", "#notificationList li", function () {
    const folio = $(this).data("folio");
    const storedNotifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
    );
    const notification = storedNotifications.find(
        (notification) => notification.folio === folio
    );

    // Mostrar notificación en el modal
    $("#notificationModalTitle").text(`Nueva OT: ${notification.folio}`);
    $("#notificationModalBody").html(`
        <p>Modulo: ${notification.modulo}</p>
        <p>Descripción: ${notification.descripcion}</p>
    `);
    $("#notificationModal").removeClass("hidden");

    // Eliminar la notificación del DOM y de localStorage
    $(this).remove();
    const updatedNotifications = storedNotifications.filter(
        (notification) => notification.folio !== folio
    );
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));

    // Actualizar el contador
    notificationCount = updatedNotifications.length;
    if (notificationCount > 0) {
        $("#notificationCount").text(notificationCount);
    } else {
        $("#notificationCount").hide();
    }
});

// Cerrar modal y actualizar contador
$(document).on("click", '[data-modal-toggle="notificationModal"]', function () {
    $("#notificationModal").addClass("hidden");

    // Verificar y actualizar el contador
    const storedNotifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
    );
    notificationCount = storedNotifications.length;

    if (notificationCount > 0) {
        $("#notificationCount").text(notificationCount).show();
    } else {
        $("#notificationCount").hide();
    }

    // Si no hay notificaciones, ocultar también el dropdown
    if (notificationCount === 0) {
        $("#notificationDropdown").hide();
        $("#notificationButton").attr("aria-expanded", "false");
    }
});
