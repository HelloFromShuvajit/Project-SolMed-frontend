if (!localStorage.getItem('User')) {
    window.location.href = '../Login Form/Login.html';
}

window.onload = function () {
    const userString = localStorage.getItem('User');
    if (!userString) {
        window.location.href = '../Login Form/Login.html';
        return;
    }
    const user = JSON.parse(userString);
    document.getElementById('userName').textContent = user.name;
    document.getElementById('id').textContent = 'SM-UID:' + user.id;
}

function logout() {
    localStorage.removeItem('User');
    window.location.href = '../Login Form/Login.html';
}

async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }
    return response.json();
}

async function addMedicine() {
    const medName = document.getElementById("medName").value;
    const medStock = document.getElementById("medStock").value;
    const medTiming = document.getElementById("medTime").value;
    const userId = JSON.parse(localStorage.getItem('User')).id;

    try {
        const medicine = await postData(`http://localhost:8080/medicine/addByUser`, { medName });
        const userMedicine = await postData(`http://localhost:8080/userMedicine/add`, {
            userId: userId,
            medicineId: medicine.medId,
            inputTime: medTiming
        });
        await postData(`http://localhost:8080/medicineLog/add`, {
            userMedId: userMedicine.id,
            medStock
        });

        alert(`${medName} has been added to your Medicine List`);
        window.location.href = '../UserDashboard/UserDashboard.html'; // update path as needed
    } catch (error) {
        alert('Error: ' + error.message);
        console.error("Error in adding medicine:", error);
    }
}