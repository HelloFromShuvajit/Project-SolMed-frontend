if (!localStorage.getItem('User')) {
    window.location.href = '../Login Form/index.html';
}

let adherenceReport = null;
let selectedDate = null;
let ownerId = null;

window.onload = async function () {
    const user = getUserFromToken();
    if (!user || user.role !== 'CARETAKER') {
        window.location.href = '../Login Form/index.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const pid = params.get('patientId');
    if (!pid) {
        window.location.href = '../CaretakerDashboard/CaretakerDashboard.html';
        return;
    }
    ownerId = pid;

    try {
        const [medRes, adhRes, patRes] = await Promise.all([
            authFetch(`${API_BASE}/api/caretaker/patient/${pid}/medicines`, { method: 'GET' }),
            authFetch(`${API_BASE}/api/caretaker/patient/${pid}/adherence?days=7`, { method: 'GET' }),
            authFetch(`${API_BASE}/api/caretaker/patients`, { method: 'GET' })
        ]);

        if (medRes.status === 401 || adhRes.status === 401) {
            window.location.href = '../Login Form/index.html';
            return;
        }

        const meds = medRes.ok ? await medRes.json() : [];
        adherenceReport = adhRes.ok ? await adhRes.json() : { days: [] };

        let patientName = 'Patient';
        let patientEmail = '';
        if (patRes.ok) {
            const plist = await patRes.json();
            const p = (plist || []).find((x) => String(x.ownerId) === String(pid));
            if (p) {
                patientName = p.name || patientName;
                patientEmail = p.email || '';
            }
        }

        document.getElementById('patientTitle').textContent = patientName;
        document.getElementById('patientSub').textContent = patientEmail ? patientEmail : '';

        renderMedicines(meds);
        renderHeatmap(adherenceReport.days || []);
    } catch (e) {
        console.error(e);
        document.getElementById('medList').innerHTML = '<p>Could not load data.</p>';
    }
};

function renderMedicines(meds) {
    const el = document.getElementById('medList');
    if (!meds || meds.length === 0) {
        el.innerHTML = '<p>No medicines on file.</p>';
        return;
    }
    el.innerHTML = meds
        .map(
            (um) => `
        <div class="readonly-med-card">
            <h4>${escapeHtml(um.medicine && um.medicine.medName ? um.medicine.medName : '')}</h4>
            <p>Scheduled: ${escapeHtml(um.medTiming || '')}</p>
        </div>
    `
        )
        .join('');
}

function heatClass(day) {
    const total = day.totalDoses || 0;
    if (total === 0) return 'hm-gray';
    const taken = day.takenDoses || 0;
    const missed = day.missedDoses || 0;
    if (missed === 0 && taken === total) return 'hm-green';
    if (taken === 0 && missed === total) return 'hm-red';
    return 'hm-yellow';
}

function renderHeatmap(days) {
    const el = document.getElementById('heatmap');
    el.innerHTML = '';
    if (!days || days.length === 0) {
        el.innerHTML = '<p>No adherence rows yet.</p>';
        return;
    }
    days.forEach((d) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'heatmap-day ' + heatClass(d);
        const short = (d.date || '').slice(5);
        btn.innerHTML = `<span class="dlabel">${escapeHtml(short)}</span><span>${d.takenDoses ?? 0}/${
            d.totalDoses ?? 0
        }</span>`;
        btn.addEventListener('click', () => selectDay(d.date, btn));
        el.appendChild(btn);
    });
    selectedDate = days[days.length - 1].date;
    const lastBtn = el.querySelector('.heatmap-day:last-child');
    if (lastBtn) lastBtn.classList.add('hm-selected');
    renderDayTable(selectedDate);
}

function selectDay(date, btnEl) {
    selectedDate = date;
    document.querySelectorAll('.heatmap-day').forEach((b) => b.classList.remove('hm-selected'));
    if (btnEl) btnEl.classList.add('hm-selected');
    renderDayTable(date);
}

function renderDayTable(date) {
    const wrap = document.getElementById('dayTableWrap');
    if (!adherenceReport || !adherenceReport.days) {
        wrap.innerHTML = '';
        return;
    }
    const day = adherenceReport.days.find((x) => x.date === date);
    if (!day) {
        wrap.innerHTML = '<p>No data for this day.</p>';
        return;
    }
    const rows = day.medicines || [];
    if (rows.length === 0) {
        wrap.innerHTML = '<p>No scheduled doses for this day.</p>';
        return;
    }
    const head = `<table class="day-table"><thead><tr><th>Medicine</th><th>Status</th><th>Scheduled</th><th>Taken at</th></tr></thead><tbody>`;
    const body = rows
        .map(
            (r) =>
                `<tr><td>${escapeHtml(r.name)}</td><td>${escapeHtml(r.status)}</td><td>${escapeHtml(
                    r.scheduledTime || ''
                )}</td><td>${escapeHtml(r.takenAt || '—')}</td></tr>`
        )
        .join('');
    wrap.innerHTML = head + body + '</tbody></table>';
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
