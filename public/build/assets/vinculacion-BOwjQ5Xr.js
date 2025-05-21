const h=document.querySelector('meta[name="csrf-token"]').getAttribute("content");document.addEventListener("DOMContentLoaded",function(){let l=[],d=[],u=new Map;const b=document.getElementById("mecanicos-list"),y=document.getElementById("supervisores-list"),s=document.getElementById("vinculacion-tbody");function w(r){var t;return((t=u.get(r))==null?void 0:t.cvetra)||""}function f(r){const t=w(r);return t?`http://128.150.102.45:8000/Intimark/${t}.jpg`:"/default-avatar.jpg"}function _(){fetch("/mecanicos").then(r=>r.json()).then(r=>{l=r,u.clear(),l.forEach(t=>{u.set(t.nombre,t)}),b.innerHTML=l.map(t=>`
                    <div class="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-mecanico"
                         data-nombre="${t.nombre||""}"
                         data-cvetra="${t.cvetra||""}"
                         data-index="${l.indexOf(t)}">
                        <img class="w-10 h-10 rounded-full ring-2 ring-gray-300"
                             src="${f(t.nombre)}"
                             alt="${t.cvetra}"/>
                        <div>
                            <h3 class="font-medium">${t.nombre}</h3>
                            <p class="text-sm text-gray-500">${t.cvetra}</p>
                        </div>
                    </div>
                `).join(""),x()})}function B(){fetch("/supervisores").then(r=>r.json()).then(r=>{d=r,y.innerHTML=d.map(t=>`
                    <div class="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md cursor-move draggable-supervisor"
                         data-supervisor="${t.Nombre||""}"
                         data-modulo="${t.Modulo||""}"
                         data-index="${d.indexOf(t)}">
                        <div>
                            <h3 class="font-medium">Módulo: ${t.Modulo}</h3>
                            <p class="text-sm text-gray-500">Supervisor: ${t.Nombre}</p>
                        </div>
                    </div>
                `).join(""),x()})}function E(){let r=Array.from(s.getElementsByTagName("tr")).find(t=>{var a,n;const o=(a=t.querySelector('[name="mecanico"] .mecanico-nombre'))==null?void 0:a.textContent.trim(),e=(n=t.querySelector('[name="supervisor-modulo"]'))==null?void 0:n.textContent.trim();return!o||!e||o===""||e===""});return r||(r=document.createElement("tr"),r.className="bg-white dark:bg-gray-800 border-b dark:border-gray-700",r.innerHTML=`
                <td name="supervisor-modulo" class="px-4 py-2"></td>
                <td name="mecanico" class="px-4 py-2 flex items-center gap-2">
                    <div class="flex-shrink-0">
                        <img class="w-10 h-10 rounded-full ring-2 ring-gray-300" alt=""/>
                    </div>
                    <span class="mecanico-nombre"></span>
                </td>
                <td name="comida" class="px-4 py-2">${c()}</td>
                <td name="break-lj" class="px-4 py-2">${c()}</td>
                <td name="break-v" class="px-4 py-2">${c()}</td>
                <td class="px-4 py-2">
                    <button onclick="this.closest('tr').remove()" class="text-red-500 hover:text-red-700">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </td>
            `,s.insertBefore(r,s.firstChild)),r}function x(){if(l.length&&d.length){const r={animation:150,forceFallback:!1,delayOnTouchOnly:!0,delay:100,touchStartThreshold:5,fallbackTolerance:3,ghostClass:"bg-blue-100"};new Sortable(b,{...r,group:{name:"shared",pull:"clone",put:!1},sort:!1,onClone:t=>{requestAnimationFrame(()=>{t.item.style.transform="translate3d(0, 0, 0)"})}}),new Sortable(y,{...r,group:{name:"shared",pull:"clone",put:!1},sort:!1}),new Sortable(s,{...r,group:{name:"shared",pull:!1,put:!0},onAdd:function(t){requestAnimationFrame(()=>{const o=t.item,e=parseInt(o.getAttribute("data-index"));let a=E();if(a!==s.firstChild&&s.insertBefore(a,s.firstChild),o.classList.contains("draggable-mecanico")){const n=l[e];n&&M(a,n)}else if(o.classList.contains("draggable-supervisor")){const n=d[e];n&&T(a,n)}o.remove()})}})}}function M(r,t){const o=r.querySelector('[name="mecanico"]'),e=o.querySelector("img");e.src=f(t.nombre),e.alt=t.cvetra,o.querySelector(".mecanico-nombre").textContent=t.nombre,r.setAttribute("data-cvetra",t.cvetra)}function T(r,t){const o=r.querySelector('[name="supervisor-modulo"]');o.innerHTML=`Mod: ${t.Modulo}<br>Sup: ${t.Nombre}`,r.setAttribute("data-supervisor",t.Nombre),r.setAttribute("data-modulo",t.Modulo)}window.validateTimeRange=function(r){const t=r.closest("div"),o=t.querySelector("select:first-child"),e=t.querySelector("select:last-child"),a=r.closest("td").getAttribute("name").replace("-"," "),n=o.value,i=e.value;return n&&i&&n>=i?(Swal.fire({title:"Error en horario",text:`La hora de fin debe ser mayor a la hora de inicio en ${a}`,icon:"warning",confirmButtonColor:"#d33"}).then(()=>{r.value=""}),!1):!0};function c(r="",t=""){const o=[];for(let e=8;e<=17;e++)["00","10","15","20","25","30","35","40","45","50"].forEach(a=>{(e!==17||e===17&&a<="50")&&o.push(`${String(e).padStart(2,"0")}:${a}`)});return`<div class="flex items-center gap-1">
            <select class="bg-transparent border-gray-300 dark:border-gray-700 rounded w-1/2"
                    onchange="validateTimeRange(this)">
                <option value="">Inicio</option>
                ${o.map(e=>`<option value="${e}" ${e===r?"selected":""}>${e}</option>`).join("")}
            </select>
            <select class="bg-transparent border-gray-300 dark:border-gray-700 rounded w-1/2"
                    onchange="validateTimeRange(this)">
                <option value="">Fin</option>
                ${o.map(e=>`<option value="${e}" ${e===t?"selected":""}>${e}</option>`).join("")}
            </select>
        </div>`}_(),B(),window.deleteVinculacion=function(r,t){Swal.fire({title:"¿Está seguro?",text:"Esta acción no se puede deshacer",icon:"warning",showCancelButton:!0,confirmButtonColor:"#d33",cancelButtonColor:"#3085d6",confirmButtonText:"Sí, eliminar",cancelButtonText:"Cancelar"}).then(o=>{o.isConfirmed&&fetch(`/vinculaciones/${t}`,{method:"DELETE",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":h}}).then(e=>e.json()).then(e=>{if(e.success)Swal.fire("Eliminado","El registro ha sido eliminado.","success"),r.closest("tr").remove();else throw new Error(e.message)}).catch(e=>{console.error("Error:",e),Swal.fire("Error","No se pudo eliminar el registro","error")})})};function S(){s.innerHTML=`
            <tr class="animate-pulse bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <td class="px-4 py-2"><div class="h-6 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2">
                    <div class="flex items-center gap-2">
                        <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div class="h-6 bg-gray-200 rounded w-32"></div></td>
                    </div>
                </td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-6 w-6 bg-gray-200 rounded"></div></td>
            </tr>
            <tr class="animate-pulse bg-white dark:bg-gray-800 border-b dark:border-gray-700">
                <td class="px-4 py-2"><div class="h-6 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2">
                    <div class="flex items-center gap-2">
                        <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div class="h-6 bg-gray-200 rounded w-32"></div>
                    </div>
                </td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-8 bg-gray-200 rounded"></div></td>
                <td class="px-4 py-2"><div class="h-6 w-6 bg-gray-200 rounded"></div></td>
            </tr>`,fetch("/vinculaciones").then(r=>r.json()).then(r=>{const t=r.reduce((o,e)=>{const a=`${e.Supervisor}-${e.Modulo}-${e.Hora_Comida_Inicio}-${e.Hora_Comida_Fin}-${e.Break_Lun_Jue_Inicio}-${e.Break_Lun_Jue_Fin}-${e.Break_Viernes_Inicio}-${e.Break_Viernes_Fin}`;return o[a]?o[a].mecanicos.push({id:e.id,nombre:e.Mecanico,cvetra:e.Mecanico}):o[a]={...e,mecanicos:[{id:e.id,nombre:e.Mecanico,cvetra:e.Mecanico}]},o},{});s.innerHTML=Object.values(t).map(o=>`
                    <tr class="bg-white dark:bg-gray-800 border-b dark:border-gray-700"
                        data-ids="${o.mecanicos.map(e=>e.id).join(",")}"
                        data-modulo="${o.Modulo}"
                        data-supervisor="${o.Supervisor}">
                        <td name="supervisor-modulo" class="px-4 py-2">
                            Mod: ${o.Modulo}<br>Sup: ${o.Supervisor}
                        </td>
                        <td name="mecanico" class="px-4 py-2">
                            <div class="flex flex-col gap-2">
                                ${o.mecanicos.map(e=>`
                                    <div class="flex items-center gap-2">
                                        <div class="flex-shrink-0">
                                            <img class="w-10 h-10 rounded-full ring-2 ring-gray-300"
                                                 src="${f(e.nombre)}"
                                                 alt="${e.nombre}"/>
                                        </div>
                                        <span class="mecanico-nombre">${e.nombre}</span>
                                    </div>
                                `).join("")}
                            </div>
                        </td>
                        <td name="comida" class="px-4 py-2">
                            ${c(o.Hora_Comida_Inicio,o.Hora_Comida_Fin)}
                        </td>
                        <td name="break-lj" class="px-4 py-2">
                            ${c(o.Break_Lun_Jue_Inicio,o.Break_Lun_Jue_Fin)}
                        </td>
                        <td name="break-v" class="px-4 py-2">
                            ${c(o.Break_Viernes_Inicio,o.Break_Viernes_Fin)}
                        </td>
                        <td class="px-4 py-2">
                            <button onclick="deleteGroupedVinculaciones(this, '${o.mecanicos.map(e=>e.id).join(",")}')"
                                    class="text-red-500 hover:text-red-700">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                          d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </td>
                    </tr>
                `).join("")}).catch(r=>{console.error("Error al cargar vinculaciones:",r),s.innerHTML=`
                    <tr>
                        <td colspan="6" class="px-4 py-2 text-center text-red-500">
                            Error al cargar los datos
                        </td>
                    </tr>
                `})}window.deleteGroupedVinculaciones=function(r,t){Swal.fire({title:"¿Está seguro?",text:"Se eliminarán todas las vinculaciones de este grupo",icon:"warning",showCancelButton:!0,confirmButtonColor:"#d33",cancelButtonColor:"#3085d6",confirmButtonText:"Sí, eliminar",cancelButtonText:"Cancelar"}).then(o=>{if(o.isConfirmed){const e=t.split(",");Promise.all(e.map(a=>fetch(`/vinculaciones/${a}`,{method:"DELETE",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":h}}).then(n=>n.json()))).then(()=>{Swal.fire("Eliminado","Los registros han sido eliminados.","success"),r.closest("tr").remove()}).catch(a=>{console.error("Error:",a),Swal.fire("Error","No se pudieron eliminar los registros","error")})}})},document.getElementById("guardar-vinculacion").addEventListener("click",function(){const r=Array.from(s.children);let t=!0;for(const e of r){const a=["comida","break-lj","break-v"];for(const n of a){const i=e.querySelector(`[name="${n}"]`),m=i.querySelector("select:first-child"),p=i.querySelector("select:last-child");if(!m.value||!p.value){Swal.fire({title:"Campos incompletos",text:`Por favor complete los horarios de ${n.replace("-"," ")}`,icon:"warning",confirmButtonColor:"#3085d6"}),t=!1;return}if(m.value>=p.value){Swal.fire({title:"Error en horarios",text:`La hora de fin debe ser mayor a la hora de inicio en ${n.replace("-"," ")}`,icon:"warning",confirmButtonColor:"#d33"}),t=!1;return}}}if(!t)return;const o=Array.from(s.children).flatMap(e=>{var k;const a=((k=e.getAttribute("data-ids"))==null?void 0:k.split(","))||[],n=e.querySelectorAll('[name="mecanico"] .mecanico-nombre'),i=e.getAttribute("data-supervisor"),m=e.getAttribute("data-modulo"),p={Hora_Comida_Inicio:e.querySelector('[name="comida"] select:first-child').value,Hora_Comida_Fin:e.querySelector('[name="comida"] select:last-child').value,Break_Lun_Jue_Inicio:e.querySelector('[name="break-lj"] select:first-child').value,Break_Lun_Jue_Fin:e.querySelector('[name="break-lj"] select:last-child').value,Break_Viernes_Inicio:e.querySelector('[name="break-v"] select:first-child').value,Break_Viernes_Fin:e.querySelector('[name="break-v"] select:last-child').value},$=[];return e.querySelectorAll('[name="mecanico"] .mecanico-nombre').forEach(v=>{var C;const g=v.textContent.trim(),j=((C=u.get(g))==null?void 0:C.cvetra)||"";$.push(j)}),Array.from(n).map((v,g)=>({id:a[g]||null,Supervisor:i,Modulo:m,Mecanico:v.textContent.trim(),Num_Mecanico:$[g]||"",...p}))});Swal.fire({title:"¿Desea guardar la información?",icon:"question",showCancelButton:!0,confirmButtonColor:"#3085d6",cancelButtonColor:"#d33",confirmButtonText:"Guardar",cancelButtonText:"Cancelar"}).then(e=>{e.isConfirmed&&fetch("/vinculaciones",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":h},body:JSON.stringify({vinculaciones:o})}).then(a=>a.json()).then(a=>{if(a.success)Swal.fire({title:"Éxito",text:a.message||"Vinculaciones guardadas correctamente",icon:"success",confirmButtonColor:"#3085d6"}).then(()=>{S()});else throw new Error(a.message||"Error al guardar")}).catch(a=>{console.error("Error al guardar vinculaciones:",a),Swal.fire({title:"Error",text:"Error al guardar las vinculaciones",icon:"error",confirmButtonColor:"#d33"})})})}),S()});
