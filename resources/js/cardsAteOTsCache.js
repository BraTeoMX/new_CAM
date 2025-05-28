
// --- Configuración de Echo/Pusher ---
window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: "pusher",
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true,
    encrypted: true,
});

const CARDS_ATE_OTS_KEY = 'cardsAteOTsData';
const CARDS_ATE_OTS_TTL = 5 * 60 * 1000; // 5 minutos

window.getCardsAteOTsData = async function() {
    const raw = localStorage.getItem(CARDS_ATE_OTS_KEY);
    if (raw) {
        try {
            const obj = JSON.parse(raw);
            if (Date.now() - obj.ts < CARDS_ATE_OTS_TTL && Array.isArray(obj.data)) {
                return obj.data;
            }
        } catch {}
    }
    const res = await fetch('/cardsAteOTs', { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    localStorage.setItem(CARDS_ATE_OTS_KEY, JSON.stringify({ data, ts: Date.now() }));
    return data;
};


