function moveToForm(){
    location.replace('/form')
}

function returnHome(){
    location.replace('/')
}

function goLogin(){
    location.replace('/login')
}

function goRegister(){
    location.replace('/register')
}

function goAccount(){
    location.replace('/account')
}

function goLogout(){
    fetch("/logout", {
        method: "POST",
    })
    location.replace('/login')
}

function refreshSess(){
    location.replace('/session-test')
}