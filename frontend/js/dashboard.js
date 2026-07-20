// =======================================
// AI Visibility Analyzer Dashboard
// =======================================

// Backend API URL
const API_URL = "https://ai-visibility-analyzer.onrender.com";

// =======================================
// Get JWT Token
// =======================================

const params = new URLSearchParams(window.location.search);

let token = params.get("token");

// Save token if received from Google login
if (token) {

    localStorage.setItem("token", token);

    // Remove token from URL
    window.history.replaceState({}, document.title, "dashboard.html");

} else {

    token = localStorage.getItem("token");

}

// Redirect if token doesn't exist
if (!token) {

    window.location.replace("login.html");

}

// =======================================
// Load Logged-in User Profile
// =======================================

async function loadProfile() {

    try {

        const response = await fetch(`${API_URL}/profile`, {

            method: "GET",

            headers: {

                "Authorization": `Bearer ${token}`

            }

        });

        if (!response.ok) {

            throw new Error("Unauthorized");

        }

        const data = await response.json();

        console.log("Profile Loaded:", data);

        if (!data.user) {

            throw new Error("User not found");

        }

        const profileCard = document.getElementById("profile-card");

        if (profileCard) {

            profileCard.innerHTML = `

                <div class="user-card">

                    <img src="${data.user.picture}" alt="${data.user.name}" class="profile-image">

                    <div class="user-info">

                        <h3>${data.user.name}</h3>

                        <p>${data.user.email}</p>

                    </div>

                </div>

            `;

        }

    }

    catch (error) {

        console.error("Profile Error:", error);

        localStorage.removeItem("token");

        window.location.replace("login.html");

    }

}

// =======================================
// Analyze Website
// =======================================

async function analyzeWebsite() {

    const website = document.getElementById("website").value.trim();

    if (website === "") {

        alert("Please enter a website URL.");

        return;

    }

    const results = document.getElementById("results");

   results.innerHTML = `
<div class="loading-card">

    <h2>🔍 Analyzing Website</h2>

    <h3>${website}</h3>

    <div class="progress-container">

        <div id="progressBar" class="progress-bar"></div>

    </div>

    <h2 id="progressPercent">0%</h2>

    <p id="progressText">
        Initializing Analysis...
    </p>

</div>
`;

// Start Progress Animation

let progress = 0;

let apiFinished = false;

const stages = [

    { value:5, text:"Initializing Analysis..." },

    { value:15, text:"Connecting to Website..." },

    { value:30, text:"Fetching HTML..." },

    { value:45, text:"Analyzing Technical SEO..." },

    { value:60, text:"Checking Metadata..." },

    { value:75, text:"Analyzing AI Visibility..." },

    { value:90, text:"Generating Recommendations..." }

];

const timer = setInterval(() => {

if (apiFinished) {

    if (progress < 100) {

        progress++;

        document.getElementById("progressText").innerHTML =
            "Preparing Final Report...";

    }

} else {

    if (progress < 90) {

        progress++;

    }

}

    document.getElementById("progressBar").style.width = progress + "%";

    document.getElementById("progressPercent").innerHTML = progress + "%";

 if (!apiFinished) {

    for (const stage of stages) {

        if (progress >= stage.value) {

            document.getElementById("progressText").innerHTML = stage.text;

        }

    }

}

    if(progress >=100){

        clearInterval(timer);

    }

},80);

    try {

        const response = await fetch(`${API_URL}/analyze`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json",

                "Authorization": `Bearer ${token}`

            },

            body: JSON.stringify({

                url: website

            })

        });

     const data = await response.json();

console.log(data);

// Tell the progress animation that the API has finished
apiFinished = true;

// Wait until the progress bar reaches 100%
while (progress < 100) {
    await new Promise(resolve => setTimeout(resolve, 30));
}

// Now display the report
showResults(data);

    }

    catch (error) {

        console.log(error);

        results.innerHTML = `

            <div class="error">

                Failed to analyze website.

            </div>

        `;

    }

}

function showResults(data) {

    const results = document.getElementById("results");

    results.innerHTML = `

<div class="results-grid">

    <div class="card score-card">

        <h2>Overall AI Visibility</h2>

        <div class="score">
            ${data.overall_ai_visibility.overall_score}
        </div>

        <h3>
            Grade ${data.overall_ai_visibility.grade}
        </h3>

    </div>

    <div class="card">

        <h2>Basic Information</h2>

        <p><b>Title</b><br>${data.basic.title}</p>

        <p><b>Description</b><br>${data.basic.meta_description}</p>

        <p><b>Language</b> : ${data.basic.language}</p>

        <p><b>Canonical</b> : ${data.basic.canonical}</p>

    </div>

    <div class="ai-grid">

        <div class="ai-card">

            <h3>LLMs.txt</h3>

            <h2>${data.llms.exists ? "✅" : "❌"}</h2>

            <p>${data.llms.exists ? "Found" : "Not Found"}</p>

        </div>

        <div class="ai-card">

            <h3>ChatGPT</h3>

            <h2>${data.chatgpt.score}</h2>

            <p>Score</p>

        </div>

        <div class="ai-card">

            <h3>Gemini</h3>

            <h2>${data.gemini.score}</h2>

            <p>Score</p>

        </div>

        <div class="ai-card">

            <h3>Claude</h3>

            <h2>${data.claude.score}</h2>

            <p>Score</p>

        </div>

        <div class="ai-card">

            <h3>Perplexity</h3>

            <h2>${data.perplexity.score}</h2>

            <p>Score</p>

        </div>

    </div>

    <div class="card">

        <h2>E-E-A-T</h2>

        <table class="report-table">

            <tr>
                <td>Score</td>
                <td>${data.eeat.score}</td>
            </tr>

            <tr>
                <td>Author</td>
                <td>${data.eeat.author ? "✅" : "❌"}</td>
            </tr>

            <tr>
                <td>About</td>
                <td>${data.eeat.about ? "✅" : "❌"}</td>
            </tr>

            <tr>
                <td>Contact</td>
                <td>${data.eeat.contact ? "✅" : "❌"}</td>
            </tr>

            <tr>
                <td>Privacy</td>
                <td>${data.eeat.privacy ? "✅" : "❌"}</td>
            </tr>

            <tr>
                <td>Terms</td>
                <td>${data.eeat.terms ? "✅" : "❌"}</td>
            </tr>

        </table>

    </div>

    <div class="card">

        <h2>Entities</h2>

        <p><b>Total :</b> ${data.entities.count}</p>

        <h3>Organizations</h3>

        <ul>

        ${data.entities.organizations.map(x=>`<li>${x}</li>`).join("")}

        </ul>

        <h3>Topics</h3>

        <ul>

        ${data.entities.topics.map(x=>`<li>${x}</li>`).join("")}

        </ul>

    </div>

    <div class="card recommendation-card">

        <h2>Recommendations</h2>

        <ul>

        ${data.recommendations.map(x=>`<li>${x}</li>`).join("")}

        </ul>

    </div>

</div>

`;

}

// =======================================
// Logout
// =======================================

function logout() {

    localStorage.removeItem("token");

    window.location.replace("login.html");

}

// =======================================
// Initialize Dashboard
// =======================================

document.addEventListener("DOMContentLoaded", () => {

    loadProfile();

});