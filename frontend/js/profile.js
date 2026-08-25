// ======================================================
// AI VISIBILITY ANALYZER
// PROFILE PAGE
// ======================================================

"use strict";


// ======================================================
// BACKEND API
// ======================================================

const API_URL =
    "https://ai-visibility-analyzer.onrender.com";

const PROFILE_API_URL =
    `${API_URL}/profile`;


// ======================================================
// DOM ELEMENTS
// ======================================================

const profileCard =
    document.getElementById("profile-card");

const message =
    document.getElementById("message");


// ======================================================
// GET JWT
// ======================================================

function getAccessToken() {

    /*
        IMPORTANT:

        login.js stores the JWT using:

        localStorage.setItem(
            "access_token",
            data.access_token
        );
    */

    const token =
        localStorage.getItem("access_token");

    return token;
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "Not available";

    }

    const date =
        new Date(dateValue);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Not available";

    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


// ======================================================
// SHOW MESSAGE
// ======================================================

function showMessage(
    text,
    type = ""
) {

    if (!message) {
        return;
    }

    message.textContent =
        text;

    message.className =
        "message";

    if (type) {

        message.classList.add(
            type
        );

    }

}


// ======================================================
// SHOW LOADING
// ======================================================

function showLoading() {

    profileCard.innerHTML = `

        <div class="profile-loading">

            <span class="button-loader"></span>

            <span>
                Loading profile...
            </span>

        </div>

    `;

}


// ======================================================
// SHOW LOGIN REQUIRED
// ======================================================

function showLoginRequired() {

    profileCard.innerHTML = `

        <div class="profile-loading">

            <div style="text-align:center;">

                <h3
                    style="
                        margin:0 0 10px;
                        color:#0f172a;
                    "
                >
                    Login Required
                </h3>

                <p
                    style="
                        margin:0 0 20px;
                        color:#64748b;
                    "
                >
                    Please login to view your profile.
                </p>

                <a
                    href="login.html"
                    class="primary-btn"
                    style="
                        display:inline-block;
                        text-decoration:none;
                    "
                >
                    Login
                </a>

            </div>

        </div>

    `;

}


// ======================================================
// SHOW SESSION EXPIRED
// ======================================================

function showSessionExpired() {

    profileCard.innerHTML = `

        <div class="profile-loading">

            <div style="text-align:center;">

                <h3
                    style="
                        margin:0 0 10px;
                        color:#0f172a;
                    "
                >
                    Session Expired
                </h3>

                <p
                    style="
                        margin:0 0 20px;
                        color:#64748b;
                    "
                >
                    Your login session has expired.
                    Please login again.
                </p>

                <a
                    href="login.html"
                    class="primary-btn"
                    style="
                        display:inline-block;
                        text-decoration:none;
                    "
                >
                    Login Again
                </a>

            </div>

        </div>

    `;

}


// ======================================================
// RENDER PROFILE
// ======================================================

function renderProfile(user) {

    const name =
        user.name ||
        "User";

    const email =
        user.email ||
        "Not available";

    const picture =
        user.picture ||
        "assets/default-user.png";

    const loginMethod =
        user.google_id
            ? "Google Account"
            : "Email & Password";

    const createdAt =
        formatDate(
            user.created_at
        );

    const active =
        user.is_active !== false;


    profileCard.innerHTML = `

        <!-- ==================================================
             PROFILE HEADER
        =================================================== -->

        <div class="profile-header">

            <div class="profile-image-wrapper">

                <img
                    src="${escapeHtml(picture)}"
                    alt="Profile picture"
                    class="profile-image"
                    id="profileImage"
                >

                <button
                    type="button"
                    class="photo-button"
                    id="photoButton"
                    title="Change profile picture"
                >
                    📷
                </button>

            </div>


            <div class="profile-heading">

                <h3>
                    ${escapeHtml(name)}
                </h3>

                <p>
                    ${escapeHtml(email)}
                </p>

                <span class="login-method">

                    ${escapeHtml(loginMethod)}

                </span>

            </div>

        </div>


        <!-- ==================================================
             ACCOUNT INFORMATION
        =================================================== -->

        <div class="section-title">

            <h3>
                Account Information
            </h3>

            <p>
                Your account details and personal information.
            </p>

        </div>


        <div class="form-grid">


            <!-- FULL NAME -->

            <div class="form-group">

                <label for="profileName">
                    Full Name
                </label>

                <input
                    type="text"
                    id="profileName"
                    value="${escapeHtml(name)}"
                    readonly
                >

                <small>
                    Your registered account name.
                </small>

            </div>


            <!-- EMAIL -->

            <div class="form-group">

                <label for="profileEmail">
                    Email Address
                </label>

                <input
                    type="email"
                    id="profileEmail"
                    value="${escapeHtml(email)}"
                    readonly
                >

                <small>
                    Your registered email address.
                </small>

            </div>


            <!-- LOGIN METHOD -->

            <div class="form-group">

                <label>
                    Login Method
                </label>

                <div class="readonly-box">

                    ${escapeHtml(loginMethod)}

                </div>

            </div>


            <!-- ACCOUNT CREATED -->

            <div class="form-group">

                <label>
                    Account Created
                </label>

                <div class="readonly-box">

                    ${escapeHtml(createdAt)}

                </div>

            </div>

        </div>


        <!-- ==================================================
             ACCOUNT STATUS
        =================================================== -->

        <div class="account-status">

            <div>

                <h3>
                    Account Status
                </h3>

                <p>
                    Your AI Visibility Analyzer account status.
                </p>

            </div>

            <span class="status-active">

                ● ${active ? "Active" : "Inactive"}

            </span>

        </div>


        <!-- ==================================================
             ACTIONS
        =================================================== -->

        <div class="profile-actions">

            <button
                type="button"
                class="secondary-btn"
                id="refreshProfileButton"
            >
                ↻ Refresh Profile
            </button>

            <button
                type="button"
                class="primary-btn"
                id="dashboardButton"
            >
                ← Dashboard
            </button>

        </div>

    `;


    // ======================================================
    // PROFILE IMAGE ERROR
    // ======================================================

    const profileImage =
        document.getElementById(
            "profileImage"
        );

    if (profileImage) {

        profileImage.addEventListener(
            "error",
            function () {

                this.src =
                    "assets/default-user.png";

            }
        );

    }


    // ======================================================
    // REFRESH
    // ======================================================

    const refreshButton =
        document.getElementById(
            "refreshProfileButton"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadProfile
        );

    }


    // ======================================================
    // DASHBOARD
    // ======================================================

    const dashboardButton =
        document.getElementById(
            "dashboardButton"
        );

    if (dashboardButton) {

        dashboardButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "dashboard.html";

            }
        );

    }


    // ======================================================
    // PHOTO BUTTON
    // ======================================================

    const photoButton =
        document.getElementById(
            "photoButton"
        );

    if (photoButton) {

        photoButton.addEventListener(
            "click",
            function () {

                showMessage(
                    "Profile picture upload is not available yet.",
                    "error"
                );

            }
        );

    }

}


// ======================================================
// LOAD PROFILE
// ======================================================

async function loadProfile() {

    console.log(
        "===================================="
    );

    console.log(
        "PROFILE PAGE"
    );

    console.log(
        "Profile API:",
        PROFILE_API_URL
    );


    showLoading();

    showMessage("");


    // ==================================================
    // GET ACCESS TOKEN
    // ==================================================

    const token =
        getAccessToken();


    console.log(
        "Access token found:",
        Boolean(token)
    );


    // ==================================================
    // NO TOKEN
    // ==================================================

    if (!token) {

        console.error(
            "PROFILE ERROR: No access_token found."
        );

        showLoginRequired();

        showMessage(
            "Please login first.",
            "error"
        );

        return;

    }


    // ==================================================
    // API REQUEST
    // ==================================================

    try {

        console.log(
            "Calling profile API..."
        );


        const response =
            await fetch(
                PROFILE_API_URL,
                {
                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"

                    }
                }
            );


        console.log(
            "Profile API status:",
            response.status
        );


        // ==================================================
        // 401
        // ==================================================

        if (
            response.status === 401
        ) {

            console.error(
                "PROFILE ERROR: Unauthorized."
            );


            localStorage.removeItem(
                "access_token"
            );


            showSessionExpired();

            showMessage(
                "Your session has expired. Please login again.",
                "error"
            );

            return;

        }


        // ==================================================
        // OTHER ERROR
        // ==================================================

        if (!response.ok) {

            let errorText =
                `Profile API error: ${response.status}`;

            try {

                const errorData =
                    await response.json();

                if (
                    errorData.detail
                ) {

                    errorText =
                        errorData.detail;

                }

            } catch (error) {

                console.warn(
                    "Could not read error response."
                );

            }

            throw new Error(
                errorText
            );

        }


        // ==================================================
        // READ RESPONSE
        // ==================================================

        const data =
            await response.json();


        console.log(
            "Profile API response:",
            data
        );


        // ==================================================
        // VALIDATE
        // ==================================================

        if (
            !data ||
            !data.user
        ) {

            throw new Error(
                "Profile API returned no user data."
            );

        }


        // ==================================================
        // DISPLAY PROFILE
        // ==================================================

        renderProfile(
            data.user
        );


        console.log(
            "Profile loaded successfully."
        );


        showMessage(
            "Profile loaded successfully.",
            "success"
        );


    } catch (error) {

        console.error(
            "PROFILE LOAD ERROR:",
            error
        );


        profileCard.innerHTML = `

            <div class="profile-loading">

                <div
                    style="
                        text-align:center;
                    "
                >

                    <h3
                        style="
                            margin:0 0 10px;
                            color:#0f172a;
                        "
                    >
                        Unable to Load Profile
                    </h3>

                    <p
                        style="
                            margin:0 0 20px;
                            color:#64748b;
                        "
                    >
                        ${escapeHtml(
                            error.message ||
                            "An unexpected error occurred."
                        )}
                    </p>

                    <button
                        type="button"
                        class="primary-btn"
                        onclick="loadProfile()"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        `;


        showMessage(
            error.message ||
            "Unable to load profile.",
            "error"
        );

    }

}


// ======================================================
// LOGOUT
// ======================================================

function logout() {

    console.log(
        "Logging out..."
    );


    localStorage.removeItem(
        "access_token"
    );


    window.location.href =
        "login.html";

}


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Profile page initialized."
        );

        loadProfile();

    }
);