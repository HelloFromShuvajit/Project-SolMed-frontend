if (!localStorage.getItem('User')) {
window.location.href = '../Login Form/Login.html';
}
window.onload = function () {
    const userString = localStorage.getItem('User');
    console.log(userString);

    if(!userString){
        window.location.href = '../Login Form/login.html';
        console.log("userString not ok");
        return;
    }
    const user = JSON.parse(userString);
    document.getElementById('userName').textContent = user.name;
    document.getElementById('email').textContent = user.email;
    document.getElementById('age').textContent = user.age;
    document.getElementById('gender').textContent = user.gender;
    document.getElementById('id').textContent = 'SM-UID:'+user.id;
    document.getElementById('phoneno').textContent = user.phone;

    console.log(user);
}
function logout(){
    localStorage.removeItem('User');
    window.location.href = '../Login Form/Login.html';
}
