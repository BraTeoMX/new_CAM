document.addEventListener("DOMContentLoaded",function(){var d;$.ajaxSetup({headers:{"X-CSRF-TOKEN":(d=document.querySelector('meta[name="csrf-token"]'))==null?void 0:d.content,Accept:"application/json","Content-Type":"application/json"},error:function(r,e,t){console.error("Error en la petición AJAX:",{status:r.status,statusText:r.statusText,responseText:r.responseText,error:t})}});function i(r){r.html(`
            <div class="animate-pulse">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
            </div>
        `)}const a=$("#mecanicos-list");i(a);const o=$("#supervisores-list");i(o);const s=document.getElementById("vinculacion-tbody");$.get("/mecanicos").done(function(r){a.empty(),Array.isArray(r)&&r.length>0?r.forEach(e=>{const t=`http://128.150.102.45:8000/Intimark/${e.cvetra}.jpg`;a.append(`
                        <div class="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-mecanico"
                             data-nombre="${e.nombre||""}"
                             data-cvetra="${e.cvetra||""}">
                            <img class="w-10 h-10 p-1 rounded-full ring-2 ring-gray-300 dark:ring-gray-500 object-cover"
                                src="${t}"
                                alt="${e.cvetra}"
                                onerror="this.onerror=null;this.src='/default-avatar.jpg';"
                            />
                            <div class="flex-1 min-w-0">
                                <h3 class="text-sm font-medium text-gray-900 dark:text-white">${e.nombre||"Sin nombre"}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${e.cvetra||"Sin ID"}</p>
                            </div>
                        </div>
                    `)}):a.html('<p class="text-gray-500 dark:text-gray-400 text-center p-4">No se encontraron mecánicos</p>')}).fail(function(r,e,t){console.error("Error AJAX mecánicos:",r,e,t),a.html(`
                <div class="text-red-500 dark:text-red-400 text-center p-4">
                    Error al cargar los mecánicos: ${t}
                </div>
            `)}),$.get("/supervisores").done(function(r){o.empty(),Array.isArray(r)&&r.length>0?r.forEach(e=>{o.append(`
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
                    `)}):o.html('<p class="text-gray-500 dark:text-gray-400 text-center p-4">No se encontraron supervisores</p>')}).fail(function(r,e,t){console.error("Error AJAX supervisores:",r,e,t),o.html(`
                <div class="text-red-500 dark:text-red-400 text-center p-4">
                    Error al cargar los supervisores: ${t}
                </div>
            `)}),new Sortable(a[0],{group:{name:"mecanicos",pull:"clone",put:!1},sort:!1,animation:150}),new Sortable(o[0],{group:{name:"supervisores",pull:"clone",put:!1},sort:!1,animation:150}),new Sortable(s,{group:{name:"vinculacion",put:["mecanicos","supervisores"]},animation:150,onAdd:function(r){const e=r.item;let t=s.querySelector("tr.selected");if(t||(t=s.querySelector("tr:last-child")),t||(t=document.createElement("tr"),t.className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 selected",t.innerHTML=`
                    <td id="td-supervisor" name="supervisor" class="px-4 py-2"></td>
                    <td id="td-mecanico" name="mecanico" class="px-4 py-2"></td>
                    <td id="td-modulo" name="modulo" class="px-4 py-2"></td>
                    <td id="td-comida" name="comida" class="px-4 py-2" contenteditable="true"></td>
                    <td id="td-break-lj" name="break-lj" class="px-4 py-2" contenteditable="true"></td>
                    <td id="td-break-v" name="break-v" class="px-4 py-2" contenteditable="true"></td>
                    <td class="px-4 py-2">
                        <button class="text-red-500 hover:text-red-700" onclick="this.closest('tr').remove()">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </td>
                `,s.appendChild(t)),e.classList.contains("draggable-mecanico")){const n=e.getAttribute("data-nombre");t.querySelector('[name="mecanico"]').textContent=n}else if(e.classList.contains("draggable-supervisor")){const n=e.getAttribute("data-supervisor"),l=e.getAttribute("data-modulo");t.querySelector('[name="supervisor"]').textContent=n,t.querySelector('[name="modulo"]').textContent=l}t.classList.contains("selected")&&t.classList.remove("selected"),e.remove()}});function c(){$.get("/vinculaciones",function(r){const e=$("#vinculacion-tbody");e.empty(),Array.isArray(r)&&r.length>0?r.forEach(t=>{e.append(`
                        <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700 draggable-row" data-id="${t.id||""}">
                            <td class="px-4 py-2">${t.Supervisor||""}</td>
                            <td class="px-4 py-2">${t.Mecanico||""}</td>
                            <td class="px-4 py-2">${t.Modulo||""}</td>
                            <td class="px-4 py-2">${t.Hora_Comida||""}</td>
                            <td class="px-4 py-2">${t.Break_Lun_Jue||""}</td>
                            <td class="px-4 py-2">${t.Break_Viernes||""}</td>
                            <td class="px-4 py-2"></td>
                        </tr>
                    `)}):e.html('<tr><td colspan="7" class="text-center text-gray-500 dark:text-gray-400 py-4">No hay vinculaciones registradas</td></tr>')})}c(),new Sortable(document.getElementById("vinculacion-tbody"),{animation:150,handle:".draggable-row",ghostClass:"bg-blue-100 dark:bg-blue-900"}),$("#guardar-vinculacion").on("click",function(){const r=[];$("#vinculacion-tbody tr").each(function(){const e=$(this).find("td");r.push({id:$(this).data("id")||null,Supervisor:e.eq(0).text().trim(),Mecanico:e.eq(1).text().trim(),Modulo:e.eq(2).text().trim(),Hora_Comida:e.eq(3).text().trim(),Break_Lun_Jue:e.eq(4).text().trim(),Break_Viernes:e.eq(5).text().trim()})}),$.ajax({url:"/vinculaciones",method:"POST",data:JSON.stringify({vinculaciones:r}),contentType:"application/json",success:function(e){alert(e.message||"Vinculaciones guardadas correctamente"),c()},error:function(e){alert("Error al guardar vinculaciones"),console.error(e)}})})});
