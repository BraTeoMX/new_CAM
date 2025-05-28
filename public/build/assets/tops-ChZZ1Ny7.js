document.addEventListener("DOMContentLoaded",async()=>{const r=document.getElementById("dashboard-topsmeca");if(r){r.innerHTML='<div class="flex justify-center items-center min-h-[180px] text-gray-400">Cargando...</div>';try{let o=function(t,n,u,v="bg-white dark:bg-gray-800"){return`
                <div class="flex flex-col items-center justify-center rounded-xl shadow-md border border-gray-200 dark:border-gray-700 ${v} p-5 w-full max-w-xs mx-auto h-full min-h-[270px]">
                    <div class="flex items-center justify-center mb-3">
                        <span class="inline-block">${u}</span>
                    </div>
                    <h2 class="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 text-center">${t}</h2>
                    <ul class="w-full">
                        ${n.map(g=>`
                            <li class="flex justify-between items-center py-1 px-2 rounded hover:bg-emerald-50 dark:hover:bg-gray-700 transition">
                                <span class="text-gray-700 dark:text-gray-200">${g.label}</span>
                                <span class="font-bold text-emerald-600 dark:text-emerald-400 text-lg">${g.total}</span>
                            </li>
                        `).join("")}
                    </ul>
                </div>
            `},l=function(t){r.innerHTML=`
                <div class="flex justify-center items-center w-full h-full min-h-[270px] transition-opacity duration-500">
                    ${a[t].html}
                </div>
                <div class="flex justify-center gap-2 mt-2">
                    ${a.map((n,u)=>`<span class="inline-block w-3 h-3 rounded-full ${u===t?"bg-emerald-500":"bg-gray-300 dark:bg-gray-700"}"></span>`).join("")}
                </div>
                <div class="flex justify-center gap-4 mt-4">
                    <button id="prevBtn" class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition">
                        <span class="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button id="pauseBtn" class="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition">
                        <span class="material-symbols-outlined">pause</span>
                    </button>
                    <button id = "nextBtn" class = "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition" >
                        <span class="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            `},s=function(){d=setInterval(()=>{e=(e+1)%a.length,l(e)},5e3)},i=function(){clearInterval(d)};var k=o,w=l,j=s,C=i;const c=await(await fetch("/dashboard/tops")).json(),m=`
            <svg class="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="currentColor" class="text-blue-100"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 8.6a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 15z"/>
            </svg>
        `,p=(c.maquinas||[]).map(t=>({label:t.Maquina,total:t.total})),h='<svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor" class="text-red-100"/><path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',y=(c.problemas||[]).map(t=>({label:t.problema||t.Problema,total:t.total})),x='<svg class="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor" class="text-emerald-100"/><path d="M4 9h16M9 4v16" stroke="currentColor" stroke-width="2"/></svg>',f=(c.modulos||[]).map(t=>({label:t.Modulo,total:t.total})),a=[{html:o("Top 3 Máquinas con más problemas",p,m,"bg-blue-50 dark:bg-blue-900")},{html:o("Top 3 Problemas más recurrentes",y,h,"bg-red-50 dark:bg-red-900")},{html:o("Top 3 Módulos con más tickets",f,x,"bg-emerald-50 dark:bg-emerald-900")}];let e=0,d=null;l(e),s(),r.addEventListener("click",t=>{if(t.target.closest("#prevBtn")&&(i(),e=(e-1+a.length)%a.length,l(e),s()),t.target.closest("#nextBtn")&&(i(),e=(e+1)%a.length,l(e),s()),t.target.closest("#pauseBtn")){const n=r.querySelector("#pauseBtn .material-symbols-outlined");d?(i(),n.textContent="play_arrow"):(s(),n.textContent="pause")}})}catch{r.innerHTML='<div class="text-red-500 p-4">No se pudo cargar el top.</div>'}}});
