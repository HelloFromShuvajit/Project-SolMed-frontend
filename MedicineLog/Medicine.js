if (!localStorage.getItem('User')) {
    window.location.href = '../Login Form/Login.html';
}

window.onload = async function () {
    const userString = localStorage.getItem('User');
    if (!userString) {
        window.location.href = '../Login Form/Login.html';
        return;
    }
    const user = JSON.parse(userString);
    document.getElementById('userName').textContent = user.name;
    document.getElementById('id').textContent = 'SM-UID:' + user.id;

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
            </div>
            <div class="updateMedStock">
            <button onclick="medTaken(${medicineLog[0].MedLogId})" type="button" class="medTaken-btn">Mark Taken</button>
            <button onclick="refill(${medicineLog[0].MedLogId})" type="button" class="refill-btn">Refill Stock</button>
            </div>`;
        })
    );
            medList.innerHTML = results.join('');
}
async function medTaken(medLogId) {
    try {
        console.log("Calling API to medicine taken: ");
        const response = await fetch(`http://localhost:8080/medicineLog/medTaken/${medLogId}`,{
            method : 'PATCH',
            headers : {
                'Content-Type' : 'application/json',
            }
        });
        if (!response.ok) {
            console.log("Failed to mark medicine as taken.");
            throw new Error("Failed to mark as taken");
            
        }
        const markMedicine = await response.json();
        console.log("Marked? :", markMedicine);
        alert(markMedicine.message);
    } catch (error) {
        console.error("Error happened while marking medicine: ", error);
    }
}
async function refill(medLogId) {
    const newStock= prompt("Enter how many medicine you want to add.");
    try {
        console.log("Calling API to medicine refill: ");
        const response = await fetch(`http://localhost:8080/medicineLog/refill/${medLogId}`,{
            method : 'PATCH',
            headers : {
                'Content-Type' : 'application/json',
            },
            body:newStock
        });
        if (!response.ok) {
            console.log("Failed to refill medicine.");
            throw new Error("Failed to refill the medicine");
            
        }
        const refillMedicine = await response.json();
        console.log("Marked? :", refillMedicine);
        alert(refillMedicine.message);
    } catch (error) {
        console.error("Error happened while refilling medicine: ", error);
    }
}
