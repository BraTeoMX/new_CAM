document.addEventListener("DOMContentLoaded",function(){var u;$.ajaxSetup({headers:{"X-CSRF-TOKEN":(u=document.querySelector('meta[name="csrf-token"]'))==null?void 0:u.content,Accept:"application/json","Content-Type":"application/json"},error:function(t,e,r){console.error("Error en la petición AJAX:",{status:t.status,statusText:t.statusText,responseText:t.responseText,error:r})}});function l(t){t.html(`
            <div class="animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
            </div>
        `)}const a=$("#mecanicos-list");l(a);const s=$("#supervisores-list");l(s);const i=document.getElementById("vinculacion-tbody");$.get("/mecanicos").done(function(t){a.empty(),Array.isArray(t)&&t.length>0?t.forEach(e=>{const r=`http://128.150.102.45:8000/Intimark/${e.cvetra}.jpg`;a.append(`
                        <div class="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-mecanico"
                             data-nombre="${e.nombre||""}"
                             data-cvetra="${e.cvetra||""}">
                            <img class="w-10 h-10 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 object-cover"
                                src="${r}"
                                alt="${e.cvetra}"
                                onerror="this.onerror=null;this.src='/default-avatar.jpg';"
                            />
                            <div class="flex-1 min-w-0">
                                <h3 class="text-sm font-medium text-gray-900 dark:text-white">${e.nombre||"Sin nombre"}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${e.cvetra||"Sin ID"}</p>
                            </div>
                        </div>
                    `)}):a.html('<p class="text-gray-500 dark:text-gray-400 text-center p-4">No se encontraron mecánicos</p>')}).fail(function(t,e,r){console.error("Error AJAX mecánicos:",t,e,r),a.html(`
                <div class="text-red-500 dark:text-red-400 text-center p-4">
                    Error al cargar los mecánicos: ${r}
                </div>
            `)}),$.get("/supervisores").done(function(t){s.empty(),Array.isArray(t)&&t.length>0?t.forEach(e=>{s.append(`
                        <div class="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-supervisor"
                             data-supervisor="${e.Nombre||""}"
                             data-modulo="${e.Modulo||""}">
                            <div class="flex-1">
                                <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                                    Módulo: ${e.Modulo||"Sin módulo"}
                                </h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">
                                    Supervisor: ${e.Nombre||"Sin nombre"}
                                </p>
                            </div>
                        </div>
                    `)}):s.html('<p class="text-gray-500 dark:text-gray-400 text-center p-4">No se encontraron supervisores</p>')}).fail(function(t,e,r){console.error("Error AJAX supervisores:",t,e,r),s.html(`
                <div class="text-red-500 dark:text-red-400 text-center p-4">
                    Error al cargar los supervisores: ${r}
                </div>
            `)}),new Sortable(a[0],{group:{name:"mecanicos",pull:"clone",put:!1},sort:!1,animation:150}),new Sortable(s[0],{group:{name:"supervisores",pull:"clone",put:!1},sort:!1,animation:150}),new Sortable(i,{group:{name:"vinculacion",put:["mecanicos","supervisores"]},animation:150,onAdd:function(t){const e=t.item;console.log("Elemento arrastrado:",e.classList.contains("draggable-mecanico")?"Mecánico":"Supervisor");let r=document.createElement("tr");if(r.className="bg-white dark:bg-gray-800 border-b dark:border-gray-700",r.innerHTML=`
                <td class="px-4 py-2"></td>
                <td class="px-4 py-2"></td>
                <td class="px-4 py-2"></td>
                <td class="px-4 py-2" contenteditable="true"></td>
                <td class="px-4 py-2" contenteditable="true"></td>
                <td class="px-4 py-2" contenteditable="true"></td>
                <td class="px-4 py-2">
                    <button class="text-red-500 hover:text-red-700" onclick="this.closest('tr').remove()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </td>
            `,e.classList.contains("draggable-mecanico")){const n=e.getAttribute("data-nombre"),o=i.querySelector("tr:not(.filled-mecanico)");if(o){o.cells[1].textContent=n,o.classList.add("filled-mecanico"),e.remove();return}else r.cells[1].textContent=n}else if(e.classList.contains("draggable-supervisor")){const n=e.getAttribute("data-supervisor"),o=e.getAttribute("data-modulo"),c=i.querySelector("tr:not(.filled-supervisor)");if(c){c.cells[0].textContent=n,c.cells[2].textContent=o,c.classList.add("filled-supervisor"),e.remove();return}else r.cells[0].textContent=n,r.cells[2].textContent=o}i.appendChild(r),e.remove()}});function d(){$.get("/vinculaciones",function(t){const e=$("#vinculacion-tbody");e.empty(),Array.isArray(t)&&t.length>0?t.forEach(r=>{e.append(`
                        <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 draggable-row" data-id="${r.id||""}">
                            <td class="px-4 py-2">${r.Supervisor||""}</td>
                            <td class="px-4 py-2">${r.Mecanico||""}</td>
                            <td class="px-4 py-2">${r.Modulo||""}</td>
                            <td class="px-4 py-2">${r.Hora_Comida||""}</td>
                            <td class="px-4 py-2">${r.Break_Lun_Jue||""}</td>
                            <td class="px-4 py-2">${r.Break_Viernes||""}</td>
                            <td class="px-4 py-2"></td>
                        </tr>
                    `)}):e.html('<tr><td colspan="7" class="text-center text-gray-500 dark:text-gray-400 py-4">No hay vinculaciones registradas</td></tr>')})}d(),new Sortable(document.getElementById("vinculacion-tbody"),{animation:150,handle:".draggable-row",ghostClass:"bg-blue-100 dark:bg-blue-900"}),$("#guardar-vinculacion").on("click",function(){const t=[];$("#vinculacion-tbody tr").each(function(){const e=$(this).find("td");t.push({id:$(this).data("id")||null,Supervisor:e.eq(0).text().trim(),Mecanico:e.eq(1).text().trim(),Modulo:e.eq(2).text().trim(),Hora_Comida:e.eq(3).text().trim(),Break_Lun_Jue:e.eq(4).text().trim(),Break_Viernes:e.eq(5).text().trim()})}),$.ajax({url:"/vinculaciones",method:"POST",data:JSON.stringify({vinculaciones:t}),contentType:"application/json",success:function(e){alert(e.message||"Vinculaciones guardadas correctamente"),d()},error:function(e){alert("Error al guardar vinculaciones"),console.error(e)}})})});
