document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const taskForm = document.getElementById('task-form');

    let editingLi = null;

    
    const saveTaskToLocalStorage = () => {
        const tasks = Array.from(taskList.querySelectorAll('li')).map((li) => ({
            text: li.querySelector('span').textContent,
            completed: li.classList.contains('completed')
        }));

        localStorage.setItem('tasks', JSON.stringify(tasks));
    };


    const refresh = () => {
        const tasks = taskList.querySelectorAll('li');
        const completed = taskList.querySelectorAll('li.completed');

        console.log(`Tarefas: ${tasks.length}`);
        console.log(`Concluídas: ${completed.length}`);
    };

    
    const resetForm = () => {
        editingLi = null;
        taskInput.value = '';
        addTaskBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    };


    const createTaskElement = (text, completed = false) => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'checkbox';
        checkbox.checked = completed;

        const span = document.createElement('span');
        span.textContent = text;

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
        editBtn.disabled = completed;
        editBtn.setAttribute('aria-label', 'Editar tarefa');

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.setAttribute('aria-label', 'Excluir tarefa');

        li.append(checkbox, span, editBtn, deleteBtn);

        if (completed) {
            li.classList.add('completed');
        }

        taskList.appendChild(li);
    };

    
    const loadTasksFromLocalStorage = () => {
        const savedTasks = localStorage.getItem('tasks');

        if (!savedTasks) {
            refresh();
            return;
        }

        try {
            const tasks = JSON.parse(savedTasks);

            if (!Array.isArray(tasks)) {
                refresh();
                return;
            }

            taskList.innerHTML = '';

            tasks.forEach((task) => {
                if (
                    task &&
                    typeof task.text === 'string' &&
                    task.text.trim() !== ''
                ) {
                    createTaskElement(task.text, task.completed === true);
                }
            });

            refresh();
        } catch (error) {
            console.error('Erro ao carregar as tarefas:', error);
            refresh();
        }
    };

    
    const addTask = (text) => {
        createTaskElement(text);
        saveTaskToLocalStorage();
        refresh();
    };

    
    const toggleTask = (li, checked) => {
        li.classList.toggle('completed', checked);
        li.querySelector('.edit-btn').disabled = checked;

        if (checked && editingLi === li) {
            resetForm();
        }

        saveTaskToLocalStorage();
        refresh();

        const allTasks = Array.from(taskList.querySelectorAll('li'));

        const allCompleted =
            allTasks.length > 0 &&
            allTasks.every((item) =>
                item.classList.contains('completed')
            );

        if (checked && allCompleted) {
            fireConfetti();
        }
    };

    
    const deleteTask = (li) => {
        if (editingLi === li) {
            resetForm();
        }

        li.remove();
        saveTaskToLocalStorage();
        refresh();
    };

    
    const editTask = (li) => {
        if (li.classList.contains('completed')) {
            return;
        }

        editingLi = li;
        taskInput.value = li.querySelector('span').textContent;
        taskInput.focus();

        addTaskBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
    };

    
    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const text = taskInput.value.trim();

        if (!text) {
            taskInput.focus();
            return;
        }

        if (editingLi) {
            editingLi.querySelector('span').textContent = text;
            saveTaskToLocalStorage();
            refresh();
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

        if (!li || !taskList.contains(li)) {
            return;
        }

        if (event.target.closest('.delete-btn')) {
            deleteTask(li);
        } else if (event.target.closest('.edit-btn')) {
            editTask(li);
        }
    });

    
    taskList.addEventListener('change', (event) => {
        if (event.target.classList.contains('checkbox')) {
            const li = event.target.closest('li');

            if (li) {
                toggleTask(li, event.target.checked);
            }
        }
    });

    
    loadTasksFromLocalStorage();
});
