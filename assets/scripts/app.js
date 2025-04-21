document.addEventListener('DOMContentLoaded', () => {
    initStorage();
    checkBonneAnnee();
    setupNavigation();
    setupLogin();
    loadTasks();
    setupAddTask();
    setupSidebarToggle();
    renderHistoric();
    renderStats();
    setupShare();
        adjustPagesHeight();

    // setTimeout(() => {
    // }, 1000);
});

/* --------------------- Initialisation & Archivage --------------------- */
function initStorage() {
    const MS_PER_DAY = 86400000;
    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // début de journée

    let storedDate = localStorage.getItem('Current-date');
    if (!storedDate) {
        localStorage.setItem('Current-date', today.getTime());
        if (!localStorage.getItem('JDI-ToDo')) localStorage.setItem('JDI-ToDo', JSON.stringify([]));
        if (!localStorage.getItem('JDI-Historic')) localStorage.setItem('JDI-Historic', JSON.stringify([]));
    } else {
        storedDate = new Date(Number(storedDate));
        const diffDays = Math.floor((today - storedDate) / MS_PER_DAY);
        if (diffDays > 0) {
            let historic = JSON.parse(localStorage.getItem('JDI-Historic')) || [];
            let tasks = JSON.parse(localStorage.getItem('JDI-ToDo')) || [];
            // Archive la journée précédente
            historic.push([storedDate.getTime(), tasks]);
            // Crée des enregistrements vides pour les jours manqués
            for (let i = 1; i < diffDays; i++) {
                let missingDate = new Date(storedDate);
                missingDate.setDate(missingDate.getDate() + i);
                historic.push([missingDate.getTime(), []]);
            }
            localStorage.setItem('JDI-Historic', JSON.stringify(historic));
            // Si le décalage est d’un jour, on conserve les tâches non accomplies ; sinon, on réinitialise
            if (diffDays === 1) {
                const carryOver = tasks.filter(task => !task.finished);
                localStorage.setItem('JDI-ToDo', JSON.stringify(carryOver));
            } else {
                localStorage.setItem('JDI-ToDo', JSON.stringify([]));
            }
            localStorage.setItem('Current-date', today.getTime());
        }
    }
}

/* --------------------- Affichage Bonne Année --------------------- */
function checkBonneAnnee() {
    const today = new Date();
    const start = new Date(today.getFullYear(), 11, 25);
    const end = new Date(today.getFullYear(), 11, 31);
    if (today >= start && today <= end) {
        const logo = document.querySelector('.header .logo');
        if (logo) logo.textContent = "Bonne année";
    }
}

/* --------------------- Navigation --------------------- */
function setupNavigation() {
    const pageLinks = document.querySelectorAll('.to-page');
    pageLinks.forEach(link => {
        link.addEventListener('click', () => {
            const target = link.getAttribute('data-page');
            switchPage(target);
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && !sidebar.classList.contains('hide')) {
                sidebar.classList.add('hide');
            }
        });
    });
}

function switchPage(pageName) {
    const pageLinks = document.querySelectorAll('.to-page');
    pageLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageName)
            link.classList.add('active');
        else
            link.classList.remove('active');
    });
    const sections = document.querySelectorAll('.pages section');
    sections.forEach(section => section.classList.remove('active'));
    const targetSection = document.querySelector(`.pages .${pageName}`);
    if (targetSection) targetSection.classList.add('active');
    adjustPagesHeight();
}

function adjustPagesHeight() {
    const header = document.querySelector('.header');
    const activeSection = document.querySelector('.pages section.active');
    const pagesContainer = document.querySelector('.pages');
    const app = document.querySelector('.app');
  
    // Utiliser scrollHeight pour capturer la hauteur totale du contenu, notamment pour la page historique
    const sectionHeight = activeSection ? activeSection.scrollHeight : 0;
    // Calcul de l'espace disponible (100vh moins la hauteur du header)
    const availablePagesHeight = window.innerHeight - header.offsetHeight;
    const newPagesHeight = Math.max(availablePagesHeight, sectionHeight);
    
    pagesContainer.style.height = newPagesHeight + 'px';
    app.style.maxHeight = Math.max(header.offsetHeight + newPagesHeight, window.innerHeight) + 'px';
  }
  


/* --------------------- Connexion --------------------- */
function setupLogin() {
    const loginBtn = document.querySelector('.login .btn');
    loginBtn.addEventListener('click', () => {
        const usernameInput = document.querySelector('.login .username');
        const username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem('JDI-Username', username);
            document.querySelector('.navbar .item .text.username').textContent = username;
            switchPage('home');
        }
    });
    const storedUsername = localStorage.getItem('JDI-Username');
    if (storedUsername) {
        document.querySelector('.navbar .text.username').textContent = storedUsername;
        document.querySelector('.login .username').value = storedUsername;
    }
}

/* --------------------- Gestion des Tâches (Page Home) --------------------- */
function loadTasks() {
    const tasksData = JSON.parse(localStorage.getItem('JDI-ToDo')) || [];
    tasksData.forEach(task => {
        insertTask(task.name, task.finished);
    });
}

function insertTask(name, finished = false) {
    const template = document.querySelector('#todo-list-task');
    const clone = document.importNode(template.content, true);
    const li = clone.querySelector('li');
    li.querySelector('.name').textContent = name;
    if (finished) li.classList.add('accomplished');

    // Bouton "check"
    li.querySelector('.btn.check').addEventListener('click', () => {
        li.classList.toggle('accomplished');
        updateTasks();
    });
    // Bouton "trash"
    li.querySelector('.btn.trash').addEventListener('click', () => {
        li.remove();
        updateTasks();
    });

    const taskList = document.querySelector('.home .todo');
    taskList.appendChild(li);
}

function updateTasks() {
    const taskItems = document.querySelectorAll('.home .todo .item');
    const tasks = [];
    taskItems.forEach(item => {
        const name = item.querySelector('.name').textContent;
        const finished = item.classList.contains('accomplished');
        tasks.push({ name, finished });
    });
    localStorage.setItem('JDI-ToDo', JSON.stringify(tasks));
}

function setupAddTask() {
    const addTaskInput = document.querySelector('.home .addTask input.name');
    const addTaskBtn = document.querySelector('.home .addTask .btn');
    addTaskBtn.addEventListener('click', () => {
        const taskName = addTaskInput.value.trim();
        if (taskName) {
            insertTask(taskName, false);
            addTaskInput.value = "";
            updateTasks();
        }
    });
}

function setupSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    const switcher = sidebar.querySelector('.switcher');
    switcher.addEventListener('click', () => {
        sidebar.classList.toggle('hide');
    });
}

/* --------------------- Historique (Page History) --------------------- */
function renderHistoric() {
    const historyWrapper = document.querySelector('.history .day-wrapper');
    historyWrapper.innerHTML = "";
    let historic = JSON.parse(localStorage.getItem('JDI-Historic')) || [];
    historic = historic.sort((a, b) => b[0] - a[0]);
    historic.forEach(([timestamp, tasks]) => {
        const template = document.querySelector('#history-card');
        const cardClone = document.importNode(template.content, true);
        const card = cardClone.querySelector('.card');
        const dateObj = new Date(timestamp);
        card.querySelector('.date').textContent = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

        tasks.forEach(task => {
            const itemTemplate = document.querySelector('#history-item');
            const itemClone = document.importNode(itemTemplate.content, true);
            const item = itemClone.querySelector('.item');
            item.querySelector('.text').textContent = task.name;
            if (task.finished) {
                item.classList.add('accomplished');
                const icon = item.querySelector('i.fas');
                if (icon) {
                    icon.classList.remove('fa-x');
                    icon.classList.add('fa-check');
                }
            }
            card.appendChild(item);
        });
        historyWrapper.appendChild(card);
    });
}

/* --------------------- Statistiques (Page Stats) --------------------- */
function renderStats() {
    renderWeeklyStats();
    renderMonthlyStats();
    renderYearlyStats(); // Nouveau graphique sur 365 jours
}

function renderWeeklyStats() {
    let historic = JSON.parse(localStorage.getItem('JDI-Historic')) || [];
    historic.sort((a, b) => a[0] - b[0]);
    const todayTasks = JSON.parse(localStorage.getItem('JDI-ToDo')) || [];
    const weeklyData = [];
    const weeklyLabels = [];
    const today = new Date();
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDay);
        date.setDate(currentDay.getDate() - i);
        const record = historic.find(rec => {
            const recDate = new Date(rec[0]);
            return recDate.getFullYear() === date.getFullYear() &&
                recDate.getMonth() === date.getMonth() &&
                recDate.getDate() === date.getDate();
        });
        let accomplished = 0;
        if (record) {
            accomplished = record[1].filter(task => task.finished).length;
        } else if (date.getTime() === currentDay.getTime()) {
            accomplished = todayTasks.filter(task => task.finished).length;
        }
        weeklyData.push(accomplished);
        const weekday = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        weeklyLabels.push(weekday);
    }
    const weekOptions = {
        series: [{
            name: "Objectifs accomplis",
            data: weeklyData
        }],
        chart: {
            height: 350,
            type: 'bar',
            zoom: { enabled: false }
        },
        dataLabels: { enabled: true },
        stroke: { curve: 'straight' },
        title: { text: 'Progression Hebdomadaire', align: 'left' },
        grid: { row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 } },
        xaxis: { categories: weeklyLabels }
    };
    const wChart = new ApexCharts(document.querySelector("#weekChart"), weekOptions);
    wChart.render();
}

function renderMonthlyStats() {
    let historic = JSON.parse(localStorage.getItem('JDI-Historic')) || [];
    historic.sort((a, b) => a[0] - b[0]);
    const todayTasks = JSON.parse(localStorage.getItem('JDI-ToDo')) || [];
    const monthlyData = [];
    const monthlyLabels = [];
    const today = new Date();
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    for (let i = 29; i >= 0; i--) {
        const date = new Date(currentDay);
        date.setDate(currentDay.getDate() - i);
        const record = historic.find(rec => {
            const recDate = new Date(rec[0]);
            return recDate.getFullYear() === date.getFullYear() &&
                recDate.getMonth() === date.getMonth() &&
                recDate.getDate() === date.getDate();
        });
        let accomplished = 0;
        if (record) {
            accomplished = record[1].filter(task => task.finished).length;
        } else if (date.getTime() === currentDay.getTime()) {
            accomplished = todayTasks.filter(task => task.finished).length;
        }
        monthlyData.push(accomplished);
        monthlyLabels.push(date.getDate());
    }
    const monthOptions = {
        series: [{
            name: "Objectifs accomplis",
            data: monthlyData
        }],
        chart: {
            height: 350,
            type: 'bar',
            zoom: { enabled: true }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'straight' },
        title: { text: 'Progression mensuelle', align: 'left' },
        grid: { row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 } },
        xaxis: { categories: monthlyLabels }
    };
    const mChart = new ApexCharts(document.querySelector("#monthChart"), monthOptions);
    mChart.render();
}

function renderYearlyStats() {
    // Graphique en ligne sur 365 jours
    let historic = JSON.parse(localStorage.getItem('JDI-Historic')) || [];
    historic.sort((a, b) => a[0] - b[0]);
    const todayTasks = JSON.parse(localStorage.getItem('JDI-ToDo')) || [];
    const seriesData = [];
    const today = new Date();
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startDay = new Date(currentDay);
    startDay.setDate(currentDay.getDate() - 364);

    let day = new Date(startDay);
    while (day <= currentDay) {
        let accomplished = 0;
        if (day.getTime() === currentDay.getTime()) {
            accomplished = todayTasks.filter(task => task.finished).length;
        } else {
            const record = historic.find(rec => {
                const recDate = new Date(rec[0]);
                return recDate.getFullYear() === day.getFullYear() &&
                    recDate.getMonth() === day.getMonth() &&
                    recDate.getDate() === day.getDate();
            });
            if (record) {
                accomplished = record[1].filter(task => task.finished).length;
            }
        }
        seriesData.push({ x: day.getTime(), y: accomplished });
        day.setDate(day.getDate() + 1);
    }

    const yearOptions = {
        series: [{
            name: "Objectifs accomplis",
            data: seriesData
        }],
        chart: {
            height: 350,
            type: 'line',
            zoom: { enabled: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'straight', width: 2 },
        title: { text: 'Progression annuelle', align: 'left' },
        xaxis: {
            type: 'datetime',
            labels: { datetimeUTC: false }
        },
        yaxis: {
            title: { text: "Tâches accomplies" },
            min: 0
        }
    };

    const yChart = new ApexCharts(document.querySelector("#yearChart"), yearOptions);
    yChart.render();
}

/* --------------------- Import/Export (Page Share) --------------------- */
function setupShare() {
    // Export
    const exportCard = document.querySelector('.share .card.export');
    exportCard.addEventListener('click', () => {
        const datasets = {
            Username: localStorage.getItem('JDI-Username') || 'Username',
            Historic: JSON.parse(localStorage.getItem('JDI-Historic')) || [],
            Today: Number(localStorage.getItem('Current-date')) || null,
            "Day-objectives": JSON.parse(localStorage.getItem('JDI-ToDo')) || []
        };
        const jsonStr = JSON.stringify(datasets, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        exportCard.href = url;
        exportCard.download = "TodoList.JDI.json";
    });

    // Import
    const fileInput = document.getElementById('file-load');
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file && file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.Username && data.Historic && data.Today && data["Day-objectives"] !== undefined) {
                        if (confirm("Voulez-vous remplacer toutes les données actuelles ?")) {
                            localStorage.setItem('JDI-Username', data.Username);
                            localStorage.setItem('JDI-Historic', JSON.stringify(data.Historic));
                            localStorage.setItem('Current-date', data.Today);
                            localStorage.setItem('JDI-ToDo', JSON.stringify(data["Day-objectives"]));
                            window.location.reload();
                        }
                    } else {
                        alert("Le fichier JSON n'a pas le bon format.");
                    }
                } catch (error) {
                    alert("Erreur lors de l'importation des données.");
                }
            };
            reader.readAsText(file);
        }
    });
}
