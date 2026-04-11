
if (!localStorage.getItem('User')) {
    window.location.href = '../Login Form/index.html';
}

window.onload = async function () {
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
        displayMedicines(usermedicines);
    } catch (error) {
        console.error('Error happened while fetching medicines.', error);
    }
};


function escapeReq(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;');
}

async function displayMedicines(usermedicines) {
    const medList = document.getElementById('medList');

    const results = await Promise.all(
        usermedicines.map(async (usermedicine) => {
            const response = await authFetch(
                `${API_BASE}/medicineLog/userMedicine/${usermedicine.id}`,
                { method: 'GET' }
            );
            if (!response.ok) {
                return `<div class="medicine-card"><p>Could not load log</p></div>`;
            }
            const medicineLog = await response.json();
            const stock = medicineLog[0]?.medStock ?? 'N/A';

            return `<div class="medicine-card">
                <h3>Medicine Name: </h3> <p>${usermedicine.medicine.medName}</p>
                <h3>Scheduled Time: </h3> <p>${usermedicine.medTiming}</p>
                <h3>Remaining Medicines: </h3> <p>${stock}</p>
            </div>`;
        })
    );
    medList.innerHTML = results.join('');
}
