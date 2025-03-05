
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
                                    <img class="w-10 h-10 rounded-full cursor-pointer"  
                                    src="${imagePath}"
                                         alt="${user.IdPoblacion} image"
                                         id="user-img-${user.IdPoblacion}"
                                         onerror="this.onerror=null; this.src='/default-avatar.jpg';">
                                <span class="top-0 left-7 absolute  w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
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
                    imgElement.addEventListener("mouseover", function() {
                        tooltipElement.style.opacity = "1";
                        tooltipElement.style.visibility = "visible";
                    });

                    document.addEventListener("mouseout", function(event) {
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

