if (!localStorage.getItem('User')) {
    window.location.href = '../../Login Form/index.html';
}

window.onload = async function () {
    const btnLogOut = document.getElementById('logOut-btn');
    if (btnLogOut) btnLogOut.addEventListener('click', logout);

    const user = getUserFromToken();
    if (!user) {
        window.location.href = '../../Login Form/index.html';
        return;
    }
    if (user.position !== 'Admin') {
        window.location.href = '../../UserDashboard/UserDashboard.html';
        return;
    }
    document.getElementById('userName').textContent = user.name;

    allmeds();
};

async function allmeds() {
    try {
        const response = await authFetch(`${API_BASE}/medicine/list`, {
            method: 'GET'
        });
        if (response.status === 401) {
            window.location.href = '../../Login Form/index.html';
            return;
        }
        if (!response.ok) {
            console.log('Failed to fetch all medicines.');
            return;
        }
        const medicines = await response.json();
        displayMedList(medicines);
    } catch (error) {
        console.error('Error happened while fetching medicines.', error);
    }
}

async function displayMedList(medicines) {
    const medList = document.getElementById('medList');
    medList.innerHTML = `
<div class="med-card">
    <table>
    <thead>
        <tr>
            <th>Medicine Id</th>
            <th>Medicine Name</th>
        </tr>
        </thead>
        <tbody>
        ${medicines.map(med => `
            <tr>
                <td>${med.medId}</td>
                <td>${med.medName}</td>
            </tr>    
            `).join('')}
        </tbody>
        </table>
        </div>`;
}
