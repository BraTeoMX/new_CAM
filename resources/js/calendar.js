import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

document.addEventListener("DOMContentLoaded", function () {
    let calendarEl = document.getElementById("calendar");
    const priorityFilter = document.getElementById("priority-filter");
    const responsibleFilter = document.getElementById("responsible-filter");

    let calendar; // Variable global para Calendar

    if (calendarEl) {
        calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, interactionPlugin],
            initialView: "dayGridMonth",
            events: async function (fetchInfo, successCallback, failureCallback) {
                try {
                    let response = await fetch("/events");
                    let data = await response.json();

                    let events = data.map((event) => {
                        let backgroundColor;
                        switch (event.priority) {
                            case "Alta":
                                backgroundColor = "#8B0000"; // Rojo sangre
                                break;
                            case "Media":
                                backgroundColor = "#FF8C00"; // Naranja oscuro
                                break;
                            case "Baja":
                                backgroundColor = "#006400"; // Verde oscuro
                                break;
                            default:
                                backgroundColor = "#87CEFA"; // Azul tenue
                        }

                        let title = event.title;
                        if (!event.priority && !event.responsible) {
                            title = `<div class="no-priority-warning">No se ha asignado una prioridad ni un responsable</div>` + title;
                        }

                        return {
                            id: event.id,
                            title: title,
                            start: event.start,
                            end: event.end,
                            responsible: event.responsible,
                            priority: event.priority,
                            backgroundColor: backgroundColor,
                            borderColor: "black",
                            textColor: "white",
                        };
                    });

                    let filteredEvents = events.filter((event) => {
                        let matchPriority = !priorityFilter.value || event.priority === priorityFilter.value;
                        let matchResponsible = !responsibleFilter.value || event.responsible === responsibleFilter.value;
                        return matchPriority && matchResponsible;
                    });

                    successCallback(filteredEvents);
                }

                catch (error) {
                    console.error("Error al cargar eventos:", error);
                    failureCallback(error);
                }
            },
            editable: true,

            eventDrop: function (info) {
                let today = new Date();
                let droppedDate = new Date(info.event.start);

                if (droppedDate < today.setHours(0, 0, 0, 0)) {
                    alert("No puedes mover eventos a fechas pasadas.");
                    info.revert();
                    return;
                }

                fetch(`/events/${info.event.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
                    },
                    body: JSON.stringify({
                        start: info.event.startStr,
                        end: info.event.endStr || info.event.startStr,
                    }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.success) {
                            console.log(`Evento ${info.event.id} actualizado a ${info.event.startStr}`);
                        } else {
                            console.error("Error al actualizar el evento:", data.error);
                        }
                    })
                    .catch((error) => console.error("Error al conectar con el servidor:", error));
            },
            eventDidMount: function (info) {
                info.el.addEventListener("contextmenu", function (e) {
                    e.preventDefault();
                    showContextMenu(e, info.event);
                });
            },
            eventContent: function (info) {
                let title = info.event.title;
                let responsible = info.event.extendedProps.responsible
                    ? `<div><strong>Responsable:</strong> ${info.event.extendedProps.responsible}</div>`
                    : "";
                let priority = info.event.extendedProps.priority
                    ? `<div><strong>Prioridad:</strong> ${info.event.extendedProps.priority}</div>`
                    : "";

                return {
                    html: `
                        <div class="fc-event-title">${title}</div>
                        ${responsible}
                        ${priority}
                    `,
                };
            },
        });

        calendar.render();
    }

    function updateCalendarEvents() {
        if (calendar) {
            calendar.getEvents().forEach(event => event.remove());
            calendar.refetchEvents();
        }
    }

    priorityFilter.addEventListener("change", updateCalendarEvents);
    responsibleFilter.addEventListener("change", updateCalendarEvents);

        let selectedEventId = null;

        function showContextMenu(event, calendarEvent) {
            let existingMenu = document.getElementById("context-menu");
            if (existingMenu) {
                existingMenu.remove();
            }

            let menu = document.createElement("div");
            menu.id = "context-menu";
            // Tailwind classes for the menu
            menu.classList.add(
                "absolute", // position: absolute
                "z-50", // z-index: 50 (adjust as needed, higher than other elements)
                "bg-white", // bg-white (light mode background)
                "dark:bg-gray-800", // dark mode background
                "shadow-lg", // shadow-lg (large shadow)
                "rounded-lg", // rounded-lg (rounded corners)
                "p-2", // p-2 (padding)
                "border", // border
                "border-gray-300", // border color light mode
                "dark:border-gray-600" // border color dark mode
            );
            menu.style.top = `${event.clientY}px`;
            menu.style.left = `${event.clientX}px`;

            let options = [
                { text: "Cambiar fecha", action: () => shortenDate(calendarEvent) },
                { text: "Asignar responsable", action: () => assignResponsible(calendarEvent) },
                { text: "Asignar prioridad", action: () => openPriorityModal(calendarEvent.id) },
            ];

            options.forEach((option) => {
                let item = document.createElement("div");
                // Tailwind classes for the menu items
                item.classList.add(
                    "px-4", // px-4 (horizontal padding)
                    "py-2", // py-2 (vertical padding)
                    "hover:bg-gray-100", // hover:bg-gray-100 (light gray on hover - light mode)
                    "dark:hover:bg-gray-700", // dark:hover:bg-gray-700 (dark gray on hover - dark mode)
                    "cursor-pointer", // cursor-pointer (hand cursor)
                    "text-sm", // text-sm (small text)
                    "text-gray-700", // text-gray-700 (text color light mode)
                    "dark:text-gray-300" // text color dark mode
                );
                item.innerText = option.text;
                item.addEventListener("click", () => {
                    option.action();
                    menu.remove();
                });
                menu.appendChild(item);
            });

            document.body.appendChild(menu);
            document.addEventListener("click", () => menu.remove(), { once: true });
        }


            function openPriorityModal(eventId) {
                selectedEventId = eventId;
                let modal = document.getElementById("modalPrioridad");
                if (modal) {
                    modal.classList.remove("hidden");
                }
            }

            function closePriorityModal() {
                let modal = document.getElementById("modalPrioridad");
                if (modal) {
                    modal.classList.add("hidden");
                }
            }

            // Esperar a que el DOM esté completamente cargado antes de agregar eventos
            let closeBtn = document.getElementById("closePriorityModal");
            let saveBtn = document.getElementById("savePriorityButton");

            if (closeBtn) {
                closeBtn.addEventListener("click", closePriorityModal);
            }

            if (saveBtn) {
                saveBtn.addEventListener("click", function (event) {
                    event.preventDefault(); // Evitar que el formulario recargue la página
                    let priority = document.getElementById("Prioridad").value;
                    if (priority && selectedEventId) {
                        updateEvent(selectedEventId, { priority: priority });
                        closePriorityModal();
                    } else {
                        alert("Seleccione una prioridad válida.");
                    }
                });
            }

            window.showContextMenu = showContextMenu;





    function updateEvent(eventId, data) {
        fetch(`/events/${eventId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').getAttribute("content"),
            },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert("Evento actualizado correctamente.");
                    updateCalendarEvents();
                } else {
                    alert("Error al actualizar el evento.");
                }
            })
            .catch((error) => console.error("Error al conectar con el servidor:", error));
    }

    function loadResponsibleOptions() {
        fetch("/responsibles")
            .then((response) => response.json())
            .then((data) => {
                responsibleFilter.innerHTML = '<option value="">Todos</option>';
                data.forEach((responsible) => {
                    let option = document.createElement("option");
                    option.value = responsible;
                    option.textContent = responsible;
                    responsibleFilter.appendChild(option);
                });
            })
            .catch((error) => console.error("Error al cargar responsables:", error));
    }

    function loadPriorityOptions() {
        fetch("/priorities")
            .then((response) => response.json())
            .then((data) => {
                priorityFilter.innerHTML = '<option value="">Todas</option>';
                data.forEach((priority) => {
                    let option = document.createElement("option");
                    option.value = priority;
                    option.textContent = priority;
                    priorityFilter.appendChild(option);
                });
            })
            .catch((error) => console.error("Error al cargar prioridades:", error));
    }

    loadResponsibleOptions();
    loadPriorityOptions();
});
