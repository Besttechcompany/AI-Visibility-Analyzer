// ======================================================
// AI VISIBILITY ANALYZER
// LOGIN + REGISTER
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

const loginButton =
    document.getElementById("loginButton");

const registerButton =
    document.getElementById("registerButton");

const googleButton =
    document.getElementById("googleButton");

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
// TAB EVENTS
// ======================================================

loginTab.addEventListener(
    "click",
    showLogin
);


registerTab.addEventListener(
    "click",
    showRegister
);


// ======================================================
// MESSAGE
// ======================================================

function showMessage(
    text,
    type = "error"
) {

    message.innerHTML = "";

    message.className =
        "message " + type;

    const textElement =
        document.createElement("span");

    textElement.textContent =
        text;

    message.appendChild(
        textElement
    );

}


function clearMessage() {

    message.innerHTML = "";

    message.className =
        "message";

}


// ======================================================
// SMALL LOADER
// ======================================================

function addLoader() {

    const loader =
        document.createElement("span");

    loader.className =
        "small-loader";

    loader.setAttribute(
        "aria-label",
        "Loading"
    );

    message.appendChild(
        loader
    );

}


// ======================================================
// GET API ERROR
// ======================================================

async function getErrorMessage(
    response
) {

    try {

        const data =
            await response.json();

        if (
            data &&
            data.detail
        ) {

            if (
                Array.isArray(
                    data.detail
                )
            ) {

                return data.detail
                    .map(
                        item =>
                            item.msg ||
                            "Invalid request."
                    )
                    .join(", ");

            }

            return data.detail;

        }

        if (
            data &&
            data.message
        ) {

            return data.message;

        }

    }

    catch(error) {

        console.error(
            "ERROR READING API RESPONSE:",
            error
        );

    }


    return "Something went wrong. Please try again.";

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
            document
                .getElementById("loginEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("loginPassword")
                .value;


        if (
            !email ||
            !password
        ) {

            showMessage(
                "Please enter email and password."
            );

            return;

        }


        loginButton.disabled =
            true;

        loginButton.innerHTML =
            `
            <span class="button-loader"></span>
            Logging in...
            `;


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

                        body:
                            JSON.stringify({

                                email:
                                    email,

                                password:
                                    password

                            })

                    }
                );


            if (
                !response.ok
            ) {

                const errorMessage =
                    await getErrorMessage(
                        response
                    );

                throw new Error(
                    errorMessage
                );

            }


            const data =
                await response.json();


            // =========================================
            // VERIFY JWT
            // =========================================

            if (
                !data.access_token
            ) {

                throw new Error(
                    "Login succeeded, but the server did not return an access token."
                );

            }


            // =========================================
            // SAVE JWT
            // =========================================

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


            addLoader();


            // =========================================
            // GO TO DASHBOARD
            // =========================================

            setTimeout(
                function() {

                    window.location.href =
                        "dashboard.html";

                },
                1000
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

            loginButton.disabled =
                false;

            loginButton.textContent =
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
            document
                .getElementById("registerName")
                .value
                .trim();


        const email =
            document
                .getElementById("registerEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("registerPassword")
                .value;


        // =========================================
        // VALIDATION
        // =========================================

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


        if (
            password.length < 6
        ) {

            showMessage(
                "Password must contain at least 6 characters."
            );

            return;

        }


        registerButton.disabled =
            true;

        registerButton.innerHTML =
            `
            <span class="button-loader"></span>
            Creating Account...
            `;


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

                        body:
                            JSON.stringify({

                                name:
                                    name,

                                email:
                                    email,

                                password:
                                    password

                            })

                    }
                );


            // =========================================
            // HANDLE ERROR
            // =========================================

            if (
                !response.ok
            ) {

                const errorMessage =
                    await getErrorMessage(
                        response
                    );

                throw new Error(
                    errorMessage
                );

            }


            const data =
                await response.json();


            console.log(
                "Registration successful.",
                data
            );


            // =========================================
            // IMPORTANT
            // =========================================
            //
            // DO NOT SAVE JWT HERE.
            //
            // Registration does NOT automatically
            // log the user into the dashboard.
            //
            // The user must login separately.
            // =========================================


            showMessage(
                "Account created successfully. Redirecting to Login...",
                "success"
            );


            addLoader();


            // =========================================
            // REDIRECT TO LOGIN PAGE
            // =========================================

            setTimeout(
                function() {

                    window.location.href =
                        "login.html";

                },
                1500
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

            registerButton.disabled =
                false;

            registerButton.textContent =
                "Create Account";

        }

    }
);


// ======================================================
// GOOGLE LOGIN
// ======================================================

googleButton.addEventListener(
    "click",
    function() {

        console.log(
            "Starting Google Login..."
        );


        googleButton.disabled =
            true;


        googleButton.innerHTML =
            `
            <span class="button-loader"></span>
            Connecting to Google...
            `;


        // =========================================
        // GOOGLE OAUTH
        // =========================================

        window.location.href =
            `${API_URL}/google/login`;

    }
);


// ======================================================
// INITIAL STATE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        showLogin();

    }
);