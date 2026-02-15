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

// Datos de tus estudiantes (Originales)
const students = [
    { id: 1, name: "ALEXANDER DE LA CRUZ", status: "En el aula" },
    { id: 2, name: "ALEXANDRA JEREZ", status: "En el aula" },
    // ... agrega aquí el resto de tu lista original
];

async function validarLogin() {
    const email = document.getElementById('usuario').value;
    const pass = document.getElementById('password').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, pass);
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        document.body.style.background = "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)";
        renderStudents();
    } catch (e) {
        alert("Error: " + e.message);
    }
}

function renderStudents() {
    const grid = $('#studentsGrid');
    grid.empty();
    
    students.forEach(s => {
        grid.append(`
            <div class="col-md-4 student-item" data-name="${s.name}">
                <div class="student-card">
                    <h5>${s.name}</h5>
                    <p class="status-text">${s.status}</p>
                    <div class="timer-badge mb-3">00:00:00</div>
                    <button class="btn btn-primary w-100" onclick="startPass(${s.id})">Registrar Pase</button>
                </div>
            </div>
        `);
    });
}

// Conserva tus funciones de theme y búsqueda
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

$('#studentSearch').on('input', function() {
    const term = $(this).val().toLowerCase();
    $('.student-item').each(function() {
        $(this).toggle($(this).data('name').toLowerCase().includes(term));
    });
});
