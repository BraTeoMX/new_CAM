let h=[];const M={days:["Lun","Mar","Mier","Juev","Vier","Sab","Dom"]};function w(e){return e>14?"bg-emerald-600 dark:bg-emerald-200":e>9?"bg-emerald-400 dark:bg-emerald-400":e>4?"bg-emerald-200 dark:bg-emerald-600":e>0?"bg-emerald-100 dark:bg-emerald-800":"bg-gray-100 dark:bg-zinc-800"}function v(e){if(!e)return null;let t=null;if(e.includes("T"))t=new Date(e);else if(e.includes(" ")){const[a]=e.split(" "),[s,c,l]=a.split("-").map(Number);if(!s||!c||!l)return null;t=new Date(s,c-1,l)}return!t||isNaN(t.getTime())?null:t}function y(e,t,a,s=null){const c=new Date(t,a+1,0).getDate(),l={};return e.forEach(b=>{const x=v(b.created_at);if(x&&x.getFullYear()===t&&x.getMonth()===a){const m=x.getDate();(s===null||m===s)&&(l[m]=(l[m]||0)+1)}}),{daysInMonth:c,dayMap:l}}function E(e,t,a,s=null){const c=document.createElement("div");c.className=`
        group py-2 px-1 sm:py-4 sm:px-2 md:py-6 md:px-4 lg:py-7 lg:px-9
        border border-dotted border-zinc-100 dark:border-zinc-800
        bg-zinc-50 dark:bg-zinc-900 rounded-md relative overflow-hidden
        flex flex-col md:flex-row gap-2 md:gap-6 w-full
        max-w-full
        lg:col-span-6
    `.replace(/\s+/g," "),c.innerHTML=`
        <div class="relative z-10 flex flex-col md:flex-row gap-2 md:gap-6 w-full">
            <div class="w-full md:w-auto">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                    <div class="text-base sm:text-lg md:text-xl lg:text-2xl font-medium tracking-tight text-gray-950 dark:text-white">Actividad de tickets</div>
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
    `;const l=c.querySelector("#calendar-grid");M.days.forEach(o=>{const r=document.createElement("div");r.textContent=o,r.className="text-xs sm:text-sm text-center text-gray-500 font-bold",l.appendChild(r)});const x=(new Date(e,t,1).getDay()+6)%7;if(s!==null){const r=(new Date(e,t,s).getDay()+6)%7;for(let n=0;n<r;n++){const g=document.createElement("div");g.className="w-full h-[44px] sm:h-[44px]",l.appendChild(g)}const i=a.dayMap[s]||0;let p=[],f=[];h.forEach(n=>{const g=v(n.created_at);g&&g.getFullYear()===e&&g.getMonth()===t&&g.getDate()===s&&(n.Modulo&&!p.includes(n.Modulo)&&p.push(n.Modulo),n.Supervisor&&!f.includes(n.Supervisor)&&f.push(n.Supervisor))});const u=`${s}/${t+1}/${e}: ${i} registros
Módulos: ${p.join(", ")||"-"}
Supervisores: ${f.join(", ")||"-"}`,d=document.createElement("div");if(d.className=`
            flex flex-col items-center justify-center
            text-xs sm:text-base font-medium ${w(i)}
            rounded-lg transition cursor-pointer
            w-full h-[44px] sm:h-[44px]
            ring-4 ring-emerald-500 ring-offset-2
        `.replace(/\s+/g," "),d.title=u,d.textContent=s,i>0){const n=document.createElement("span");n.textContent=i,n.className="block text-[12px] sm:text-[13px] text-emerald-900 dark:text-emerald-100 font-bold",d.appendChild(n)}l.appendChild(d)}else{for(let o=0;o<x;o++){const r=document.createElement("div");r.className="w-full h-[44px] sm:h-[44px]",l.appendChild(r)}for(let o=1;o<=a.daysInMonth;o++){const r=a.dayMap[o]||0;let i=[],p=[];h.forEach(d=>{const n=v(d.created_at);n&&n.getFullYear()===e&&n.getMonth()===t&&n.getDate()===o&&(d.Modulo&&!i.includes(d.Modulo)&&i.push(d.Modulo),d.Supervisor&&!p.includes(d.Supervisor)&&p.push(d.Supervisor))});const f=`${o}/${t+1}/${e}: ${r} registros
Módulos: ${i.join(", ")||"-"}
Supervisores: ${p.join(", ")||"-"}`,u=document.createElement("div");if(u.className=`
                flex flex-col items-center justify-center
                text-xs sm:text-base font-medium ${w(r)}
                rounded-lg transition cursor-pointer
                w-full h-[44px] sm:h-[44px]
            `.replace(/\s+/g," "),u.title=f,u.textContent=o,r>0){const d=document.createElement("span");d.textContent=r,d.className="block text-[12px] sm:text-[13px] text-emerald-900 dark:text-gray-800 font-bold",u.appendChild(d)}l.appendChild(u)}}const m=document.getElementById("dashboard-heatmap");m&&(m.innerHTML="",m.appendChild(c))}function k(){const e=document.getElementById("calendar-month"),t=document.getElementById("calendar-year"),a=document.getElementById("calendar-day"),s=e?parseInt(e.value,10):new Date().getMonth(),c=t?parseInt(t.value,10):new Date().getFullYear(),l=a&&a.value?parseInt(a.value,10):null;return{month:s,year:c,day:l}}window.addEventListener("calendar:change",()=>{const{month:e,year:t,day:a}=k(),s=y(h,t,e,a);E(t,e,s,a)});async function C(){try{h=await window.getCardsAteOTsData();const{month:e,year:t,day:a}=k(),s=y(h,t,e,a);E(t,e,s,a)}catch(e){console.error("Error cargando heatmap:",e)}}document.addEventListener("DOMContentLoaded",C);document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("calendar-month"),t=document.getElementById("calendar-year");e&&t&&(e.addEventListener("change",()=>{window.dispatchEvent(new Event("calendar:change"))}),t.addEventListener("change",()=>{window.dispatchEvent(new Event("calendar:change"))}))});
