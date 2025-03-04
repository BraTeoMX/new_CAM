<div class="min-w-fit">
    <!-- Sidebar backdrop (mobile only) -->
    <div class="fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200"
        :class="sidebarOpenActive ? 'opacity-100' : 'opacity-0 pointer-events-none'" aria-hidden="true" x-cloak></div>

    <!-- Sidebar -->
    <div id="sidebar-active"
        class="flex lg:!flex flex-col absolute z-40 right-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-active-expanded:!w-64 2xl:!w-64 shrink-0 bg-white dark:bg-gray-800 p-4 transition-all duration-200 ease-in-out transform lg:transform-none"
        :class="sidebarOpenActive ? 'translate-x-0' : 'translate-x-full'"
        @keydown.escape.window="sidebarOpenActive = false">

        <!-- Sidebar header -->
        <div class="flex justify-between mb-10 pr-3 sm:px-2">
            <!-- Close button -->
            <button class="lg:hidden text-gray-500 hover:text-gray-400"
                @click.stop="sidebarOpenActive = !sidebarOpenActive" aria-controls="sidebar-active"
                :aria-expanded="sidebarOpenActive">
                <span class="sr-only">Cerrar sidebar</span>
                <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z" />
                </svg>
            </button>
            <div class="flex flex-col space-y-4">
                <h1 class="text-xs uppercase text-gray-600 dark:text-gray-500 font-semibold pl-3">
                    Activos
                </h1>
            </div>
        </div>

        <!-- Links -->
        <div class="space-y-8 flex flex-col h-full justify-between">
            <ul id="active-users-list" role="list" class="max-w-sm divide-y divide-gray-200 dark:divide-gray-700">
                <!-- Aquí se agregarán los usuarios activos -->
            </ul>
        </div>

        <!-- Expand / collapse button -->
        <div class="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
            <div class="w-12 pl-4 pr-3 py-2">
                <button
                    class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
                    @click="sidebarActiveExpanded = !sidebarActiveExpanded">
                    <span class="sr-only">Expandir / colapsar sidebar</span>
                    <svg class="shrink-0 fill-current text-gray-400 dark:text-gray-500 sidebar-active-expanded:rotate-180"
                        xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                        <path
                            d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</div>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        $.ajax({
            url: "/active-users",
            method: "GET",
            success: function(data) {
                const userList = $("#active-users-list");
                userList.empty();

                // Ordenar usuarios (Gerente > Jefe > Resto)
                data.sort((a, b) => {
                    const puestoA = a.despue.toLowerCase();
                    const puestoB = b.despue.toLowerCase();

                    if (puestoA.includes("gerente") && !puestoB.includes("gerente"))
                    return -1;
                    if (!puestoA.includes("gerente") && puestoB.includes("gerente"))
                    return 1;

                    if (puestoA.includes("jefe") && !puestoB.includes("jefe")) return -1;
                    if (!puestoA.includes("jefe") && puestoB.includes("jefe")) return 1;

                    return 0; // Mantiene el orden de los demás
                });

                data.forEach(function(user) {
                    const imagePath =
                        `http://128.150.102.45:8000/fotos/${user.IdPoblacion}.jpg`;
                    const tooltipId = `tooltip-${user.IdPoblacion}`;

                    const listItem = `
                        <li class="py-3 sm:py-4 relative">
                            <div class="flex items-center space-x-3 rtl:space-x-reverse">
                                <div class="shrink-0 relative">
                                    <img class="w-8 h-8 rounded-full cursor-pointer"
                                         src="${imagePath}"
                                         alt="${user.IdPoblacion} image"
                                         id="user-img-${user.IdPoblacion}"
                                         onerror="this.onerror=null; this.src='/default-avatar.jpg';">

                                    <!-- Tooltip -->
                                    <div id="${tooltipId}" role="tooltip"
                                        class="absolute z-10 hidden md:block px-4 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg max-w-xs break-words opacity-0 transition-opacity duration-200 dark:bg-gray-700">
                                        <p><strong>Número empleado:</strong> ${user.IdPoblacion}</p>
                                        <p><strong>Nombre:</strong> ${user.nombre}</p>
                                        <p><strong>Puesto:</strong> ${user.despue}</p>
                                        <p><strong>Ubicación:</strong> ${user.ubication}</p>
                                    </div>
                                </div>
                                <div class="flex-5 min-w-0">
                                    <p class="text-sm font-semibold text-gray-900 truncate dark:text-white">
                                        ${user.nombre}
                                    </p>
                                    <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                                        ${user.despue}
                                    </p>
                                     <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                                        ${user.IdPoblacion}
                                    </p>
                                </div>
                                <span class="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                                    <span class="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
                                    Activo
                                </span>
                            </div>
                        </li>`;

                    userList.append(listItem);

                    // Tooltip hover (Desktop)
                    const imgElement = document.getElementById(
                        `user-img-${user.IdPoblacion}`);
                    const tooltipElement = document.getElementById(tooltipId);

                    imgElement.addEventListener("mouseover", function() {
                        tooltipElement.style.opacity = "1";
                        tooltipElement.style.visibility = "visible";
                    });

                    imgElement.addEventListener("mouseout", function() {
                        tooltipElement.style.opacity = "0";
                        tooltipElement.style.visibility = "hidden";
                    });

                    // Tooltip click (Mobile)
                    imgElement.addEventListener("click", function() {
                        tooltipElement.style.opacity = "1";
                        tooltipElement.style.visibility = "visible";
                    });

                    document.addEventListener("click", function(event) {
                        if (!imgElement.contains(event.target) && !tooltipElement
                            .contains(event.target)) {
                            tooltipElement.style.opacity = "0";
                            tooltipElement.style.visibility = "hidden";
                        }
                    });
                });
            },
            error: function(error) {
                console.error("Error obteniendo usuarios:", error);
            },
        });
    });
</script>
