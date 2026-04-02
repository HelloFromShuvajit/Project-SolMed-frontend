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
    userList.innerHTML = `
<div class="user-card">
    <table>
    <thead>
        <tr>
            <th>User Id</th>
            <th>Email</th>
            <th>Name</th>
            <th>Age </th>
            <th>Gender </th>
            <th>Phone No </th>
        </tr>
        </thead>
        <tbody>
        ${users.map(aUser => `
            <tr>
                <td>${aUser.id}</td>
                <td>${aUser.email}</td>
                <td>${aUser.name}</td>
                <td>${aUser.age}</td>
                <td>${aUser.gender}</td>
                <td>${aUser.phone}</td>
            </tr>    
            `).join('')}
        </tbody>
        </table>
        </div>`
}