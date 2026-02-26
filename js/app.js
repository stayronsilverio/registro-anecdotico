// Variables globales
let students = [];
let events = [];
let interpretations = [];
let inasistenciaReports = [];
let acuerdos = [];
let startTime = null;
let endTime = null;
let classDurationInterval = null;
let capturedEvidence = [];
let stream = null;
let headerImage = null;
let footerImage = null;
let participationRecords = [];
let currentStudentIndex = 1;
let outsideStudents = [];
let studentFormVisible = false;
let outsideStudentsInterval = null;

function getCurrentUserId() {
    const authUser = firebase.auth().currentUser;
    if (authUser?.uid) return authUser.uid;

    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) return 'anonymous';

    try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.uid || 'anonymous';
    } catch (error) {
        return 'anonymous';
    }
}

function getStorageKey() {
    return `registroData_${getCurrentUserId()}`;
}

// Lista de emojis disponibles
const emojisList = [
    { emoji: '👍', type: 'positiva', tooltip: 'Positiva - Buen trabajo' },
    { emoji: '👎', type: 'negativa', tooltip: 'Negativa - Necesita mejorar' },
    { emoji: '👏', type: 'participación', tooltip: 'Participación - Buena participación' },
    { emoji: '😊', type: 'buena conducta', tooltip: 'Buena conducta - Comportamiento ejemplar' },
    { emoji: '😞', type: 'mala conducta', tooltip: 'Mala conducta - Comportamiento inadecuado' },
    { emoji: '❤️', type: 'ayuda a otros', tooltip: 'Ayuda a otros - Apoyo a compañeros' },
    { emoji: '💡', type: 'buena idea', tooltip: 'Buena idea - Contribución creativa' },
    { emoji: '⚠️', type: 'llamar la atención', tooltip: 'Llamar la atención - Requiere supervisión' },
    { emoji: '🚀', type: 'excelente trabajo', tooltip: 'Excelente trabajo - Desempeño sobresaliente' },
    { emoji: '🎯', type: 'objetivo cumplido', tooltip: 'Objetivo cumplido - Meta alcanzada' },
    { emoji: '🤔', type: 'necesita mejorar', tooltip: 'Necesita mejorar - Requiere refuerzo' },
    { emoji: '😴', type: 'falta de atención', tooltip: 'Falta de atención - Desinterés' },
    { emoji: '⭐', type: 'destacado', tooltip: 'Destacado - Rendimiento excepcional' },
    { emoji: '🙌', type: 'colaboración', tooltip: 'Colaboración - Trabajo en equipo' },
    { emoji: '🤝', type: 'acuerdo cumplido', tooltip: 'Acuerdo cumplido - Compromiso realizado' },
    { emoji: '📚', type: 'estudio', tooltip: 'Estudio - Dedicación al aprendizaje' },
    { emoji: '🎉', type: 'celebración', tooltip: 'Celebración - Logro destacado' },
    { emoji: '💪', type: 'esfuerzo', tooltip: 'Esfuerzo - Dedicación y perseverancia' },
    { emoji: '🧠', type: 'inteligencia', tooltip: 'Inteligencia - Habilidad cognitiva' },
    { emoji: '🌟', type: 'brillantez', tooltip: 'Brillantez - Desempeño excepcional' },
    { emoji: '🏆', type: 'triunfo', tooltip: 'Triunfo - Victoria o éxito' },
    { emoji: '🔍', type: 'investigación', tooltip: 'Investigación - Espíritu curioso' },
    { emoji: '💬', type: 'comunicación', tooltip: 'Comunicación - Habilidad para expresarse' },
    { emoji: '🤲', type: 'compartir', tooltip: 'Compartir - Generosidad con otros' },
    { emoji: '🌱', type: 'crecimiento', tooltip: 'Crecimiento - Desarrollo personal' },
    { emoji: '💫', type: 'inspiración', tooltip: 'Inspiración - Capacidad de motivar' },
    { emoji: '😁', type: 'alegría', tooltip: 'Alegría - Expresión de felicidad' },
    { emoji: '😢', type: 'tristeza', tooltip: 'Tristeza - Expresión de desánimo' },
    { emoji: '😡', type: 'enojo', tooltip: 'Enojo - Expresión de frustración' },
    { emoji: '😎', type: 'confianza', tooltip: 'Confianza - Seguridad en sí mismo' },
    { emoji: '😍', type: 'amor', tooltip: 'Amor - Afecto hacia el aprendizaje' },
    { emoji: '🤩', type: 'entusiasmo', tooltip: 'Entusiasmo - Gran motivación' },
    { emoji: '🥳', type: 'celebración', tooltip: 'Celebración - Logro importante' },
    { emoji: '🤯', type: 'asombro', tooltip: 'Asombro - Aprendizaje impactante' },
    { emoji: '🤗', type: 'apoyo', tooltip: 'Apoyo - Acompañamiento emocional' },
    { emoji: '🤫', type: 'silencio', tooltip: 'Silencio - Trabajo concentrado' },
    { emoji: '🤥', type: 'deshonestidad', tooltip: 'Deshonestidad - Falta de verdad' },
    { emoji: '😇', type: 'bondad', tooltip: 'Bondad - Comportamiento ejemplar' },
    { emoji: '🥺', type: 'súplica', tooltip: 'Súplica - Necesidad de ayuda' },
    { emoji: '🥱', type: 'cansancio', tooltip: 'Cansancio - Falta de energía' },
    { emoji: '😰', type: 'ansiedad', tooltip: 'Ansiedad - Nerviosismo' },
    { emoji: '😓', type: 'estrés', tooltip: 'Estrés - Presión académica' },
    { emoji: '🤑', type: 'interés', tooltip: 'Interés - Motivación por recompensa' },
    { emoji: '🤒', type: 'enfermedad', tooltip: 'Enfermedad - Malestar físico' },
    { emoji: '🤕', type: 'lesión', tooltip: 'Lesión - Daño físico' },
    { emoji: '🤢', type: 'náuseas', tooltip: 'Náuseas - Malestar estomacal' },
    { emoji: '🤮', type: 'vómito', tooltip: 'Vómito - Malestar intenso' },
    { emoji: '🤠', type: 'valentía', tooltip: 'Valentía - Coraje para participar' },
    { emoji: '🥴', type: 'confusión', tooltip: 'Confusión - Falta de comprensión' },
    { emoji: '😈', type: 'travesura', tooltip: 'Travesura - Comportamiento juguetón' },
    { emoji: '🎓', type: 'graduación', tooltip: 'Graduación - Logro académico' },
    { emoji: '📝', type: 'tarea', tooltip: 'Tarea - Entrega de trabajo' },
    { emoji: '📊', type: 'rendimiento', tooltip: 'Rendimiento - Desempeño académico' },
    { emoji: '💼', type: 'responsabilidad', tooltip: 'Responsabilidad - Cumplimiento de deberes' },
    { emoji: '🗣️', type: 'expresión oral', tooltip: 'Expresión oral - Participación verbal' },
    { emoji: '👀', type: 'atención', tooltip: 'Atención - Enfoque en clase' },
    { emoji: '✏️', type: 'ejercicio', tooltip: 'Ejercicio - Realización de actividades' },
    { emoji: '📖', type: 'lectura', tooltip: 'Lectura - Participación lectora' },
    { emoji: '🤷', type: 'indiferencia', tooltip: 'Indiferencia - Falta de interés' },
    { emoji: '🖐️', type: 'levantó la mano', tooltip: 'Levantó la mano - Deseo de participar' },
    { emoji: '🙋', type: 'participación activa', tooltip: 'Participación activa - Intervenciones frecuentes' },
    { emoji: '🗯️', type: 'opinión', tooltip: 'Opinión - Expresó su punto de vista' },
    { emoji: '📝', type: 'respuesta escrita', tooltip: 'Respuesta escrita - Aportó en la pizarra/cuaderno' },
    { emoji: '🎤', type: 'expuso', tooltip: 'Expuso - Presentación oral' },
    { emoji: '🤓', type: 'interés académico', tooltip: 'Interés académico - Preguntó o investigó' },
    { emoji: '📢', type: 'aportó idea', tooltip: 'Aportó idea - Compartió con la clase' },
    { emoji: '🧩', type: 'resolución de problema', tooltip: 'Resolución de problema - Ayudó a resolver' }
];

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            // No hay usuario autenticado, redirigir al login
            window.location.href = 'index.html';
            return;
        }
        console.log("Usuario autenticado:", user.email);
    });
    
    // Configurar botón de logout
    document.getElementById('logout-btn').addEventListener('click', function() {
        firebase.auth().signOut().then(() => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        }).catch((error) => {
            showNotification('Error al cerrar sesión', 'error');
        });
    });
    
    // Inicializar el tipo de reporte
    toggleReportType();
    
    // Configurar fechas
    const today = new Date();
    document.getElementById('lastAttendanceDate').valueAsDate = today;
    document.getElementById('acuerdoFechaCompromiso').valueAsDate = today;
    
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    document.getElementById('acuerdoFechaSeguimiento').valueAsDate = nextWeek;
    document.getElementById('acuerdoFechaEntrega').valueAsDate = nextWeek;
    
    // Iniciar intervalo para actualizar el tiempo de estudiantes fuera
    startOutsideStudentsInterval();
    
    // Cargar emojis
    loadEmojis();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Cargar datos guardados
    loadSavedData();
});

// Cargar emojis en los selectores
function loadEmojis() {
    const emojiSelector = document.getElementById('emojiSelector');
    const editEmojiSelector = document.getElementById('editEmojiSelector');
    
    const emojiHTML = emojisList.map(item => `
        <button class="emoji-btn" onclick="addParticipation('${item.emoji}', '${item.type}')" title="${item.tooltip}">
            ${item.emoji}
            <span class="emoji-tooltip">${item.tooltip}</span>
        </button>
    `).join('');
    
    const editEmojiHTML = emojisList.map(item => `
        <button class="emoji-btn" onclick="addEmojiToEdit('${item.emoji}', '${item.type}')" title="${item.tooltip}">
            ${item.emoji}
            <span class="emoji-tooltip">${item.tooltip}</span>
        </button>
    `).join('');
    
    if (emojiSelector) emojiSelector.innerHTML = emojiHTML;
    if (editEmojiSelector) editEmojiSelector.innerHTML = editEmojiHTML;
}

// Configurar event listeners
function setupEventListeners() {
    // Botón de agregar estudiante
    document.querySelector('.add-student-btn').addEventListener('click', function() {
        document.getElementById('addStudentModal').style.display = 'flex';
    });
}

// Cargar datos guardados en localStorage
function loadSavedData() {
    const storageKey = getStorageKey();
    let savedData = localStorage.getItem(storageKey);

    if (!savedData) {
        const legacyData = localStorage.getItem('registroData');
        if (legacyData) {
            savedData = legacyData;
            localStorage.setItem(storageKey, legacyData);
        }
    }

    if (savedData) {
        const data = JSON.parse(savedData);
        if (data.events) events = data.events;
        if (data.interpretations) interpretations = data.interpretations;
        if (data.participationRecords) participationRecords = data.participationRecords;
        if (data.inasistenciaReports) inasistenciaReports = data.inasistenciaReports;
        if (data.acuerdos) acuerdos = data.acuerdos;
        if (data.capturedEvidence) capturedEvidence = data.capturedEvidence;
        
        updateEventsList();
        updateInterpretationsList();
        updateParticipationList();
        updateAcuerdosList();
        updateEvidenceList();
    }
}

// Guardar datos en localStorage
function saveData() {
    const data = {
        events,
        interpretations,
        participationRecords,
        inasistenciaReports,
        acuerdos,
        capturedEvidence
    };
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
}

// Funciones de la interfaz
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach((tab, index) => {
        if (tab.getAttribute('onclick').includes(tabId)) {
            tab.classList.add('active');
        }
    });
    
    document.getElementById(tabId).classList.add('active');
}

function toggleReportType() {
    const reportType = document.querySelector('input[name="reportType"]:checked').value;
    
    document.getElementById('individualReportSection').style.display = 'none';
    document.getElementById('multipleReportSection').style.display = 'none';
    
    if (reportType === 'individual') {
        document.getElementById('individualReportSection').style.display = 'block';
    } else if (reportType === 'multiple') {
        document.getElementById('multipleReportSection').style.display = 'block';
    }
}

function toggleOtherSubject() {
    const subjectSelect = document.getElementById('subject');
    const otherSubjectInput = document.getElementById('otherSubject');
    
    if (subjectSelect.value === 'Otra') {
        otherSubjectInput.classList.remove('hidden');
    } else {
        otherSubjectInput.classList.add('hidden');
    }
}

function toggleAcuerdoOtro() {
    const select = document.getElementById('acuerdoTituloSelect');
    const otroInput = document.getElementById('acuerdoTituloOtro');
    
    if (select.value === 'Otro') {
        otroInput.classList.remove('hidden');
    } else {
        otroInput.classList.add('hidden');
    }
}

function toggleCompromisoOtro() {
    const select = document.getElementById('compromisosSelect');
    const otroInput = document.getElementById('compromisoOtro');
    const textarea = document.getElementById('acuerdoCompromisos');
    
    if (select.value === 'Otro') {
        otroInput.classList.remove('hidden');
        textarea.classList.add('hidden');
    } else if (select.value) {
        otroInput.classList.add('hidden');
        textarea.classList.remove('hidden');
        textarea.value = select.value;
    } else {
        otroInput.classList.add('hidden');
        textarea.classList.add('hidden');
    }
}

function showInasistenciaReportForm() {
    document.getElementById("inasistenciaReportForm").style.display = "block";
    document.getElementById("acuerdosForm").classList.add("hidden");
}

function toggleAcuerdosForm() {
    const acuerdosForm = document.getElementById("acuerdosForm");
    if (acuerdosForm.classList.contains("hidden")) {
        acuerdosForm.classList.remove("hidden");
        document.getElementById("inasistenciaReportForm").style.display = "none";
        updateAcuerdosList();
    } else {
        acuerdosForm.classList.add("hidden");
    }
}

function fillDefaultData() {
    document.getElementById('schoolName').value = "Politécnico Santo Esteban Rivera";
    document.getElementById('teacherName').value = "Miguel Silverio";
    document.getElementById('subject').value = "Inglés";
    showNotification("Datos autocompletados correctamente", "success");
}


function startNewClass() {
    const confirmed = confirm('¿Deseas iniciar una nueva clase? Se limpiarán los registros actuales de esta cuenta.');
    if (!confirmed) return;

    if (classDurationInterval) {
        clearInterval(classDurationInterval);
        classDurationInterval = null;
    }

    students.forEach(student => {
        if (student?.timerInterval) clearInterval(student.timerInterval);
    });

    startTime = null;
    endTime = null;
    currentStudentIndex = 1;
    outsideStudents = [];
    events = [];
    interpretations = [];
    participationRecords = [];
    inasistenciaReports = [];
    acuerdos = [];
    capturedEvidence = [];
    students = [];

    headerImage = null;
    footerImage = null;

    const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.value = value;
    };

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    setText('startTime', 'No iniciado');
    setText('endTime', 'No finalizado');
    setText('classDuration', '--:--');

    setValue('manualStartTime', '');
    setValue('manualEndTime', '');
    setValue('classEvents', '');
    setValue('interpretation', '');
    setValue('participationComment', '');
    setValue('studentNameInput', '');
    setValue('multipleStudents', '');
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    setValue('lastAttendanceDate', formatDateForInput(today));
    setValue('studentNameInasistencia', '');
    setValue('motivoInasistencia', '');
    setValue('otherMotive', '');
    setValue('accionesRealizadas', '');
    setValue('acuerdoDescripcion', '');
    setValue('acuerdoParticipantes', '');
    setValue('acuerdoCompromisos', '');
    setValue('acuerdoTituloOtro', '');
    setValue('compromisoOtro', '');
    setValue('acuerdoTituloSelect', '');
    setValue('compromisosSelect', '');
    setValue('evidenceObservation', '');
    setValue('acuerdoFechaCompromiso', formatDateForInput(today));
    setValue('acuerdoFechaSeguimiento', formatDateForInput(nextWeek));
    setValue('acuerdoFechaEntrega', formatDateForInput(nextWeek));

    const studentInputs = document.getElementById('studentInputs');
    if (studentInputs) {
        studentInputs.innerHTML = '';
        studentInputs.classList.add('hidden');
    }

    const outsideIndicator = document.getElementById('studentOutsideIndicator');
    if (outsideIndicator) outsideIndicator.style.display = 'none';

    const outsideList = document.getElementById('outsideStudentsList');
    if (outsideList) outsideList.innerHTML = '';

    const headerPreview = document.getElementById('headerImagePreview');
    if (headerPreview) {
        headerPreview.style.display = 'none';
        headerPreview.src = '';
    }

    const footerPreview = document.getElementById('footerImagePreview');
    if (footerPreview) {
        footerPreview.style.display = 'none';
        footerPreview.src = '';
    }

    const reportTypeIndividual = document.querySelector('input[name="reportType"][value="individual"]');
    if (reportTypeIndividual) reportTypeIndividual.checked = true;
    toggleReportType();

    updateEventsList();
    updateInterpretationsList();
    updateParticipationList();
    updateAcuerdosList();
    updateEvidenceList();
    updateOutsideStudentsList();

    saveData();
    showNotification('Nueva clase iniciada. Registros reiniciados para esta cuenta.', 'success');
}


function updateManualTime(type) {
    if (type === 'start') {
        const manual = document.getElementById('manualStartTime').value;
        if (manual) {
            document.getElementById('startTime').textContent = manual;
        }
    } else if (type === 'end') {
        const manual = document.getElementById('manualEndTime').value;
        if (manual) {
            document.getElementById('endTime').textContent = manual;
        }
    }
}

function navigateToStudentSection() {
    switchTab('class-register');
    document.getElementById('studentManagementSection').scrollIntoView({
        behavior: 'smooth'
    });
}

function addStudentForm() {
    navigateToStudentSection();
}

function closeStudentModal() {
    document.getElementById('addStudentModal').style.display = 'none';
    document.getElementById('modalStudentName').value = '';
    document.getElementById('modalReason').value = '';
}

function confirmStudentExit() {
    const studentName = document.getElementById('modalStudentName').value.trim();
    const reason = document.getElementById('modalReason').value.trim();
    
    if (!studentName || !reason) {
        showNotification('Por favor, complete todos los campos', 'error');
        return;
    }
    
    addStudentFormFields();
    const newIndex = currentStudentIndex - 1;
    
    setTimeout(function() {
        const nameInput = document.getElementById(`studentNameInput${newIndex}`);
        const reasonInput = document.getElementById(`reason${newIndex}`);
        if (nameInput) nameInput.value = studentName;
        if (reasonInput) reasonInput.value = reason;
        
        startStudentTimer(newIndex);
        updateOutsideStudentsList();
        
        const el = document.getElementById(`student${newIndex}`);
        if (el) el.scrollIntoView({behavior: 'smooth', block: 'center'});
    }, 50);
    
    closeStudentModal();
}

// Control de tiempo de clase
function startClass() {
    startTime = new Date();
    document.getElementById("startTime").textContent = formatDateTime(startTime);
    
    if (classDurationInterval) clearInterval(classDurationInterval);
    classDurationInterval = setInterval(updateClassDuration, 1000);
    
    showNotification("Clase iniciada", "success");
}

function endClass() {
    endTime = new Date();
    document.getElementById("endTime").textContent = formatDateTime(endTime);
    
    if (classDurationInterval) clearInterval(classDurationInterval);
    updateClassDuration();
    
    showNotification("Clase finalizada", "success");
}

function updateClassDuration() {
    if (!startTime) return;
    
    const now = endTime || new Date();
    const duration = Math.floor((now - startTime) / 1000);
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    document.getElementById("classDuration").textContent = 
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Gestión de estudiantes
function addStudentFormFields() {
    const studentCount = currentStudentIndex;
    const studentForm = `
        <div id="student${studentCount}" class="student-box">
            <h3>Estudiante ${studentCount}</h3>
            <div class="grid-2">
                <div class="form-group">
                    <label>Nombre:</label>
                    <input type="text" id="studentNameInput${studentCount}" placeholder="Nombre del estudiante">
                </div>
                <div class="form-group">
                    <label>Razón:</label>
                    <input type="text" id="reason${studentCount}" placeholder="Razón de salida">
                </div>
            </div>
            <button class="btn btn-sm btn-warning" onclick="startStudentTimer(${studentCount})"><i class="fas fa-sign-out-alt"></i> Registrar Salida</button>
            <button class="btn btn-sm btn-success" onclick="stopStudentTimer(${studentCount})"><i class="fas fa-sign-in-alt"></i> Registrar Retorno</button>
            <div class="timer-display" id="timer${studentCount}">00:00</div>
            <p id="exitTime${studentCount}"></p>
            <p id="returnTime${studentCount}"></p>
            <p id="totalTime${studentCount}"></p>
        </div>
    `;
    document.getElementById("studentInputs").insertAdjacentHTML('beforeend', studentForm);
    students.push({ 
        name: "", 
        reason: "", 
        startTime: null, 
        returnTime: null, 
        duration: 0, 
        comment: "",
        timerInterval: null,
        timerElement: `timer${studentCount}`
    });
    
    currentStudentIndex++;
}

function startStudentTimer(studentIndex) {
    const student = students[studentIndex - 1];
    student.name = document.getElementById(`studentNameInput${studentIndex}`).value;
    student.reason = document.getElementById(`reason${studentIndex}`).value;
    
    if (!student.name || !student.reason) {
        showNotification("Completa los campos antes de registrar la salida", "error");
        return;
    }
    
    student.startTime = new Date();
    document.getElementById(`exitTime${studentIndex}`).textContent = `Hora de salida: ${formatDateTime(student.startTime)}`;
    
    document.getElementById(`student${studentIndex}`).style.borderLeftColor = "#e74c3c";
    
    student.timerInterval = setInterval(() => {
        const elapsed = new Date() - student.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        document.getElementById(`timer${studentIndex}`).innerText = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
    
    outsideStudents.push({
        id: studentIndex,
        name: student.name,
        reason: student.reason,
        startTime: student.startTime,
        timerInterval: student.timerInterval
    });
    
    updateOutsideStudentsList();
    showNotification(`Salida registrada para ${student.name}`, "success");
}

function stopStudentTimer(studentIndex) {
    const student = students[studentIndex - 1];
    
    if (!student.startTime) {
        showNotification("Primero debe registrar la salida del estudiante", "error");
        return;
    }
    
    student.returnTime = new Date();
    clearInterval(student.timerInterval);
    
    const duration = Math.floor((student.returnTime - student.startTime) / 60000);
    student.duration = duration;
    
    document.getElementById(`returnTime${studentIndex}`).textContent = `Hora de retorno: ${formatDateTime(student.returnTime)}`;
    document.getElementById(`totalTime${studentIndex}`).textContent = `Tiempo fuera: ${duration} minutos`;
    
    if (duration <= 2) {
        student.comment = "Regresó en un tiempo prudente.";
    } else if (duration <= 3) {
        student.comment = "Regresó con una ligera demora.";
    } else {
        student.comment = "Regresó con una tardanza considerable.";
    }
    
    document.getElementById(`student${studentIndex}`).style.borderLeftColor = "#3498db";
    document.getElementById(`student${studentIndex}`).style.display = "none";
    
    document.getElementById(`studentNameInput${studentIndex}`).value = "";
    document.getElementById(`reason${studentIndex}`).value = "";
    document.getElementById(`timer${studentIndex}`).innerText = "00:00";
    
    outsideStudents = outsideStudents.filter(s => s.id !== studentIndex);
    updateOutsideStudentsList();
    
    showNotification(`Retorno registrado para ${student.name}`, "success");
}

function startOutsideStudentsInterval() {
    if (outsideStudentsInterval) clearInterval(outsideStudentsInterval);
    
    outsideStudentsInterval = setInterval(() => {
        updateOutsideStudentsList();
    }, 1000);
}

function updateOutsideStudentsList() {
    const outsideList = document.getElementById("outsideStudentsList");
    const indicator = document.getElementById("studentOutsideIndicator");
    if (!outsideList || !indicator) return;
    
    if (outsideStudents.length === 0) {
        indicator.style.display = "none";
        return;
    }
    
    indicator.style.display = "block";
    
    const existing = {};
    Array.from(outsideList.children).forEach(child => {
        const id = child.getAttribute('data-student-id');
        if (id) existing[id] = child;
    });
    
    const currentIds = outsideStudents.map(s => String(s.id));
    
    outsideStudents.forEach(student => {
        const sid = String(student.id);
        const now = new Date();
        const elapsed = Math.floor((now - student.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeText = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
        
        if (existing[sid]) {
            const el = existing[sid];
            const timeEl = el.querySelector('.student-time');
            const nameEl = el.querySelector('.student-name');
            const reasonEl = el.querySelector('.student-reason');
            if (timeEl) timeEl.textContent = timeText;
            if (nameEl) nameEl.textContent = student.name;
            if (reasonEl) reasonEl.textContent = student.reason;
            delete existing[sid];
        } else {
            const studentElement = document.createElement("div");
            studentElement.className = "outside-student";
            studentElement.setAttribute('data-student-id', sid);
            studentElement.innerHTML = `
                <div class="student-info" style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span class="blinking-light red-light"></span>
                        <span class="student-name"><strong>${student.name}</strong></span>
                    </div>
                    <span class="student-time">${timeText}</span>
                </div>
                <div class="student-reason">${student.reason}</div>
                <button class="btn btn-sm btn-success" onclick="stopStudentTimer(${student.id})" style="margin-top: 8px;">
                    <i class="fas fa-sign-in-alt"></i> Registrar Retorno
                </button>
            `;
            outsideList.appendChild(studentElement);
        }
    });
    
    Object.keys(existing).forEach(id => {
        const node = existing[id];
        if (node && node.parentNode) node.parentNode.removeChild(node);
    });
}

// Eventos
function addEvent() {
    const eventText = document.getElementById("classEvents").value;
    if (!eventText.trim()) {
        showNotification("Escribe un evento antes de agregarlo", "error");
        return;
    }
    
    const event = {
        text: eventText,
        time: new Date(),
        formattedTime: formatDateTime(new Date())
    };
    
    events.push(event);
    updateEventsList();
    document.getElementById("classEvents").value = "";
    saveData();
    
    showNotification("Evento agregado correctamente", "success");
}

function updateEventsList() {
    const eventsList = document.getElementById("eventsList");
    if (!eventsList) return;
    eventsList.innerHTML = "";
    
    events.forEach((event, index) => {
        const li = document.createElement("li");
        li.className = "event-item";
        li.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                <div>
                    <strong>Evento ${index + 1}:</strong> ${formatMultilineText(event.text)}
                    <div class="event-time">${event.formattedTime}</div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-sm btn-primary" onclick="editEvent(${index})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvent(${index})"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            </div>
        `;
        eventsList.appendChild(li);
    });
}

function editEvent(index) {
    const current = events[index];
    if (!current) return;
    const nuevo = prompt('Editar evento:', current.text);
    if (nuevo === null) return;
    events[index].text = nuevo.trim();
    updateEventsList();
    saveData();
    showNotification('Evento editado', 'success');
}

function deleteEvent(index) {
    if (!confirm('¿Eliminar este evento?')) return;
    events.splice(index, 1);
    updateEventsList();
    saveData();
    showNotification('Evento eliminado', 'info');
}

// Interpretaciones
function addInterpretation() {
    const interpretationText = document.getElementById("interpretation").value;
    if (!interpretationText.trim()) {
        showNotification("Escribe una interpretación antes de agregarla", "error");
        return;
    }
    
    const interpretation = {
        text: interpretationText,
        time: new Date(),
        formattedTime: formatDateTime(new Date())
    };
    
    interpretations.push(interpretation);
    updateInterpretationsList();
    document.getElementById("interpretation").value = "";
    saveData();
    
    showNotification("Interpretación agregada correctamente", "success");
}

function updateInterpretationsList() {
    const interpretationsList = document.getElementById("interpretationsList");
    if (!interpretationsList) return;
    interpretationsList.innerHTML = "";
    
    interpretations.forEach((interpretation, index) => {
        const li = document.createElement("li");
        li.className = "interpretation-item";
        li.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                <div>
                    <strong>Interpretación ${index + 1}:</strong> ${formatMultilineText(interpretation.text)}
                    <div class="interpretation-time">${interpretation.formattedTime}</div>
                </div>
                <div style="display:flex; gap:6px;">
                    <button class="btn btn-sm btn-primary" onclick="editInterpretation(${index})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteInterpretation(${index})"><i class="fas fa-trash"></i> Eliminar</button>
                </div>
            </div>
        `;
        interpretationsList.appendChild(li);
    });
}

function editInterpretation(index) {
    const current = interpretations[index];
    if (!current) return;
    const nuevo = prompt('Editar interpretación:', current.text);
    if (nuevo === null) return;
    interpretations[index].text = nuevo.trim();
    updateInterpretationsList();
    saveData();
    showNotification('Interpretación editada', 'success');
}

function deleteInterpretation(index) {
    if (!confirm('¿Eliminar esta interpretación?')) return;
    interpretations.splice(index, 1);
    updateInterpretationsList();
    saveData();
    showNotification('Interpretación eliminada', 'info');
}

// Reportes de inasistencia
function addInasistenciaReport() {
    const studentName = document.getElementById("studentNameInasistencia").value;
    const lastAttendanceDate = document.getElementById("lastAttendanceDate").value;
    const motivo = document.getElementById("motivoInasistencia").value;
    const acciones = document.getElementById("accionesRealizadas").value;
    
    if (!studentName || !lastAttendanceDate || !motivo || !acciones) {
        showNotification("Completa todos los campos antes de agregar el reporte", "error");
        return;
    }
    
    const report = {
        studentName,
        lastAttendanceDate,
        motivo,
        acciones,
        reportDate: formatDate(new Date()),
        teacherName: document.getElementById("teacherName").value || "No especificado",
        grade: document.getElementById("grade").value,
        subject: document.getElementById("subject").value
    };
    
    inasistenciaReports.push(report);
    saveData();
    
    document.getElementById("studentNameInasistencia").value = "";
    document.getElementById("lastAttendanceDate").value = "";
    document.getElementById("motivoInasistencia").value = "";
    document.getElementById("accionesRealizadas").value = "";
    document.getElementById("inasistenciaReportForm").style.display = "none";
    
    showNotification("Reporte de inasistencia agregado correctamente", "success");
}

// Acuerdos
function addAcuerdo() {
    let titulo = document.getElementById("acuerdoTituloSelect").value;
    if (titulo === "Otro") {
        titulo = document.getElementById("acuerdoTituloOtro").value;
    }
    
    const descripcion = document.getElementById("acuerdoDescripcion").value;
    
    let compromisos = document.getElementById("acuerdoCompromisos").value;
    if (document.getElementById("compromisoOtro").value) {
        compromisos = document.getElementById("compromisoOtro").value;
    }
    
    const participantes = document.getElementById("acuerdoParticipantes").value;
    const fechaCompromiso = document.getElementById("acuerdoFechaCompromiso").value;
    const fechaSeguimiento = document.getElementById("acuerdoFechaSeguimiento").value;
    const fechaEntrega = document.getElementById("acuerdoFechaEntrega").value;
    
    if (!titulo || !descripcion) {
        showNotification("Completa al menos el título y la descripción del acuerdo", "error");
        return;
    }
    
    const teacherName = document.getElementById("teacherName").value || "No especificado";
    const grade = document.getElementById("grade").value;
    const subjectSelect = document.getElementById("subject");
    const subject = subjectSelect.value === "Otra" ? document.getElementById("otherSubject").value : subjectSelect.value;
    const schoolName = document.getElementById("schoolName").value;
    
    const acuerdo = {
        titulo,
        descripcion,
        compromisos,
        participantes,
        fechaCompromiso: formatDate(new Date(fechaCompromiso)),
        fechaSeguimiento: formatDate(new Date(fechaSeguimiento)),
        fechaEntrega: formatDate(new Date(fechaEntrega)),
        fechaCreacion: formatDate(new Date()),
        teacherName,
        grade,
        subject,
        schoolName
    };
    
    acuerdos.push(acuerdo);
    saveData();
    
    document.getElementById("acuerdoTituloSelect").value = "";
    document.getElementById("acuerdoTituloOtro").value = "";
    document.getElementById("acuerdoTituloOtro").classList.add("hidden");
    document.getElementById("acuerdoDescripcion").value = "";
    document.getElementById("compromisosSelect").value = "";
    document.getElementById("compromisoOtro").value = "";
    document.getElementById("compromisoOtro").classList.add("hidden");
    document.getElementById("acuerdoCompromisos").value = "";
    document.getElementById("acuerdoCompromisos").classList.add("hidden");
    document.getElementById("acuerdoParticipantes").value = "";
    
    document.getElementById("acuerdosForm").classList.add("hidden");
    
    updateAcuerdosList();
    
    showNotification("Acuerdo escolar agregado correctamente", "success");
}

function updateAcuerdosList() {
    const acuerdosList = document.getElementById("acuerdosList");
    acuerdosList.innerHTML = "";
    
    if (acuerdos.length === 0) {
        acuerdosList.innerHTML = "<p>No hay acuerdos registrados aún.</p>";
        return;
    }
    
    acuerdos.forEach((acuerdo, index) => {
        const acuerdoItem = document.createElement("div");
        acuerdoItem.className = "acuerdo-item";
        
        acuerdoItem.innerHTML = `
            <h4>${acuerdo.titulo}</h4>
            <p><strong>Fecha de creación:</strong> ${acuerdo.fechaCreacion}</p>
            <p><strong>Descripción:</strong> ${formatMultilineText(acuerdo.descripcion)}</p>
            ${acuerdo.compromisos ? `<p><strong>Compromisos:</strong><br>${formatMultilineText(acuerdo.compromisos)}</p>` : ''}
            ${acuerdo.participantes ? `<p><strong>Participantes:</strong> ${formatMultilineText(acuerdo.participantes)}</p>` : ''}
            <p><strong>Fecha de compromiso:</strong> ${acuerdo.fechaCompromiso}</p>
            <p><strong>Fecha de seguimiento:</strong> ${acuerdo.fechaSeguimiento}</p>
            <p><strong>Fecha de entrega:</strong> ${acuerdo.fechaEntrega}</p>
            <button class="btn btn-sm btn-danger" onclick="deleteAcuerdo(${index})"><i class="fas fa-trash"></i> Eliminar</button>
        `;
        
        acuerdosList.appendChild(acuerdoItem);
    });
}

function deleteAcuerdo(index) {
    acuerdos.splice(index, 1);
    updateAcuerdosList();
    saveData();
    showNotification("Acuerdo eliminado", "info");
}

// Sistema de participación
function addParticipation(emoji, type) {
    const commentTextarea = document.getElementById("participationComment");
    commentTextarea.value += ` ${emoji} (${type})`;
}

function addEmojiToEdit(emoji, type) {
    const commentTextarea = document.getElementById('editComment');
    commentTextarea.value += ` ${emoji} (${type})`;
}

function registerParticipation() {
    const reportType = document.querySelector('input[name="reportType"]:checked').value;
    const comment = document.getElementById("participationComment").value;
    
    let studentsList = [];
    
    if (reportType === "individual") {
        const studentName = document.getElementById("studentNameInput").value;
        
        if (!studentName.trim()) {
            showNotification("Escribe el nombre del estudiante para el reporte individual", "error");
            return;
        }
        
        studentsList = [studentName];
    } else if (reportType === "multiple") {
        const multipleStudentsText = document.getElementById("multipleStudents").value;
        
        if (!multipleStudentsText.trim()) {
            showNotification("Escribe los nombres de los estudiantes para el reporte múltiple", "error");
            return;
        }
        
        studentsList = multipleStudentsText.split('\n')
            .map(name => name.trim())
            .filter(name => name !== "");
    } else if (reportType === "general") {
        studentsList = ["Todo el curso"];
    }
    
    studentsList.forEach(studentName => {
        const participation = {
            studentName,
            comment,
            time: new Date(),
            formattedTime: formatDateTime(new Date())
        };
        
        participationRecords.push(participation);
    });
    
    updateParticipationList();
    saveData();
    
    document.getElementById("participationComment").value = "";
    document.getElementById("studentNameInput").value = "";
    document.getElementById("multipleStudents").value = "";
    
    showNotification("Participación/conducta registrada correctamente", "success");
}

function updateParticipationList() {
    const participationList = document.getElementById("participationList");
    participationList.innerHTML = "";
    
    if (participationRecords.length === 0) {
        participationList.innerHTML = "<tr><td colspan='6'>No hay registros de participación/conducta aún.</td></tr>";
        return;
    }
    
    participationRecords.forEach((record, index) => {
        const row = document.createElement("tr");
        
        const emojiMatch = record.comment.match(/([\u{1F300}-\u{1F9FF}])/gu);
        const emoji = emojiMatch ? emojiMatch[0] : "📝";
        
        const typeMatch = record.comment.match(/\(([^)]+)\)/);
        const type = typeMatch ? typeMatch[1] : "comentario";
        
        let badgeClass = "badge-neutral";
        const positiveTypes = ["positiva", "buena", "participación", "ayuda", "excelente", "objetivo", "destacado", "colaboración", "acuerdo", "estudio", "celebración", "esfuerzo", "inteligencia", "brillantez", "triunfo", "investigación", "comunicación", "compartir", "crecimiento", "inspiración"];
        const negativeTypes = ["negativa", "mala", "atención", "mejorar", "falta"];
        
        if (positiveTypes.some(t => type.includes(t))) {
            badgeClass = "badge-positive";
        } else if (negativeTypes.some(t => type.includes(t))) {
            badgeClass = "badge-negative";
        }
        
        row.innerHTML = `
            <td>${record.studentName}</td>
            <td><span class="participation-badge ${badgeClass}">${type}</span></td>
            <td>${emoji}</td>
            <td>${formatMultilineText(record.comment)}</td>
            <td>${record.formattedTime}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editParticipation(${index})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteParticipation(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        participationList.appendChild(row);
    });
}

function editParticipation(index) {
    const record = participationRecords[index];
    
    document.getElementById('editStudentName').value = record.studentName;
    document.getElementById('editComment').value = record.comment;
    document.getElementById('editIndex').value = index;
    
    document.getElementById('editParticipationModal').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editParticipationModal').style.display = 'none';
}

function saveEditedParticipation() {
    const index = document.getElementById('editIndex').value;
    if (index === "") return;
    
    const studentName = document.getElementById('editStudentName').value;
    const comment = document.getElementById('editComment').value;
    
    if (!studentName) {
        showNotification("El nombre del estudiante es obligatorio", "error");
        return;
    }
    
    participationRecords[index].studentName = studentName;
    participationRecords[index].comment = comment;
    
    updateParticipationList();
    saveData();
    closeEditModal();
    showNotification("Registro actualizado correctamente", "success");
}

function deleteParticipation(index) {
    participationRecords.splice(index, 1);
    updateParticipationList();
    saveData();
    showNotification("Registro de participación eliminado", "info");
}

// Imágenes de encabezado y pie de página
function handleHeaderImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            headerImage = e.target.result;
            const preview = document.getElementById('headerImagePreview');
            preview.src = headerImage;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

function handleFooterImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            footerImage = e.target.result;
            const preview = document.getElementById('footerImagePreview');
            preview.src = footerImage;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Cámara y evidencias
function openCamera() {
    const modal = document.getElementById("cameraModal");
    modal.style.display = "flex";
    
    const video = document.getElementById("video");
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(mediaStream) {
                video.srcObject = mediaStream;
                stream = mediaStream;
            })
            .catch(function(error) {
                console.error("Error al acceder a la cámara: ", error);
                showNotification("Error al acceder a la cámara", "error");
            });
    } else {
        showNotification("Tu navegador no soporta acceso a la cámara", "error");
    }
}

function closeCamera() {
    const modal = document.getElementById("cameraModal");
    modal.style.display = "none";
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    document.getElementById("photoPreview").style.display = "none";
    document.getElementById("captureActions").style.display = "none";
    document.getElementById("video").style.display = "block";
}

function capturePhoto() {
    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext('2d');
    const photoPreview = document.getElementById("photoPreview");
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    photoPreview.src = canvas.toDataURL('image/png');
    photoPreview.style.display = "block";
    
    video.style.display = "none";
    document.getElementById("captureActions").style.display = "block";
}

function retakePhoto() {
    const video = document.getElementById("video");
    const photoPreview = document.getElementById("photoPreview");
    
    video.style.display = "block";
    photoPreview.style.display = "none";
    document.getElementById("captureActions").style.display = "none";
}

function savePhoto() {
    const canvas = document.getElementById("canvas");
    const imageData = canvas.toDataURL('image/png');
    const observation = document.getElementById("evidenceObservation").value;
    
    capturedEvidence.push({
        type: "image",
        data: imageData,
        timestamp: new Date(),
        formattedTime: formatDateTime(new Date()),
        filename: "foto_evidencia.png",
        observation: observation
    });
    
    updateEvidenceList();
    saveData();
    
    document.getElementById("evidenceObservation").value = "";
    closeCamera();
    
    showNotification("Evidencia capturada correctamente", "success");
}

async function handleFileUpload(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
        return;
    }

    const fileToDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error(`No se pudo leer el archivo: ${file.name}`));
            reader.readAsDataURL(file);
        });
    };

    try {
        const now = new Date();
        const loadedFiles = await Promise.all(files.map((file) => fileToDataURL(file)));

        loadedFiles.forEach((fileData, index) => {
            const file = files[index];
            capturedEvidence.push({
                type: file.type.includes('image') ? "image" : "document",
                data: fileData,
                timestamp: now,
                formattedTime: formatDateTime(now),
                filename: file.name,
                observation: ""
            });
        });

        updateEvidenceList();
        saveData();
        showNotification(`${files.length} archivo(s) subido(s) correctamente`, "success");
    } catch (error) {
        showNotification(error.message || "Ocurrió un error al subir archivos", "error");
    } finally {
        event.target.value = "";
    }
}

function updateEvidenceList() {
    const evidenceList = document.getElementById("evidenceList");
    evidenceList.innerHTML = "";
    
    if (capturedEvidence.length === 0) {
        evidenceList.innerHTML = "<p>No hay evidencias capturadas aún.</p>";
        return;
    }
    
    capturedEvidence.forEach((evidence, index) => {
        const evidenceItem = document.createElement("div");
        evidenceItem.className = "evidence-item";
        
        if (evidence.type === "image") {
            evidenceItem.innerHTML = `
                <p><strong>Foto de evidencia</strong> - ${evidence.formattedTime}</p>
                <img src="${evidence.data}" class="evidence-image" alt="Evidencia ${index + 1}">
            `;
        } else if (evidence.type === "document") {
            evidenceItem.innerHTML = `
                <p><strong>Documento:</strong> ${evidence.filename} - ${evidence.formattedTime}</p>
                <a href="${evidence.data}" download="${evidence.filename}" class="btn btn-sm btn-primary">
                    <i class="fas fa-download"></i> Descargar documento
                </a>
            `;
        }
        
        evidenceItem.innerHTML += `
            <div class="form-group evidence-observation">
                <label>Agregar/Editar observaciones:</label>
                <textarea id="evidenceObservation${index}" placeholder="Agregar observaciones sobre esta evidencia...">${evidence.observation || ''}</textarea>
                <button class="btn btn-sm btn-primary" onclick="updateEvidenceObservation(${index})">
                    <i class="fas fa-save"></i> Guardar observación
                </button>
            </div>
            ${evidence.observation ? `<p class="evidence-observation-text"><strong>Observaciones:</strong> ${evidence.observation}</p>` : ''}
            <button class="btn btn-sm btn-danger" onclick="deleteEvidence(${index})"><i class="fas fa-trash"></i> Eliminar</button>
            <hr>
        `;
        
        evidenceList.appendChild(evidenceItem);
    });
}

function updateEvidenceObservation(index) {
    const observation = document.getElementById(`evidenceObservation${index}`).value;
    capturedEvidence[index].observation = observation;
    saveData();
    showNotification("Observación guardada correctamente", "success");
}

function deleteEvidence(index) {
    capturedEvidence.splice(index, 1);
    updateEvidenceList();
    saveData();
    showNotification("Evidencia eliminada", "info");
}

// Generación de reportes
function generateReport() {
    const teacherName = document.getElementById("teacherName").value || "No especificado";
    const grade = document.getElementById("grade").value;
    const subjectSelect = document.getElementById("subject");
    const subject = subjectSelect.value === "Otra" ? document.getElementById("otherSubject").value : subjectSelect.value;
    const schoolName = document.getElementById("schoolName").value;
    const date = formatDate(new Date());
    
    let content = '';
    
    if (headerImage) {
        content += `<div style="text-align: center; margin-bottom: 20px;">
            <img src="${headerImage}" style="max-width: 100%;">
        </div>`;
    }
    
    content += `
        <div class="report-header">
            <h2>REGISTRO ANECDÓTICO DE ${grade || 'CLASE'}</h2>
            <p><strong>Centro Educativo:</strong> ${schoolName || 'No especificado'}</p>
            <p><strong>Fecha:</strong> ${date}</p>
        </div>
        
        <div class="report-section">
            <h3>Información General</h3>
            <p><strong>Profesor:</strong> ${teacherName}</p>
            <p><strong>Grado/Sección:</strong> ${grade || 'No especificado'}</p>
            <p><strong>Materia:</strong> ${subject || 'No especificada'}</p>
            <p><strong>Inicio:</strong> ${startTime ? formatDateTime(startTime) : "No registrado"}</p>
            <p><strong>Fin:</strong> ${endTime ? formatDateTime(endTime) : "No registrado"}</p>
            <p><strong>Duración:</strong> ${document.getElementById("classDuration").textContent}</p>
        </div>
    `;
    
    if (students.length > 0 && students.some(s => s.name)) {
        content += `<div class="report-section">
            <h3>Registro de Salidas de Estudiantes</h3>`;
        
        students.forEach((student, index) => {
            if (student.name) {
                content += `
                    <p><strong>Estudiante ${index + 1}:</strong> ${student.name}</p>
                    <p><strong>Razón:</strong> ${formatMultilineText(student.reason)}</p>
                    <p><strong>Hora de salida:</strong> ${student.startTime ? formatDateTime(student.startTime) : "No registrada"}</p>
                    <p><strong>Hora de retorno:</strong> ${student.returnTime ? formatDateTime(student.returnTime) : "No registrada"}</p>
                    <p><strong>Tiempo fuera:</strong> ${student.duration} minutos</p>
                    <p><strong>Observación:</strong> ${formatMultilineText(student.comment)}</p>
                    <hr>
                `;
            }
        });
        
        content += `</div>`;
    }
    
    if (events.length > 0) {
        content += `<div class="report-section">
            <h3>Situaciones Ocurridas en el Aula</h3>
            <ul>`;
        
        events.forEach((event, index) => {
            content += `
                <li>
                    <strong>Evento ${index + 1}:</strong> ${formatMultilineText(event.text)}
                    <div><small>${event.formattedTime}</small></div>
                </li>
            `;
        });
        
        content += `</ul></div>`;
    }
    
    if (interpretations.length > 0) {
        content += `<div class="report-section">
            <h3>Interpretación de lo Observado</h3>
            <ul>`;
        
        interpretations.forEach((interpretation, index) => {
            content += `
                <li>
                    <strong>Interpretación ${index + 1}:</strong> ${formatMultilineText(interpretation.text)}
                    <div><small>${interpretation.formattedTime}</small></div>
                </li>
            `;
        });
        
        content += `</ul></div>`;
    }
    
    if (participationRecords.length > 0) {
        content += `<div class="report-section">
            <h3>Registro de Participación y Conducta</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background-color: #2c3e50; color: white;">
                    <th style="padding: 10px; text-align: left;">Estudiante(s)</th>
                    <th style="padding: 10px; text-align: left;">Comentario</th>
                    <th style="padding: 10px; text-align: left;">Hora</th>
                </tr>`;
        
        participationRecords.forEach((record, index) => {
            content += `
                <tr style="${index % 2 === 0 ? 'background-color: #f2f2f2;' : ''}">
                    <td style="padding: 10px; border: 1px solid #ddd;">${record.studentName}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formatMultilineText(record.comment)}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${record.formattedTime}</td>
                </tr>
            `;
        });
        
        content += `</table></div>`;
    }
    
    if (inasistenciaReports.length > 0) {
        content += `<div class="report-section">
            <h3>Reportes de Inasistencia</h3>`;
        
        inasistenciaReports.forEach((report, index) => {
            content += `
                <p><strong>Reporte ${index + 1}:</strong> ${report.studentName}</p>
                <p><strong>Última fecha de asistencia:</strong> ${report.lastAttendanceDate}</p>
                <p><strong>Motivo:</strong> ${formatMultilineText(report.motivo)}</p>
                <p><strong>Acciones realizadas:</strong> ${formatMultilineText(report.acciones)}</p>
                <p><strong>Fecha del reporte:</strong> ${report.reportDate}</p>
                <hr>
            `;
        });
        
        content += `</div>`;
    }
    
    if (acuerdos.length > 0) {
        content += `<div class="report-section">
            <h3>Acuerdos y Compromisos Escolares</h3>`;
        
        acuerdos.forEach((acuerdo, index) => {
            content += `
                <p><strong>Acuerdo ${index + 1}:</strong> ${acuerdo.titulo}</p>
                <p><strong>Fecha de creación:</strong> ${acuerdo.fechaCreacion}</p>
                <p><strong>Descripción:</strong> ${formatMultilineText(acuerdo.descripcion)}</p>
                ${acuerdo.compromisos ? `<p><strong>Compromisos:</strong><br>${formatMultilineText(acuerdo.compromisos)}</p>` : ''}
                ${acuerdo.participantes ? `<p><strong>Participantes:</strong> ${formatMultilineText(acuerdo.participantes)}</p>` : ''}
                <p><strong>Fecha de compromiso:</strong> ${acuerdo.fechaCompromiso}</p>
                <p><strong>Fecha de seguimiento:</strong> ${acuerdo.fechaSeguimiento}</p>
                <p><strong>Fecha de entrega:</strong> ${acuerdo.fechaEntrega}</p>
                <hr>
            `;
        });
        
        content += `</div>`;
    }
    
    if (capturedEvidence.length > 0) {
        content += `<div class="report-section">
            <h3>Evidencias de Revisión</h3>
            <div class="conformity-statement">
                <h4>Declaración de Conformidad</h4>
                <p>Confirmo que he leído y acepto el contenido de este reporte, comprometiéndome a cumplir los acuerdos establecidos. El profesor certifica que las evidencias en este registro de tareas o disciplinario han sido verificadas y son auténticas, suficientes y pertinentes para los fines académicos.</p>
            </div>`;
        
        content += `<div class="report-evidence-gallery">`;

        capturedEvidence.forEach((evidence, index) => {
            if (evidence.type === "image") {
                content += `
                    <div class="report-evidence-item">
                        <p><strong>Foto de evidencia ${index + 1}</strong> - ${evidence.formattedTime}</p>
                        <img src="${evidence.data}" class="report-evidence-image" alt="Evidencia ${index + 1}">
                        ${evidence.observation ? `<p><strong>Observaciones:</strong> ${formatMultilineText(evidence.observation)}</p>` : ''}
                        <hr>
                    </div>
                `;
            } else if (evidence.type === "document") {
                content += `
                    <div class="report-evidence-item">
                        <p><strong>Documento ${index + 1}:</strong> ${evidence.filename} - ${evidence.formattedTime}</p>
                        ${evidence.observation ? `<p><strong>Observaciones:</strong> ${formatMultilineText(evidence.observation)}</p>` : ''}
                        <hr>
                    </div>
                `;
            }
        });

        content += `</div>`;
        
        content += `</div>`;
    }
    
    if (footerImage) {
        content += `<div style="text-align: center; margin-top: 30px;">
            <img src="${footerImage}" style="max-width: 100%;">
        </div>`;
    }
    
    document.getElementById("reportPreview").innerHTML = content;
}

async function downloadPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const grade = document.getElementById("grade").value || "Grado";
        
        const today = new Date();
        const day = today.getDate();
        const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const month = monthNames[today.getMonth()];
        const year = today.getFullYear();
        const dateString = `${day}-${month}-${year}`;
        
        const fileName = `${grade} - ${dateString}.pdf`;
        
        const element = document.getElementById('reportPreview');
        
        const margin = 15;
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * margin;
        
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= doc.internal.pageSize.getHeight();
        
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
            heightLeft -= doc.internal.pageSize.getHeight();
        }
        
        doc.save(fileName);
        showNotification("PDF generado y descargado", "success");
    } catch (error) {
        console.error("Error al generar el PDF:", error);
        showNotification("Error al generar el PDF. Por favor, intente nuevamente.", "error");
    }
}

// Utilidades
function showNotification(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 500);
    }, 3000);
}

function formatMultilineText(text) {
    if (!text) return '';
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
}

function formatDate(date) {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('es-ES', options).toUpperCase();
}

function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

function formatDateTime(date) {
    const options = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return date.toLocaleDateString('es-ES', options).toUpperCase();
}
