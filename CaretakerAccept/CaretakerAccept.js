(function () {
    const params = new URLSearchParams(window.location.search);
    const requestId = params.get('requestId');
    const statusEl = document.getElementById('status');

    if (!requestId) {
        statusEl.textContent = 'Missing request id. Open this page from a pending caretaker request.';
        return;
    }

    if (!localStorage.getItem('User') || typeof getAuthToken !== 'function' || !getAuthToken()) {
        statusEl.textContent = 'Please log in as the patient, then open this invite link again.';
        setTimeout(() => {
            window.location.href = '../Login Form/index.html';
        }, 2000);
        return;
    }

    authFetch(`${API_BASE}/api/caretaker/link-requests/${encodeURIComponent(requestId)}/accept`, {
        method: 'POST',
    })
        .then(async (res) => {
            if (res.status === 401 || res.status === 403) {
                statusEl.textContent = 'You must be signed in as the patient to approve this request.';
                setTimeout(() => {
                    window.location.href = '../Login Form/index.html';
                }, 2000);
                return;
            }
            if (!res.ok) {
                const text = await res.text().catch(() => '');
                statusEl.textContent = text || 'Could not accept this caretaker request.';
                return;
            }
            statusEl.textContent = 'Caretaker request approved. Redirecting to your profile…';
            setTimeout(() => {
                window.location.href = '../UserProfile/UserProfile.html';
            }, 1500);
        })
        .catch(() => {
            statusEl.textContent = 'Could not accept the request. Try again later.';
        });
})();
