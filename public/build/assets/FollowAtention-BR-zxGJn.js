import{P as k,E as N}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";const T={FINALIZADO:"bg-blue-100 text-blue-800",ASIGNADO:"bg-green-100 text-green-800",PROCESO:"bg-yellow-100 text-yellow-800",PENDIENTE:"bg-orange-100 text-orange-800",ATENDIDO:"bg-red-100 text-red-800",AUTONOMO:"bg-violet-200 text-violet-800",DEFAULT:"bg-gray-100 text-gray-800"},B=["PENDIENTE","ASIGNADO","PROCESO","ATENDIDO","AUTONOMO","FINALIZADO"],p=new Map,y=new Map,b=new Map;window.Pusher=k;window.Echo=new N({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function D(e){return T[e]||T.DEFAULT}function O(e){return e?new Date(e).toLocaleString():""}function x(e){if(!e)return 0;if(typeof e=="number")return e;if(/^\d+$/.test(e))return parseInt(e);if(/^\d{2}:\d{2}$/.test(e)){const[t,a]=e.split(":").map(Number);return t*60+a}return 0}async function z(e){if(y.has(e))return y.get(e);try{const t=await fetch(`/api/follow-atention/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!t.ok)throw new Error("No se pudo obtener el registro");const a=await t.json();if(a.success){y.set(e,a.data);const n=document.querySelector(`.timer-countdown[data-folio="${e}"]`);if(n){const r=p.get(e);if(r){const i=n.closest(".bg-white, .dark\\:bg-gray-800");i&&(i.outerHTML=A(r),setTimeout(()=>{L()},10))}}return a.data}return null}catch(t){return console.error(t),null}}function A(e){const t=D(e.Status);let a="",n=y.get(e.Folio),r="",i="",o="Tiempo restante:",c="",d="timer-countdown";e.Status==="PROCESO"&&n&&(r=n.TimeInicio||"",i=x(n.TimeEstimado)),e.Status==="ATENDIDO"&&n&&n.TimeEjecucion!=null?(o="Tiempo total de atención:",c=`${parseInt(n.TimeEjecucion)} minutos`,d="timer-finalizado",a=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${o}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${d}">
                    ${c}
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${i||"..."} minutos
                </div>
            </div>
        `):e.Status==="PROCESO"&&(a=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${o}</span>
                </div>
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${e.Folio}"
                     data-inicio="${r}"
                     data-estimado="${i}">
                    <span class="text-gray-400">Cargando...</span>
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${i||"..."} minutos
                </div>
            </div>
        `);let u="";e.Status==="PROCESO"&&(u=`
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <button class="finalizar-proceso-btn text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    type="button"
                    data-folio="${e.Folio}"
                    data-inicio="${r}"
                    data-estimado="${i}">
                    Finalizar Proceso
                </button>
            </div>
        `);const l=e.Status==="ASIGNADO"?`
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button class="iniciar-atencion-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    data-folio="${e.Folio}"
                    data-maquina="${e.Maquina}">
                Iniciar Atención
            </button>
        </div>
    `:"";return`
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-5">
            <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 text-sm font-semibold rounded ${t}">${e.Status}</span>
                <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Folio: ${e.Folio}</span>
            </div>
            <div class="space-y-3">
                <p class="font-bold text-gray-800 dark:text-gray-100">${e.Problema}</p>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>Módulo: <span class="font-semibold">${e.Modulo}</span></div>
                    <div>Máquina: <span class="font-semibold">${e.Maquina}</span></div>
                    <div>Mecánico: <span class="font-semibold">${e.Mecanico}</span></div>
                    <div>Supervisor: <span class="font-semibold">${e.Supervisor}</span></div>
                </div>
                <div class="text-xs text-gray-500 flex justify-between">
                    <span>Creada: ${O(e.created_at)}</span>
                    <span>Actualizada: ${O(e.updated_at)}</span>
                </div>
            </div>
            ${a}
            ${u}
            ${l}
        </div>
    `}function q(e){e=parseInt(e)||0;const t=Math.floor(e/60),a=e%60;return`${t}:${a.toString().padStart(2,"0")}`}document.getElementById("drawer-form-finalizar")||document.body.insertAdjacentHTML("beforeend",`
    <div id="drawer-form-finalizar" class="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform -translate-x-full bg-white w-80 dark:bg-gray-800" tabindex="-1" aria-labelledby="drawer-form-label">
        <h5 class="inline-flex items-center mb-6 text-base font-semibold text-gray-500 uppercase dark:text-gray-400">
            <span class="material-symbols-outlined mr-2">assignment_turned_in</span>Finalizar Atención
        </h5>
        <button type="button" data-drawer-hide="drawer-form-finalizar" aria-controls="drawer-form-finalizar" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
            </svg>
            <span class="sr-only">Close menu</span>
        </button>
        <form id="finalizar-atencion-form" class="mb-6">
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione que falla tenía:</label>
                <select id="falla-select" class="swal2-select w-full"></select>
            </div>
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione la causa de la falla:</label>
                <select id="causa-select" class="swal2-select w-full"></select>
            </div>
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Seleccione la acción que implementó:</label>
                <select id="accion-select" class="swal2-select w-full"></select>
            </div>
            <div class="mb-6">
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Comentarios adicionales (opcional):</label>
                <textarea id="comentarios-finalizar" rows="3" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
            </div>
            <button type="submit" class="text-white justify-center flex items-center bg-blue-700 hover:bg-blue-800 w-full focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                Finalizar Atención
            </button>
        </form>
    </div>
    `);document.addEventListener("click",async function(e){if(e.target&&e.target.classList.contains("finalizar-proceso-btn")){const t=e.target.getAttribute("data-folio"),a=e.target.getAttribute("data-inicio"),n=e.target.getAttribute("data-estimado");window.finalizarAtencionFolio=t,window.finalizarAtencionTimeInicio=a,window.finalizarAtencionTimeEstimado=n,await E("/api/fallas","#falla-select","Fallas"),await E("/api/causas","#causa-select","Causa"),await E("/api/acciones","#accion-select","Accion"),window.dispatchEvent(new CustomEvent("open-drawer",{detail:{id:"drawer-form-finalizar"}})),document.getElementById("drawer-form-finalizar").classList.remove("-translate-x-full")}});async function E(e,t,a){const r=await(await fetch(e)).json(),i=document.querySelector(t);i.innerHTML='<option value="">Seleccione una opción</option>'+r.map(o=>`<option value="${o[a]}">${o[a]}</option>`).join(""),$(i).val("").trigger("change"),$(i).select2({dropdownParent:$("#drawer-form-finalizar"),width:"100%"})}document.getElementById("finalizar-atencion-form").addEventListener("submit",async function(e){var w,I;e.preventDefault();const t=window.finalizarAtencionFolio,a=$("#falla-select").val(),n=$("#causa-select").val(),r=$("#accion-select").val(),i=$("#comentarios-finalizar").val();if(!a||!n||!r){Swal.fire("Error","Debe seleccionar una opción en cada catálogo.","error");return}const o=new Date,c=o.getHours().toString().padStart(2,"0")+":"+o.getMinutes().toString().padStart(2,"0"),d=document.querySelector(`.timer-countdown[data-folio="${t}"], .timer-finalizado[data-folio="${t}"]`);let u="00:00";d&&(u=d.textContent.replace("-","").trim());const l=y.get(t);let s=(l==null?void 0:l.TimeInicio)||window.finalizarAtencionTimeInicio||"";x((l==null?void 0:l.TimeEstimado)||window.finalizarAtencionTimeEstimado||"");let m=0;if(s&&c){const[g,v]=s.split(":").map(Number),[C,M]=c.split(":").map(Number);m=C*60+M-(g*60+v),m<0&&(m+=24*60)}if(b.has(t)&&(clearInterval(b.get(t)),b.delete(t)),l&&(l.TimeEjecucion=m),d){const g=(I=(w=d.parentElement)==null?void 0:w.previousElementSibling)==null?void 0:I.querySelector("span.text-gray-800");g&&(g.textContent="Tiempo total de atención:"),d.classList.remove("text-green-600","text-orange-500","text-red-600","timer-countdown"),d.classList.add("text-blue-700","timer-finalizado"),d.textContent=q(m)}if((await(await fetch("/api/finalizar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:t,falla:a,causa:n,accion:r,comentarios:i,time_final:c,time_real:u,time_ejecucion:m})})).json()).success){let g=null;p.has(t)&&(g=p.get(t).id,p.get(t).Status="ATENDIDO"),g&&await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:g,status:"ATENDIDO"})});const v=document.getElementById("modulo-select").value;v&&await f(v),Swal.fire("¡Éxito!","Atención finalizada correctamente","success"),document.getElementById("drawer-form-finalizar").classList.add("-translate-x-full")}else Swal.fire("Error","No se pudo finalizar la atención","error")});window.addEventListener("open-drawer",function(e){const t=e.detail.id;document.getElementById(t).classList.remove("-translate-x-full")});document.querySelectorAll("[data-drawer-hide]").forEach(e=>{e.addEventListener("click",function(){const t=e.getAttribute("aria-controls");document.getElementById(t).classList.add("-translate-x-full")})});function j(){for(const e of b.values())clearInterval(e);b.clear()}function L(){j(),document.querySelectorAll(".timer-countdown").forEach(e=>{const t=e.dataset.folio;let a=e.dataset.inicio,n=e.dataset.estimado;if(n=x(n),!a||!n)return;let r;if(/^\d{2}:\d{2}$/.test(a)){const[u,l]=a.split(":");r=new Date,r.setHours(parseInt(u),parseInt(l),0,0)}else r=new Date(a);const i=r.getTime()+n*60*1e3;let o=!1;function c(){const u=new Date().getTime(),l=i-u;let s,m,h=!1;if(l<0){h=!0;const w=Math.abs(l);s=Math.floor(w/(1e3*60)),m=Math.floor(w%(1e3*60)/1e3)}else s=Math.floor(l/(1e3*60)),m=Math.floor(l%(1e3*60)/1e3),l<=3e5&&!o&&(o=!0,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Quedan 5 minutos para la OT ${t}`,icon:"warning",timer:5e3}));const S=`${h?"-":""}${s}:${m.toString().padStart(2,"0")}`;e.classList.remove("text-green-600","text-orange-500","text-red-600"),h||l<=n*60*1e3*.25?e.classList.add("text-red-600"):l<=n*60*1e3*.5?e.classList.add("text-orange-500"):e.classList.add("text-green-600"),e.textContent=S}const d=setInterval(c,1e3);b.set(t,d),c()})}async function P(e){var d,u,l;p.clear(),e.forEach(s=>p.set(s.Folio,s));const t=((u=(d=document.getElementById("search-ot"))==null?void 0:d.value)==null?void 0:u.toLowerCase())||"",a=((l=document.getElementById("filter-status"))==null?void 0:l.value)||"";let n=e.filter(s=>s.Status!=="FINALIZADO");t&&(n=n.filter(s=>s.Folio&&s.Folio.toLowerCase().includes(t)||s.Modulo&&s.Modulo.toLowerCase().includes(t)||s.Mecanico&&s.Mecanico.toLowerCase().includes(t)||s.Supervisor&&s.Supervisor.toLowerCase().includes(t)||s.Maquina&&s.Maquina.toLowerCase().includes(t)||s.Problema&&s.Problema.toLowerCase().includes(t))),a&&(n=n.filter(s=>s.Status===a));const i=n.filter(s=>s.Status==="PROCESO").map(s=>z(s.Folio));await Promise.all(i);const o={};B.forEach(s=>o[s]=0),o.total=e.filter(s=>s.Status!=="AUTONOMO").length,e.forEach(s=>{o[s.Status]!==void 0&&o[s.Status]++}),document.getElementById("ot-pendientes")&&(document.getElementById("ot-pendientes").textContent=o.PENDIENTE),document.getElementById("ot-asignadas")&&(document.getElementById("ot-asignadas").textContent=o.ASIGNADO),document.getElementById("ot-proceso")&&(document.getElementById("ot-proceso").textContent=o.PROCESO),document.getElementById("ot-atendidas")&&(document.getElementById("ot-atendidas").textContent=o.ATENDIDO),document.getElementById("ot-autonomas")&&(document.getElementById("ot-autonomas").textContent=o.AUTONOMO),document.getElementById("ot-finalizadas")&&(document.getElementById("ot-finalizadas").textContent=o.FINALIZADO),document.getElementById("ot-total")&&(document.getElementById("ot-total").textContent=o.total);const c=document.getElementById("seguimiento-ot-container");c.innerHTML=n.length?n.map(A).join(""):'<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>',L()}function f(e){return fetch("/cardsAteOTs").then(t=>t.json()).then(t=>{let a=t.filter(n=>n.Modulo===e);return P(a)})}window.cargarSeguimientoOTs=f;document.addEventListener("DOMContentLoaded",function(){$("#modulo-select").select2({placeholder:"Selecciona tu módulo de atención",width:"100%"}),axios.get("/obtener-modulos").then(n=>{const r=document.getElementById("modulo-select");n.data.forEach(i=>{let o=i.Modulo||i.moduleid||i.MODULEID||i.value||i,c=i.Modulo||i.moduleid||i.MODULEID||i.value||i;if(o&&c){let d=document.createElement("option");d.value=o,d.textContent=c,r.appendChild(d)}}),$("#modulo-select").trigger("change")}),$("#modulo-select").on("change",function(){const n=this.value;n?(document.getElementById("resumen-bar").classList.remove("hidden"),document.getElementById("filtros-bar").classList.remove("hidden"),f(n)):(document.getElementById("resumen-bar").classList.add("hidden"),document.getElementById("filtros-bar").classList.add("hidden"),document.getElementById("seguimiento-ot-container").innerHTML="")});const e=document.getElementById("search-ot"),t=document.getElementById("filter-status");function a(){const n=document.getElementById("modulo-select").value;n&&f(n)}e&&e.addEventListener("input",a),t&&t.addEventListener("change",a)});document.addEventListener("click",function(e){if(e.target&&e.target.classList.contains("iniciar-atencion-btn")){const t=e.target.getAttribute("data-folio"),a=e.target.getAttribute("data-maquina");F(t,a)}});async function F(e,t){try{const a=await fetch(`/api/clases-maquina/${encodeURIComponent(t)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!a.ok)throw new Error(`HTTP error! status: ${a.status}`);const n=a.headers.get("content-type");if(!n||!n.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const r=await a.json(),{value:i}=await Swal.fire({title:"Seleccionar Clase de Máquina",html:`
                <select id="clase-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${r.map(o=>`
                        <option value="${o.class}"
                                data-tiempo="${o.TimeEstimado}">
                            ${o.class} (${o.TimeEstimado} min)
                        </option>
                    `).join("")}
                </select>
            `,didOpen:()=>{$("#clase-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona una clase",width:"100%"})},preConfirm:()=>{const o=document.getElementById("clase-select"),c=o.options[o.selectedIndex];return o.value?{clase:o.value,tiempo_estimado:c.dataset.tiempo}:(Swal.showValidationMessage("Debes seleccionar una clase"),!1)}});i&&await R(e,i.clase,i.tiempo_estimado)}catch(a){console.error("Error:",a),Swal.fire("Error","No se pudieron cargar las clases de máquina","error")}}async function R(e,t,a){try{const n=new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",hour12:!1}),r=await fetch("/api/iniciar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,clase:t,tiempo_estimado:a,time_inicio:n})});if(!r.ok)throw new Error(`HTTP error! status: ${r.status}`);const i=r.headers.get("content-type");if(!i||!i.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const o=await r.json();if(o.success){await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:o.ot.id,status:"PROCESO"})}),await Swal.fire("¡Éxito!","Atención iniciada correctamente","success");const c=document.getElementById("modulo-select").value;c&&await f(c)}}catch(n){console.error("Error:",n),Swal.fire("Error","No se pudo iniciar la atención","error")}}Notification.permission==="default"&&Notification.requestPermission();document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){const e=document.getElementById("modulo-select").value;e&&f(e)}});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&f(t)}).listen("AsignacionOTReasignada",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&f(t)}).listen("StatusOTUpdated",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&f(t)});
