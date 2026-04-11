if (!localStorage.getItem('User')) {
    window.location.href = '../Login Form/index.html';
}

window.onload = async function () {
    const logOutBtn = document.getElementById('logOut-btn');
    if (logOutBtn) logOutBtn.addEventListener('click', logout);

    const user = getUserFromToken();

    if (!user) {
        window.location.href = '../Login Form/index.html';
        return;
    }
    if (user.role === 'CARETAKER') {
        window.location.href = '../CaretakerDashboard/CaretakerDashboard.html';
        return;
    }
    document.getElementById('userName').textContent = user.name;
    document.getElementById('id').textContent = 'SM-UID:' + user.id;

    const userId = user.id;
    try {
        const response = await authFetch(`${API_BASE}/userMedicine/user/${userId}`, {
            method: 'GET'
        });
        if (response.status === 401) {
            window.location.href = '../Login Form/index.html';
            return;
        }
        if (!response.ok) {
            console.log('Failed to fetch medicines.');
            return;
        }
        const usermedicines = await response.json();
        displayMedicines(usermedicines, user);
    } catch (error) {
        console.error('Error happened while fetching medicines.', error);
    }
};

async function displayMedicines(usermedicines, currentUser) {
    const medList = document.getElementById('medList');
    const role = currentUser && currentUser.role ? currentUser.role : (getUserFromToken() || {}).role;

    const results = await Promise.all(
        usermedicines.map(async (usermedicine) => {
            const [logRes, takenRes] = await Promise.all([
                authFetch(`${API_BASE}/medicineLog/userMedicine/${usermedicine.id}`, { method: 'GET' }),
                authFetch(`${API_BASE}/medicineLog/userMedicine/${usermedicine.id}/taken-today`, {
                    method: 'GET',
                }),
            ]);
            if (!logRes.ok) {
                return `<div class="medicine-card"><p>Could not load log</p></div>`;
            }
            const medicineLog = await logRes.json();
            const stock = medicineLog[0]?.medStock ?? 'N/A';
            const medLogRow = medicineLog[0];

            let takenToday = false;
            if (takenRes.ok) {
                try {
                    const t = await takenRes.json();
                    takenToday = !!t.takenToday;
                } catch (_) {
                    /* ignore */
                }
            }

            let actions = '';
            if (role !== 'CARETAKER' && medLogRow) {
                const markBtn = takenToday
                    ? '<button type="button" class="medTaken-btn" disabled aria-disabled="true">Taken today</button>'
                    : `<button onclick="medTaken(${medLogRow.MedLogId})" type="button" class="medTaken-btn">Mark Taken</button>`;
                actions = `<div class="updateMedStock">
                ${markBtn}
                <button onclick="refill(${medLogRow.MedLogId})" type="button" class="refill-btn">Refill Stock</button>
                </div>`;
            }

            return `<div class="medicine-card">
                <h3>Medicine Name: </h3> <p>${usermedicine.medicine.medName}</p>
                <h3>Scheduled Time: </h3> <p>${usermedicine.medTiming}</p>
                <h3>Remaining Medicines: </h3> <p>${stock}</p>
                ${actions}
            </div>`;
        })
    );
    medList.innerHTML = results.join('');
}

async function medTaken(medLogId) {
    try {
        const response = await authFetch(`${API_BASE}/medicineLog/medTaken/${medLogId}`, {
            method: 'PATCH'
        });
        if (response.status === 401) {
            window.location.href = '../Login Form/index.html';
            return;
        }
        if (!response.ok) {
            throw new Error('Failed to mark as taken');
        }
        const markMedicine = await response.json();
        alert(markMedicine.message);
                window.location.reload();
    } catch (error) {
        console.error('Error happened while marking medicine: ', error);
    }
}

async function refill(medLogId) {
    const newStock = prompt('Enter how many medicine you want to add.');
    if (newStock === null) return;
    try {
        const response = await authFetch(`${API_BASE}/medicineLog/refill/${medLogId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parseInt(newStock, 10))
        });
        if (response.status === 401) {
            window.location.href = '../Login Form/index.html';
            return;
        }
        if (!response.ok) {
            throw new Error('Failed to refill the medicine');
        }
        const refillMedicine = await response.json();
        alert(refillMedicine.message);
        window.location.reload();
    } catch (error) {
        console.error('Error happened while refilling medicine: ', error);
    }
}
