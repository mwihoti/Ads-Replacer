document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("taskInput");
    const addTaskButton = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll("li").forEach(taskItem => {
            tasks.push(taskItem.textContent.replace("Delete", "").trim());
        });
        chrome.storage.local.set({ tasks });
    }

    function loadTasks() {
        chrome.storage.local.get("tasks", function(data) {
            if (data.tasks) {
                data.tasks.forEach(taskText => {
                    addTaskButton(taskText);
                });
            }
        });
    }

    function addTask(taskText) {
        const taskItem = document.createElement("li");
        taskItem.textContent = taskText;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            taskList.removeChild(taskItem);
            saveTasks();
        });
        taskItem.appendChild(deleteButton);
        taskList.appendChild(taskItem);
        saveTasks()
    }

    addTaskButton.addEventListener("click", function () {
        const taskText = taskInput.value.trim();
        if (taskText !== "") {
            addTask(taskText);
            taskInput.value = "";
        }
    });
    loadTasks();


})