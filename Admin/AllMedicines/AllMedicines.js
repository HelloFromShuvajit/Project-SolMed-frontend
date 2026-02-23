if (!localStorage.getItem('User')) {
window.location.href = '../Login Form/Login.html';
}
window.onload = async function () {
    const userString = localStorage.getItem('User');
    console.log(userString);

    if(!userString){
        window.location.href = '../Login Form/login.html';
        console.log("userString not ok");
        return;
    }
    const user = JSON.parse(userString);
    document.getElementById('userName').textContent = user.name;

    const admin = user.position;
    console.log(admin);
    allmeds();
}

function logout(){
    localStorage.removeItem('User');
    window.location.href = '../../Login Form/Login.html';
}
async function allmeds() {
    console.log("Calling API to show all meds...");
    try {
        const response = await fetch(`http://localhost:8080/medicine/list` , {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/json',
            }
        });
        if(!response.ok){
            console.log("Failed to fetch all medicnes.");
        }
        const medicines= await response.json();
        console.log(medicines);
        displayMedList(medicines);
    } catch (error) {
        console.error("Error happened while fetching medicines.", error);

    }

}
async function displayMedList(medicines) {
    const medList = document.getElementById("medList");
    medList.innerHTML = medicines.map(med => `
        <div class="med-card">
            <h3>Medicine Id:</h3> <p>${med.medId}</p>
            <h3>Medicine Name:</h3> <p>${med.medName}</p>
        </div>
    `).join('');
}