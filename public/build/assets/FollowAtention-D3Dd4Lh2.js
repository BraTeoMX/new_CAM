import{P as k,E as N}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";const O={ASIGNADO:"bg-blue-100 text-blue-800",PROCESO:"bg-yellow-100 text-yellow-800",PENDIENTE:"bg-red-100 text-red-800",ATENDIDO:"bg-green-100 text-green-800",AUTONOMO:"bg-violet-200 text-violet-800",DEFAULT:"bg-gray-100 text-gray-800"},D=["PENDIENTE","ASIGNADO","PROCESO","ATENDIDO","AUTONOMO"],w=new Map,y=new Map,h=new Map;window.Pusher=k;window.Echo=new N({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function B(e){return O[e]||O.DEFAULT}function A(e){return e?new Date(e).toLocaleString():""}function S(e){if(!e)return 0;if(typeof e=="number")return e;if(/^\d+$/.test(e))return parseInt(e);if(/^\d{2}:\d{2}$/.test(e)){const[t,a]=e.split(":").map(Number);return t*60+a}return 0}async function j(e){if(y.has(e))return y.get(e);try{const t=await fetch(`/api/follow-atention/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!t.ok)throw new Error("No se pudo obtener el registro");const a=await t.json();if(a.success){y.set(e,a.data);const n=document.querySelector(`.timer-countdown[data-folio="${e}"]`);if(n){const r=w.get(e);if(r){const i=n.closest(".bg-white, .dark\\:bg-gray-800");i&&(i.outerHTML=T(r),setTimeout(()=>{L()},10))}}return a.data}return null}catch(t){return console.error(t),null}}function T(e){const t=B(e.Status);let a="",n=y.get(e.Folio)||{},r="",i="",s="Tiempo restante:",l="",d="timer-countdown";if(e.Status==="PROCESO"&&(r=n.TimeInicio||"",i=S(n.TimeEstimado)),e.Status==="ATENDIDO"){s="Tiempo total de atención:";let u=0;typeof n.TimeEjecucion<"u"&&n.TimeEjecucion!==null&&n.TimeEjecucion!==""?(u=parseInt(n.TimeEjecucion,10),isNaN(u)&&(u=0)):fetch(`/api/follow-atention/${encodeURIComponent(e.Folio)}`).then(o=>o.json()).then(o=>{if(o.success&&o.data&&o.data.TimeEjecucion!=null){y.set(e.Folio,o.data);const f=document.querySelector(`[data-folio-card="${e.Folio}"]`);f&&(f.outerHTML=T(e))}}),l=`${u} minutos`,d="timer-finalizado",a=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${s}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${d}">
                    ${l}
                </div>
            </div>
        `}else e.Status==="PROCESO"&&(a=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${s}</span>
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
        `);let m="";e.Status==="PROCESO"&&(m=`
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <button class="finalizar-proceso-btn text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    type="button"
                    data-folio="${e.Folio}"
                    data-inicio="${r}"
                    data-estimado="${i}">
                    Finalizar Proceso
                </button>
            </div>
        `);const c=e.Status==="ASIGNADO"?`
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
            ${c}
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
    `);document.addEventListener("click",async function(e){if(e.target&&e.target.classList.contains("finalizar-proceso-btn")){const t=e.target.getAttribute("data-folio"),a=e.target.getAttribute("data-inicio"),n=e.target.getAttribute("data-estimado");window.finalizarAtencionFolio=t,window.finalizarAtencionTimeInicio=a,window.finalizarAtencionTimeEstimado=n,await x("/api/fallas","#falla-select","Fallas"),await x("/api/causas","#causa-select","Causa"),await x("/api/acciones","#accion-select","Accion"),window.dispatchEvent(new CustomEvent("open-drawer",{detail:{id:"drawer-form-finalizar"}})),document.getElementById("drawer-form-finalizar").classList.remove("-translate-x-full")}});async function x(e,t,a){const r=await(await fetch(e)).json(),i=document.querySelector(t);i.innerHTML='<option value="">Seleccione una opción</option>'+r.map(s=>`<option value="${s[a]}">${s[a]}</option>`).join(""),$(i).val("").trigger("change"),$(i).select2({dropdownParent:$("#drawer-form-finalizar"),width:"100%"})}document.getElementById("finalizar-atencion-form").addEventListener("submit",async function(e){var p,I;e.preventDefault();const t=window.finalizarAtencionFolio,a=$("#falla-select").val(),n=$("#causa-select").val(),r=$("#accion-select").val(),i=$("#comentarios-finalizar").val();if(!a||!n||!r){Swal.fire("Error","Debe seleccionar una opción en cada catálogo.","error");return}const s=new Date,l=s.getHours().toString().padStart(2,"0")+":"+s.getMinutes().toString().padStart(2,"0"),d=document.querySelector(`.timer-countdown[data-folio="${t}"], .timer-finalizado[data-folio="${t}"]`);let m="00:00";d&&(m=d.textContent.replace("-","").trim());const c=y.get(t);let u=(c==null?void 0:c.TimeInicio)||window.finalizarAtencionTimeInicio||"";S((c==null?void 0:c.TimeEstimado)||window.finalizarAtencionTimeEstimado||"");let o=0;if(u&&l){const[b,E]=u.split(":").map(Number),[C,M]=l.split(":").map(Number);o=C*60+M-(b*60+E),o<0&&(o+=24*60)}if(h.has(t)&&(clearInterval(h.get(t)),h.delete(t)),c&&(c.TimeEjecucion=o),d){const b=(I=(p=d.parentElement)==null?void 0:p.previousElementSibling)==null?void 0:I.querySelector("span.text-gray-800");b&&(b.textContent="Tiempo total de atención:"),d.classList.remove("text-green-600","text-orange-500","text-red-600","timer-countdown"),d.classList.add("text-blue-700","timer-finalizado"),d.textContent=q(o)}if((await(await fetch("/api/finalizar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:t,falla:a,causa:n,accion:r,comentarios:i,time_final:l,time_real:m,time_ejecucion:o})})).json()).success){let b=null;w.has(t)&&(b=w.get(t).id,w.get(t).Status="ATENDIDO"),b&&await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:b,status:"ATENDIDO"})});const E=document.getElementById("modulo-select").value;E&&await g(E),Swal.fire("¡Éxito!","Atención finalizada correctamente","success"),document.getElementById("drawer-form-finalizar").classList.add("-translate-x-full")}else Swal.fire("Error","No se pudo finalizar la atención","error")});window.addEventListener("open-drawer",function(e){const t=e.detail.id;document.getElementById(t).classList.remove("-translate-x-full")});document.querySelectorAll("[data-drawer-hide]").forEach(e=>{e.addEventListener("click",function(){const t=e.getAttribute("aria-controls");document.getElementById(t).classList.add("-translate-x-full")})});function z(){for(const e of h.values())clearInterval(e);h.clear()}function L(){z(),document.querySelectorAll(".timer-countdown").forEach(e=>{const t=e.dataset.folio;let a=e.dataset.inicio,n=e.dataset.estimado;if(n=S(n),!a||!n)return;let r;if(/^\d{2}:\d{2}$/.test(a)){const[m,c]=a.split(":");r=new Date,r.setHours(parseInt(m),parseInt(c),0,0)}else r=new Date(a);const i=r.getTime()+n*60*1e3;let s=!1;function l(){const m=new Date().getTime(),c=i-m;let u,o,f=!1;if(c<0){f=!0;const p=Math.abs(c);u=Math.floor(p/(1e3*60)),o=Math.floor(p%(1e3*60)/1e3)}else u=Math.floor(c/(1e3*60)),o=Math.floor(c%(1e3*60)/1e3),c<=3e5&&!s&&(s=!0,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Quedan 5 minutos para la OT ${t}`,icon:"warning",timer:5e3}));const v=`${f?"-":""}${u}:${o.toString().padStart(2,"0")}`;e.classList.remove("text-green-600","text-orange-500","text-red-600"),f||c<=n*60*1e3*.25?e.classList.add("text-red-600"):c<=n*60*1e3*.5?e.classList.add("text-orange-500"):e.classList.add("text-green-600"),e.textContent=v}const d=setInterval(l,1e3);h.set(t,d),l()})}async function P(e){var m,c,u;w.clear(),e.forEach(o=>w.set(o.Folio,o));const t=((c=(m=document.getElementById("search-ot"))==null?void 0:m.value)==null?void 0:c.toLowerCase())||"",a=((u=document.getElementById("filter-status"))==null?void 0:u.value)||"";let n=e.slice();const r=["AUTONOMO","ASIGNADO","PROCESO","PENDIENTE","ATENDIDO"];n.sort((o,f)=>{const v=r.indexOf(o.Status),p=r.indexOf(f.Status);return(v===-1?99:v)-(p===-1?99:p)}),t&&(n=n.filter(o=>o.Folio&&o.Folio.toLowerCase().includes(t)||o.Modulo&&o.Modulo.toLowerCase().includes(t)||o.Mecanico&&o.Mecanico.toLowerCase().includes(t)||o.Supervisor&&o.Supervisor.toLowerCase().includes(t)||o.Maquina&&o.Maquina.toLowerCase().includes(t)||o.Problema&&o.Problema.toLowerCase().includes(t))),a&&(n=n.filter(o=>o.Status===a));const s=n.filter(o=>o.Status==="PROCESO").map(o=>j(o.Folio));await Promise.all(s);const l={};D.forEach(o=>l[o]=0),l.total=e.filter(o=>o.Status!=="FINALIZADO").length,e.forEach(o=>{l[o.Status]!==void 0&&l[o.Status]++}),document.getElementById("ot-pendientes")&&(document.getElementById("ot-pendientes").textContent=l.PENDIENTE),document.getElementById("ot-asignadas")&&(document.getElementById("ot-asignadas").textContent=l.ASIGNADO),document.getElementById("ot-proceso")&&(document.getElementById("ot-proceso").textContent=l.PROCESO),document.getElementById("ot-atendidas")&&(document.getElementById("ot-atendidas").textContent=l.ATENDIDO),document.getElementById("ot-autonomas")&&(document.getElementById("ot-autonomas").textContent=l.AUTONOMO),document.getElementById("ot-total")&&(document.getElementById("ot-total").textContent=l.total);const d=document.getElementById("seguimiento-ot-container");d.innerHTML=n.length?n.map(T).join(""):'<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>',L()}function g(e){return fetch("/cardsAteOTs").then(t=>t.json()).then(t=>{let a=t.filter(n=>n.Modulo===e);return P(a)})}window.cargarSeguimientoOTs=g;document.addEventListener("DOMContentLoaded",function(){$("#modulo-select").select2({placeholder:"Selecciona tu módulo de atención",width:"100%"}),axios.get("/obtener-modulos").then(n=>{const r=document.getElementById("modulo-select");n.data.forEach(i=>{let s=i.Modulo||i.moduleid||i.MODULEID||i.value||i,l=i.Modulo||i.moduleid||i.MODULEID||i.value||i;if(s&&l){let d=document.createElement("option");d.value=s,d.textContent=l,r.appendChild(d)}}),$("#modulo-select").trigger("change")}),$("#modulo-select").on("change",function(){const n=this.value;n?(document.getElementById("resumen-bar").classList.remove("hidden"),document.getElementById("filtros-bar").classList.remove("hidden"),g(n)):(document.getElementById("resumen-bar").classList.add("hidden"),document.getElementById("filtros-bar").classList.add("hidden"),document.getElementById("seguimiento-ot-container").innerHTML="")});const e=document.getElementById("search-ot"),t=document.getElementById("filter-status");function a(){const n=document.getElementById("modulo-select").value;n&&g(n)}e&&e.addEventListener("input",a),t&&t.addEventListener("change",a)});document.addEventListener("click",function(e){if(e.target&&e.target.classList.contains("iniciar-atencion-btn")){const t=e.target.getAttribute("data-folio"),a=e.target.getAttribute("data-maquina");F(t,a)}});async function F(e,t){try{const a=await fetch(`/api/clases-maquina/${encodeURIComponent(t)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!a.ok)throw new Error(`HTTP error! status: ${a.status}`);const n=a.headers.get("content-type");if(!n||!n.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const r=await a.json(),{value:i}=await Swal.fire({title:"Seleccionar Clase de Máquina",html:`
                <select id="clase-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${r.map(s=>`
                        <option value="${s.class}"
                                data-tiempo="${s.TimeEstimado}">
                            ${s.class} (${s.TimeEstimado} min)
                        </option>
                    `).join("")}
                </select>
            `,didOpen:()=>{$("#clase-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona una clase",width:"100%"})},preConfirm:()=>{const s=document.getElementById("clase-select"),l=s.options[s.selectedIndex];return s.value?{clase:s.value,tiempo_estimado:l.dataset.tiempo}:(Swal.showValidationMessage("Debes seleccionar una clase"),!1)}});i&&await R(e,i.clase,i.tiempo_estimado)}catch(a){console.error("Error:",a),Swal.fire("Error","No se pudieron cargar las clases de máquina","error")}}async function R(e,t,a){try{const n=new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",hour12:!1}),r=await fetch("/api/iniciar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,clase:t,tiempo_estimado:a,time_inicio:n})});if(!r.ok)throw new Error(`HTTP error! status: ${r.status}`);const i=r.headers.get("content-type");if(!i||!i.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const s=await r.json();if(s.success){await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:s.ot.id,status:"PROCESO"})}),await Swal.fire("¡Éxito!","Atención iniciada correctamente","success");const l=document.getElementById("modulo-select").value;l&&await g(l)}}catch(n){console.error("Error:",n),Swal.fire("Error","No se pudo iniciar la atención","error")}}Notification.permission==="default"&&Notification.requestPermission();document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){const e=document.getElementById("modulo-select").value;e&&g(e)}});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&g(t)}).listen("AsignacionOTReasignada",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&g(t)}).listen("StatusOTUpdated",e=>{var a;const t=(a=document.getElementById("modulo-select"))==null?void 0:a.value;t&&g(t)});
