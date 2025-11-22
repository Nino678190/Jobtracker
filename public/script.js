const { Account, Databases, Query } = Appwrite;

const client = new Appwrite.Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("690e41bb001b23b7fce1");

const account = new Account(client);
const databases = new Databases(client);



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
    const loginDialog = document.getElementById("loginDialog");
    loginDialog.style.display = "none"; 
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
    console.log("Adding application...");
    checkAuthStatus();
    console.log("User ID from sessionStorage:", sessionStorage.getItem("userId"));
    const title = document.getElementById("title").value;
    const company = document.getElementById("company").value;
    const date_applied = new Date().toISOString().split("T")[0];
    console.log("Date Applied:", date_applied);
    const last_interacted = date_applied;
    const status = document.getElementById("status").value;
    const description = document.getElementById("description").value;
    const place = document.getElementById("location").value;
    console.log("Place:", place);
    const salary = document.getElementById("salary").value;
    const tasks = document.getElementById("key_tasks").value;
    const key_tasks = tasks.split(";").map(task => task.trim()).filter(task => task.length > 0);
    console.log("Key Tasks:", key_tasks);
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
            } else {
                alert("Failed to add application.");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while adding the application.");
        });
}

function displayData(){
    checkAuthStatus();

    getApplications().then(applications => {
        displayApplications(applications);
    }).catch(error => {
        console.error("Error fetching applications:", error);
    });
}

function getApplications(){
    try {
        let query = [];
        query.push(Query.equal("userId", toString(sessionStorage.getItem("userId"))));
        console.log("Fetching applications for userId:", sessionStorage.getItem("userId"));
        return databases
            .listDocuments("690e41f1002e854e5f82", "jobs", query)
            .then((response) => {
                return response.documents;
            });
    } catch (error) {
        console.error("Error retrieving applications:", error);
        throw error;
    }
}

function displayApplications(applications){
    const data = applications;

    // Define stages, including "Waiting"
    let stages = ["Waiting", "Online Test", "HR Interview", "First Interview", "Second Interview", "Culture Fit Interview", "Offer"];

    // Initialize counts
    let totalApplications = data.length;

    let counts = {
        total: totalApplications,
        directRejected: 0,
        waiting: 0, // Count for "Waiting" applications
        stageCounts: {},
        rejectedAtStage: {},
        activeAtStage: {},
        transitions: {},
    };

    // Initialize counts for stages
    stages.forEach(stage => {
        counts.stageCounts[stage] = 0;
        counts.rejectedAtStage[stage] = 0;
        counts.activeAtStage[stage] = 0;
    });

    // Helper functions
    function initializeHistory(history) {
        if (!history || history.length === 0 || (history.length === 1 && (history[0] === "None" || history[0] === null))) {
            return ["Waiting"];
        }
        if (history[0] === "None" || history[0] === null) {
            history[0] = "Waiting";
        }
        return history;
    }

    function processRejection(counts, lastStage) {
        if (lastStage) {
            counts.rejectedAtStage[lastStage] = (counts.rejectedAtStage[lastStage] || 0) + 1;
            counts.transitions[`${lastStage},Rejected`] = (counts.transitions[`${lastStage},Rejected`] || 0) + 1;
        } else {
            counts.directRejected++;
            counts.transitions[`Total Applications,Rejected`] = (counts.transitions[`Total Applications,Rejected`] || 0) + 1;
        }
    }

    function processActive(counts, lastStage) {
        let stage = lastStage || "Waiting";
        counts.activeAtStage[stage] = (counts.activeAtStage[stage] || 0) + 1;
        counts.transitions[`${stage},Active`] = (counts.transitions[`${stage},Active`] || 0) + 1;
    }

    function recordTransition(transitions, from, to) {
        if (from !== to) {
            transitions[`${from},${to}`] = (transitions[`${from},${to}`] || 0) + 1;
        }
    }

    // Process applications
    data.forEach(application => {
        // Assuming 'History' and 'Status' fields exist on your application documents
        let history = initializeHistory(application.History);
        let status = application.Status;

        let lastStage = null;
        let rejected = false;

        for (let step of history) {
            if (step === "Reject") {
                processRejection(counts, lastStage);
                rejected = true;
                break; // Stop processing further stages
            } else if (stages.includes(step)) {
                counts.stageCounts[step] = (counts.stageCounts[step] || 0) + 1;
                counts.activeAtStage[step] = counts.activeAtStage[step] || 0;
                counts.rejectedAtStage[step] = counts.rejectedAtStage[step] || 0;

                recordTransition(counts.transitions, lastStage || "Total Applications", step);
                lastStage = step;
            }
        }

        if (!rejected && status === "Rejected") {
            processRejection(counts, lastStage);
        } else if (!rejected && status === "Active") {
            processActive(counts, lastStage);
        }
    });

    // Set counts.waiting after processing
    counts.waiting = counts.activeAtStage["Waiting"];

    // Build Mermaid Sankey diagram
    let mermaidData = "sankey-beta\n";

    // Generate transitions
    for (let [key, value] of Object.entries(counts.transitions)) {
        let [from, to] = key.split(",");
        from = from.replace(/,/g, ''); // Ensure node names have no commas
        to = to.replace(/,/g, '');
        if (from === to) continue; // Skip self-transitions
        mermaidData += `${from},${to},${value}\n`;
    }

    // Render the chart using Mermaid.js
    const container = document.getElementById("diagramContainer"); // Assuming you have a div with this id
    if (container) {
        const element = document.createElement('pre');
        element.classList.add('mermaid');
        element.textContent = mermaidData;
        container.innerHTML = ''; // Clear previous content
        container.appendChild(element);
        // mermaid.run({ nodes: [element] });
    } else {
        console.error("Container for Sankey diagram not found.");
    }
}