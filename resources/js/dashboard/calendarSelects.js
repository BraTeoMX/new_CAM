let calendarData = [];
let calendarDates = [];

function saveCalendarToLocal() {
    try {
        localStorage.setItem('calendarData', JSON.stringify(calendarData));
        localStorage.setItem('calendarDates', JSON.stringify(calendarDates));
    } catch (e) {}
}

function loadCalendarFromLocal() {
    try {
        const data = localStorage.getItem('calendarData');
        const dates = localStorage.getItem('calendarDates');
        calendarData = data ? JSON.parse(data) : [];
        calendarDates = dates ? JSON.parse(dates) : [];
    } catch (e) {
        calendarData = [];
        calendarDates = [];
    }
}

async function initCalendarSelects() {
    const monthSelect = document.getElementById('calendar-month');
    const yearSelect = document.getElementById('calendar-year');
    const daySelect = document.getElementById('calendar-day');
    if (!monthSelect || !yearSelect || !daySelect) return;

    loadCalendarFromLocal();

    let fetched = false;
    try {
        if (!calendarData.length) {
            calendarData = await window.getCardsAteOTsData();
            fetched = true;
        }
        if (!calendarDates.length && calendarData.length) {
            calendarDates = calendarData
                .map(item => item.created_at)
                .filter(Boolean)
                .map(dateStr => {
                    const d = new Date(dateStr);
                    return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
                });
            fetched = true;
        }
        if (fetched) saveCalendarToLocal();

        if (!calendarData.length || !calendarDates.length) {
            loadCalendarFromLocal();
        }
        if (!calendarData.length || !calendarDates.length) throw new Error('No data');

        const years = [...new Set(calendarDates.map(d => d.year))].sort((a, b) => a - b);
        yearSelect.innerHTML = '';
        years.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        });

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        function fillMonthOptions(selectedYear) {
            monthSelect.innerHTML = '';
            const months = [...new Set(calendarDates.filter(d => d.year === selectedYear).map(d => d.month))];
            for (let m = 0; m < 12; m++) {
                if (months.includes(m)) {
                    const opt = document.createElement('option');
                    opt.value = m;
                    opt.textContent = monthNames[m];
                    monthSelect.appendChild(opt);
                }
            }
        }
        function fillDayOptions(selectedYear, selectedMonth) {
            daySelect.innerHTML = '';
            const optAll = document.createElement('option');
            optAll.value = '';
            optAll.textContent = 'Todos';
            daySelect.appendChild(optAll);
            const days = [...new Set(calendarDates.filter(d => d.year === selectedYear && d.month === selectedMonth).map(d => d.day))].sort((a, b) => a - b);
            days.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d;
                opt.textContent = d;
                daySelect.appendChild(opt);
            });
        }

        // Selección robusta de año y mes
        const now = new Date();
        let currentYear = now.getFullYear();
        let currentMonth = now.getMonth();

        let hasCurrentMonth = calendarDates.some(d => d.year === currentYear && d.month === currentMonth);

        if (!hasCurrentMonth) {
            let prevMonth = currentMonth - 1;
            let prevYear = currentYear;
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear = currentYear - 1;
            }
            let hasPrevMonth = calendarDates.some(d => d.year === prevYear && d.month === prevMonth);
            if (hasPrevMonth) {
                currentYear = prevYear;
                currentMonth = prevMonth;
            } else {
                currentYear = Number(yearSelect.options[0]?.value);
                currentMonth = undefined;
            }
        }

        fillMonthOptions(currentYear);

        let monthOptionValues = Array.from(monthSelect.options).map(opt => Number(opt.value));
        if (currentMonth === undefined || !monthOptionValues.includes(currentMonth)) {
            currentMonth = monthOptionValues.length > 0 ? monthOptionValues[0] : 0;
        }
        yearSelect.value = currentYear;
        monthSelect.value = currentMonth;

        fillDayOptions(currentYear, currentMonth);
        daySelect.value = '';

        // Dispara el evento SOLO cuando los selects ya tienen valores válidos
        function dispatchCalendarChange() {
            const detail = {
                year: Number(yearSelect.value),
                month: Number(monthSelect.value),
                day: daySelect.value ? Number(daySelect.value) : null
            };
            window.dispatchEvent(new CustomEvent('calendar:change', { detail }));
        }

        dispatchCalendarChange();

        yearSelect.addEventListener('change', () => {
            fillMonthOptions(Number(yearSelect.value));
            monthSelect.value = monthSelect.options[0]?.value;
            fillDayOptions(Number(yearSelect.value), Number(monthSelect.value));
            daySelect.value = '';
            dispatchCalendarChange();
        });
        monthSelect.addEventListener('change', () => {
            fillDayOptions(Number(yearSelect.value), Number(monthSelect.value));
            daySelect.value = '';
            dispatchCalendarChange();
        });
        daySelect.addEventListener('change', () => {
            dispatchCalendarChange();
        });

    } catch (e) {
        loadCalendarFromLocal();
        if (calendarData.length && calendarDates.length) {
            initCalendarSelects();
            return;
        }
        const now = new Date();
        yearSelect.innerHTML = `<option value="${now.getFullYear()}">${now.getFullYear()}</option>`;
        monthSelect.innerHTML = `<option value="${now.getMonth()}">${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][now.getMonth()]}</option>`;
        daySelect.innerHTML = `<option value="">Todos</option>`;
        window.dispatchEvent(new Event('calendar:change'));
    }
}

document.addEventListener('DOMContentLoaded', initCalendarSelects);
