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
    allusers();
}

function logout(){
    localStorage.removeItem('User');
    window.location.href = '../../Login Form/Login.html';
}
async function allusers() {
    console.log("Calling API to show all users...");
    try {
        const response = await fetch(`http://localhost:8080/user/list` , {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/json',
            }
        });
        if(!response.ok){
            console.log("Failed to fetch all users.");
        }
        const users= await response.json();
        console.log(users);
        displayUserList(users);
    } catch (error) {
        console.error("Error happened while fetching users.", error);

    }

}
async function displayUserList(users) {
    const userList = document.getElementById("userList");
    userList.innerHTML = users.map(aUser => `
        <div class="user-card">
            <h3>User Id:</h3> <p>${aUser.id}</p>
            <h3>User Email:</h3> <p>${aUser.email}</p>
            <h3>User Name:</h3> <p>${aUser.name}</p>
            <h3>User Age:</h3> <p>${aUser.age}</p>
            <h3>User Gender:</h3> <p>${aUser.gender}</p>
            <h3>User Phone:</h3> <p>${aUser.phone}</p>
        </div>
    `).join('');
}