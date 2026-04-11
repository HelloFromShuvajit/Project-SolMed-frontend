window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const preEmail = params.get('email');
    if (preEmail) {
        const em = document.getElementById('email');
        if (em) em.value = preEmail;
        if (em) em.readOnly = true;
    }
});

async function signup() {
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const password = document.getElementById('password').value;
    const phoneNo = document.getElementById('phoneNo').value;

    try {
        console.log('Trying to call signup API');
        const response = await fetch(`${API_BASE}/api/auth/signup`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name:name,
                email:email,
                age:parseInt(age),
                gender:gender,
                password:password,
                phone:phoneNo,
                position: 'User',
                role: 'OWNER',
            })
        });
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);


        if (!response.ok) {
            const errorText = await response.text();
            console.error('Signup failed:', errorText);
            alert('Signup failed: ' + errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        console.log(response);
        console.log(data);
        localStorage.setItem('User',JSON.stringify(data));
        const decoded = typeof getUserFromToken === 'function' ? getUserFromToken() : null;
        if (decoded && decoded.role === 'CARETAKER') {
            window.location.href = '../CaretakerDashboard/CaretakerDashboard.html';
        } else {
            window.location.href = '../UserDashboard/UserDashboard.html';
        }
    } catch (error) {
        console.error('Error exists...', error);
    }
}
