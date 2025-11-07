const client = new Appwrite.Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("690e41bb001b23b7fce1");

const account = new Appwrite.Account(client)


document.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById("year").innerHTML = new Date().getFullYear();
    // if (!window.location.href.includes('index') && window.location.pathname !== '/') {
    //     checkAuthStatus();
    // }
})


function showLoginForm() {
    const loginDialog = document.getElementById('loginDialog');
    loginDialog.style.display = 'flex';
}

function closeLoginForm(){

}

async function checkAuthStatus() {
    try {
        const user = await account.get();
        console.log("User is authenticated:", user);
        // Proceed with your authenticated app flow
        return user;
    } catch (error) {
        console.error("User is not authenticated:", error);
        window.location.href = '/';
        return null;
    }
}

async function login(){
    try {
        const result = await account.createEmailPasswordSession(
            document.getElementById('email').value,
            document.getElementById('password').value
        );
        sessionStorage.setItem('userId', result.userId);
        window.location.href = '/overview.html';
    } catch (error) {
        console.error("Failed to login:", error);
        alert("Login failed. Please check your credentials or network connection.");
    }
}

function register(){
    const email = document.getElementById('regiEmail').value;
    const password = document.getElementById('regiPass').value
    account.create({
        email: email, 
        password: password
    });
    console.log(user);
}



function addApplication(event) {
    event.preventDefault();
    checkAuthStatus();
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

    console.log(
        {
            title,
            company,
            date_applied,
            last_interacted,
            status,
            description,
            place,
            salary,
            key_tasks,
        },
        sessionStorage.getItem("userId")
    );
    fetch("http://localhost:3050/api/application", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
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
            userId: sessionStorage.getItem("userId"),
        }),
    })
        .then((response) => {
            if (response.ok) {
                alert("Application added successfully!");
                window.location.href = "index.html";
            } else {
                alert("Failed to add application.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while adding the application.");
        });
}