if (!localStorage.getItem('User')) {
    window.location.href = '../Login Form/index.html';
}

/**
 * Load profile from the API so age, phone, gender, etc. are correct.
 * The JWT only carries id, name, position, email — not the full user row.
 */
window.onload = async function () {
    const fromToken = getUserFromToken();
    if (!fromToken || fromToken.id == null) {
        window.location.href = '../Login Form/index.html';
        return;
    }
    if (fromToken.role === 'CARETAKER') {
        window.location.href = '../CaretakerDashboard/CaretakerDashboard.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/user/${fromToken.id}`, {
            method: 'GET',
            headers: authHeaders()
        });

        if (res.status === 401) {
            window.location.href = '../Login Form/index.html';
            return;
        }
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || res.statusText);
        }
        await loadIncomingCaretakerRequests();
        await loadCaretakers();

        const user = await res.json();

        document.getElementById('userName').textContent = user.name || '';
        document.getElementById('id').textContent = 'SM-UID:' + user.id;
        document.getElementById('email').textContent = user.email || '';
        document.getElementById('age').textContent =
            user.age != null && user.age !== '' ? String(user.age) : '';
        document.getElementById('gender').textContent = user.gender || '';
        document.getElementById('phoneno').textContent = user.phone || '';

    } catch (e) {
        console.error(e);
        alert('Could not load profile: ' + e.message);
    }
};

async function loadCaretakers() {
    const ul = document.getElementById('caretakerList');
    const msg = document.getElementById('caretakerInviteMsg');
    if (!ul) return;
    ul.innerHTML = '';
    try {
        const res = await authFetch(`${API_BASE}/api/caretaker/list`, { method: 'GET' });
        if (!res.ok) {
            if (msg) msg.textContent = 'Could not load caretakers.';
            return;
        }
        const list = await res.json();
        if (!list || list.length === 0) {
            ul.innerHTML = '<li>No caretakers linked yet.</li>';
            return;
        }
        list.forEach((c) => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${escapeHtml(c.name || '')} &lt;${escapeHtml(c.email || '')}&gt;</span>`;
            const revoke = document.createElement('button');
            revoke.type = 'button';
            revoke.textContent = 'Revoke access';
            revoke.addEventListener('click', () => revokeCaretaker(c.caretakerUserId));
            li.appendChild(revoke);
            ul.appendChild(li);
        });
    } catch (e) {
        console.error(e);
        if (msg) msg.textContent = 'Error loading caretakers.';
    }
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

async function loadIncomingCaretakerRequests() {
    const list = document.getElementById('caretakerRequestsList');
    if (!list) return;
    try {
        const res = await authFetch(`${API_BASE}/api/caretaker/incoming-link-requests`, { method: 'GET' });
        if (res.status === 401 || res.status === 403) {
            list.innerHTML = '<p class="subtle">Sign in as a patient to manage caretaker requests.</p>';
            return;
        }
        if (!res.ok) {
            list.innerHTML = '<p>Could not load requests.</p>';
            return;
        }
        const items = await res.json();
        if (!items || items.length === 0) {
            list.innerHTML = '<p class="subtle">No pending caretaker requests.</p>';
            return;
        }
        list.innerHTML = items
            .map(
                (r) => `
            <div class="req-row" data-req-id="${r.requestId}">
                <div>
                    <strong>${escapeHtml(r.caretakerName)}</strong>
                    <span style="color:var(--text-muted)"> &lt;${escapeHtml(r.caretakerEmail)}&gt;</span>
                </div>
                <div class="req-actions">
                    <button type="button" class="btn-accept" data-action="accept">Approve</button>
                    <button type="button" class="btn-reject" data-action="reject">Decline</button>
                </div>
            </div>`
            )
            .join('');
        list.querySelectorAll('.req-row').forEach((row) => {
            const id = row.getAttribute('data-req-id');
            row.querySelector('[data-action="accept"]').addEventListener('click', () => respondCaretakerRequest(id, 'accept'));
            row.querySelector('[data-action="reject"]').addEventListener('click', () => respondCaretakerRequest(id, 'reject'));
        });
    } catch (e) {
        console.error(e);
        list.innerHTML = '<p>Could not load caretaker requests.</p>';
    }
}

async function respondCaretakerRequest(requestId, action) {
    const path = action === 'accept' ? 'accept' : 'reject';
    try {
        const res = await authFetch(`${API_BASE}/api/caretaker/link-requests/${requestId}/${path}`, {
            method: 'POST',
        });
        if (!res.ok) {
            alert('Could not update request.');
            return;
        }
        await loadIncomingCaretakerRequests();
        if (action === 'accept') {
            await loadCaretakers();
        }
    } catch (e) {
        console.error(e);
        alert('Network error.');
    }
}


async function revokeCaretaker(caretakerUserId) {
    if (!confirm('Revoke this caretaker’s access?')) return;
    const msg = document.getElementById('caretakerInviteMsg');
    try {
        const res = await authFetch(`${API_BASE}/api/caretaker/revoke/${caretakerUserId}`, {
            method: 'DELETE'
        });
        if (!res.ok) {
            const t = await res.text();
            throw new Error(t || res.statusText);
        }
        if (msg) msg.textContent = 'Access revoked.';
        await loadCaretakers();
    } catch (e) {
        console.error(e);
        if (msg) msg.textContent = 'Could not revoke: ' + e.message;
    }
}
