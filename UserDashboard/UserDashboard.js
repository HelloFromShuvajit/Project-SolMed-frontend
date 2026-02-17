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
        const medicines = await response.json();
        console.log("Medicines:", medicines);
        displayMedicines(medicines);
    } catch (error) {
        console.error("Error happened while fetching medicines.", error);
    }
}
function logout(){
    localStorage.removeItem('User');
    window.location.href = '../Login Form/Login.html';
}
function displayMedicines(medicines){
    const medList= document.getElementById("medList");

    medList.innerHTML= medicines.map(medicine =>
        ` <div class= "medicine-card">
            <h3>Medicine Name: </h3> <p>${medicine.medicine.medName}</p>
            <h3>Scheduled Time: </h3> <p>${medicine.medTiming}</p>
        </div>
        `).join('');
}