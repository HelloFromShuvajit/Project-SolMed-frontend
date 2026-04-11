if (!localStorage.getItem('User')) {
    window.location.href = '../Login Form/index.html';
}

window.onload = async function () {
    const user = getUserFromToken();
    console.log(user.id, user.email, user.name);

    if (!user) {
        window.location.href = '../Login Form/index.html';
        console.log('user not ok');
        return;
    }
    if (user.role === 'CARETAKER') {
        window.location.href = '../CaretakerDashboard/CaretakerDashboard.html';
        return;
    }
    document.getElementById('userName').textContent = user.name;
    document.getElementById('id').textContent = 'SM-UID:' + user.id;
};

/**
 * POST JSON with JWT. Every route except /api/auth/** is protected; the filter
 * reads Authorization: Bearer ... and sets the logged-in user.
 */
async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }
    return response.json();
}

async function addMedicine() {
    const user = getUserFromToken();
    if (!user || user.id == null) {
        window.location.href = '../Login Form/index.html';
        return;
    }

    const medName = document.getElementById('medName').value.trim();
    const medStockRaw = document.getElementById('medStock').value;
    const medTiming = document.getElementById('medTime').value;
    const userId = user.id;

    if (!medName || !medTiming || medStockRaw === '') {
        alert('Please fill medicine name, stock, and time.');
        return;
    }

    const medStock = parseInt(medStockRaw, 10);
    if (Number.isNaN(medStock) || medStock < 0) {
        alert('Please enter a valid stock number.');
        return;
    }

    try {
        console.log('Calling API for medicine.');
        const medicine = await postData(`${API_BASE}/medicine/addByUser`, { medName });
        const userMedicine = await postData(`${API_BASE}/userMedicine/add`, {
            userId: userId,
            medicineId: medicine.medId,
            inputTime: medTiming
        });
        await postData(`${API_BASE}/medicineLog/add`, {
            userMedId: userMedicine.id,
            medStock: medStock
        });

        alert(`${medName} has been added to your Medicine List`);
    } catch (error) {
        alert('Error: ' + error.message);
        console.error('Error in adding medicine:', error);
    }
}
