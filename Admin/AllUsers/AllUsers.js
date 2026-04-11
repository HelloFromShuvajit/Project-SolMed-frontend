if (!localStorage.getItem('User')) {
    window.location.href = '../../Login Form/index.html';
}

window.onload = async function () {
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

    allusers();
};

async function allusers() {
    try {
        const response = await authFetch(`${API_BASE}/user/list`, {
            method: 'GET'
        });
        if (response.status === 401) {
            window.location.href = '../../Login Form/index.html';
            return;
        }
        if (!response.ok) {
            console.log('Failed to fetch all users.');
            return;
        }
        const users = await response.json();
        displayUserList(users);
    } catch (error) {
        console.error('Error happened while fetching users.', error);
    }
}

async function displayUserList(users) {
    const userList = document.getElementById('userList');
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
        </div>`;
}
