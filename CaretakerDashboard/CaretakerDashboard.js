if (!localStorage.getItem('User')) {
    window.location.href = '../Login Form/index.html';
}

window.onload = async function () {
    const user = getUserFromToken();
    if (!user) {
        window.location.href = '../Login Form/index.html';
        return;
    }
    if (user.role !== 'CARETAKER') {
        window.location.href = '../UserDashboard/UserDashboard.html';
        return;
    }

    document.getElementById('userName').textContent = user.name;
    document.getElementById('id').textContent = 'SM-UID:' + user.id;

    document.getElementById('requestLinkBtn').addEventListener('click', requestPatientLink);
    await loadPendingLinkRequests();

    const container = document.getElementById('patientCards');
    try {
        const res = await authFetch(`${API_BASE}/api/caretaker/patients`, { method: 'GET' });
        if (res.status === 401) {
            window.location.href = '../Login Form/index.html';
            return;
        }
        if (!res.ok) {
            container.innerHTML = '<p>Could not load patients.</p>';
            return;
        }
        const patients = await res.json();
        if (!patients || patients.length === 0) {
            container.innerHTML =
                '<p>No patients linked yet. Use <strong>Connect a patient</strong> above with their registered email, then ask them to approve the request in their patient dashboard.</p>';
            return;
        }
        await loadTodayMissedMedicines(patients);
        container.innerHTML = patients
            .map(
                (p) => `
            <div class="patient-card" data-owner-id="${p.ownerId}">
                <h4>${escapeHtml(p.name || '')}</h4>
                <p>${escapeHtml(p.email || '')}</p>
                <div class="stats">
                    <span class="stat-ok">Taken today: ${p.todayTaken ?? 0}</span>
                    <span class="stat-bad">Missed today: ${p.todayMissed ?? 0}</span>
                    <span>Pending: ${p.todayPending ?? 0}</span>
                </div>
                <div class="missed-meds">
                    <p class="missed-title">Missed medicines</p>
                    ${
                        p.todayMissedMedicines && p.todayMissedMedicines.length > 0
                            ? `<ul>${p.todayMissedMedicines
                                  .map((name) => `<li>${escapeHtml(name)}</li>`)
                                  .join('')}</ul>`
                            : '<p class="missed-empty">No missed medicines today.</p>'
                    }
                </div>
            </div>
        `
            )
            .join('');

        container.querySelectorAll('.patient-card').forEach((el) => {
            el.addEventListener('click', () => {
                const id = el.getAttribute('data-owner-id');
                window.location.href = `../CaretakerPatientDetail/CaretakerPatientDetail.html?patientId=${encodeURIComponent(
                    id
                )}`;
            });
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p>Error loading patients.</p>';
    }
};

async function loadTodayMissedMedicines(patients) {
    const calls = (patients || []).map(async (p) => {
        try {
            const res = await authFetch(`${API_BASE}/api/caretaker/patient/${p.ownerId}/adherence?days=1`, {
                method: 'GET',
            });
            if (!res.ok) {
                p.todayMissedMedicines = [];
                return;
            }
            const report = await res.json();
            const days = report && report.days ? report.days : [];
            const day = days.length > 0 ? days[days.length - 1] : null;
            const meds = day && day.medicines ? day.medicines : [];
            const missed = meds
                .filter((m) => String(m.status || '').toUpperCase() === 'MISSED')
                .map((m) => m.name)
                .filter((name) => !!name);
            p.todayMissedMedicines = [...new Set(missed)];
        } catch (e) {
            console.error(e);
            p.todayMissedMedicines = [];
        }
    });
    await Promise.all(calls);
}

async function loadPendingLinkRequests() {
    const box = document.getElementById('pendingRequests');
    try {
        const res = await authFetch(`${API_BASE}/api/caretaker/my-link-requests`, { method: 'GET' });
        if (!res.ok) {
            box.innerHTML = '<p>Could not load pending requests.</p>';
            return;
        }
        const rows = await res.json();
        const pending = (rows || []).filter((r) => r.status === 'PENDING');
        if (pending.length === 0) {
            box.innerHTML = '<p class="help-text" style="margin:0">No pending link requests.</p>';
            return;
        }
        box.innerHTML = pending
            .map(
                (r) => `
            <div class="pending-row">
                <span>${escapeHtml(r.patientName || '')} &lt;${escapeHtml(r.patientEmail || '')}&gt;</span>
                <span class="status-pending">Waiting for patient to approve</span>
            </div>`
            )
            .join('');
    } catch (e) {
        console.error(e);
        box.innerHTML = '<p>Could not load pending requests.</p>';
    }
}

async function requestPatientLink() {
    const input = document.getElementById('patientEmailInput');
    const msg = document.getElementById('linkPatientMsg');
    const email = (input.value || '').trim();
    msg.textContent = '';
    msg.className = 'inline-msg';
    if (!email || !email.includes('@')) {
        msg.className = 'inline-msg err';
        msg.textContent = 'Enter a valid patient email.';
        return;
    }
    try {
        const res = await authFetchJson(`${API_BASE}/api/caretaker/request-link`, {
            method: 'POST',
            body: JSON.stringify({ patientEmail: email }),
        });
        if (res.status === 401) {
            window.location.href = '../Login Form/index.html';
            return;
        }
        if (!res.ok) {
            const t = await res.text();
            msg.className = 'inline-msg err';
            msg.textContent = t || 'Request failed.';
            return;
        }
        msg.className = 'inline-msg ok';
        msg.textContent = 'Request sent. Ask the patient to approve it in their dashboard.';
        input.value = '';
        await loadPendingLinkRequests();
    } catch (e) {
        console.error(e);
        msg.className = 'inline-msg err';
        msg.textContent = 'Network error.';
    }
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
