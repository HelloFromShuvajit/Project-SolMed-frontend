async function login() {
    const email= document.getElementById('email').value;
    const password =  document.getElementById('password').value;
    try{
        console.log("Calling API for login");
        const response = await fetch(`http://localhost:8080/user/login`,{
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
            throw new Error("Error happened.");
        }
        const data = await response.json();
        console.log("User:", data);
        
        localStorage.setItem('User',JSON.stringify(data));
        window.location.href='../UserDashboard/UserDashboard.html';
        
    }
    catch(error){
        console.error("User not found...",error);
        alert ('Invalid Credientials.');
        }

}