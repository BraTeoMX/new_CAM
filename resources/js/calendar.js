import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

// Utilidad para obtener el token CSRF de forma segura
function getCsrfToken() {
    const token = document.querySelector('meta[name="csrf-token"]');
    return token ? token.getAttribute("content") : "";
}

document.addEventListener("DOMContentLoaded", function () {
    const calendarEl = document.getElementById("calendar");
    const priorityFilter = document.getElementById("priority-filter");
    const responsibleFilter = document.getElementById("responsible-filter");
    let calendar = null;
    let selectedEventId = null;

    // Función para limpiar menús contextuales previos
    function removeContextMenu() {
        const existingMenu = document.getElementById("context-menu");
        if (existingMenu) existingMenu.remove();
    }

    // Menú contextual responsivo usando Tailwind y Flowbite
    function showContextMenu(e, calendarEvent) {
        removeContextMenu();
        const menu = document.createElement("div");
        menu.id = "context-menu";
        menu.className = `
            fixed z-50 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700
            w-56 max-w-full transition-all
        `;
        // Posicionamiento responsivo
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        let left = e.clientX, top = e.clientY;
        if (vw - left < 230) left = vw - 230;
        if (vh - top < 120) top = vh - 120;
        menu.style.left = `${left}px`;
        menu.style.top = `${top}px`;

        const options = [
            { text: "Cambiar fecha", action: () => shortenDate(calendarEvent) },
            { text: "Asignar responsable", action: () => assignResponsible(calendarEvent) },
            { text: "Asignar prioridad", action: () => openPriorityModal(calendarEvent.id) },
        ];
        options.forEach(option => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = `
                w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm
                text-gray-700 dark:text-gray-300 rounded transition-colors
            `;
            item.innerText = option.text;
            item.onclick = () => {
                option.action();
                removeContextMenu();
            };
            menu.appendChild(item);
        });

        document.body.appendChild(menu);
        setTimeout(() => {
            document.addEventListener("click", removeContextMenu, { once: true });
        }, 10);
    }

    // Modal de prioridad
    function openPriorityModal(eventId) {
        selectedEventId = eventId;
        const modal = document.getElementById("modalPrioridad");
        if (modal) modal.classList.remove("hidden");
    }
    function closePriorityModal() {
        const modal = document.getElementById("modalPrioridad");
        if (modal) modal.classList.add("hidden");
    }

    // Actualizar evento en el backend
    async function updateEvent(eventId, data) {
        try {
            const response = await fetch(`/events/${eventId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": getCsrfToken(),
                },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                alert("Evento actualizado correctamente.");
                updateCalendarEvents();
            } else {
                alert("Error al actualizar el evento.");
            }
        } catch (error) {
            console.error("Error al conectar con el servidor:", error);
        }
    }

    // Recargar eventos del calendario
    function updateCalendarEvents() {
        if (calendar) {
            calendar.refetchEvents();
        }
    }

    // Cargar opciones de responsables y prioridades
    async function loadResponsibleOptions() {
        try {
            const response = await fetch("/responsibles");
            const data = await response.json();
            responsibleFilter.innerHTML = '<option value="">Todos</option>';
            data.forEach(responsible => {
                const option = document.createElement("option");
                option.value = responsible;
                option.textContent = responsible;
                responsibleFilter.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar responsables:", error);
        }
    }
    async function loadPriorityOptions() {
        try {
            const response = await fetch("/priorities");
            const data = await response.json();
            priorityFilter.innerHTML = '<option value="">Todas</option>';
            data.forEach(priority => {
                const option = document.createElement("option");
                option.value = priority;
                option.textContent = priority;
                priorityFilter.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar prioridades:", error);
        }
    }

    // Inicializar calendario con clases responsivas
    if (calendarEl) {
        calendar = new Calendar(calendarEl, {
            plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
            initialView: window.innerWidth < 640 ? "listYear" : "dayGridMonth",
            headerToolbar: {
                left: "prev,next today",
                center: "title",
                right: "timeGridDay,timeGridWeek,dayGridMonth,listYear"
            },
            buttonText: {
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Horas",
                list: "Año"
            },
            height: "auto",
            aspectRatio: window.innerWidth < 640 ? 0.8 : 1.5,
            contentHeight: "auto",
            events: async (fetchInfo, successCallback, failureCallback) => {
                try {
                    const response = await fetch("/events");
                    const data = await response.json();
                    const events = data.map(event => {
                        let backgroundColor;
                        switch (event.priority) {
                            case "Alta": backgroundColor = "#8B0000"; break;
                            case "Media": backgroundColor = "#FF8C00"; break;
                            case "Baja": backgroundColor = "#006400"; break;
                            default: backgroundColor = "#87CEFA";
                        }
                        let title = event.title;
                        if (!event.priority && !event.responsible) {
                            title = `<div class="no-priority-warning">No se ha asignado una prioridad ni un responsable</div>` + title;
                        }
                        return {
                            id: event.id,
                            title,
                            start: event.start,
                            end: event.end,
                            responsible: event.responsible,
                            priority: event.priority,
                            backgroundColor,
                            borderColor: "black",
                            textColor: "white",
                        };
                    });
                    // Filtrado por prioridad y responsable
                    const filteredEvents = events.filter(event => {
                        const matchPriority = !priorityFilter.value || event.priority === priorityFilter.value;
                        const matchResponsible = !responsibleFilter.value || event.responsible === responsibleFilter.value;
                        return matchPriority && matchResponsible;
                    });
                    successCallback(filteredEvents);
                } catch (error) {
                    console.error("Error al cargar eventos:", error);
                    failureCallback(error);
                }
            },
            editable: true,
            eventDrop: function (info) {
                const today = new Date();
                const droppedDate = new Date(info.event.start);
                if (droppedDate < today.setHours(0, 0, 0, 0)) {
                    alert("No puedes mover eventos a fechas pasadas.");
                    info.revert();
                    return;
                }
                updateEvent(info.event.id, {
                    start: info.event.startStr,
                    end: info.event.endStr || info.event.startStr,
                });
            },
            eventDidMount: function (info) {
                info.el.addEventListener("contextmenu", function (e) {
                    e.preventDefault();
                    showContextMenu(e, info.event);
                });
                // Clases responsivas para los eventos
                info.el.classList.add(
                    "rounded", "shadow", "overflow-hidden", "text-xs", "sm:text-sm", "md:text-base"
                );
            },
            eventContent: function (info) {
                // Renderizado seguro del contenido del evento
                const div = document.createElement("div");
                div.innerHTML = `
                    <div class="fc-event-title font-semibold">${info.event.title}</div>
                    ${info.event.extendedProps.responsible
                        ? `<div class="text-xs"><strong>Responsable:</strong> ${info.event.extendedProps.responsible}</div>` : ""}
                    ${info.event.extendedProps.priority
                        ? `<div class="text-xs"><strong>Prioridad:</strong> ${info.event.extendedProps.priority}</div>` : ""}
                `;
                return { domNodes: [div] };
            },
            // Adaptar el calendario al tamaño de la pantalla al cambiar el tamaño
            windowResize: function(view) {
                const isMobile = window.innerWidth < 640;
                calendar.setOption("headerToolbar", {
                    left: "prev,next today",
                    center: "title",
                    right: "timeGridDay,timeGridWeek,dayGridMonth,listYear"
                });
                calendar.changeView(isMobile ? "listYear" : "dayGridMonth");
                calendar.setOption("aspectRatio", isMobile ? 0.8 : 1.5);

                // Ajustar header responsivo al cambiar tamaño
                setTimeout(applyResponsiveHeader, 50);
            }
        });
        calendar.render();

        // Aplica clases responsivas al header de FullCalendar
        function applyResponsiveHeader() {
            const header = calendarEl.querySelector('.fc-header-toolbar');
            if (header) {
                header.classList.add(
                    "flex", "flex-wrap", "items-center", "gap-2", "sm:gap-4", "overflow-x-auto", "px-1", "sm:px-2"
                );
                // Asegura que los botones no se desborden
                header.style.width = "100%";
                header.style.boxSizing = "border-box";
            }
        }
        // Ejecutar al renderizar
        setTimeout(applyResponsiveHeader, 50);
    }

    // Listeners para filtros
    priorityFilter.addEventListener("change", updateCalendarEvents);
    responsibleFilter.addEventListener("change", updateCalendarEvents);

    // Modal de prioridad
    const closeBtn = document.getElementById("closePriorityModal");
    const saveBtn = document.getElementById("savePriorityButton");
    if (closeBtn) closeBtn.addEventListener("click", closePriorityModal);
    if (saveBtn) {
        saveBtn.addEventListener("click", function (event) {
            event.preventDefault();
            const priority = document.getElementById("Prioridad").value;
            if (priority && selectedEventId) {
                updateEvent(selectedEventId, { priority });
                closePriorityModal();
            } else {
                alert("Seleccione una prioridad válida.");
            }
        });
    }

    // Cargar filtros al iniciar
    loadResponsibleOptions();
    loadPriorityOptions();

    // Exponer showContextMenu si es necesario
    window.showContextMenu = showContextMenu;

    // Funciones placeholder para acciones del menú contextual
    function shortenDate(calendarEvent) {
        alert("Funcionalidad de cambiar fecha no implementada.");
    }
    function assignResponsible(calendarEvent) {
        alert("Funcionalidad de asignar responsable no implementada.");
    }
});
