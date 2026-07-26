// =========================================
// AI Visibility Analyzer Dashboard
// =========================================

// Backend API URL
const API_URL = "https://ai-visibility-analyzer.onrender.com";

// =========================================
// Authentication
// =========================================

const params = new URLSearchParams(window.location.search);

let token = params.get("token");

if (token) {
    localStorage.setItem("token", token);

    window.history.replaceState(
        {},
        document.title,
        "dashboard.html"
    );
} else {
    token = localStorage.getItem("token");
}

if (!token) {
    window.location.href = "login.html";
}

// =========================================
// Load Logged-in User
// =========================================

async function loadProfile() {

    try {

        const response = await fetch(
            `${API_URL}/profile`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Unauthorized");
        }

        const data = await response.json();

        const card = document.getElementById("profile-card");

        if (card) {

            card.innerHTML = `

            <div class="user-card">

                <img
                    src="${data.user.picture}"
                    class="profile-image"
                    alt="Profile">

                <div class="user-info">

                    <h3>${data.user.name}</h3>

                    <p>${data.user.email}</p>

                </div>

            </div>

            `;

        }

    }

    catch (err) {

        console.error(err);

        localStorage.removeItem("token");

        window.location.href = "login.html";

    }

}

// =========================================
// Analyze Website
// =========================================

async function analyzeWebsite() {

    const website =
        document
            .getElementById("website")
            .value
            .trim();

    if (website === "") {

        alert("Please enter website URL.");

        return;

    }

    const results =
        document.getElementById("results");

    results.innerHTML = `

    <div class="card">

        <div class="loading-box">

            <div class="spinner"></div>

            <h2>Analyzing Website...</h2>

            <p>${website}</p>

            <p>Please wait while AI analyzes your website.</p>

        </div>

    </div>

    `;

    try {

        const response = await fetch(

            `${API_URL}/analyze`,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({

                    url: website

                })

            }

        );

        if (!response.ok) {

            throw new Error("Analysis failed");

        }

        const data = await response.json();

        console.log(data);

        showResults(data);

    }

    catch (err) {

        console.error(err);

        results.innerHTML = `

        <div class="card">

            <h2>Analysis Failed</h2>

            <p>${err.message}</p>

        </div>

        `;

    }

}

// =========================================
// Show Results
// =========================================

function showResults(data) {

    const results =
        document.getElementById("results");

    results.innerHTML = `

    <div class="card overall-card">

        <div class="overall-left">

            <h2>AI Visibility Score</h2>

            <h1>${data.overall_ai_visibility.overall_score}</h1>

            <span class="grade">

                ${data.overall_ai_visibility.grade}

            </span>

        </div>

        <div class="overall-right">

            <p>

                Overall AI readiness score for your website.

            </p>

        </div>

    </div>

    <div class="card">

        <h2>Website Screenshots</h2>

        <div class="screenshots">

            <div class="shot">

                <h3>Desktop</h3>

                <img
                    src="${API_URL}${data.screenshots.desktop}"
                    alt="Desktop Screenshot"
                    onclick="window.open(this.src)"
                >

            </div>

            <div class="shot">

                <h3>Mobile</h3>

                <img
                    src="${API_URL}${data.screenshots.mobile}"
                    alt="Mobile Screenshot"
                    onclick="window.open(this.src)"
                >

            </div>

        </div>

    </div>

    <div class="card">

        <h2>Technology Detection</h2>

        <div class="technology-grid">

            ${renderTechnologies(data.technologies)}

        </div>

    </div>

    <div class="card">

        <h2>Basic Information</h2>

        <table class="info-table">

            <tr>

                <td>Title</td>

                <td>${data.basic.title || "-"}</td>

            </tr>

            <tr>

                <td>Description</td>

                <td>${data.basic.meta_description || "-"}</td>

            </tr>

            <tr>

                <td>Language</td>

                <td>${data.basic.language || "-"}</td>

            </tr>

            <tr>

                <td>Canonical</td>

                <td>${data.basic.canonical || "-"}</td>

            </tr>

        </table>

    </div>

        <div class="card">

        <h2>AI Platform Scores</h2>

        <div class="score-grid">

            <div class="score-card">

                <h3>ChatGPT</h3>

                <h1>${data.chatgpt.score}</h1>

            </div>

            <div class="score-card">

                <h3>Gemini</h3>

                <h1>${data.gemini.score}</h1>

            </div>

            <div class="score-card">

                <h3>Claude</h3>

                <h1>${data.claude.score}</h1>

            </div>

            <div class="score-card">

                <h3>Perplexity</h3>

                <h1>${data.perplexity.score}</h1>

            </div>

        </div>

    </div>

    <div class="card">

        <h2>LLMs.txt</h2>

        <table class="info-table">

            <tr>

                <td>Status</td>

                <td>

                    ${data.llms.exists ? "✅ Found" : "❌ Not Found"}

                </td>

            </tr>

            <tr>

                <td>URL</td>

                <td>

                    ${data.llms.url || "-"}

                </td>

            </tr>

        </table>

    </div>

    <div class="card">

        <h2>E-E-A-T</h2>

        <table class="info-table">

            <tr>

                <td>Score</td>

                <td>${data.eeat.score}</td>

            </tr>

            <tr>

                <td>Author</td>

                <td>${data.eeat.author}</td>

            </tr>

            <tr>

                <td>About Page</td>

                <td>${data.eeat.about}</td>

            </tr>

            <tr>

                <td>Contact Page</td>

                <td>${data.eeat.contact}</td>

            </tr>

        </table>

    </div>

    <div class="card">

        <h2>Entities</h2>

        <p>

            <strong>Total Entities :</strong>

            ${data.entities.count}

        </p>

        <h3>Organizations</h3>

        <ul>

            ${data.entities.organizations
                .map(org => `<li>${org}</li>`)
                .join("")}

        </ul>

    </div>

    <div class="card">

        <h2>Recommendations</h2>

        <ul>

            ${data.recommendations
                .map(item => `<li>${item}</li>`)
                .join("")}

        </ul>

    </div>

    `;

}

// =========================================
// Render Technology Cards
// =========================================

function renderTechnologies(technologies) {

    if (!technologies || technologies.length === 0) {

        return `

            <p>No technologies detected.</p>

        `;

    }

    return technologies.map(tech => `

        <div class="technology-card">

            <h3>${tech.name}</h3>

            <p>

                ${tech.category || "Technology"}

            </p>

            <span>

                ${tech.confidence || 100}%

            </span>

        </div>

    `).join("");

}
// =========================================
// Format Score Badge
// =========================================

function getScoreBadge(score) {

    score = Number(score);

    if (score >= 90) {

        return "excellent";

    }

    if (score >= 75) {

        return "good";

    }

    if (score >= 50) {

        return "average";

    }

    return "poor";

}

// =========================================
// Format Boolean
// =========================================

function formatBoolean(value) {

    return value ? "✅ Yes" : "❌ No";

}

// =========================================
// Show Notification
// =========================================

function showNotification(message, type = "success") {

    const notification = document.createElement("div");

    notification.className = `notification ${type}`;

    notification.innerHTML = message;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.classList.add("show");

    }, 100);

    setTimeout(() => {

        notification.classList.remove("show");

        setTimeout(() => {

            notification.remove();

        }, 300);

    }, 3000);

}

// =========================================
// Reset Dashboard
// =========================================

function resetDashboard() {

    document.getElementById("website").value = "";

    document.getElementById("results").innerHTML = "";

}

// =========================================
// Logout
// =========================================

function logout() {

    localStorage.removeItem("token");

    window.location.href = "login.html";

}

// =========================================
// Enter Key Support
// =========================================

const websiteInput = document.getElementById("website");

if (websiteInput) {

    websiteInput.addEventListener("keypress", function(event) {

        if (event.key === "Enter") {

            analyzeWebsite();

        }

    });

}

// =========================================
// Page Initialization
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    loadProfile();

    console.log("AI Visibility Analyzer Dashboard Loaded");

});