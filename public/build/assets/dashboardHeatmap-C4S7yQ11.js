const p=[],k={days:["Lun","Mar","Mier","Juev","Vier","Sab","Dom"]};function M(a){return a>14?"bg-emerald-600 dark:bg-emerald-200":a>9?"bg-emerald-400 dark:bg-emerald-400":a>4?"bg-emerald-200 dark:bg-emerald-600":a>0?"bg-emerald-100 dark:bg-emerald-800":"bg-gray-100 dark:bg-zinc-800"}function v(a){if(!a)return null;let n=null;if(a.includes("T"))n=new Date(a);else if(a.includes(" ")){const[d]=a.split(" "),[s,r,o]=d.split("-").map(Number);if(!s||!r||!o)return null;n=new Date(s,r-1,o)}return!n||isNaN(n.getTime())?null:n}function b(a,n,d){const s=new Date(n,d+1,0).getDate(),r={};return a.forEach(o=>{const c=v(o.created_at);if(c&&c.getFullYear()===n&&c.getMonth()===d){const m=c.getDate();r[m]=(r[m]||0)+1}}),{daysInMonth:s,dayMap:r}}function h(a,n,d){const s=document.createElement("div");s.className=`
        group py-2 px-1 sm:py-4 sm:px-2 md:py-6 md:px-4 lg:py-7 lg:px-9
        border border-dotted border-zinc-100 dark:border-zinc-800
        bg-zinc-50 dark:bg-zinc-900 rounded-md relative overflow-hidden
        flex flex-col md:flex-row gap-2 md:gap-6 w-full
        max-w-full
        lg:col-span-6
    `.replace(/\s+/g," "),s.innerHTML=`
        <div class="relative z-10 flex flex-col md:flex-row gap-2 md:gap-6 w-full">
            <div class="w-full md:w-auto">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                    <div class="text-base sm:text-lg md:text-xl lg:text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Actividad de tickets</div>
                    <div class="flex gap-2">
                        <select id="calendar-month" class="px-2 py-1 rounded bg-zinc-800 text-white text-xs sm:text-sm border border-zinc-700 focus:outline-none"></select>
                        <select id="calendar-year" class="px-2 py-1 rounded bg-zinc-800 text-white text-xs sm:text-sm border border-zinc-700 focus:outline-none"></select>
                    </div>
                </div>
                <div class="overflow-x-auto w-full">
                    <div id="calendar-grid" class="grid grid-cols-7 gap-2 min-w-[340px] sm:min-w-[420px] md:min-w-[420px] lg:min-w-[420px] w-max mx-auto"></div>
                </div>
            </div>
            <div class="flex flex-row flex-wrap md:flex-col items-center md:items-start justify-center ml-0 md:ml-6 gap-2 md:gap-0 mt-2 md:mt-0">
                <div class="text-xs text-gray-500 mb-2 hidden md:block">Actividad</div>
                <div class="flex items-center gap-1 sm:gap-2">
                    <span class="inline-block w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-gray-100 dark:bg-zinc-800 border"></span>
                    <span class="text-[10px] sm:text-xs text-gray-400">0</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2 mt-0 md:mt-1">
                    <span class="inline-block w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-emerald-100 dark:bg-emerald-800 border"></span>
                    <span class="text-[10px] sm:text-xs text-gray-400">1-4</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2 mt-0 md:mt-1">
                    <span class="inline-block w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-emerald-200 dark:bg-emerald-600 border"></span>
                    <span class="text-[10px] sm:text-xs text-gray-400">5-9</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2 mt-0 md:mt-1">
                    <span class="inline-block w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-emerald-400 dark:bg-emerald-400 border"></span>
                    <span class="text-[10px] sm:text-xs text-gray-400">10-14</span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2 mt-0 md:mt-1">
                    <span class="inline-block w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded bg-emerald-600 dark:bg-emerald-200 border"></span>
                    <span class="text-[10px] sm:text-xs text-gray-400">15+</span>
                </div>
            </div>
        </div>
    `;const r=s.querySelector("#calendar-month");for(let e=0;e<12;e++){const t=document.createElement("option");t.value=e,t.textContent=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][e],e===n&&(t.selected=!0),r.appendChild(t)}const o=s.querySelector("#calendar-year"),c=new Date().getFullYear();for(let e=c-3;e<=c+1;e++){const t=document.createElement("option");t.value=e,t.textContent=e,e===a&&(t.selected=!0),o.appendChild(t)}const m=s.querySelector("#calendar-grid");k.days.forEach(e=>{const t=document.createElement("div");t.textContent=e,t.className="text-xs sm:text-sm text-center text-gray-500 font-bold",m.appendChild(t)});const w=(new Date(a,n,1).getDay()+6)%7;for(let e=0;e<w;e++){const t=document.createElement("div");t.className="w-full h-[44px] sm:h-[44px]",m.appendChild(t)}for(let e=1;e<=d.daysInMonth;e++){const t=d.dayMap[e]||0;let i=[],f=[];p.forEach(l=>{const g=v(l.created_at);g&&g.getFullYear()===a&&g.getMonth()===n&&g.getDate()===e&&(l.Modulo&&!i.includes(l.Modulo)&&i.push(l.Modulo),l.Supervisor&&!f.includes(l.Supervisor)&&f.push(l.Supervisor))});const y=`${e}/${n+1}/${a}: ${t} registros
Módulos: ${i.join(", ")||"-"}
Supervisores: ${f.join(", ")||"-"}`,x=document.createElement("div");if(x.className=`
            flex flex-col items-center justify-center
            text-xs sm:text-base font-medium ${M(t)}
            rounded-lg transition cursor-pointer
            w-full h-[44px] sm:h-[44px]
        `.replace(/\s+/g," "),x.title=y,x.textContent=e,t>0){const l=document.createElement("span");l.textContent=t,l.className="block text-[12px] sm:text-[13px] text-emerald-900 dark:text-emerald-100 font-bold",x.appendChild(l)}m.appendChild(x)}const u=document.getElementById("dashboard-heatmap");u&&(u.innerHTML="",u.appendChild(s)),r.addEventListener("change",()=>{const e=parseInt(r.value,10),t=parseInt(o.value,10),i=b(p,t,e);h(t,e,i)}),o.addEventListener("change",()=>{const e=parseInt(r.value,10),t=parseInt(o.value,10),i=b(p,t,e);h(t,e,i)})}async function C(){try{const n=await(await fetch("/cardsAteOTs")).json();p.length=0,n.forEach(r=>p.push(r));const d=new Date,s=b(p,d.getFullYear(),d.getMonth());h(d.getFullYear(),d.getMonth(),s)}catch(a){console.error("Error cargando heatmap:",a)}}document.addEventListener("DOMContentLoaded",C);
