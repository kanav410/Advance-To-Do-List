// document.addEventListener("DOMContentLoaded", () => {
//     const todoInput = document.getElementById("task-input");
//     const addTaskButt = document.getElementById("add-btn");
//     const todoList = document.getElementById("task-list");
    
//     let tasks = JSON.parse(localStorage.getItem('tasks')) ||[];

//     tasks.forEach(task => renderTasks(task));     
    
//     addTaskButt.addEventListener("click", () => {
//         const tasktext = todoInput.value.trim();    
//         if (tasktext === "") return;
        
        
//         const newTask = {
//             id: Date.now(),
//             text: tasktext,
//             completed: false
//         }
//         tasks.push(newTask);
//         saveTask();
//         renderTasks(newTask);
//         todoInput.value = "";
//         console.log(tasks);
//     });
    
//     function renderTasks(task){
//         const li = document.createElement("li");
//         li.setAttribute('data-id',task.id);
//         if(task.completed) li.classList.add('completed');
//         li.innerHTML = `
//         <span>${task.text}</span>
//         <button>Delete</button>

//         `;
//         li.addEventListener("click", (e) =>{
//             if(e.target.tagName === "BUTTON") return;
//             task.completed = !task.completed
//             li.classList.toggle("completed")
//             saveTask();
//         })
        
//         todoList.appendChild(li);
//     }
    
//     function saveTask() {
//         localStorage.setItem('tasks',JSON.stringify(tasks));
//     }
// });


document.addEventListener("DOMContentLoaded", () => {
    const todoInput = document.getElementById("task-input");
    const taskTimeInput = document.getElementById("task-time");
    const addTaskButt = document.getElementById("add-btn");
    const todoList = document.getElementById("task-list");
    const micBtn = document.getElementById("mic-btn");
    const voiceFeedback = document.getElementById("voice-feedback");
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Speech Recognition with Advanced Commands
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;

    function showFeedback(message, isError = false) {
        voiceFeedback.textContent = message;
        voiceFeedback.style.color = isError ? '#ff7b72' : '#58a6ff';
        setTimeout(() => {
            voiceFeedback.textContent = '';
        }, 3000);
    }

    function parseVoiceCommand(transcript) {
        const lowerTranscript = transcript.toLowerCase();
        
        // Add task command
        const addMatch = lowerTranscript.match(/add\s+(.+?)(?:\s+at\s+(\d+(?::\d+)?\s*(?:am|pm)?)?)?$/i);
        if (addMatch) {
            const taskText = addMatch[1];
            const taskTime = addMatch[2] || '';
            
            const newTask = {
                id: Date.now(),
                text: taskText,
                time: taskTime,
                completed: false
            };
            
            tasks.push(newTask);
            saveTask();
            renderTasks(newTask);
            showFeedback(`Added task: ${taskText}`);
            return true;
        }

        // Delete task command
        const deleteMatch = lowerTranscript.match(/delete\s+(.+)/i);
        if (deleteMatch) {
            const taskToDelete = deleteMatch[1];
            const foundTask = tasks.find(task => 
                task.text.toLowerCase().includes(taskToDelete.toLowerCase())
            );
            
            if (foundTask) {
                tasks = tasks.filter(t => t.id !== foundTask.id);
                document.querySelector(`li[data-id="${foundTask.id}"]`)?.remove();
                saveTask();
                showFeedback(`Deleted task: ${foundTask.text}`);
                return true;
            } else {
                showFeedback(`No task found matching: ${taskToDelete}`, true);
                return false;
            }
        }

        return false;
    }

    // Speech Recognition Setup
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            micBtn.classList.add('listening');
            showFeedback('Listening...');
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            
            if (!parseVoiceCommand(transcript)) {
                // If no command recognized, fill input
                todoInput.value = transcript;
            }
            
            micBtn.classList.remove('listening');
        };
        
        recognition.onend = () => {
            micBtn.classList.remove('listening');
        };

        recognition.onerror = (event) => {
            showFeedback('Speech recognition error', true);
            micBtn.classList.remove('listening');
        };
    } else {
        micBtn.style.display = 'none';
        console.log('Speech Recognition not supported');
    }

    // Mic Button Event Listener
    micBtn.addEventListener('click', () => {
        if (recognition) {
            recognition.start();
        }
    });

    // Render existing tasks
    tasks.forEach(task => renderTasks(task));     
    
    // Add Task Button
    addTaskButt.addEventListener("click", () => {
        const tasktext = todoInput.value.trim();    
        const taskTime = taskTimeInput.value;
        
        if (tasktext === "") return;
        
        const newTask = {
            id: Date.now(),
            text: tasktext,
            time: taskTime,
            completed: false
        }
        tasks.push(newTask);
        saveTask();
        renderTasks(newTask);
        todoInput.value = "";
        taskTimeInput.value = "";
    });
    
    function renderTasks(task){
        const li = document.createElement("li");
        li.setAttribute('data-id', task.id);
        if(task.completed) li.classList.add('completed');
        
        li.innerHTML = `
        <div>
            <span>${task.text}</span>
            ${task.time ? `<small class="task-time">${task.time}</small>` : ''}
        </div>
        <button class="delete-btn">Delete</button>
        `;
        
        li.addEventListener("click", (e) =>{
            if(e.target.classList.contains('delete-btn')) return;
            task.completed = !task.completed
            li.classList.toggle("completed")
            saveTask();
        })
        
        // Delete functionality
        li.querySelector('.delete-btn').addEventListener('click', () => {
            tasks = tasks.filter(t => t.id !== task.id);
            li.remove();
            saveTask();
        });
        
        todoList.appendChild(li);
    }
    
    function saveTask() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
});