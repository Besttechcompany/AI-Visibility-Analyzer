// ======================================================
// AI VISIBILITY ANALYZER
// LOGIN + REGISTRATION
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

const loginPassword =
    document.getElementById("loginPassword");

const loginPasswordToggle =
    document.getElementById(
        "loginPasswordToggle"
    );

const registerPassword =
    document.getElementById(
        "registerPassword"
    );

const registerPasswordToggle =
    document.getElementById(
        "registerPasswordToggle"
    );

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
// POPUP
// ======================================================

function createPopup() {

    let popup =
        document.getElementById(
            "authPopup"
        );

    if (popup) {
        return popup;
    }

    popup =
        document.createElement("div");

    popup.id =
        "authPopup";

    popup.className =
        "auth-popup-overlay";

    popup.innerHTML = `

        <div
            class="auth-popup"
            role="alertdialog"
            aria-modal="true"
        >

            <div
                id="popupIcon"
                class="popup-icon"
            >
                ⚠️
            </div>

            <h3
                id="popupTitle"
            >
                Error
            </h3>

            <p
                id="popupText"
            ></p>

            <button
                type="button"
                id="popupClose"
                class="popup-close-btn"
            >
                OK
            </button>

        </div>

    `;

    document.body.appendChild(
        popup
    );

    document
        .getElementById("popupClose")
        .addEventListener(
            "click",
            closePopup
        );

    popup.addEventListener(
        "click",
        function(event) {

            if (
                event.target === popup
            ) {
                closePopup();
            }

        }
    );

    return popup;
}


function showPopup(
    text,
    type = "error"
) {

    const popup =
        createPopup();

    const title =
        document.getElementById(
            "popupTitle"
        );

    const popupText =
        document.getElementById(
            "popupText"
        );

    const icon =
        document.getElementById(
            "popupIcon"
        );

    if (
        type === "success"
    ) {

        title.textContent =
            "Success";

        icon.textContent =
            "✓";

        icon.className =
            "popup-icon success";

    } else {

        title.textContent =
            "Something went wrong";

        icon.textContent =
            "⚠️";

        icon.className =
            "popup-icon error";

    }

    popupText.textContent =
        text;

    popup.classList.add(
        "show"
    );

    document.body.classList.add(
        "popup-open"
    );

}


function closePopup() {

    const popup =
        document.getElementById(
            "authPopup"
        );

    if (!popup) {
        return;
    }

    popup.classList.remove(
        "show"
    );

    document.body.classList.remove(
        "popup-open"
    );

}


// ======================================================
// OLD MESSAGE AREA
// ======================================================

function clearMessage() {

    if (!message) {
        return;
    }

    message.textContent = "";

    message.className =
        "message hidden";
}


function showMessage(
    text,
    type = "error"
) {

    /*
     * IMPORTANT:
     * Do not display errors at the bottom.
     * Everything is now shown in a popup.
     */

    showPopup(
        text,
        type
    );

    clearMessage();
}


// ======================================================
// SHOW LOGIN
// ======================================================

function showLogin() {

    loginForm.classList.remove(
        "hidden"
    );

    registerForm.classList.add(
        "hidden"
    );

    loginTab.classList.add(
        "active"
    );

    registerTab.classList.remove(
        "active"
    );

    clearMessage();
}


// ======================================================
// SHOW REGISTER
// ======================================================

function showRegister() {

    loginForm.classList.add(
        "hidden"
    );

    registerForm.classList.remove(
        "hidden"
    );

    loginTab.classList.remove(
        "active"
    );

    registerTab.classList.add(
        "active"
    );

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
// PASSWORD SHOW / HIDE
// ======================================================

function togglePassword(
    input,
    button
) {

    if (
        input.type === "password"
    ) {

        input.type =
            "text";

        button.textContent =
            "🙈";

        button.setAttribute(
            "aria-label",
            "Hide password"
        );

    } else {

        input.type =
            "password";

        button.textContent =
            "👁";

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

function validatePassword(
    password
) {

    const length =
        password.length >= 8;

    const upper =
        /[A-Z]/.test(
            password
        );

    const lower =
        /[a-z]/.test(
            password
        );

    const number =
        /[0-9]/.test(
            password
        );

    const special =
        /[^A-Za-z0-9]/.test(
            password
        );

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
// PASSWORD RULE UI
// ======================================================

function updateRule(
    element,
    valid
) {

    if (!element) {
        return;
    }

    const span =
        element.querySelector(
            "span"
        );

    if (valid) {

        element.classList.add(
            "valid"
        );

        if (span) {
            span.textContent =
                "✓";
        }

    } else {

        element.classList.remove(
            "valid"
        );

        if (span) {
            span.textContent =
                "○";
        }

    }

}


// ======================================================
// PASSWORD INPUT
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
// LOGIN LOADER
// ======================================================

function startLoginLoader() {

    const button =
        document.getElementById(
            "loginButton"
        );

    const loader =
        document.getElementById(
            "loginLoader"
        );

    const text =
        button?.querySelector(
            ".button-text"
        );

    if (button) {
        button.disabled =
            true;
    }

    if (text) {
        text.textContent =
            "Logging in...";
    }

    if (loader) {
        loader.classList.remove(
            "hidden"
        );
    }

}


function stopLoginLoader() {

    const button =
        document.getElementById(
            "loginButton"
        );

    const loader =
        document.getElementById(
            "loginLoader"
        );

    const text =
        button?.querySelector(
            ".button-text"
        );

    if (button) {
        button.disabled =
            false;
    }

    if (text) {
        text.textContent =
            "Login";
    }

    if (loader) {
        loader.classList.add(
            "hidden"
        );
    }

}


// ======================================================
// REGISTER LOADER
// ======================================================

function startRegisterLoader() {

    const button =
        document.getElementById(
            "registerButton"
        );

    const loader =
        document.getElementById(
            "registerLoader"
        );

    const text =
        button?.querySelector(
            ".button-text"
        );

    if (button) {
        button.disabled =
            true;
    }

    if (text) {
        text.textContent =
            "Creating Account...";
    }

    if (loader) {
        loader.classList.remove(
            "hidden"
        );
    }

}


function stopRegisterLoader() {

    const button =
        document.getElementById(
            "registerButton"
        );

    const loader =
        document.getElementById(
            "registerLoader"
        );

    const text =
        button?.querySelector(
            ".button-text"
        );

    if (button) {
        button.disabled =
            false;
    }

    if (text) {
        text.textContent =
            "Create Account";
    }

    if (loader) {
        loader.classList.add(
            "hidden"
        );
    }

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
            loginPassword.value;

        if (
            !email ||
            !password
        ) {

            showPopup(
                "Please enter your email and password.",
                "error"
            );

            return;
        }

        startLoginLoader();

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

            } catch (_) {

                data = {};

            }

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Invalid email or password."
                );

            }

            if (
                !data.access_token
            ) {

                throw new Error(
                    "Login succeeded, but no access token was returned."
                );

            }

            localStorage.setItem(
                "access_token",
                data.access_token
            );

            /*
             * Successful login.
             */

            showPopup(
                "Login successful. Redirecting to your dashboard...",
                "success"
            );

            setTimeout(
                function() {

                    window.location.href =
                        "dashboard.html";

                },
                900
            );

        }

        catch(error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            showPopup(
                error.message ||
                "Unable to login. Please try again.",
                "error"
            );

            stopLoginLoader();

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

        if (
            !name ||
            !email ||
            !password
        ) {

            showPopup(
                "Please complete all fields.",
                "error"
            );

            return;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailPattern.test(
                email
            )
        ) {

            showPopup(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }

        const passwordResult =
            validatePassword(
                password
            );

        if (
            !passwordResult.valid
        ) {

            showPopup(
                "Please create a stronger password using all the password rules shown above.",
                "error"
            );

            return;
        }

        startRegisterLoader();

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

            } catch (_) {

                data = {};

            }

            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    data.message ||
                    "Registration failed."
                );

            }

            /*
             * Registration successful.
             */

            showPopup(
                "Your account has been created successfully. Please login.",
                "success"
            );

            document.getElementById(
                "registerName"
            ).value = "";

            document.getElementById(
                "registerEmail"
            ).value = "";

            registerPassword.value = "";

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

            stopRegisterLoader();

            setTimeout(
                function() {

                    closePopup();

                    showLogin();

                    document.getElementById(
                        "loginEmail"
                    ).value =
                        email;

                    document.getElementById(
                        "loginPassword"
                    ).focus();

                    showPopup(
                        "Registration successful. Please login with your new account.",
                        "success"
                    );

                },
                1300
            );

        }

        catch(error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );

            showPopup(
                error.message ||
                "Unable to create your account.",
                "error"
            );

            stopRegisterLoader();

        }

    }
);


// ======================================================
// GOOGLE LOGIN
// ======================================================

googleButton.addEventListener(
    "click",
    function() {

        googleButton.disabled =
            true;

        googleButton.innerHTML = `

            <span
                class="small-loader"
            ></span>

            <span>
                Connecting to Google...
            </span>

        `;

        /*
         * Redirect to FastAPI Google
         * authentication endpoint.
         */

        window.location.href =
            `${API_URL}/google/login`;

    }
);


// ======================================================
// INITIAL STATE
// ======================================================

clearMessage();

console.log(
    "AI Visibility Analyzer login.js loaded."
);