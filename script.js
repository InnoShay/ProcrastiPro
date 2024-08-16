let tasks = [];
let procrastinationTask = null;
let productivityScore = 0;
let streak = 0;
let timeLeft = 300; // 5 minutes in seconds
let pomodoroDuration = 25;
let breakDuration = 5;
let notificationSound = 'bell';
let procrastinationTime = 0;
let procrastinationInterval;

// Display username in sidebar
document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('username');
    if (username) {
        document.getElementById('username-display').textContent = username;
    } else {
        window.location.href = 'index.html'; // Redirect to login if no username
    }
});

function addTask() {
    const newTaskInput = document.getElementById('new-task');
    const taskPriority = document.getElementById('task-priority');
    const taskType = document.getElementById('task-type');
    const taskSchedule = document.getElementById('task-schedule');
    const taskText = newTaskInput.value.trim();
    if (taskText) {
        const task = {
            text: taskText,
            priority: taskPriority.value,
            type: taskType.value,
            schedule: taskSchedule.value,
            locked: false,
            completed: false
        };
        tasks.push(task);
        newTaskInput.value = '';
        taskSchedule.value = '';
        updateTaskList();
        updateScheduledTasks();
        saveToLocalStorage();
    }
}

function updateTaskList() {
    const taskList = document.getElementById('tasks');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        if (!task.schedule) {
            const li = createTaskElement(task, index);
            taskList.appendChild(li);
        }
    });
}

function updateScheduledTasks() {
    const scheduledTaskList = document.getElementById('scheduled-tasks');
    scheduledTaskList.innerHTML = '';
    tasks.forEach((task, index) => {
        if (task.schedule) {
            const li = createTaskElement(task, index);
            scheduledTaskList.appendChild(li);
        }
    });
}

function createTaskElement(task, index) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${task.text}</span>
        <div>
            <span class="task-priority ${task.priority}">${task.priority}</span>
            <span class="task-type ${task.type}">${task.type}</span>
            ${task.schedule ? `<span class="task-schedule">${new Date(task.schedule).toLocaleString()}</span>` : ''}
        </div>
    `;
    if (task.locked) {
        li.classList.add('locked');
    } else if (task.completed) {
        li.classList.add('completed');
    } else {
        li.onclick = () => attemptTask(index);
    }
    return li;
}

function selectProcrastinationTask() {
    if (tasks.length === 0) {
        alert('Add some tasks first!');
        return;
    }
    if (procrastinationTask !== null) {
        document.getElementById('unlock-sound').play();
        tasks[procrastinationTask].locked = false;x
    }
    procrastinationTask = Math.floor(Math.random() * tasks.length);
    document.getElementById('procrastination-task-display').textContent = tasks[procrastinationTask].text;
    tasks[procrastinationTask].locked = true;
    document.getElementById('lock-sound').play();
    updateTaskList();
    updateScheduledTasks();
    resetTimer();
    saveToLocalStorage();
}

function attemptTask(index) {
    if (index === procrastinationTask) {
        alert("Nice try! You can't work on your procrastination task.");
    } else {
        alert(`Good job! You're working on: ${tasks[index].text}`);
        if (!tasks[index].completed) {
            tasks[index].completed = true;
            productivityScore += 10;
            streak++;
            document.getElementById('complete-sound').play();
            updateProductivityScore();
            updateStreak();
        }
    }
    updateTaskList();
    updateScheduledTasks();
    saveToLocalStorage();
}

function updateProductivityScore() {
    document.getElementById('score').textContent = productivityScore;
}

function updateStreak() {
    document.getElementById('streak-count').textContent = streak;
}

function resetTimer() {
    timeLeft = pomodoroDuration * 60;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('time-left').textContent = 
        `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function startTimer() {
    setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            selectProcrastinationTask();
        }
    }, 1000);
}

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('productivityScore', productivityScore);
    localStorage.setItem('streak', streak);
    localStorage.setItem('pomodoroDuration', pomodoroDuration);
    localStorage.setItem('breakDuration', breakDuration);
    localStorage.setItem('notificationSound', notificationSound);
}

function loadFromLocalStorage() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        productivityScore = parseInt(localStorage.getItem('productivityScore') || '0');
        streak = parseInt(localStorage.getItem('streak') || '0');
        pomodoroDuration = parseInt(localStorage.getItem('pomodoroDuration') || '25');
        breakDuration = parseInt(localStorage.getItem('breakDuration') || '5');
        notificationSound = localStorage.getItem('notificationSound') || 'bell';
        updateTaskList();
        updateScheduledTasks();
        updateProductivityScore();
        updateStreak();
        updateSettingsInModal();
    }
}

async function getMotivationalQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        document.getElementById('quote').textContent = `"${data.content}" - ${data.author}`;
    } catch (error) {
        console.error('Error fetching quote:', error);
        document.getElementById('quote').textContent = "Believe in yourself!";
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeLabel = document.getElementById('theme-label');
    if (document.body.classList.contains('dark-theme')) {
        themeLabel.textContent = 'Light Mode';
    } else {
        themeLabel.textContent = 'Dark Mode';
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('closed');
    const mainContent = document.getElementById('main-content');
    mainContent.style.marginLeft = sidebar.classList.contains('closed') ? '60px' : '250px';
}

function clearAllTasks() {
    if (confirm('Are you sure you want to clear all tasks?')) {
        tasks = [];
        updateTaskList();
        updateScheduledTasks();
        saveToLocalStorage();
    }
}

function showAllTasksModal() {
    const modal = document.getElementById('all-tasks-modal');
    const allTasksList = document.getElementById('all-tasks-list');
    allTasksList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = createTaskElement(task, index);
        allTasksList.appendChild(li);
    });
    modal.style.display = 'block';
}

function showAnalyticsModal() {
    const modal = document.getElementById('analytics-modal');
    modal.style.display = 'block';
    renderAnalyticsChart();
}

function renderAnalyticsChart() {
    const ctx = document.getElementById('analytics-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Completed Tasks', 'Pending Tasks', 'Productivity Score'],
            datasets: [{
                label: 'Task Analytics',
                data: [
                    tasks.filter(task => task.completed).length,
                    tasks.filter(task => !task.completed).length,
                    productivityScore
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)'
                ]
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function showSettingsModal() {
    const modal = document.getElementById('settings-modal');
    updateSettingsInModal();
    modal.style.display = 'block';
}

function updateSettingsInModal() {
    document.getElementById('pomodoro-duration').value = pomodoroDuration;
    document.getElementById('break-duration').value = breakDuration;
    document.getElementById('notification-sound').value = notificationSound;
}

function saveSettings() {
    pomodoroDuration = parseInt(document.getElementById('pomodoro-duration').value);
    breakDuration = parseInt(document.getElementById('break-duration').value);
    notificationSound = document.getElementById('notification-sound').value;
    saveToLocalStorage();
    alert('Settings saved successfully!');
}

function toggleProcrastination() {
    const toggleButton = document.getElementById('toggle-procrastination');
    if (toggleButton.textContent === 'Start') {
        startProcrastination();
    } else {
        stopProcrastination();
    }
}

function startProcrastination() {
    const toggleButton = document.getElementById('toggle-procrastination');
    toggleButton.textContent = 'Stop';
    toggleButton.innerHTML = '<i class="fas fa-stop"></i> Stop';
    procrastinationInterval = setInterval(() => {
        procrastinationTime++;
        updateProcrastinationTimeDisplay();
    }, 1000);
}

function stopProcrastination() {
    const toggleButton = document.getElementById('toggle-procrastination');
    toggleButton.textContent = 'Start';
    toggleButton.innerHTML = '<i class="fas fa-play"></i> Start';
    clearInterval(procrastinationInterval);
}

function resetProcrastination() {
    stopProcrastination();
    procrastinationTime = 0;
    updateProcrastinationTimeDisplay();
}

function updateProcrastinationTimeDisplay() {
    const minutes = Math.floor(procrastinationTime / 60);
    const seconds = procrastinationTime % 60;
    document.getElementById('procrastination-time').textContent = 
        `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Event Listeners
document.getElementById('theme-toggle').addEventListener('change', toggleTheme);
document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
document.getElementById('all-tasks-link').addEventListener('click', showAllTasksModal);
document.getElementById('analytics-link').addEventListener('click', showAnalyticsModal);
document.getElementById('settings-link').addEventListener('click', showSettingsModal);
document.getElementById('save-settings').addEventListener('click', saveSettings);
document.getElementById('toggle-procrastination').addEventListener('click', toggleProcrastination);
document.getElementById('reset-procrastination').addEventListener('click', resetProcrastination);

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Close modal when clicking close button
document.querySelectorAll('.close-modal').forEach(button => {
    button.onclick = function() {
        this.closest('.modal').style.display = 'none';
    }
});

// Initial setup
loadFromLocalStorage();
startTimer();
getMotivationalQuote();

function logout() {
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

function updateUpcomingTasks() {
    const upcomingTasksList = document.getElementById('upcoming-tasks');
    upcomingTasksList.innerHTML = '<h2><i class="fas fa-calendar"></i> Upcoming Tasks</h2>';
    const now = new Date();
    const upcomingTasks = tasks.filter(task => {
        if (task.schedule) {
            const taskDate = new Date(task.schedule);
            return taskDate > now && !task.completed;
        }
        return false;
    });
    upcomingTasks.sort((a, b) => new Date(a.schedule) - new Date(b.schedule));
    upcomingTasks.slice(0, 5).forEach(task => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${task.text}</span>
            <span>${new Date(task.schedule).toLocaleString()}</span>
        `;
        upcomingTasksList.appendChild(li);
    });
}

function initializeApp() {
    loadFromLocalStorage();
    startTimer();
    getMotivationalQuote();
    updateUpcomingTasks();
    updateTaskList();
    updateScheduledTasks();
    updateProductivityScore();
    updateStreak();
}

// Add logout button to sidebar
const logoutListItem = document.createElement('li');
logoutListItem.innerHTML = '<a href="#" id="logout-link"><i class="fas fa-sign-out-alt"></i> <span>Logout</span></a>';
document.querySelector('#sidebar ul').appendChild(logoutListItem);

// Add event listener to the logout link
document.getElementById('logout-link').addEventListener('click', logout);

// Initialize the app
initializeApp();

// Update upcoming tasks every minute
setInterval(updateUpcomingTasks, 60000);