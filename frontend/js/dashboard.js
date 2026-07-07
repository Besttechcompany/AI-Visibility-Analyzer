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

function analyzeWebsite() {

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

            <p>Please wait while we analyze AI visibility.</p>

        </div>

    `;

    // TODO:
    // Later you'll call your FastAPI endpoint here

    /*
    fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            website: website
        })
    })
    */

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