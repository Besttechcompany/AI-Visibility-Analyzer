// ======================================================
// AI VISIBILITY ANALYZER
// REGISTER
// ======================================================


// ======================================================
// BACKEND API
// ======================================================

const API_URL =
    "https://ai-visibility-analyzer.onrender.com";


// ======================================================
// DOM
// ======================================================

const registerForm =
    document.getElementById("registerForm");

const registerButton =
    document.getElementById("registerButton");

const buttonText =
    document.getElementById("buttonText");

const loader =
    document.getElementById("loader");

const message =
    document.getElementById("message");



// ======================================================
// MESSAGE
// ======================================================

function showMessage(text, type = "error") {

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
// PASSWORD SHOW / HIDE
// ======================================================

function togglePassword() {

    const password =
        document.getElementById("registerPassword");

    if (password.type === "password") {

        password.type = "text";

    } else {

        password.type = "password";

    }

}



// ======================================================
// REGISTER
// ======================================================

registerForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        clearMessage();


        // ==============================================
        // GET VALUES
        // ==============================================

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


        const terms =
            document
                .getElementById("terms")
                .checked;



        // ==============================================
        // VALIDATION
        // ==============================================

        if (!name) {

            showMessage(
                "Please enter your full name."
            );

            return;

        }


        if (!email) {

            showMessage(
                "Please enter your email address."
            );

            return;

        }


        if (!password) {

            showMessage(
                "Please enter a password."
            );

            return;

        }


        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters."
            );

            return;

        }


        if (!terms) {

            showMessage(
                "Please accept the Terms of Service and Privacy Policy."
            );

            return;

        }



        // ==============================================
        // LOADING
        // ==============================================

        registerButton.disabled = true;

        loader.style.display =
            "inline-block";

        buttonText.textContent =
            "Creating Account...";



        // ==============================================
        // API REQUEST
        // ==============================================

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



            // ==========================================
            // READ RESPONSE
            // ==========================================

            let data;

            try {

                data =
                    await response.json();

            } catch {

                throw new Error(
                    "Invalid response received from server."
                );

            }



            console.log(
                "REGISTER RESPONSE:",
                data
            );



            // ==========================================
            // ERROR
            // ==========================================

            if (!response.ok) {

                let errorMessage =
                    "Registration failed.";


                if (data.detail) {

                    if (Array.isArray(data.detail)) {

                        errorMessage =
                            data.detail
                                .map(
                                    error =>
                                        error.msg
                                )
                                .join(", ");

                    } else {

                        errorMessage =
                            data.detail;

                    }

                } else if (data.message) {

                    errorMessage =
                        data.message;

                }


                throw new Error(
                    errorMessage
                );

            }



            // ==========================================
            // ACCESS TOKEN
            // ==========================================

            if (!data.access_token) {

                throw new Error(
                    "Account was created, but the server did not return an access token."
                );

            }



            // ==========================================
            // SAVE TOKEN
            // ==========================================

            localStorage.setItem(
                "access_token",
                data.access_token
            );



            // Optional user information

            if (data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

            }



            // ==========================================
            // SUCCESS
            // ==========================================

            showMessage(
                "Account created successfully. Redirecting...",
                "success"
            );



            // ==========================================
            // REDIRECT
            // ==========================================

            setTimeout(
                function() {

                    window.location.href =
                        "dashboard.html";

                },
                800
            );


        }


        catch(error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );


            showMessage(
                error.message ||
                "Unable to create account. Please try again."
            );

        }


        finally {

            registerButton.disabled =
                false;

            loader.style.display =
                "none";

            buttonText.textContent =
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