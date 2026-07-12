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

        <div class="loading">

            <h3>Analyzing Website...</h3>

            <p><strong>${website}</strong></p>

            <p>Please wait...</p>

        </div>

    `;

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

        <div class="card">

            <h2>Overall AI Visibility</h2>

            <h1>${data.overall_ai_visibility.overall_score}</h1>

            <h3>Grade : ${data.overall_ai_visibility.grade}</h3>

        </div>

        <div class="card">

            <h2>Basic Information</h2>

            <p><strong>Title:</strong> ${data.basic.title}</p>

            <p><strong>Description:</strong> ${data.basic.meta_description}</p>

            <p><strong>Language:</strong> ${data.basic.language}</p>

            <p><strong>Canonical:</strong> ${data.basic.canonical}</p>

        </div>

        <div class="card">

            <h2>LLMs.txt</h2>

            <p>${data.llms.exists ? "✅ Found" : "❌ Not Found"}</p>

        </div>

        <div class="card">

            <h2>ChatGPT</h2>

            <p>Score : ${data.chatgpt.score}</p>

        </div>

        <div class="card">

            <h2>Gemini</h2>

            <p>Score : ${data.gemini.score}</p>

        </div>

        <div class="card">

            <h2>Claude</h2>

            <p>Score : ${data.claude.score}</p>

        </div>

        <div class="card">

            <h2>Perplexity</h2>

            <p>Score : ${data.perplexity.score}</p>

        </div>

        <div class="card">

            <h2>E-E-A-T</h2>

            <p>Score : ${data.eeat.score}</p>

            <p>Author : ${data.eeat.author}</p>

            <p>About : ${data.eeat.about}</p>

            <p>Contact : ${data.eeat.contact}</p>

        </div>

        <div class="card">

            <h2>Entities</h2>

            <p>Total : ${data.entities.count}</p>

            <p><strong>Organizations</strong></p>

            <ul>

                ${data.entities.organizations.map(x=>`<li>${x}</li>`).join("")}

            </ul>

        </div>

        <div class="card">

            <h2>Recommendations</h2>

            <ul>

                ${data.recommendations.map(x=>`<li>${x}</li>`).join("")}

            </ul>

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