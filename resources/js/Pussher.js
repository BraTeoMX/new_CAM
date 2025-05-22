import $ from "jquery";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import moment from "moment";

// --- Configuración de Echo/Pusher ---
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    encrypted: true,
});

// --- Variables globales ---
let notificationCount = 0;
window.notificationsArray = []; // Para almacenar notificaciones en memoria

// --- Utilidad para calcular tiempo transcurrido ---
function timeAgo(time) {
    return moment(time).fromNow();
}

// --- Renderiza una notificación en el DOM ---
function renderNotification(notification) {
    let notificationHtml;
    if (notification.status === "AUTONOMO") {
        notificationHtml = `
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <li class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 cursor-pointer flex justify-between items-center" data-folio="${notification.folio}">
                <div class="shrink-0">
                    <img class="w-12 h-12 rounded-full" src="/images/Avatar.webp" alt="AvatarIA"/>
                </div>
                <div class="w-full ps-3">
                    <div class="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                        <strong>Problema resuelta Autonomamente</strong><br>Modulo: ${notification.modulo}
                    </div>
                    <div class="text-xs text-blue-600 dark:text-blue-500">${timeAgo(notification.created_at)}</div>
                </div>
            </li>
            </div>
        `;
    } else if(notification.status === "CANCELADO" ){
         notificationHtml = `
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <li class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 cursor-pointer flex justify-between items-center" data-folio="${notification.folio}">
                <div class="shrink-0">
                    <img class="w-12 h-12 rounded-full" src="/images/cancelado.webp" alt="cancelado"/>
                </div>
                <div class="w-full ps-3">
                    <div class="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                        <strong>Ticket cancelado</strong><br>Modulo: ${notification.modulo}
                    </div>
                    <div class="text-xs text-blue-600 dark:text-blue-500">${timeAgo(notification.created_at)}</div>
                </div>
            </li>
            </div>
        `;
    }else {
        notificationHtml = `
            <div class="divide-y divide-gray-100 dark:divide-gray-700">
            <li class="px-4 py-2 border-b border-gray-200 dark:border-gray-700 cursor-pointer flex justify-between items-center" data-folio="${notification.folio}">
                <div class="shrink-0">
                    <img class="w-12 h-12 rounded-full" src="/images/Avatar.webp" alt="AvatarIA"/>
                </div>
                <div class="w-full ps-3">
                    <div class="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
                        <strong>Nueva OT: ${notification.folio}</strong><br>Modulo: ${notification.modulo}
                    </div>
                    <div class="text-xs text-blue-600 dark:text-blue-500">${timeAgo(notification.created_at)}</div>
                </div>
            </li>
            </div>
        `;
    }
    $("#notificationList").prepend(notificationHtml);
}

// --- Renderiza todas las notificaciones almacenadas ---
function renderAllNotifications() {
    $("#notificationList").empty();
    window.notificationsArray.forEach(renderNotification);
}

// --- Carga notificaciones desde localStorage a memoria y DOM ---
function loadNotificationsFromStorage() {
    window.notificationsArray = JSON.parse(localStorage.getItem("notifications") || "[]");
    notificationCount = window.notificationsArray.length;
    if (notificationCount > 0) {
        $("#notificationCount").text(notificationCount).show();
    } else {
        $("#notificationCount").hide();
    }
    renderAllNotifications();
}

// --- Guarda notificaciones en localStorage ---
function saveNotificationsToStorage() {
    localStorage.setItem("notifications", JSON.stringify(window.notificationsArray));
}

// --- Agrega una nueva notificación a memoria, storage y DOM ---
function addNotification(notification) {
    window.notificationsArray.unshift(notification);
    notificationCount = window.notificationsArray.length;
    $("#notificationCount").text(notificationCount).show();
    renderNotification(notification);
    saveNotificationsToStorage();
}

// --- Elimina una notificación por folio ---
function removeNotificationByFolio(folio) {
    window.notificationsArray = window.notificationsArray.filter(n => n.folio !== folio);
    notificationCount = window.notificationsArray.length;
    saveNotificationsToStorage();
    renderAllNotifications();
    if (notificationCount > 0) {
        $("#notificationCount").text(notificationCount).show();
    } else {
        $("#notificationCount").hide();
        $("#notificationDropdown").hide();
        $("#notificationButton").attr("aria-expanded", "false");
    }
}

// --- Muestra el toast de notificación ---
function showToast(e) {
    const toast = document.createElement("div");
    let toastMessage;
    if (e.status === "AUTONOMO") {
        toastMessage = "Problema resuelto Autonomamente";
    }else if (e.status === "CANCELADO") {
        toastMessage = `Ticket cancelado`;
    }else {
        toastMessage = `Nuevo ticket generado: ${e.folio}`;
    }
    toast.innerHTML = `
        <div id="toast-notification" style="z-index:99999;" class="fixed top-5 right-5 w-full max-w-xs p-4 text-gray-900 bg-white rounded-lg shadow-sm dark:bg-gray-800 dark:text-gray-300 animate-slide-in transition-opacity duration-300 opacity-0" role="alert">
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
                    <div class="text-sm font-normal">${toastMessage}</div>
                    <span class="text-xs font-medium text-blue-600 dark:text-blue-500">${timeAgo(e.created_at)}</span>
                </div>
            </div>
        </div>
    `;
    const toastElement = toast.firstElementChild;
    // Asegura que el toast esté sobre todo
    toastElement.style.position = "fixed";
    toastElement.style.zIndex = "99999";
    document.body.appendChild(toastElement);
    toastElement.offsetHeight;
    requestAnimationFrame(() => {
        toastElement.style.opacity = "1";
    });
    const closeButton = toastElement.querySelector('[data-dismiss-target="#toast-notification"]');
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            toastElement.style.opacity = "0";
            setTimeout(() => toastElement.remove(), 500);
        });
    }
    setTimeout(() => {
        if (toastElement && toastElement.parentElement) {
            toastElement.style.opacity = "0";
            setTimeout(() => {
                if (toastElement.parentElement) {
                    toastElement.remove();
                }
            }, 1000);
        }
    }, 10000);
}

// --- Inicialización al cargar la página ---
$(document).ready(function () {
    loadNotificationsFromStorage();
});

// --- Escuchar canal de notificaciones ---
window.Echo.channel("notifications").listen(
    "NewOrderNotification",
    async (e) => {
        // Sonido
        try {
            const audio = new Audio("/sound/notification.mp3");
            audio.volume = 0.5;
            await audio.play().catch((error) => console.log("Error reproduciendo audio:", error));
        } catch (error) {
            console.log("Error al cargar el audio:", error);
        }

        // Verificar si ya existe
        const exists = window.notificationsArray.some(n => n.folio === e.folio);
        showToast(e);

        if (!exists) {
            addNotification(e);
        }
    }
);

// --- Mostrar/ocultar el menú de notificaciones ---
$("#notificationButton").on("click", function () {
    const dropdown = $("#notificationDropdown");
    const isExpanded = $(this).attr("aria-expanded") === "true";
    $(this).attr("aria-expanded", !isExpanded);
    dropdown.toggle();
});

// --- Cerrar el menú de notificaciones si se hace clic fuera ---
$(document).on("click", function (event) {
    if (!$(event.target).closest("#notificationButton, #notificationDropdown").length) {
        $("#notificationDropdown").hide();
        $("#notificationButton").attr("aria-expanded", "false");
    }
});

// --- Mostrar notificación en modal y descontar del contador ---
$(document).on("click", "#notificationList li", function () {
    const folio = $(this).data("folio");
    const notification = window.notificationsArray.find(n => n.folio === folio);

    // Mostrar notificación en el modal
    if (notification) {
        if (notification.status === "AUTONOMO") {
            $("#notificationModalTitle").text(`Problema resuelta Autonomamente`);
            $("#notificationModalBody").html(`
                <p>Modulo: ${notification.modulo}</p>
                <p>Descripción: ${notification.descripcion || ''}</p>
            `);
        }else if(notification.status === "CANCELADO"){
            $("#notificationModalTitle").text(`Ticket cancelado`);
            $("#notificationModalBody").html(`
                <p>Modulo: ${notification.modulo}</p>
            `);
        } else {
            $("#notificationModalTitle").text(`Nueva OT: ${notification.folio}`);
            $("#notificationModalBody").html(`
                <p>Modulo: ${notification.modulo}</p>
                <p>Descripción: ${notification.descripcion || ''}</p>
            `);
        }
        $("#notificationModal").removeClass("hidden");
    }

    // Eliminar la notificación del DOM y de localStorage
    removeNotificationByFolio(folio);
});

// --- Cerrar modal y actualizar contador ---
$(document).on("click", '[data-modal-toggle="notificationModal"]', function () {
    $("#notificationModal").addClass("hidden");
    notificationCount = window.notificationsArray.length;
    if (notificationCount > 0) {
        $("#notificationCount").text(notificationCount).show();
    } else {
        $("#notificationCount").hide();
        $("#notificationDropdown").hide();
        $("#notificationButton").attr("aria-expanded", "false");
    }
});
