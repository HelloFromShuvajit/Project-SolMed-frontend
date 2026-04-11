async function login() {
    const email= document.getElementById('email').value;
    const password =  document.getElementById('password').value;
    try{
        console.log("Calling API for login");
        const response = await fetch(`${API_BASE}/api/auth/login`,{
            method:'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body:JSON.stringify({
                email: email,
                password: password
            })
        });
        if(!response.ok){
            throw new Error("Error happened in fetching API.");
        }
        const data = await response.json();
        localStorage.setItem('User', JSON.stringify(data));
        console.log("token:", data);
        
        
        const decoded = getUserFromToken();

        if (decoded.role === 'CARETAKER') {
            window.location.href = '../CaretakerDashboard/CaretakerDashboard.html';
        } else if (decoded.position === 'Admin') {
            window.location.href = '../Admin/AllUsers/AllUsers.html';
        } else if (decoded.position === 'User') {
            window.location.href = '../MedicineLog/Medicine.html';
        }
        
    }
    catch(error){
        console.error("User not found...",error);
        alert ('Invalid Credientials.');
        }
}