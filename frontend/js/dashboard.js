// =======================================
// AI Visibility Analyzer Dashboard
// =======================================

// Get token from URL
const params = new URLSearchParams(window.location.search);

let token = params.get("token");

// Save token in localStorage
if (token) {

    localStorage.setItem("token", token);

    // Remove token from URL
    window.history.replaceState({}, document.title, "dashboard.html");

} else {

    token = localStorage.getItem("token");

}

// No token -> Login
if (!token) {

    window.location.href = "login.html";

}

// Load Profile
fetch("https://ai-visibility-analyzer.onrender.com/profile", {

    method: "GET",

    headers: {

        "Authorization": `Bearer ${token}`

    }

})

.then(async (response) => {

    if (!response.ok) {

        throw new Error(`HTTP ${response.status}`);

    }

    return response.json();

})

.then((data) => {

    console.log("Profile Loaded:", data);

    const profileCard = document.getElementById("profile-card");

    // If profile placeholder exists
    if (profileCard && data.user) {

        profileCard.innerHTML = `
            <div class="user-card">

                <img src="${data.user.picture}" alt="Profile">

                <h2>${data.user.name}</h2>

                <p>${data.user.email}</p>

            </div>
        `;

    }

})

.catch((error) => {

    console.error("Profile Error:", error);

    alert("Unable to load profile.");

    // Remove invalid token
    localStorage.removeItem("token");

    window.location.href = "login.html";

});

// Logout
function logout() {

    localStorage.removeItem("token");

    window.location.href = "login.html";

}