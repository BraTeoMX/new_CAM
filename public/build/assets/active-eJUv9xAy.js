const g="active_users_data_v1";let l=null;function f(e,a){try{localStorage.setItem(e,JSON.stringify({data:a,ts:Date.now()}))}catch{}}function b(e,a){try{const o=JSON.parse(localStorage.getItem(e));return!o||!o.ts||!o.data||Date.now()-o.ts>a?null:o.data}catch{return null}}function n(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function y(e){return`/user-photo/${encodeURIComponent(e)}`}function u(e){const a=$("#active-users-list");a.empty();const o=$("#active-users-list-mobile");o.length&&o.empty();const m=window.innerWidth<640;e.sort((t,c)=>{const i=(t.despue||"").toLowerCase(),s=(c.despue||"").toLowerCase();return i.includes("gerente")&&!s.includes("gerente")?-1:!i.includes("gerente")&&s.includes("gerente")?1:i.includes("jefe")&&!s.includes("jefe")?-1:!i.includes("jefe")&&s.includes("jefe")?1:0}),e.forEach(function(t){const c=y(t.IdPoblacion),i=`tooltip-${t.IdPoblacion}`;let s="";if(s=`
            <li class="py-3 sm:py-4 relative">
                <div class="flex items-center space-x-3 rtl:space-x-reverse">
                    <div class="shrink-0 relative">
                        <img class="w-10 h-10 rounded-full cursor-pointer"
                            src="${c}"
                            alt="${n(t.IdPoblacion)} image"
                            id="user-img-${n(t.IdPoblacion)}"
                            onerror="this.onerror=null; this.src='/default-avatar.jpg';">
                        <span class="top-0 left-7 absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
                        <!-- Tooltip -->
                        <div id="${i}" role="tooltip"
                            class="absolute z-10 hidden md:block px-4 py-3 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg max-w-xs break-words opacity-0 transition-opacity duration-200 dark:bg-gray-700">
                            <p><strong>Número empleado:</strong> ${n(t.IdPoblacion)}</p>
                            <p><strong>Nombre:</strong> ${n(t.nombre)}</p>
                            <p><strong>Puesto:</strong> ${n(t.despue)}</p>
                            <p><strong>Ubicación:</strong> ${n(t.ubication)}</p>
                        </div>
                    </div>
                    <div class="flex-5 min-w-0">
                        <p class="text-sm font-semibold text-gray-900 truncate dark:text-white">
                            ${n(t.nombre)}
                        </p>
                        <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                            ${n(t.despue)}
                        </p>
                        <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                            ${n(t.IdPoblacion)}
                        </p>
                    </div>
                </div>
            </li>`,a.append(s),o.length&&o.append(`
                <li>
                    <img class="w-10 h-10 rounded-full border-2 border-green-400"
                        src="${c}"
                        alt="${n(t.IdPoblacion)} image"
                        onerror="this.onerror=null; this.src='/default-avatar.jpg';">
                </li>
            `),!m){const d=document.getElementById(`user-img-${t.IdPoblacion}`),r=document.getElementById(i);d&&r&&(d.addEventListener("mouseover",function(){r.style.opacity="1",r.style.visibility="visible"}),d.addEventListener("mouseout",function(){r.style.opacity="0",r.style.visibility="hidden"}),document.addEventListener("mouseout",function(p){!d.contains(p.target)&&!r.contains(p.target)&&(r.style.opacity="0",r.style.visibility="hidden")}))}})}document.addEventListener("DOMContentLoaded",function(){l=b(g,12e4),l?u(l):$.ajax({url:"/active-users",method:"GET",success:function(e){f(g,e),u(e),l=e},error:function(e){console.error("Error obteniendo usuarios:",e)}}),window.addEventListener("resize",function(){l&&u(l)})});
