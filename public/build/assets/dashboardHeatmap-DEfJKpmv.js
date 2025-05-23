const m=[],l={days:["Lun","Mar","Mier","Juev","Vier","Sab","Dom"],cellSize:44,cellGap:8};function C(t){return t>14?"bg-emerald-600 dark:bg-emerald-200":t>9?"bg-emerald-400 dark:bg-emerald-400":t>4?"bg-emerald-200 dark:bg-emerald-600":t>0?"bg-emerald-100 dark:bg-emerald-800":"bg-gray-100 dark:bg-zinc-800"}function k(t){if(!t)return null;let n=null;if(t.includes("T"))n=new Date(t);else if(t.includes(" ")){const[o]=t.split(" "),[r,s,c]=o.split("-").map(Number);if(!r||!s||!c)return null;n=new Date(r,s-1,c)}return!n||isNaN(n.getTime())?null:n}function y(t,n,o){const r=new Date(n,o+1,0).getDate(),s={};return t.forEach(c=>{const p=k(c.created_at);if(p&&p.getFullYear()===n&&p.getMonth()===o){const u=p.getDate();s[u]=(s[u]||0)+1}}),{daysInMonth:r,dayMap:s}}function w(t,n,o){const r=document.createElement("div");r.className="group py-7 px-9 border border-dotted border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded-md relative overflow-hidden lg:col-span-6 flex flex-row gap-8",r.innerHTML=`
        <div class="absolute inset-0 z-0 opacity-5"></div>
        <div class="relative z-10 flex flex-row gap-8">
            <div>
                <div class="flex items-center gap-4 mb-4">
                    <div class="text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Actividad de tickets</div>
                    <select id="calendar-month" class="ml-4 px-2 py-1 rounded bg-zinc-800 text-white text-sm border border-zinc-700 focus:outline-none"></select>
                    <select id="calendar-year" class="ml-2 px-2 py-1 rounded bg-zinc-800 text-white text-sm border border-zinc-700 focus:outline-none"></select>
                </div>
                <div class="overflow-x-auto">
                    <div id="calendar-grid" class="relative" style="min-width: 270px;"></div>
                </div>
            </div>
            <div class="flex flex-col items-start justify-center ml-6">
                <div class="text-xs text-gray-500 mb-2">Actividad</div>
                <div class="flex items-center gap-2">
                    <span class="inline-block w-6 h-6 rounded bg-gray-100 dark:bg-zinc-800 border"></span>
                    <span class="text-xs text-gray-400">0</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="inline-block w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-800 border"></span>
                    <span class="text-xs text-gray-400">1-4</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="inline-block w-6 h-6 rounded bg-emerald-200 dark:bg-emerald-600 border"></span>
                    <span class="text-xs text-gray-400">5-9</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="inline-block w-6 h-6 rounded bg-emerald-400 dark:bg-emerald-400 border"></span>
                    <span class="text-xs text-gray-400">10-14</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                    <span class="inline-block w-6 h-6 rounded bg-emerald-600 dark:bg-emerald-200 border"></span>
                    <span class="text-xs text-gray-400">15+</span>
                </div>
            </div>
        </div>
    `;const s=r.querySelector("#calendar-month");for(let e=0;e<12;e++){const a=document.createElement("option");a.value=e,a.textContent=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][e],e===n&&(a.selected=!0),s.appendChild(a)}const c=r.querySelector("#calendar-year"),p=new Date().getFullYear();for(let e=p-3;e<=p+1;e++){const a=document.createElement("option");a.value=e,a.textContent=e,e===t&&(a.selected=!0),c.appendChild(a)}const u=r.querySelector("#calendar-grid");l.days.forEach((e,a)=>{const d=document.createElement("div");d.textContent=e,d.className="text-sm text-center text-gray-500",d.style=`
            position: absolute;
            left: ${a*(l.cellSize+l.cellGap)}px;
            top: 0;
            width: ${l.cellSize}px;
            height: 28px;
            line-height: 28px;
        `,u.appendChild(d)});const M=(new Date(t,n,1).getDay()+6)%7;let b=0;for(let e=1;e<=o.daysInMonth;e++){const a=(M+e-1)%7;b=Math.floor((M+e-1)/7);const d=o.dayMap[e]||0;let h=[],v=[];m.forEach(i=>{const x=k(i.created_at);x&&x.getFullYear()===t&&x.getMonth()===n&&x.getDate()===e&&(i.Modulo&&!h.includes(i.Modulo)&&h.push(i.Modulo),i.Supervisor&&!v.includes(i.Supervisor)&&v.push(i.Supervisor))});const z=`${e}/${n+1}/${t}: ${d} registros
Módulos: ${h.join(", ")||"-"}
Supervisores: ${v.join(", ")||"-"}`,g=document.createElement("div");if(g.className=`absolute flex flex-col items-center justify-center text-base font-medium ${C(d)}`,g.style=`
            left: ${a*(l.cellSize+l.cellGap)}px;
            top: ${b*(l.cellSize+l.cellGap)+32}px;
            width: ${l.cellSize}px;
            height: ${l.cellSize}px;
            border-radius: 8px;
            transition: background 0.2s;
            cursor: pointer;
        `,g.title=z,g.textContent=e,d>0){const i=document.createElement("span");i.textContent=d,i.className="block text-[13px] text-emerald-900 dark:text-emerald-100 font-bold",g.appendChild(i)}u.appendChild(g)}u.style.height=`${(b+1)*(l.cellSize+l.cellGap)+40}px`,u.style.width=`${7*(l.cellSize+l.cellGap)}px`;const f=document.getElementById("dashboard-heatmap");f&&(f.innerHTML="",f.appendChild(r)),s.addEventListener("change",()=>{const e=parseInt(s.value,10),a=parseInt(c.value,10),d=y(m,a,e);w(a,e,d)}),c.addEventListener("change",()=>{const e=parseInt(s.value,10),a=parseInt(c.value,10),d=y(m,a,e);w(a,e,d)})}async function E(){try{const n=await(await fetch("/cardsAteOTs")).json();m.length=0,n.forEach(s=>m.push(s));const o=new Date,r=y(m,o.getFullYear(),o.getMonth());w(o.getFullYear(),o.getMonth(),r)}catch(t){console.error("Error cargando heatmap:",t)}}document.addEventListener("DOMContentLoaded",E);
