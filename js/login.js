// Variables globales
let failedAttempts = 0;
let isBlocked = false;
let blockUntil = 0;
const db = firebase.firestore ? firebase.firestore() : null;

// Mostrar alerta personalizada
function showAlert(message, type = "success") {
    const alert = document.getElementById("custom-alert");
    const alertMessage = document.getElementById("alert-message");
    
    alert.className = "custom-alert " + type;
    alertMessage.textContent = message;
    alert.classList.add("show");
    
    setTimeout(() => {
        alert.classList.remove("show");
    }, 3000);
}

// Cambiar entre tema claro y oscuro
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        document.getElementById('theme-switch').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem('theme', 'light');
        document.getElementById('theme-switch').innerHTML = '<i class="fas fa-moon"></i>';
    }
}

// Mostrar/ocultar contraseña
function togglePassword(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(toggleId).querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Función para recuperar contraseña
function forgotPassword() {
    const email = document.getElementById('usuario').value.trim().toLowerCase();
    
    if (!email) {
        showAlert('Por favor, ingresa tu correo electrónico primero', 'error');
        return;
    }
    
    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            showAlert('Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.', 'success');
        })
        .catch((error) => {
            showAlert('Error: ' + error.message, 'error');
        });
}

// Actualizar mensaje de bloqueo
function updateBlockedMessage() {
    if (!isBlocked) return;
    
    const now = Date.now();
    if (now >= blockUntil) {
        isBlocked = false;
        localStorage.removeItem('blockUntil');
        document.getElementById('blocked-msg').style.display = 'none';
        return;
    }
    
    const remainingSeconds = Math.ceil((blockUntil - now) / 1000);
    document.getElementById('blocked-text').textContent = `Demasiados intentos fallidos. Intenta nuevamente en ${remainingSeconds} segundos.`;
    document.getElementById('blocked-msg').style.display = 'block';
    
    setTimeout(updateBlockedMessage, 1000);
}

// Bloquear acceso temporalmente
function blockAccess() {
    isBlocked = true;
    blockUntil = Date.now() + 45000; // 45 segundos
    localStorage.setItem('blockUntil', blockUntil.toString());
    updateBlockedMessage();
}


function toDate(value) {
    if (!value) return null;
    if (typeof value.toDate === 'function') return value.toDate();
    if (value instanceof Date) return value;
    if (typeof value === 'number') {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === 'string') {
        const d = new Date(value);
        return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
}

function generateSessionId() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

async function validateUsersCollection(user) {
    if (!db) {
        throw new Error('No se pudo validar el usuario porque Firestore no está disponible.');
    }

    const usersQuery = await db.collection('users')
        .where('correo', '==', user.email)
        .limit(1)
        .get();

    if (usersQuery.empty) {
        return { found: false };
    }

    const userDoc = usersQuery.docs[0];
    const userData = userDoc.data() || {};

    const sessionExpiryRaw = userData.sessionIDExpiresAt || userData.sessionExpiresAt || userData.sessionExpires || userData.expiresAt || null;
    const sessionExpiry = toDate(sessionExpiryRaw);

    if (sessionExpiry && sessionExpiry <= new Date()) {
        throw new Error('Tu sessionID está expirado. Contacta al administrador.');
    }

    const currentDeviceSession = sessionStorage.getItem('sessionID') || localStorage.getItem('sessionID') || '';
    const storedSessionID = userData.sessionID || '';

    if (storedSessionID && currentDeviceSession && storedSessionID !== currentDeviceSession) {
        throw new Error('Ya existe una sesión activa en otra PC con este usuario.');
    }

    const newSessionID = currentDeviceSession || generateSessionId();
    await userDoc.ref.update({ sessionID: newSessionID, correo: user.email });
    sessionStorage.setItem('sessionID', newSessionID);
    localStorage.setItem('sessionID', newSessionID);

    return { found: true };
}

async function validateAdminsCollection(user) {
    if (!db) {
        throw new Error('No se pudo validar el usuario porque Firestore no está disponible.');
    }

    const adminQuery = await db.collection('usuarios')
        .where('correo', '==', user.email)
        .limit(1)
        .get();

    return { found: !adminQuery.empty };
}

// Función de login con Firebase
async function validarLogin() {
    if (isBlocked) {
        updateBlockedMessage();
        return;
    }

    const email = document.getElementById('usuario').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    const errorText = document.getElementById('error-text');
    const successMsg = document.getElementById('success-msg');

    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    document.getElementById('blocked-msg').style.display = 'none';

    if (!email || !password) {
        errorText.textContent = 'Por favor, completa todos los campos';
        errorMsg.style.display = 'block';
        return;
    }

    let user;

    try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        user = userCredential.user;
    } catch (authError) {
        failedAttempts++;

        let errorMessage = 'Correo o contraseña incorrectos';
        switch (authError.code) {
            case 'auth/user-not-found':
                errorMessage = 'Usuario no encontrado';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Contraseña incorrecta';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Correo electrónico inválido';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Usuario desactivado';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Demasiados intentos. Intenta más tarde';
                break;
        }

        errorText.textContent = errorMessage;
        errorMsg.style.display = 'block';

        if (failedAttempts >= 3) {
            blockAccess();
        }

        return;
    }

    try {
        const [userValidation, adminValidation] = await Promise.all([
            validateUsersCollection(user),
            validateAdminsCollection(user)
        ]);

        if (!userValidation.found && !adminValidation.found) {
            await firebase.auth().signOut();
            errorText.textContent = 'Tu correo no existe en users ni en usuarios.';
            errorMsg.style.display = 'block';
            return;
        }

        failedAttempts = 0;
        successMsg.style.display = 'block';

        localStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            uid: user.uid,
            displayName: user.displayName || email.split('@')[0],
            loginTime: new Date().toISOString()
        }));

        setTimeout(() => {
            showAlert('Redirigiendo al sistema principal...', 'success');
            window.location.href = 'app.html';
        }, 1500);
    } catch (validationError) {
        await firebase.auth().signOut();
        errorText.textContent = validationError.message || 'No se pudo validar el acceso en Firestore';
        errorMsg.style.display = 'block';
    }
}

// Verificar si hay sesión activa al cargar la página
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Usuario ya está logueado, redirigir a la app
        console.log("Usuario ya autenticado:", user.email);
    }
});

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Cargar preferencia de tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-switch').innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Verificar si hay bloqueo activo
    const blockTime = localStorage.getItem('blockUntil');
    if (blockTime && parseInt(blockTime) > Date.now()) {
        isBlocked = true;
        blockUntil = parseInt(blockTime);
        updateBlockedMessage();
    }
    
    // Configurar event listeners
    document.getElementById('theme-switch').addEventListener('click', toggleTheme);
    
    document.getElementById('password-toggle').addEventListener('click', function() {
        togglePassword('password', 'password-toggle');
    });
    
    // Permitir login con la tecla Enter
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            validarLogin();
        }
    });
});
