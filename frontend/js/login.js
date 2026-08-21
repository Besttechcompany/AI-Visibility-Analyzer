// ======================================================
// AI VISIBILITY ANALYZER
// FRONTEND AUTHENTICATION
// ======================================================


// ======================================================
// BACKEND API
// ======================================================

const API_URL =
    "https://ai-visibility-analyzer.onrender.com";


// ======================================================
// DOM ELEMENTS
// ======================================================

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const loginTab =
    document.getElementById("loginTab");

const registerTab =
    document.getElementById("registerTab");

const message =
    document.getElementById("message");


// ======================================================
// SHOW LOGIN
// ======================================================

function showLogin() {

    loginForm.classList.remove("hidden");

    registerForm.classList.add("hidden");

    loginTab.classList.add("active");

    registerTab.classList.remove("active");

    clearMessage();
}


// ======================================================
// SHOW REGISTER
// ======================================================

function showRegister() {

    loginForm.classList.add("hidden");

    registerForm.classList.remove("hidden");

    loginTab.classList.remove("active");

    registerTab.classList.add("active");

    clearMessage();
}


// ======================================================
// MESSAGE
// ======================================================

function showMessage(
    text,
    type = "error"
) {

    message.textContent = text;

    message.className =
        "message " + type;
}


function clearMessage() {

    message.textContent = "";

    message.className =
        "message";
}


// ======================================================
// LOGIN
// ======================================================

loginForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        clearMessage();


        const email =
            document.getElementById(
                "loginEmail"
            ).value.trim();


        const password =
            document.getElementById(
                "loginPassword"
            ).value;


        if (!email || !password) {

            showMessage(
                "Please enter email and password."
            );

            return;
        }


        const button =
            loginForm.querySelector(
                "button[type='submit']"
            );


        button.disabled = true;

        button.textContent =
            "Logging in...";


        try {

            const response =
                await fetch(
                    `${API_URL}/login`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            email:
                                email,

                            password:
                                password

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(

                    data.detail ||
                    data.message ||
                    "Login failed."

                );

            }


            // =========================================
            // SAVE JWT
            // =========================================

            if (!data.access_token) {

                throw new Error(
                    "Login succeeded but no access token was returned."
                );

            }


            localStorage.setItem(
                "access_token",
                data.access_token
            );


            console.log(
                "Login successful."
            );


            showMessage(
                "Login successful. Redirecting...",
                "success"
            );


            // =========================================
            // DASHBOARD
            // =========================================

            setTimeout(
                function() {

                    window.location.href =
                        "dashboard.html";

                },
                500
            );


        }

        catch(error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            showMessage(
                error.message ||
                "Unable to login."
            );

        }

        finally {

            button.disabled = false;

            button.textContent =
                "Login";

        }

    }
);


// ======================================================
// REGISTER
// ======================================================

registerForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        clearMessage();


        const name =
            document.getElementById(
                "registerName"
            ).value.trim();


        const email =
            document.getElementById(
                "registerEmail"
            ).value.trim();


        const password =
            document.getElementById(
                "registerPassword"
            ).value;


        if (
            !name ||
            !email ||
            !password
        ) {

            showMessage(
                "Please complete all fields."
            );

            return;
        }


        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters."
            );

            return;
        }


        const button =
            registerForm.querySelector(
                "button[type='submit']"
            );


        button.disabled = true;

        button.textContent =
            "Creating Account...";


        try {

            const response =
                await fetch(
                    `${API_URL}/register`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            name:
                                name,

                            email:
                                email,

                            password:
                                password

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(

                    data.detail ||
                    data.message ||
                    "Registration failed."

                );

            }


            // =========================================
            // REGISTRATION SUCCESS
            // =========================================

            if (!data.access_token) {

                throw new Error(
                    "Registration succeeded but no access token was returned."
                );

            }


            localStorage.setItem(
                "access_token",
                data.access_token
            );


            console.log(
                "Registration successful."
            );


            showMessage(
                "Account created successfully. Redirecting...",
                "success"
            );


            setTimeout(
                function() {

                    window.location.href =
                        "dashboard.html";

                },
                500
            );


        }

        catch(error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );


            showMessage(
                error.message ||
                "Unable to create account."
            );

        }

        finally {

            button.disabled = false;

            button.textContent =
                "Create Account";

        }

    }
);


// ======================================================
// GOOGLE LOGIN
// ======================================================

function googleLogin() {

    console.log(
        "Starting Google Login..."
    );


    window.location.href =
        `${API_URL}/google/login`;

}