import{P as q,E as j}from"./pusher-RuRbGOpv.js";import"./_commonjsHelpers-Cpj98o6Y.js";const L={ASIGNADO:"bg-blue-100 text-blue-800",PROCESO:"bg-yellow-100 text-yellow-800",PENDIENTE:"bg-red-100 text-red-800",ATENDIDO:"bg-green-100 text-green-800",AUTONOMO:"bg-violet-200 text-violet-800",DEFAULT:"bg-gray-100 text-gray-800"},F=["PENDIENTE","ASIGNADO","PROCESO","ATENDIDO","AUTONOMO"],v=new Map,E=new Map,T=new Map;window.Pusher=q;window.Echo=new j({broadcaster:"pusher",key:"51d9687d2d0bffce329a",cluster:"us3",forceTLS:!0,encrypted:!0});function R(e){return L[e]||L.DEFAULT}function P(e){switch(e){case"ASIGNADO":return"ring-blue-400 dark:ring-blue-400 bg-blue-400";case"PROCESO":return"ring-yellow-400 dark:ring-yellow-400 bg-yellow-400";case"PENDIENTE":return"ring-red-500 dark:ring-red-500 bg-red-500";case"ATENDIDO":return"ring-green-600 dark:ring-green-600 bg-green-600";case"AUTONOMO":return"ring-violet-600 dark:ring-violet-600 bg-violet-600";default:return"ring-gray-400 dark:ring-gray-400 bg-gray-400"}}function B(e){return e?new Date(e).toLocaleString():""}function x(e){if(!e)return 0;if(typeof e=="number")return e;if(/^\d+$/.test(e))return parseInt(e);if(/^\d{2}:\d{2}$/.test(e)){const[t,i]=e.split(":").map(Number);return t*60+i}return 0}async function z(e){if(E.has(e))return E.get(e);try{const t=await fetch(`/api/follow-atention/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!t.ok)throw new Error("No se pudo obtener el registro");const i=await t.json();if(i.success){E.set(e,i.data);const a=document.querySelector(`.timer-countdown[data-folio="${e}"]`);if(a){const s=v.get(e);if(s){const o=a.closest(".bg-white, .dark\\:bg-gray-800");o&&(o.outerHTML=C(s),setTimeout(()=>{M()},10))}}return i.data}return null}catch(t){return console.error(t),null}}function C(e){const t=R(e.Status);let i="",a=E.get(e.Folio)||{},s="";e.ComidaBreak&&e.TerminoComidaBreack&&(s=`
            <div class="mt-2">
                <span class="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                    ${e.ComidaBreak}
                    Regresa a las: ${new Date(e.TerminoComidaBreack).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                </span>
            </div>
        `);let o="",l="",c="Tiempo restante:",r="",d="timer-countdown";if(e.Status==="PROCESO"&&(o=a.TimeInicio||"",l=x(a.TimeEstimado)),e.Status==="ATENDIDO"){c="Tiempo total de atención:";let m=0;typeof a.TimeEjecucion<"u"&&a.TimeEjecucion!==null&&a.TimeEjecucion!==""?(m=parseInt(a.TimeEjecucion,10),isNaN(m)&&(m=0)):fetch(`/api/follow-atention/${encodeURIComponent(e.Folio)}`).then(p=>p.json()).then(p=>{if(p.success&&p.data&&p.data.TimeEjecucion!=null){E.set(e.Folio,p.data);const y=document.querySelector(`[data-folio-card="${e.Folio}"]`);y&&(y.outerHTML=C(e))}}),r=`${m} minutos`,d="timer-finalizado",i=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${c}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${d}">
                    ${r}
                </div>
            </div>
        `}else e.Status==="PROCESO"&&(i=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${c}</span>
                </div>
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${e.Folio}"
                     data-inicio="${o}"
                     data-estimado="${l}">
                    <span class="text-gray-400">Cargando...</span>
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${l||"..."} minutos
                </div>
            </div>
        `);let u="",n="",f="",g=!0,b=0;if(window.bahiaTimers[e.Folio]&&typeof window.bahiaTimers[e.Folio].pulsaciones<"u"&&(b=window.bahiaTimers[e.Folio].pulsaciones),b>=4&&(g=!1),e.Status==="PROCESO"){const m=D(e.Folio);g?n=`
                <button class="bahia-btn text-white ${m?"bg-red-700 hover:bg-red-800":"bg-violet-700 hover:bg-violet-800"} focus:ring-4 focus:ring-violet-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 ml-2 dark:${m?"bg-red-600 hover:bg-red-700":"bg-violet-600 hover:bg-violet-700"} focus:outline-none dark:focus:ring-violet-800"
                    type="button"
                    data-folio="${e.Folio}">
                    ${m?"Fin Bahía":"Inicio Bahía"}
                </button>
            `:n="";const p=window.bahiaTimers[e.Folio]&&(window.bahiaTimers[e.Folio].elapsed>0||window.bahiaTimers[e.Folio].running);f=`
            <div class="mt-2 text-center bahia-timer-container" data-folio="${e.Folio}" style="${p?"":"display:none;"}">
                <div class="text-xs text-gray-500 mb-1">Tiempo Bahía:</div>
                <div class="font-mono text-xl font-bold text-violet-700 timer-bahia" data-folio="${e.Folio}">00:00:00</div>
            </div>
        `,u=`
            <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
                <button class="finalizar-proceso-btn text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    type="button"
                    data-folio="${e.Folio}"
                    data-inicio="${a.TimeInicio||""}"
                    data-estimado="${x(a.TimeEstimado)}">
                    Finalizar Atención
                </button>
                ${n}
            </div>
        `}if(e.Status==="ATENDIDO"){c="Tiempo total de atención:";let m=0;typeof a.TimeEjecucion<"u"&&a.TimeEjecucion!==null&&a.TimeEjecucion!==""?(m=parseInt(a.TimeEjecucion,10),isNaN(m)&&(m=0)):fetch(`/api/follow-atention/${encodeURIComponent(e.Folio)}`).then(p=>p.json()).then(p=>{if(p.success&&p.data&&p.data.TimeEjecucion!=null){E.set(e.Folio,p.data);const y=document.querySelector(`[data-folio-card="${e.Folio}"]`);y&&(y.outerHTML=C(e))}}),r=`${m} minutos`,d="timer-finalizado",i=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${c}</span>
                </div>
                <div class="font-mono text-2xl font-bold text-blue-700 ${d}">
                    ${r}
                </div>
            </div>
        `}else e.Status==="PROCESO"&&(i=`
            <div class="mt-3 text-center">
                <div class="font-mono text-2xl font-bold">
                    <span class="material-symbols-outlined">timer</span>
                    <span class="text-gray-800 dark:text-gray-100">${c}</span>
                </div>
                <div class="font-mono text-2xl font-bold timer-countdown"
                     data-folio="${e.Folio}"
                     data-inicio="${a.TimeInicio||""}"
                     data-estimado="${x(a.TimeEstimado)}">
                    <span class="text-gray-400">Cargando...</span>
                </div>
                <div class="text-sm text-gray-500">
                    Tiempo estimado: ${x(a.TimeEstimado)?x(a.TimeEstimado):"..."} minutos
                </div>
                ${f}
            </div>
        `);const w=e.Status==="ASIGNADO"?`
        <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button class="iniciar-atencion-btn w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                    data-folio="${e.Folio}"
                    data-maquina="${e.Maquina}">
                Iniciar Atención
            </button>
        </div>
    `:"",S=P(e.Status),N=e.Status==="AUTONOMO"?"/images/Avatar.webp":"http://128.150.102.45:8000/Intimark/Fotos%20Credenciales/"+e.Num_Mecanico+".jpg";return`
    <div class="relative max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 flex flex-col" data-folio-card="${e.Folio}">
         <div class="absolute -top-8 -left-8 z-10">
            <img class="w-20 h-20 rounded-full ring-4 ${S} shadow-lg object-cover bg-white"
                src="${N}" alt="${e.Num_Mecanico}"
                onerror="this.onerror=null; this.src='/default-avatar.jpg';">
        </div>
        <div class="p-5 pl-20">
        <div class="flex items-center justify-between mb-4">
                <span class="px-3 py-1 text-sm font-semibold rounded ${t}">${e.Status}</span>
                <span class="text-lg font-bold text-gray-800 dark:text-gray-100">Folio: ${e.Folio}</span>
            </div>
            <div class="space-y-3">
                <p class="font-bold text-gray-800 dark:text-gray-100">${e.Problema}</p>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>Módulo: <span class="font-semibold">${e.Modulo}</span></div>
                    <div>Operario: <span class="font-semibold">${e.Operario}</span></div>
                    <div>Nombre Operario: <span class="font-semibold">${e.NombreOperario}</span></div>
                    <div>Máquina: <span class="font-semibold">${e.Maquina}</span></div>
                    <div>Mecánico: <span class="font-semibold">${e.Mecanico}</span></div>
                    <div>Supervisor: <span class="font-semibold">${e.Supervisor}</span></div>
                </div>
                <div class="text-xs text-gray-500 flex justify-between">
                    <span>Creada: ${B(e.created_at)}</span>
                    <span>Actualizada: ${B(e.updated_at)}</span>
                </div>
                ${s}
            </div>
            ${i}
            ${u}
            ${w}
            </div>
        </div>
    `}function H(e){e=parseInt(e)||0;const t=Math.floor(e/60),i=e%60;return`${t}:${i.toString().padStart(2,"0")}`}document.getElementById("drawer-form-finalizar")||document.body.insertAdjacentHTML("beforeend",`
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
    `);document.addEventListener("click",async function(e){if(e.target&&e.target.classList.contains("finalizar-proceso-btn")){const t=e.target.getAttribute("data-folio"),i=e.target.getAttribute("data-inicio"),a=e.target.getAttribute("data-estimado");window.finalizarAtencionFolio=t,window.finalizarAtencionTimeInicio=i,window.finalizarAtencionTimeEstimado=a,await A("/api/fallas","#falla-select","Fallas"),await A("/api/causas","#causa-select","Causa"),await A("/api/acciones","#accion-select","Accion"),window.dispatchEvent(new CustomEvent("open-drawer",{detail:{id:"drawer-form-finalizar"}})),document.getElementById("drawer-form-finalizar").classList.remove("-translate-x-full")}});async function A(e,t,i){const s=await(await fetch(e)).json(),o=document.querySelector(t);o.innerHTML='<option value="">Seleccione una opción</option>'+s.map(l=>`<option value="${l[i]}">${l[i]}</option>`).join(""),$(o).val("").trigger("change"),$(o).select2({dropdownParent:$("#drawer-form-finalizar"),width:"100%"})}document.getElementById("finalizar-atencion-form").addEventListener("submit",async function(e){e.preventDefault();let t=document.createElement("div");t.id="finalizar-atencion-spinner",t.className="flex justify-center items-center my-4",t.innerHTML=`
        <div role="status">
          <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
          <span class="sr-only">Cargando...</span>
        </div>
    `;const i=document.getElementById("drawer-form-finalizar");i&&i.prepend(t);try{const a=window.finalizarAtencionFolio,s=$("#falla-select").val(),o=$("#causa-select").val(),l=$("#accion-select").val(),c=$("#comentarios-finalizar").val();if(!s||!o||!l){Swal.fire("Error","Debe seleccionar una opción en cada catálogo.","error");return}const r=new Date,d=r.getHours().toString().padStart(2,"0")+":"+r.getMinutes().toString().padStart(2,"0"),u=document.querySelector(`.timer-countdown[data-folio="${a}"], .timer-finalizado[data-folio="${a}"]`);let n="00:00";u&&(n=u.textContent.replace("-","").trim());const f=E.get(a);let g=f&&f.TimeInicio?f.TimeInicio:window.finalizarAtencionTimeInicio||"",b=x(f&&f.TimeEstimado?f.TimeEstimado:window.finalizarAtencionTimeEstimado||""),w=0;if(g&&d){const[m,p]=g.split(":").map(Number),[y,O]=d.split(":").map(Number);w=y*60+O-(m*60+p),w<0&&(w+=24*60)}if(T.has(a)&&(clearInterval(T.get(a)),T.delete(a)),f&&(f.TimeEjecucion=w),window.bahiaTimers[a]&&(delete window.bahiaTimers[a],I()),u){const m=u.parentElement&&u.parentElement.previousElementSibling?u.parentElement.previousElementSibling.querySelector("span.text-gray-800"):null;m&&(m.textContent="Tiempo total de atención:"),u.classList.remove("text-green-600","text-orange-500","text-red-600","timer-countdown"),u.classList.add("text-blue-700","timer-finalizado"),u.textContent=H(w)}if((await(await fetch("/api/finalizar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:a,falla:s,causa:o,accion:l,comentarios:c,time_final:d,time_real:n,time_ejecucion:w})})).json()).success){let m=null;v.has(a)&&(m=v.get(a).id,v.get(a).Status="ATENDIDO"),m&&await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:m,status:"ATENDIDO"})});const p=document.getElementById("modulo-select").value;p&&await h(p),Swal.fire("¡Éxito!","Atención finalizada correctamente","success").then(async()=>{const y=`
                    <div style="text-align:left;">
                        <label style="display:flex;align-items:center;margin-bottom:10px;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Excelente" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">🌟</span>
                            <span>Excelente</span>
                        </label>
                        <label style="display:flex;align-items:center;margin-bottom:10px;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Bueno" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">👍</span>
                            <span>Bueno</span>
                        </label>
                        <label style="display:flex;align-items:center;margin-bottom:10px;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Regular" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">😐</span>
                            <span>Regular</span>
                        </label>
                        <label style="display:flex;align-items:center;cursor:pointer;">
                            <input type="radio" name="satisfaccion" value="Malo" style="margin-right:8px;">
                            <span style="font-size:1.5em;margin-right:8px;">👎</span>
                            <span>Malo</span>
                        </label>
                    </div>
                `,{value:O}=await Swal.fire({title:"Califica que tan buena fue la atención",html:y,focusConfirm:!1,preConfirm:()=>{const k=document.querySelector('input[name="satisfaccion"]:checked');return k?k.value:(Swal.showValidationMessage("Debes seleccionar una opción"),!1)},confirmButtonText:"Enviar",showCancelButton:!1,customClass:{htmlContainer:"swal2-radio-group"}});O&&(await fetch("/api/encuesta-satisfaccion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:a,encuesta:O})}),Swal.fire("¡Gracias!","Tu opinión ha sido registrada.","success"))}),document.getElementById("drawer-form-finalizar").classList.add("-translate-x-full")}else Swal.fire("Error","No se pudo finalizar la atención","error")}finally{t&&t.parentNode&&t.parentNode.removeChild(t)}});window.addEventListener("open-drawer",function(e){const t=e.detail.id;document.getElementById(t).classList.remove("-translate-x-full")});document.querySelectorAll("[data-drawer-hide]").forEach(e=>{e.addEventListener("click",function(){const t=e.getAttribute("aria-controls");document.getElementById(t).classList.add("-translate-x-full")})});window.bahiaTimers=window.bahiaTimers||{};function X(){const e=localStorage.getItem("bahiaTimers");if(e)try{window.bahiaTimers=JSON.parse(e)}catch{window.bahiaTimers={}}}function I(){localStorage.setItem("bahiaTimers",JSON.stringify(window.bahiaTimers))}X();function U(e,t){window.bahiaTimers[e]?(window.bahiaTimers[e].start=Date.now(),window.bahiaTimers[e].elapsed=0,window.bahiaTimers[e].running=!0,window.bahiaTimers[e].pulsaciones=t||window.bahiaTimers[e].pulsaciones||1):window.bahiaTimers[e]={start:Date.now(),elapsed:0,running:!0,pulsaciones:t||1},I()}function _(e){const t=window.bahiaTimers[e];t&&t.running&&(t.elapsed+=Math.floor((Date.now()-t.start)/1e3),t.running=!1,I())}function J(e){const t=window.bahiaTimers[e];return t?t.running?t.elapsed+Math.floor((Date.now()-t.start)/1e3):t.elapsed:0}function D(e){return!!(window.bahiaTimers[e]&&window.bahiaTimers[e].running)}async function Z(e,t){try{const a=await(await fetch("/api/bahia",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,tipo:t})})).json();return a.success||Swal.fire("Error",a.message||"No se pudo guardar el tiempo de Bahía","error"),a}catch{return Swal.fire("Error","No se pudo guardar el tiempo de Bahía","error"),null}}async function G(e){try{return(await(await fetch(`/api/bahia-info/${encodeURIComponent(e)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}})).json()).bahia||null}catch{return null}}document.addEventListener("click",async function(e){if(e.target&&e.target.classList.contains("bahia-btn")){const t=e.target.getAttribute("data-folio"),i=await G(t);let a=i&&i.Pulsaciones?parseInt(i.Pulsaciones):0;if(a>=4)return;let s="";if(D(t)){if(a===1)s="fin";else if(a===3)s="fin1";else return;_(t)}else{if(a===0)s="inicio";else if(a===2)s="inicio1";else return;U(t,a+1)}const o=await Z(t,s);o&&o.bahia&&(a=o.bahia.Pulsaciones?parseInt(o.bahia.Pulsaciones):a+1,window.bahiaTimers[t]=window.bahiaTimers[t]||{},window.bahiaTimers[t].pulsaciones=a,a>=4&&delete window.bahiaTimers[t],I());const l=document.querySelector(`[data-folio-card="${t}"]`);l&&v.has(t)&&(l.outerHTML=C(v.get(t)),setTimeout(()=>M(),10))}});function W(){for(const e of T.values())clearInterval(e);T.clear()}function M(){W(),document.querySelectorAll(".timer-countdown").forEach(e=>{const t=e.dataset.folio;let i=e.dataset.inicio,a=e.dataset.estimado;if(a=x(a),!i||!a)return;let s;if(/^\d{2}:\d{2}$/.test(i)){const[u,n]=i.split(":");s=new Date,s.setHours(parseInt(u),parseInt(n),0,0)}else s=new Date(i);const o=s.getTime()+a*60*1e3;let l=!1,c=null;function r(){const u=new Date().getTime(),n=o-u;let f,g,b=!1;if(n<4){b=!0;const S=Math.abs(n);f=Math.floor(S/(1e3*60)),g=Math.floor(S%(1e3*60)/1e3),f!==c&&(c=f,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Se ha terminado el tiempo de atención para la OT ${t}. Han pasado ${f} minuto(s) extra.`,icon:"error",timer:4e3}))}else f=Math.floor(n/(1e3*60)),g=Math.floor(n%(1e3*60)/1e3),n<=3e5&&!l&&(l=!0,document.visibilityState==="visible"&&Swal.fire({title:"¡Atención!",text:`Quedan 5 minutos para la OT ${t}`,icon:"warning",timer:5e3}));const w=`${b?"-":""}${f}:${g.toString().padStart(2,"0")}`;e.classList.remove("text-green-600","text-orange-500","text-red-600"),b||n<=a*60*1e3*.25?e.classList.add("text-red-600"):n<=a*60*1e3*.5?e.classList.add("text-orange-500"):e.classList.add("text-green-600"),e.textContent=w}const d=setInterval(r,1e3);T.set(t,d),r()}),document.querySelectorAll(".bahia-timer-container").forEach(e=>{const t=e.dataset.folio,i=e.querySelector(".timer-bahia"),a=window.bahiaTimers[t];if(a&&(a.running||a.elapsed>0)){let s=function(){let l=J(t);const c=Math.floor(l/3600),r=Math.floor(l%3600/60),d=l%60;i.textContent=`${c.toString().padStart(2,"0")}:${r.toString().padStart(2,"0")}:${d.toString().padStart(2,"0")}`};e.style.display="",s();const o=setInterval(s,1e3);T.set(`bahia_${t}`,o)}else e.style.display="none"})}async function V(e){v.clear(),e=e.filter(n=>n.Status!=="CANCELADO"&&n.Status!=="FINALIZADO"),e.forEach(n=>v.set(n.Folio,n));const t=document.getElementById("search-ot"),i=t&&t.value?t.value.toLowerCase():"",a=document.getElementById("filter-status"),s=a&&a.value?a.value:"";let o=e.slice();const l=["AUTONOMO","ASIGNADO","PROCESO","PENDIENTE","ATENDIDO"];o.sort((n,f)=>{const g=l.indexOf(n.Status),b=l.indexOf(f.Status);return(g===-1?99:g)-(b===-1?99:b)}),i&&(o=o.filter(n=>n.Folio&&n.Folio.toLowerCase().includes(i)||n.Modulo&&n.Modulo.toLowerCase().includes(i)||n.Mecanico&&n.Mecanico.toLowerCase().includes(i)||n.Supervisor&&n.Supervisor.toLowerCase().includes(i)||n.Maquina&&n.Maquina.toLowerCase().includes(i)||n.Problema&&n.Problema.toLowerCase().includes(i))),s&&(o=o.filter(n=>n.Status===s));const r=o.filter(n=>n.Status==="PROCESO").map(n=>z(n.Folio));await Promise.all(r);const d={};F.forEach(n=>d[n]=0),d.total=e.filter(n=>n.Status!=="FINALIZADO"&&n.Status!=="CANCELADO").length,e.forEach(n=>{d[n.Status]!==void 0&&d[n.Status]++}),document.getElementById("ot-pendientes")&&(document.getElementById("ot-pendientes").textContent=d.PENDIENTE),document.getElementById("ot-asignadas")&&(document.getElementById("ot-asignadas").textContent=d.ASIGNADO),document.getElementById("ot-proceso")&&(document.getElementById("ot-proceso").textContent=d.PROCESO),document.getElementById("ot-atendidas")&&(document.getElementById("ot-atendidas").textContent=d.ATENDIDO),document.getElementById("ot-autonomas")&&(document.getElementById("ot-autonomas").textContent=d.AUTONOMO),document.getElementById("ot-total")&&(document.getElementById("ot-total").textContent=d.total);const u=document.getElementById("seguimiento-ot-container");u.innerHTML=o.length?o.map(C).join(""):'<div class="col-span-full text-center text-gray-400 py-8">No hay OTs para mostrar.</div>',M()}function h(e){return fetch("/cardsAteOTs").then(t=>t.json()).then(t=>{let i=t.filter(a=>a.Modulo===e);return V(i)})}window.cargarSeguimientoOTs=h;document.addEventListener("DOMContentLoaded",function(){$("#modulo-select").select2({placeholder:"Selecciona tu módulo de atención",width:"100%"}),axios.get("/obtener-modulos").then(o=>{const l=document.getElementById("modulo-select");o.data.forEach(c=>{let r=c.Modulo||c.moduleid||c.MODULEID||c.value||c,d=c.Modulo||c.moduleid||c.MODULEID||c.value||c;if(r&&d){let u=document.createElement("option");u.value=r,u.textContent=d,l.appendChild(u)}}),$("#modulo-select").trigger("change")}),$("#modulo-select").on("change",function(){const o=this.value;o?(document.getElementById("resumen-bar").classList.remove("hidden"),document.getElementById("filtros-bar").classList.remove("hidden"),h(o)):(document.getElementById("resumen-bar").classList.add("hidden"),document.getElementById("filtros-bar").classList.add("hidden"),document.getElementById("seguimiento-ot-container").innerHTML="")});const e=document.getElementById("search-ot"),t=document.getElementById("filter-status");function i(){const o=document.getElementById("modulo-select").value;o&&h(o)}e&&e.addEventListener("input",i),t&&t.addEventListener("change",i);function a(o){return new URLSearchParams(window.location.search).get(o)}const s=a("modulo");if(s){const o=document.getElementById("modulo-select"),l=()=>{Array.from(o.options).find(r=>r.value===s)?(o.value=s,$("#modulo-select").trigger("change")):setTimeout(l,100)};l()}});document.addEventListener("click",function(e){if(e.target&&e.target.classList.contains("iniciar-atencion-btn")){const t=e.target.getAttribute("data-folio"),i=e.target.getAttribute("data-maquina");let a=document.createElement("div");a.id="modal-iniciar-atencion-spinner",a.className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40",a.innerHTML=`
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col items-center px-8 py-6">
                <svg aria-hidden="true" class="w-12 h-12 mb-3 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span class="text-lg font-semibold text-gray-700 dark:text-gray-100">Cargando...</span>
            </div>
        `,document.body.appendChild(a),K(t,i).finally(()=>{a&&a.parentNode&&a.parentNode.removeChild(a)})}});async function K(e,t){try{const i=await fetch(`/api/clases-maquina/${encodeURIComponent(t)}`,{headers:{Accept:"application/json","X-Requested-With":"XMLHttpRequest"}});if(!i.ok)throw new Error(`HTTP error! status: ${i.status}`);const a=i.headers.get("content-type");if(!a||!a.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const s=await i.json(),o=s.clases||[],l=s.numeroMaquina||[],{value:c}=await Swal.fire({title:"Seleccionar Clase y Número de Máquina",html:`
                <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Clase de Máquina:</label>
                <select id="clase-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${o.map(r=>`
                        <option value="${r.class}" data-tiempo="${r.TimeEstimado}">
                            ${r.class} (${r.TimeEstimado} min)
                        </option>
                    `).join("")}
                </select>
                <label class="block mt-4 mb-2 text-sm font-medium text-gray-900 dark:text-white">Número de Máquina:</label>
                <select id="numero-maquina-select" class="swal2-select" style="width: 100%">
                    <option></option>
                    ${l.map(r=>`
                        <option value="${r.Remplacad}">
                            ${r.Remplacad}
                        </option>
                    `).join("")}
                </select>
            `,didOpen:()=>{$("#clase-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona una clase",width:"100%"}),$("#numero-maquina-select").select2({dropdownParent:$(".swal2-container"),placeholder:"Selecciona el número de máquina",width:"100%"})},preConfirm:()=>{const r=document.getElementById("clase-select"),d=r.options[r.selectedIndex],u=document.getElementById("numero-maquina-select");return r.value?u.value?{clase:r.value,tiempo_estimado:d.dataset.tiempo,numero_maquina:u.value}:(Swal.showValidationMessage("Debes seleccionar el número de máquina"),!1):(Swal.showValidationMessage("Debes seleccionar una clase"),!1)}});c&&await Q(e,c.clase,c.tiempo_estimado,c.numero_maquina)}catch(i){console.error("Error:",i),Swal.fire("Error","No se pudieron cargar las clases de máquina","error")}}async function Q(e,t,i,a){try{const s=new Date().toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit",hour12:!1}),o=await fetch("/api/iniciar-atencion",{method:"POST",headers:{Accept:"application/json","Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content"),"X-Requested-With":"XMLHttpRequest"},body:JSON.stringify({folio:e,clase:t,numero_maquina:a,tiempo_estimado:i,time_inicio:s})});if(!o.ok)throw new Error(`HTTP error! status: ${o.status}`);const l=o.headers.get("content-type");if(!l||!l.includes("application/json"))throw new TypeError("La respuesta no es JSON!");const c=await o.json();if(c.success){await fetch("/broadcast-status-ot",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":document.querySelector('meta[name="csrf-token"]').getAttribute("content")},body:JSON.stringify({id:c.ot.id,status:"PROCESO"})}),await Swal.fire("¡Éxito!","Atención iniciada correctamente","success");const r=document.getElementById("modulo-select").value;r&&await h(r)}}catch(s){console.error("Error:",s),Swal.fire("Error","No se pudo iniciar la atención","error")}}Notification.permission==="default"&&Notification.requestPermission();document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){const e=document.getElementById("modulo-select").value;e&&h(e)}});window.Echo.channel("asignaciones-ot").listen("AsignacionOTCreated",e=>{var i;if(e&&e.Status==="CANCELADO")return;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)}).listen("AsignacionOTReasignada",e=>{var i;if(e&&e.Status==="CANCELADO")return;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)}).listen("StatusOTUpdated",e=>{var i;if(e&&e.Status==="CANCELADO")return;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)}).listen("ComidaBreakLimpiado",e=>{var i;const t=(i=document.getElementById("modulo-select"))==null?void 0:i.value;t&&h(t)});
