// ======================================================
// AI VISIBILITY ANALYZER
// LOGIN + REGISTRATION
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

const googleButton =
    document.getElementById("googleButton");

const message =
    document.getElementById("message");


// Login password

const loginPassword =
    document.getElementById("loginPassword");

const loginPasswordToggle =
    document.getElementById(
        "loginPasswordToggle"
    );


// Register password

const registerPassword =
    document.getElementById(
        "registerPassword"
    );

const registerPasswordToggle =
    document.getElementById(
        "registerPasswordToggle"
    );


// Password rules

const ruleLength =
    document.getElementById("ruleLength");

const ruleUpper =
    document.getElementById("ruleUpper");

const ruleLower =
    document.getElementById("ruleLower");

const ruleNumber =
    document.getElementById("ruleNumber");

const ruleSpecial =
    document.getElementById("ruleSpecial");


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

function togglePassword(
    input,
    button
) {

    if (
        input.type === "password"
    ) {

        input.type = "text";

        button.textContent = "🙈";

        button.setAttribute(
            "aria-label",
            "Hide password"
        );

    } else {

        input.type = "password";

        button.textContent = "👁";

        button.setAttribute(
            "aria-label",
            "Show password"
        );

    }

}


loginPasswordToggle.addEventListener(
    "click",
    function() {

        togglePassword(
            loginPassword,
            loginPasswordToggle
        );

    }
);


registerPasswordToggle.addEventListener(
    "click",
    function() {

        togglePassword(
            registerPassword,
            registerPasswordToggle
        );

    }
);


// ======================================================
// PASSWORD VALIDATION
// ======================================================

function validatePassword(password) {

    const length =
        password.length >= 8;

    const upper =
        /[A-Z]/.test(password);

    const lower =
        /[a-z]/.test(password);

    const number =
        /[0-9]/.test(password);

    const special =
        /[^A-Za-z0-9]/.test(password);


    return {

        length,
        upper,
        lower,
        number,
        special,

        valid:
            length &&
            upper &&
            lower &&
            number &&
            special

    };

}


// ======================================================
// UPDATE PASSWORD RULE UI
// ======================================================

function updateRule(
    element,
    valid
) {

    if (valid) {

        element.classList.add(
            "valid"
        );

        element.querySelector(
            "span"
        ).textContent = "✓";

    } else {

        element.classList.remove(
            "valid"
        );

        element.querySelector(
            "span"
        ).textContent = "○";

    }

}


// ======================================================
// PASSWORD INPUT EVENT
// ======================================================

registerPassword.addEventListener(
    "input",
    function() {

        const result =
            validatePassword(
                registerPassword.value
            );


        updateRule(
            ruleLength,
            result.length
        );


        updateRule(
            ruleUpper,
            result.upper
        );


        updateRule(
            ruleLower,
            result.lower
        );


        updateRule(
            ruleNumber,
            result.number
        );


        updateRule(
            ruleSpecial,
            result.special
        );

    }
);


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
            loginPassword.value;


        if (
            !email ||
            !password
        ) {

            showMessage(
                "Please enter your email and password."
            );

            return;

        }


        const button =
            document.getElementById(
                "loginButton"
            );

        const loader =
            document.getElementById(
                "loginLoader"
            );

        const buttonText =
            button.querySelector(
                ".button-text"
            );


        button.disabled = true;

        buttonText.textContent =
            "Logging in...";

        loader.classList.remove(
            "hidden"
        );


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


            let data = {};

            try {

                data =
                    await response.json();

            } catch {

                data = {};

            }


            if (!response.ok) {

                throw new Error(

                    data.detail ||
                    data.message ||
                    "Login failed."

                );

            }


            if (
                !data.access_token
            ) {

                throw new Error(
                    "Login succeeded but no access token was returned."
                );

            }


            // SAVE JWT

            localStorage.setItem(
                "access_token",
                data.access_token
            );


            showMessage(
                "Login successful. Redirecting...",
                "success"
            );


            // DASHBOARD

            setTimeout(
                function() {

                    window.location.href =
                        "dashboard.html";

                },
                700
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


            button.disabled = false;

            buttonText.textContent =
                "Login";

            loader.classList.add(
                "hidden"
            );

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
            registerPassword.value;


        // ===============================================
        // BASIC VALIDATION
        // ===============================================

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


        // ===============================================
        // PASSWORD VALIDATION
        // ===============================================

        const passwordResult =
            validatePassword(
                password
            );


        if (
            !passwordResult.valid
        ) {

            showMessage(
                "Please create a stronger password using all the rules shown above."
            );

            return;

        }


        // ===============================================
        // BUTTON LOADER
        // ===============================================

        const button =
            document.getElementById(
                "registerButton"
            );

        const loader =
            document.getElementById(
                "registerLoader"
            );

        const buttonText =
            button.querySelector(
                ".button-text"
            );


        button.disabled = true;

        buttonText.textContent =
            "Creating Account...";

        loader.classList.remove(
            "hidden"
        );


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


            let data = {};

            try {

                data =
                    await response.json();

            } catch {

                data = {};

            }


            if (!response.ok) {

                throw new Error(

                    data.detail ||
                    data.message ||
                    "Registration failed."

                );

            }


            // =========================================
            // IMPORTANT:
            // DO NOT SAVE JWT HERE
            // DO NOT GO TO DASHBOARD HERE
            // =========================================


            showMessage(
                "Account created successfully. Please login.",
                "success"
            );


            // Clear registration fields

            document.getElementById(
                "registerName"
            ).value = "";


            document.getElementById(
                "registerEmail"
            ).value = "";


            registerPassword.value = "";


            // Reset password rules

            updateRule(
                ruleLength,
                false
            );

            updateRule(
                ruleUpper,
                false
            );

            updateRule(
                ruleLower,
                false
            );

            updateRule(
                ruleNumber,
                false
            );

            updateRule(
                ruleSpecial,
                false
            );


            // =========================================
            // GO TO LOGIN
            // =========================================

            setTimeout(
                function() {

                    showLogin();

                    document.getElementById(
                        "loginEmail"
                    ).value = email;

                    document.getElementById(
                        "loginPassword"
                    ).focus();


                    showMessage(
                        "Registration successful. Please login.",
                        "success"
                    );

                },
                1000
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


            button.disabled = false;

            buttonText.textContent =
                "Create Account";

            loader.classList.add(
                "hidden"
            );

        }

    }
);


// ======================================================
// GOOGLE LOGIN
// ======================================================

googleButton.addEventListener(
    "click",
    function() {

        googleButton.disabled = true;

        googleButton.innerHTML = `

            <span class="small-loader"></span>

            <span>
                Connecting to Google...
            </span>

        `;


        window.location.href =
            `${API_URL}/google/login`;

    }
);