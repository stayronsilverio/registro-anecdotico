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
    const email = document.getElementById('usuario').value;
    
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

// Función de login con Firebase
async function validarLogin() {
    if (isBlocked) {
        updateBlockedMessage();
        return;
    }

    const email = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    const errorText = document.getElementById('error-text');
    const successMsg = document.getElementById('success-msg');

    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
    document.getElementById('blocked-msg').style.display = 'none';

    // Validaciones básicas
    if (!email || !password) {
        errorText.textContent = "Por favor, completa todos los campos";
        errorMsg.style.display = "block";
        return;
    }

    try {
        // Login con Firebase Auth
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        if (db) {
            try {
                const adminQuery = await db.collection('usuarios')
                    .where('correo', '==', user.email)
                    .limit(1)
                    .get();

                if (!adminQuery.empty) {
                    const adminData = adminQuery.docs[0].data() || {};

                    if (adminData.activo !== true) {
                        await firebase.auth().signOut();
                        errorText.textContent = 'Tu usuario administrador está inactivo.';
                        errorMsg.style.display = 'block';
                        return;
                    }
                }
            } catch (firestoreError) {
                console.warn('⚠️ No se pudo validar el estado del usuario en Firestore:', firestoreError);
            }
        } else {
            console.warn('⚠️ Firestore no está disponible en la pantalla de login.');
            showAlert('No se pudo validar el usuario en Firestore. Se continuará con Firebase Auth.', 'error');
        }

        // Login exitoso
        failedAttempts = 0;
        successMsg.style.display = "block";

        // Guardar información del usuario en localStorage para la app
        localStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            uid: user.uid,
            displayName: user.displayName || email.split('@')[0],
            loginTime: new Date().toISOString()
        }));

        setTimeout(function() {
            showAlert("Redirigiendo al sistema principal...", "success");
            window.location.href = "app.html";
        }, 1500);

    } catch (error) {
        failedAttempts++;
        
        let errorMessage = "Correo o contraseña incorrectos";
        
        // Manejar errores específicos de Firebase
        switch(error.code) {
            case 'auth/user-not-found':
                errorMessage = "Usuario no encontrado";
                break;
            case 'auth/wrong-password':
                errorMessage = "Contraseña incorrecta";
                break;
            case 'auth/invalid-email':
                errorMessage = "Correo electrónico inválido";
                break;
            case 'auth/user-disabled':
                errorMessage = "Usuario desactivado";
                break;
            case 'auth/too-many-requests':
                errorMessage = "Demasiados intentos. Intenta más tarde";
                break;
        }
        
        errorText.textContent = errorMessage;
        errorMsg.style.display = "block";

        if (failedAttempts >= 3) {
            blockAccess();
        }
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
