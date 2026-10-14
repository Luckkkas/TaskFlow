document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.querySelector('.input-area');
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');
    const todosContainer = document.querySelector('.todos-container');
    const progressBar = document.getElementById('progress');
    const progressNumbers = document.getElementById('numbers');

    const required = { taskForm, taskInput, addTaskBtn, taskList, progressBar, progressNumbers };
    for (const [name, el] of Object.entries(required)) {
        if (!el) {
            console.error(`Elemento não encontrado no HTML: ${name}`);
            return;
        }
    }

    let editingLi = null;

    const fireConfetti = () => {
        if (typeof confetti !== 'function') return;

        const count = 200;
        const defaults = { origin: { y: 0.7 } };

        const fire = (particleRatio, opts) => {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
            });
        };

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
    };

    
    const saveTaskToLocalStorage = () => {
        const tasks = Array.from(taskList.querySelectorAll('li')).map((li) => ({
            text: li.querySelector('span').textContent,
            completed: li.classList.contains('completed'),
        }));
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const updateStats = () => {
        const totalTasks = taskList.querySelectorAll('li').length;
        const completedTasks = taskList.querySelectorAll('li.completed').length;
        const percent = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

        progressBar.style.width = `${percent}%`;
        progressNumbers.textContent = `${completedTasks} / ${totalTasks}`;
    };

    const toggleEmptyState = () => {
        const isEmpty = taskList.querySelectorAll('li').length === 0;

        if (emptyImage) {
            emptyImage.style.display = isEmpty ? 'block' : 'none';
        }
        if (todosContainer) {
            todosContainer.style.width = isEmpty ? '50%' : '100%';
        }
    };

    const refresh = () => {
        updateStats();
        toggleEmptyState();
    };

    const createTaskElement = (text, completed = false) => {
        const li = document.createElement('li');
        li.classList.toggle('completed', completed);

        const taskCheckbox = document.createElement('input');
        taskCheckbox.type = 'checkbox';
        taskCheckbox.className = 'checkbox';
        taskCheckbox.checked = completed;

        const taskText = document.createElement('span');
        taskText.textContent = text;

        const taskButtons = document.createElement('div');
        taskButtons.className = 'task-buttons';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
        editBtn.setAttribute('aria-label', 'Editar tarefa');
        editBtn.disabled = completed;

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.setAttribute('aria-label', 'Excluir tarefa');

        taskButtons.append(editBtn, deleteBtn);
        li.append(taskCheckbox, taskText, taskButtons);
        taskList.appendChild(li);
    };

    const loadTasksFromLocalStorage = () => {
        let savedTasks = [];
        try {
            const saved = JSON.parse(localStorage.getItem('tasks'));
            savedTasks = Array.isArray(saved) ? saved : [];
        } catch (error) {
            savedTasks = [];
        }

        savedTasks.forEach((task) => {
            createTaskElement(task.text, task.completed);
        });

        refresh();
    };

    const resetForm = () => {
        editingLi = null;
        taskInput.value = '';
        addTaskBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    };

    const addTask = (text) => {
        createTaskElement(text);
        saveTaskToLocalStorage();
        refresh();
    };

    const toggleTask = (li, checked) => {
        li.classList.toggle('completed', checked);
        li.querySelector('.edit-btn').disabled = checked;

        if (checked && editingLi === li) resetForm();

        saveTaskToLocalStorage();
        refresh();

        const allCompleted = Array.from(taskList.querySelectorAll('li')).every((item) =>
            item.classList.contains('completed')
        );
        if (checked && allCompleted) {
            fireConfetti();
        }
    };

    const deleteTask = (li) => {
        if (editingLi === li) resetForm();
        li.remove();
        saveTaskToLocalStorage();
        refresh();
    };

    const editTask = (li) => {
        editingLi = li;
        taskInput.value = li.querySelector('span').textContent;
        taskInput.focus();
        addTaskBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    };

    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const text = taskInput.value.trim();
        if (!text) return;

        if (editingLi) {
            editingLi.querySelector('span').textContent = text;
            saveTaskToLocalStorage();
        } else {
            addTask(text);
        }

        resetForm();
        taskInput.focus();
    });

    taskInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && editingLi) {
            resetForm();
        }
    });

    taskList.addEventListener('click', (event) => {
        const li = event.target.closest('li');
        if (!li) return;

        if (event.target.closest('.delete-btn')) {
            deleteTask(li);
        } else if (event.target.closest('.edit-btn')) {
            editTask(li);
        }
    });

    taskList.addEventListener('change', (event) => {
        if (event.target.classList.contains('checkbox')) {
            const li = event.target.closest('li');
            toggleTask(li, event.target.checked);
        }
    });

    loadTasksFromLocalStorage();
});
