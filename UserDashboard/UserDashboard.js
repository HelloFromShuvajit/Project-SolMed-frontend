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
    document.getElementById('id').textContent = 'SM-UID:'+user.id;

    const userId = user.id;
    console.log(userId);
    try {
        console.log("Calling API to get UserMedicines for: ", userId);
        const response = await fetch(`http://localhost:8080/userMedicine/user/${userId}`,{
            method : 'GET',
            headers : {
                'Content-Type' : 'application/json',
            }
        });
        if (!response.ok) {
            console.log("Failed to fetch medicines.");
        }
        const usermedicines = await response.json();
        console.log("UserMedicines:", usermedicines);
        displayMedicines(usermedicines);
    } catch (error) {
        console.error("Error happened while fetching medicines.", error);
    }
}
function logout(){
    localStorage.removeItem('User');
    window.location.href = '../Login Form/Login.html';
}
async function displayMedicines(usermedicines){
    const medList= document.getElementById("medList");

    const results = await Promise.all(
        usermedicines.map(async (usermedicine) => {
            console.log("Usermedicine Id:",usermedicine.id)
            const response = await fetch(`http://localhost:8080/medicineLog/userMedicine/${usermedicine.id}`);
            const medicineLog = await response.json();
            console.log("MedicineLog:",medicineLog);
            const stock = medicineLog[0]?.medStock ?? 'N/A';//The ?. and ?? operators prevent crashes if any value is null or undefined, so the page will still render even if some data is missing.

            return `<div class="medicine-card">
                <h3>Medicine Name: </h3> <p>${usermedicine.medicine.medName}</p>
                <h3>Scheduled Time: </h3> <p>${usermedicine.medTiming}</p>
                <h3>Remaining Medicines: </h3> <p>${stock}</p>
            </div>`;
        })
    );
            medList.innerHTML = results.join('');
}
