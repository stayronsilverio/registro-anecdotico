// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCY14LkfciAkiQK8tqFedBR1oNsSJYy_NM",
    authDomain: "registro-anecdotico-4e9f9.firebaseapp.com",
    projectId: "registro-anecdotico-4e9f9",
    storageBucket: "registro-anecdotico-4e9f9.appspot.com",
    messagingSenderId: "1090150651792",
    appId: "1:1090150651792:web:7235a82869df91969a5840"
};

// Inicializar Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

let failedAttempts = 0;
let isBlocked = false;

// --- FUNCIONES DE INTERFAZ ---
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const icon = document.querySelector('.theme-switch i');
    if (icon) {
        icon.className = document.body.classList.contains('dark-mode') ? 'fas fa-sun' : 'fas fa-moon';
    }
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

function showAlert(message, type = "success") {
    const alert = document.getElementById("custom-alert");
    const alertText = document.getElementById("alert-message");
    if (alert && alertText) {
        alert.className = `custom-alert show ${type}`;
        alertText.textContent = message;
        setTimeout(() => alert.classList.remove("show"), 3000);
    }
}

function updateProfileRealTime() {
    const emailInput = document.getElementById('usuario');
    if (!emailInput) return;
    
    const email = emailInput.value.toLowerCase();
    const profileName = document.getElementById('profile-name');
    const avatar = document.getElementById('user-avatar');
    
    if(email.includes("silverio")) {
        profileName.textContent = "Miguel Silverio";
        avatar.textContent = "MS";
    } else if(email.includes("@")) {
        const name = email.split('@')[0].toUpperCase();
        profileName.textContent = name;
        avatar.textContent = name.charAt(0);
    }
}

// --- LÓGICA DE LOGIN ---
async function validarLogin() {
    if (isBlocked) return;

    const email = document.getElementById('usuario').value;
    const pass = document.getElementById('password').value;
    const errorBox = document.getElementById('error-msg');
    const errorText = document.getElementById('error-text');
    const successBox = document.getElementById('success-msg');

    if (!email || !pass) {
        errorText.textContent = "Por favor, completa todos los campos.";
        errorBox.style.display = 'block';
        return;
    }

    try {
        // Autenticación con Firebase
        await auth.signInWithEmailAndPassword(email, pass);
        
        // Si el login es correcto
        errorBox.style.display = 'none';
        successBox.style.display = 'block';
        
        // REDIRECCIÓN (Asegúrate que el archivo se llame dashboard.html en GitHub)
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);

    } catch (error) {
        failedAttempts++;
        errorText.textContent = "Error: Usuario o contraseña incorrectos.";
        errorBox.style.display = 'block';
        console.error("Error de Firebase:", error.message);
        
        if (failedAttempts >= 3) {
            startBlock();
        }
    }
}

function startBlock() {
    isBlocked = true;
    let timeLeft = 45;
    const blockedBox = document.getElementById('blocked-msg');
    const blockedText = document.getElementById('blocked-text');
    
    blockedBox.style.display = 'block';
    const timer = setInterval(() => {
        blockedText.textContent = `Acceso bloqueado. Intente en ${timeLeft}s`;
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(timer);
            isBlocked = false;
            blockedBox.style.display = 'none';
            failedAttempts = 0;
        }
    }, 1000);
}

// --- ADMINISTRACIÓN ---
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
    } else { 
        alert("Credenciales de administrador incorrectas");
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
        showAlert("Usuario creado exitosamente");
        loadUsers();
    } catch (e) { 
        showAlert(e.message, "error"); 
    }
}

async function loadUsers() {
    const list = document.getElementById('user-list');
    if (!list) return;
    
    list.innerHTML = "Cargando usuarios...";
    try {
        const snap = await db.collection('users').get();
        list.innerHTML = "";
        snap.forEach(doc => {
            const u = doc.data();
            list.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #ddd">
                    <span style="font-size:14px;">${u.name} <br><small>${u.email}</small></span>
                    <button onclick="deleteUser('${u.email}')" style="width:auto; background:red; padding:5px 10px; font-size:12px;">Borrar</button>
                </div>`;
        });
    } catch (error) {
        list.innerHTML = "Error al cargar usuarios.";
    }
}

function switchAdminTab(tab) {
    document.getElementById('create-user-form').style.display = tab === 'create' ? 'block' : 'none';
    document.getElementById('delete-user-form').style.display = tab === 'delete' ? 'block' : 'none';
    document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
}

function hideAdminPanel() { 
    document.getElementById('admin-panel').style.display = 'none'; 
    document.getElementById('login-form').style.display = 'block'; 
}
