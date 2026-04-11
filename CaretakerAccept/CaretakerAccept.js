(function () {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const statusEl = document.getElementById('status');

    if (!token) {
        statusEl.textContent = 'Missing invite token. Ask the patient to resend the invite.';
        return;
    }

    fetch(`${API_BASE}/api/caretaker/accept?token=${encodeURIComponent(token)}`)
        .then((r) => r.json())
        .then((data) => {
            if (data.outcome === 'LINKED') {
                statusEl.textContent =
                    data.message || 'Your account is linked. Please log in with your existing Sol-med credentials.';
                setTimeout(() => {
                    window.location.href = '../Login Form/index.html';
                }, 2000);
                return;
            }
            if (data.outcome === 'REGISTER_REQUIRED') {
                const email = encodeURIComponent(data.email || '');
                const t = encodeURIComponent(data.inviteToken || token);
                window.location.href = `../SignUp/signUp.html?email=${email}&token=${t}&caretaker=1`;
                return;
            }
            statusEl.textContent = data.message || 'This invite is not valid.';
        })
        .catch(() => {
            statusEl.textContent = 'Could not verify the invite. Try again later.';
        });
})();
