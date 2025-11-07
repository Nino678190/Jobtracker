document.getElementById('year').textContent = new Date().getFullYear();


function showLoginForm() {
    const loginDialog = document.getElementById('loginDialog');
    loginDialog.style.display = 'flex';
}

function closeLoginForm(){
    
}

function login(){

}



function addApplication(event) {
    event.preventDefault();
    const title = document.getElementById("title").value;
    const company = document.getElementById("company").value;
    const date_applied = new Date().toISOString().split("T")[0];
    const last_interacted = date_applied;
    const status = document.getElementById("status").value;
    const description = document.getElementById("description").value;
    const place = document.getElementById("location").value;
    const salary = document.getElementById("salary").value;
    const tasks = document.getElementById("key_tasks").value;
    const key_tasks = tasks.split(";").map(task => task.trim()).filter(task => task.length > 0);

    console.log({
        title,
        company,
        date_applied,
        last_interacted,
        status,
        description,
        place,
        salary,
        key_tasks
    });
    fetch('/api/applications', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title,
            company,
            date_applied,
            last_interacted,
            status,
            description,
            place,
            salary,
            key_tasks,
            userId: sessionStorage.getItem('userId')
        })
    }).then(response => {
        if (response.ok) {
            alert('Application added successfully!');
            window.location.href = 'index.html';
        } else {
            alert('Failed to add application.');
        }
    }).catch(error => {
        console.error('Error:', error);
        alert('An error occurred while adding the application.');
    }
    )
}