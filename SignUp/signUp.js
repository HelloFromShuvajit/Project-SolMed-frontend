async function signup() {
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const password = document.getElementById('password').value;
    const phoneNo = document.getElementById('phoneNo').value;

    try {
        console.log('Trying to call signup API');
        const response = await fetch(`http://localhost:8080/user/signup`, {
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
                phone:phoneNo
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
        localStorage.setItem('User',JSON.stringify(data));
        window.location.href='../UserDashboard/UserDashboard.html';
    console.log(data);
    } catch (error) {
        console.error('User already exists...', error);
    }
}