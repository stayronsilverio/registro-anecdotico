const firebaseConfig = {
    apiKey: "AIzaSyCY14LkfciAkiQK8tqFedBR1oNsSJYy_NM",
    authDomain: "registro-anecdotico-4e9f9.firebaseapp.com",
    projectId: "registro-anecdotico-4e9f9",
    storageBucket: "registro-anecdotico-4e9f9.appspot.com",
    messagingSenderId: "1090150651792",
    appId: "1:1090150651792:web:7235a82869df91969a5840"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let failedAttempts = 0;
let isBlocked = false;

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-switch i');
    icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
}

function togglePassword(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const icon = document.querySelector(`#${toggleId} i`);
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function updateProfileRealTime() {
    const email = document.getElementById('usuario').value.toLowerCase();
    const profileName = document.getElementById('profile-name');
    const avatar = document.getElementById('user-avatar');
    
    if(email.includes("silverio")) {
        profileName.textContent = "Miguel Silverio";
        avatar.textContent = "MS";
    }
}

async function validarLogin() {
    if (isBlocked) return;
    const email = document.getElementById('usuario').value;
    const pass = document.getElementById('password').value;
    const errorBox = document.getElementById('error-msg');
    const successBox = document.getElementById('success-msg');

    try {
        await auth.signInWithEmailAndPassword(email, pass);
        errorBox.style.display = 'none';
        successBox.style.display = 'block';
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);
    } catch (error) {
        failedAttempts++;
        document.getElementById('error-text').textContent = "Credenciales incorrectas";
        errorBox.style.display = 'block';
        if (failedAttempts >= 3) startBlock();
    }
}

function startBlock() {
    isBlocked = true;
    let timeLeft = 45;
    const blockedBox = document.getElementById('blocked-msg');
    blockedBox.style.display = 'block';
    const timer = setInterval(() => {
        document.getElementById('blocked-text').textContent = `Bloqueado por ${timeLeft}s`;
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(timer);
            isBlocked = false;
            blockedBox.style.display = 'none';
            failedAttempts = 0;
        }
    }, 1000);
}

function showAdminAuth() { 
    document.getElementById('login-form').style.display = 'none'; 
    document.getElementById('admin-auth').style.display = 'block'; 
}

function hideAdminAuth() { 
    document.getElementById('login-form').style.display = 'block'; 
    document.getElementById('admin-auth').style.display = 'none'; 
}

function verifyAdmin() {
    const u = document.getElementById('admin-username').value;
    const p = document.getElementById('admin-password').value;
    if(u === "admin" && p === "2201") {
        document.getElementById('admin-auth').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        loadUsers();
    }
}

async function registerUser() {
    const email = document.getElementById('new-email').value;
    const pass = document.getElementById('new-password').value;
    const name = document.getElementById('new-username').value;
    const role = document.getElementById('user-role').value;

    try {
        await auth.createUserWithEmailAndPassword(email, pass);
        await db.collection('users').doc(email).set({ name, role, email });
        showAlert("Usuario creado con éxito");
    } catch (e) { showAlert(e.message, "error"); }
}

function showAlert(msg) {
    const alert = document.getElementById('custom-alert');
    document.getElementById('alert-message').textContent = msg;
    alert.classList.add('show');
    setTimeout(() => alert.classList.remove('show'), 3000);
}

function hideAdminPanel() {
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}

function switchAdminTab(tab) {
    document.getElementById('create-user-form').style.display = tab === 'create' ? 'block' : 'none';
    document.getElementById('delete-user-form').style.display = tab === 'delete' ? 'block' : 'none';
    document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
}
