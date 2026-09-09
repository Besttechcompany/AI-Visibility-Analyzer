// ======================================================
// AI VISIBILITY ANALYZER
// FIREBASE LOGIN + REGISTRATION
// ======================================================

import {
    auth,
    googleProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup
} from "./firebase-auth.js";

import {
    createUserProfile
} from "./firebase-user.js";


// ======================================================
// API
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
     * Everything is shown in a popup.
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
// FIREBASE ERROR HANDLER
// ======================================================

function getFirebaseErrorMessage(
    error
) {

    const code =
        error?.code || "";

    switch (code) {

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-not-found":
            return "No account was found with this email address.";

        case "auth/wrong-password":
            return "Incorrect email or password.";

        case "auth/invalid-credential":
            return "The email or password is incorrect.";

        case "auth/email-already-in-use":
            return "An account already exists with this email address. Please login instead.";

        case "auth/weak-password":
            return "Please create a stronger password.";

        case "auth/popup-closed-by-user":
            return "Google login was cancelled.";

        case "auth/popup-blocked":
            return "Your browser blocked the Google login popup. Please allow popups for this website.";

        case "auth/unauthorized-domain":
            return "This website is not authorized for Firebase login. Please check the Firebase Authorized Domains setting.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection and try again.";

        case "auth/too-many-requests":
            return "Too many login attempts. Please wait a little while and try again.";

        case "auth/account-exists-with-different-credential":
            return "An account already exists with this email using another sign-in method.";

        default:

            return (
                error?.message ||
                "Authentication failed. Please try again."
            );

    }

}


// ======================================================
// FIREBASE → FASTAPI JWT BRIDGE
// ======================================================

async function exchangeFirebaseTokenForBackendJWT(
    user
) {

    if (!user) {

        throw new Error(
            "Firebase user information is unavailable."
        );

    }

    // --------------------------------------------------
    // GET FRESH FIREBASE ID TOKEN
    // --------------------------------------------------

    const idToken =
        await user.getIdToken(
            true
        );

    if (!idToken) {

        throw new Error(
            "Unable to obtain Firebase authentication token."
        );

    }

    // --------------------------------------------------
    // SEND TOKEN TO FASTAPI
    // --------------------------------------------------

    const response =
        await fetch(
            `${API_URL}/firebase/auth`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        id_token:
                            idToken
                    })
            }
        );

    // --------------------------------------------------
    // READ RESPONSE
    // --------------------------------------------------

    let data = {};

    try {

        data =
            await response.json();

    } catch (_) {

        data = {};

    }

    // --------------------------------------------------
    // SERVER ERROR
    // --------------------------------------------------

    if (!response.ok) {

        throw new Error(
            data.detail ||
            data.message ||
            "Unable to authenticate with the AI Visibility Analyzer server."
        );

    }

    // --------------------------------------------------
    // CHECK APPLICATION JWT
    // --------------------------------------------------

    if (!data.access_token) {

        throw new Error(
            "Authentication succeeded, but the server did not return an application access token."
        );

    }

    // --------------------------------------------------
    // STORE EXISTING APPLICATION JWT
    // --------------------------------------------------

    localStorage.setItem(
        "access_token",
        data.access_token
    );

    // --------------------------------------------------
    // OPTIONAL USER INFORMATION
    // --------------------------------------------------

    if (data.user) {

        try {

            localStorage.setItem(
                "user_info",
                JSON.stringify(
                    data.user
                )
            );

        } catch (_) {

            // Do not block login if
            // localStorage user info fails.

        }

    }

    return data;

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

            // --------------------------------------------------
            // FIREBASE EMAIL LOGIN
            // --------------------------------------------------

            const credential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user =
                credential.user;

            // --------------------------------------------------
            // FIREBASE → FASTAPI
            // --------------------------------------------------

            await exchangeFirebaseTokenForBackendJWT(
                user
            );

            // --------------------------------------------------
            // SUCCESS
            // --------------------------------------------------

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
                "FIREBASE LOGIN ERROR:",
                error
            );

            showPopup(
                getFirebaseErrorMessage(
                    error
                ),
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

            // --------------------------------------------------
            // CREATE FIREBASE ACCOUNT
            // --------------------------------------------------

            const credential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user =
                credential.user;

            // --------------------------------------------------
            // UPDATE FIREBASE DISPLAY NAME
            // --------------------------------------------------

            /*
             * Firebase profile creation is handled here
             * through the user profile module.
             *
             * The Firestore profile stores:
             * name
             * email
             * picture
             * plan = free
             */

            try {

                await createUserProfile(
                    user
                );

            } catch(profileError) {

                console.error(
                    "FIRESTORE PROFILE ERROR:",
                    profileError
                );

                /*
                 * Do not immediately fail the entire
                 * authentication flow.
                 *
                 * The backend will still create/link
                 * the Neon account.
                 */

            }

            // --------------------------------------------------
            // FIREBASE → FASTAPI
            // --------------------------------------------------

            await exchangeFirebaseTokenForBackendJWT(
                user
            );

            // --------------------------------------------------
            // SUCCESS
            // --------------------------------------------------

            showPopup(
                "Your account has been created successfully. Redirecting to your dashboard...",
                "success"
            );

            // --------------------------------------------------
            // CLEAR REGISTRATION FORM
            // --------------------------------------------------

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

            // --------------------------------------------------
            // REDIRECT
            // --------------------------------------------------

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
                "FIREBASE REGISTRATION ERROR:",
                error
            );

            showPopup(
                getFirebaseErrorMessage(
                    error
                ),
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
    async function() {

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

        try {

            // --------------------------------------------------
            // FIREBASE GOOGLE POPUP
            // --------------------------------------------------

            const result =
                await signInWithPopup(
                    auth,
                    googleProvider
                );

            const user =
                result.user;

            // --------------------------------------------------
            // CREATE / LOAD FIRESTORE PROFILE
            // --------------------------------------------------

            try {

                await createUserProfile(
                    user
                );

            } catch(profileError) {

                console.error(
                    "GOOGLE FIRESTORE PROFILE ERROR:",
                    profileError
                );

            }

            // --------------------------------------------------
            // FIREBASE → FASTAPI
            // --------------------------------------------------

            await exchangeFirebaseTokenForBackendJWT(
                user
            );

            // --------------------------------------------------
            // SUCCESS
            // --------------------------------------------------

            showPopup(
                "Google login successful. Redirecting to your dashboard...",
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
                "GOOGLE LOGIN ERROR:",
                error
            );

            showPopup(
                getFirebaseErrorMessage(
                    error
                ),
                "error"
            );

            // --------------------------------------------------
            // RESTORE GOOGLE BUTTON
            // --------------------------------------------------

            googleButton.disabled =
                false;

            googleButton.innerHTML = `
                <span>
                    Continue with Google
                </span>
            `;

        }

    }
);


// ======================================================
// INITIAL STATE
// ======================================================

clearMessage();

console.log(
    "AI Visibility Analyzer Firebase login.js loaded."
);