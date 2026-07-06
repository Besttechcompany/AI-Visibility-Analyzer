// Read token from URL or localStorage
const params = new URLSearchParams(window.location.search);

let token = params.get("token");

if (token) {
    localStorage.setItem("token", token);
} else {
    token = localStorage.getItem("token");
}

if (!token) {
    window.location = "login.html";
}

// Load logged-in user
fetch("https://ai-visibility-analyzer.onrender.com/profile", {
    headers: {
        Authorization: `Bearer ${token}`
    }
})
.then(response => response.json())
.then(data => {

    if (data.user) {

        document.getElementById("profile-card").innerHTML = `
            <div class="user-card">

                <img src="${data.user.picture}" alt="Profile">

                <h2>${data.user.name}</h2>

                <p>${data.user.email}</p>

            </div>
        `;

    } else {

        window.location = "login.html";

    }

})
.catch(() => {
    window.location = "login.html";
});

function logout() {

    localStorage.removeItem("token");

    window.location = "login.html";

}