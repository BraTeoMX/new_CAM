import{P as k,E as N}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";const O={ASIGNADO:"bg-blue-100 text-blue-800",PROCESO:"bg-yellow-100 text-yellow-800",PENDIENTE:"bg-red-100 text-red-800",ATENDIDO:"bg-green-100 text-green-800",AUTONOMO:"bg-violet-200 text-violet-800",DEFAULT:"bg-gray-100 text-gray-800"},B=["PENDIENTE","ASIGNADO","PROCESO","ATENDIDO","AUTONOMO"],b=new Map,w=new Map,y=new Map;window.Pusher=k;window.Echo=new N({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function D(e){return O[e]||O.DEFAULT}function A(e){return e?new Date(e).toLocaleString():""}function x(e){if(!e)return 0;if(typeof e=="number")return e;if(/^\d+$/.test(e))return parseInt(e);if(/^\d{2}:\d{2}$/.test(e)){const[t,a]=e.split(":").map(Number);return t*60+a}return 0}async function j(e){if(w.has(e))return w.get(e);try{const t=await fetch(`/api/follow-atention/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!t.ok)throw new Error("No se pudo obtener el registro");const a=await t.json();if(a.success){w.set(e,a.data);const n=document.querySelector(`.timer-countdown[data-folio="${e}"]`);if(n){const r=b.get(e);if(r){const s=n.closest(".bg-white, .dark\\:bg-gray-800");s&&(s.outerHTML=S(r),setTimeout(()=>{L()},10))}}return a.data}return null}catch(t){return console.error(t),null}}function S(e){const t=D(e.Status);let a="",n=w.get(e.Folio)||{},r="",s="",i="Tiempo restante:",c="",d="timer-countdown";if(e.Status==="PROCESO"&&(r=n.TimeInicio||"",s=x(n.TimeEstimado)),e.Status==="ATENDIDO"){i="Tiempo total de atención:";let o=0;typeof n.TimeEjecucion<"u"&&n.TimeEjecucion!==null&&n.TimeEjecucion!==""?(o=parseInt(n.TimeEjecucion,10),isNaN(o)&&(o=0)):fetch(`/api/follow-atention/${encodeURIComponent(e.Folio)}`).then(u=>u.json()).then(u=>{if(u.success&&u.data&&u.data.TimeEjecucion!=null){w.set(e.Folio,u.data);const p=document.querySelector(`[data-folio-card="${e.Folio}"]`);p&&(p.outerHTML=S(e))}}),c=`${o} minutos`,d="timer-finalizado",a=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${i}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${d}">
                    ${c}
                </div>
            </div>
        `}else e.Status==="PROCESO"&&(a=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${i}</span>
                </div>
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${e.Folio}"
                     data-inicio="${r}"
                     data-estimado="${s}">
                    <span class="text-gray-400">Cargando...</span>
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${s||"..."} minutos
                </div>
            </div>
        `);let m="";e.Status==="PROCESO"&&(m=`
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <button class="finalizar-proceso-btn text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    type="button"
                    data-folio="${e.Folio}"
                    data-inicio="${r}"
                    data-estimado="${s}">
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
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-5" data-folio-card="${e.Folio}">
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
                    <span>Creada: ${A(e.created_at)}</span>
                    <span>Actualizada: ${A(e.updated_at)}</span>
                </div>
            </div>
            ${a}
            ${m}
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
    `);document.addEventListener("click",async function(e){if(e.target&&e.target.classList.contains("finalizar-proceso-btn")){const t=e.target.getAttribute("data-folio"),a=e.target.getAttribute("data-inicio"),n=e.target.getAttribute("data-estimado");window.finalizarAtencionFolio=t,window.finalizarAtencionTimeInicio=a,window.finalizarAtencionTimeEstimado=n,await E("/api/fallas","#falla-select","Fallas"),await E("/api/causas","#causa-select","Causa"),await E("/api/acciones","#accion-select","Accion"),window.dispatchEvent(new CustomEvent("open-drawer",{detail:{id:"drawer-form-finalizar"}})),document.getElementById("drawer-form-finalizar").classList.remove("-translate-x-full")}});async function E(e,t,a){const r=await(await fetch(e)).json(),s=document.querySelector(t);s.innerHTML='<option value="">Seleccione una opción</option>'+r.map(i=>`<option value="${i[a]}">${i[a]}</option>`).join(""),$(s).val("").trigger("change"),$(s).select2({dropdownParent:$("#drawer-form-finalizar"),width:"100%"})}document.getElementById("finalizar-atencion-form").addEventListener("submit",async function(e){var h,I;e.preventDefault();const t=window.finalizarAtencionFolio,a=$("#falla-select").val(),n=$("#causa-select").val(),r=$("#accion-select").val(),s=$("#comentarios-finalizar").val();if(!a||!n||!r){Swal.fire("Error","Debe seleccionar una opción en cada catálogo.","error");return}const i=new Date,c=i.getHours().toString().padStart(2,"0")+":"+i.getMinutes().toString().padStart(2,"0"),d=document.querySelector(`.timer-countdown[data-folio="${t}"], .timer-finalizado[data-folio="${t}"]`);let m="00:00";d&&(m=d.textContent.replace("-","").trim());const l=w.get(t);let o=(l==null?void 0:l.TimeInicio)||window.finalizarAtencionTimeInicio||"";x((l==null?void 0:l.TimeEstimado)||window.finalizarAtencionTimeEstimado||"");let u=0;if(o&&c){const[g,v]=o.split(":").map(Number),[C,M]=c.split(":").map(Number);u=C*60+M-(g*60+v),u<0&&(u+=24*60)}if(y.has(t)&&(clearInterval(y.get(t)),y.delete(t)),l&&(l.TimeEjecucion=u),d){const g=(I=(h=d.parentElement)==null?void 0:h.previousElementSibling)==null?void 0:I.querySelector("span.text-gray-800");g&&(g.textContent="Tiempo total de atención:"),d.classList.remove("text-green-600","text-orange-500","text-red-600","timer-countdown"),d.classList.add("text-blue-700","timer-finalizado"),d.textContent=q(u)}if((await(await fetch("/api/finalizar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:t,falla:a,causa:n,accion:r,comentarios:s,time_final:c,time_real:m,time_ejecucion:u})})).json()).success){let g=null;b.has(t)&&(g=b.get(t).id,b.get(t).Status="ATENDIDO"),g&&await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:g,status:"ATENDIDO"})});const v=document.getElementById("modulo-select").value;v&&await f(v),Swal.fire("¡Éxito!","Atención finalizada correctamente","success"),document.getElementById("drawer-form-finalizar").classList.add("-translate-x-full")}else Swal.fire("Error","No se pudo finalizar la atención","error")});window.addEventListener("open-drawer",function(e){const t=e.detail.id;document.getElementById(t).classList.remove("-translate-x-full")});document.querySelectorAll("[data-drawer-hide]").forEach(e=>{e.addEventListener("click",function(){const t=e.getAttribute("aria-controls");document.getElementById(t).classList.add("-translate-x-full")})});function z(){for(const e of y.values())clearInterval(e);y.clear()}function L(){z(),document.querySelectorAll(".timer-countdown").forEach(e=>{const t=e.dataset.folio;let a=e.dataset.inicio,n=e.dataset.estimado;if(n=x(n),!a||!n)return;let r;if(/^\d{2}:\d{2}$/.test(a)){const[m,l]=a.split(":");r=new Date,r.setHours(parseInt(m),parseInt(l),0,0)}else r=new Date(a);const s=r.getTime()+n*60*1e3;let i=!1;function c(){const m=new Date().getTime(),l=s-m;let o,u,p=!1;if(l<0){p=!0;const h=Math.abs(l);o=Math.floor(h/(1e3*60)),u=Math.floor(h%(1e3*60)/1e3)}else o=Math.floor(l/(1e3*60)),u=Math.floor(l%(1e3*60)/1e3),l<=3e5&&!i&&(i=!0,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Quedan 5 minutos para la OT ${t}`,icon:"warning",timer:5e3}));const T=`${p?"-":""}${o}:${u.toString().padStart(2,"0")}`;e.classList.remove("text-green-600","text-orange-500","text-red-600"),p||l<=n*60*1e3*.25?e.classList.add("text-red-600"):l<=n*60*1e3*.5?e.classList.add("text-orange-500"):e.classList.add("text-green-600"),e.textContent=T}const d=setInterval(c,1e3);y.set(t,d),c()})}async function F(e){var d,m,l;b.clear(),e.forEach(o=>b.set(o.Folio,o));const t=((m=(d=document.getElementById("search-ot"))==null?void 0:d.value)==null?void 0:m.toLowerCase())||"",a=((l=document.getElementById("filter-status"))==null?void 0:l.value)||"";let n=e.filter(o=>o.Status!=="FINALIZADO");t&&(n=n.filter(o=>o.Folio&&o.Folio.toLowerCase().includes(t)||o.Modulo&&o.Modulo.toLowerCase().includes(t)||o.Mecanico&&o.Mecanico.toLowerCase().includes(t)||o.Supervisor&&o.Supervisor.toLowerCase().includes(t)||o.Maquina&&o.Maquina.toLowerCase().includes(t)||o.Problema&&o.Problema.toLowerCase().includes(t))),a&&(n=n.filter(o=>o.Status===a));const s=n.filter(o=>o.Status==="PROCESO").map(o=>j(o.Folio));await Promise.all(s);const i={};B.forEach(o=>i[o]=0),i.total=e.filter(o=>o.Status!=="FINALIZADO").length,e.forEach(o=>{i[o.Status]!==void 0&&i[o.Status]++}),document.getElementById("ot-pendientes")&&(document.getElementById("ot-pendientes").textContent=i.PENDIENTE),document.getElementById("ot-asignadas")&&(document.getElementById("ot-asignadas").textContent=i.ASIGNADO),document.getElementById("ot-proceso")&&(document.getElementById("ot-proceso").textContent=i.PROCESO),document.getElementById("ot-atendidas")&&(document.getElementById("ot-atendidas").textContent=i.ATENDIDO),document.getElementById("ot-autonomas")&&(document.getElementById("ot-autonomas").textContent=i.AUTONOMO),document.getElementById("ot-total")&&(document.getElementById("ot-total").textContent=i.total);const c=document.getElementById("seguimiento-ot-container");c.innerHTML=n.length?n.map(S).join(""):'<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>',L()}function f(e){return fetch("/cardsAteOTs").then(t=>t.json()).then(t=>{let a=t.filter(n=>n.Modulo===e);return F(a)})}window.cargarSeguimientoOTs=f;document.addEventListener("DOMContentLoaded",function(){$("#modulo-select").select2({placeholder:"Selecciona tu módulo de atención",width:"100%"}),axios.get("/obtener-modulos").then(n=>{const r=document.getElementById("modulo-select");n.data.forEach(s=>{let i=s.Modulo||s.moduleid||s.MODULEID||s.value||s,c=s.Modulo||s.moduleid||s.MODULEID||s.value||s;if(i&&c){let d=document.createElement("option");d.value=i,d.textContent=c,r.appendChild(d)}}),$("#modulo-select").trigger("change")}),$("#modulo-select").on("change",function(){const n=this.value;n?(document.getElementById("resumen-bar").classList.remove("hidden"),document.getElementById("filtros-bar").classList.remove("hidden"),f(n)):(document.getElementById("resumen-bar").classList.add("hidden"),document.getElementById("filtros-bar").classList.add("hidden"),document.getElementById("seguimiento-ot-container").innerHTML="")});const e=document.getElementById("search-ot"),t=document.getElementById("filter-status");function a(){const n=document.getElementById("modulo-select").value;n&&f(n)}e&&e.addEventListener("input",a),t&&t.addEventListener("change",a)});document.addEventListener("click",function(e){if(e.target&&e.target.classList.contains("iniciar-atencion-btn")){const t=e.target.getAttribute("data-folio"),a=e.target.getAttribute("data-maquina");P(t,a)}});async function P(e,t){try{const a=await fetch(`/api/clases-maquina/${encodeURIComponent(t)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!a.ok)throw new Error(`HTTP error! status: ${a.status}`);const n=a.headers.get("content-type");if(!n||!n.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const r=await a.json(),{value:s}=await Swal.fire({title:"Seleccionar Clase de Máquina",html:`
                <select id="clase-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${r.map(i=>`
                        <option value="${i.class}"
                                data-tiempo="${i.TimeEstimado}">
                            ${i.class} (${i.TimeEstimado} min)
                        </option>
                    `).join("")}
                </select>
            `,didOpen:()=>{$("#clase-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona una clase",width:"100%"})},preConfirm:()=>{const i=document.getElementById("clase-select"),c=i.options[i.selectedIndex];return i.value?{clase:i.value,tiempo_estimado:c.dataset.tiempo}:(Swal.showValidationMessage("Debes seleccionar una clase"),!1)}});s&&await R(e,s.clase,s.tiempo_estimado)}catch(a){console.error("Error:",a),Swal.fire("Error","No se pudieron cargar las clases de máquina","error")}}async function R(e,t,a){try{const n=new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",hour12:!1}),r=await fetch("/api/iniciar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,clase:t,tiempo_estimado:a,time_inicio:n})});if(!r.ok)throw new Error(`HTTP error! status: ${r.status}`);const s=r.headers.get("content-type");if(!s||!s.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const i=await r.json();if(i.success){await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:i.ot.id,status:"PROCESO"})}),await Swal.fire("¡Éxito!","Atención iniciada correctamente","success");const c=document.getElementById("modulo-select").value;c&&await f(c)}}catch(n){console.error("Error:",n),Swal.fire("Error","No se pudo iniciar la atención","error")}}Notification.permission==="default"&&Notification.requestPermission();document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){const e=document.getElementById("modulo-select").value;e&&f(e)}});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&f(t)}).listen("AsignacionOTReasignada",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&f(t)}).listen("StatusOTUpdated",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&f(t)});
