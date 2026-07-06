const token = localStorage.getItem("token");

if (!token) {
    window.location = "login.html";
}

fetch("https://ai-visibility-analyzer.onrender.com/profile", {

    headers: {

        Authorization: `Bearer ${token}`

    }

})
.then(res => res.json())
.then(data => {

    document.getElementById("profile-card").innerHTML = `

        <div class="user-card">

            <img src="${data.user.picture}" width="120">

            <h2>${data.user.name}</h2>

            <p>${data.user.email}</p>

            <p>User ID : ${data.user.id}</p>

            <p>Status : Active</p>

        </div>

    `;

});

function logout(){

    localStorage.removeItem("token");

    window.location="login.html";

}