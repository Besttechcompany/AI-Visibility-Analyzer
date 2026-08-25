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
// CURRENT PROFILE DATA
// ======================================================

let currentUser = null;

let isEditMode = false;


// ======================================================
// GET JWT TOKEN
// ======================================================

function getAccessToken() {

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
// LOGIN REQUIRED
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
// SESSION EXPIRED
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

    currentUser =
        user;

    isEditMode =
        false;


    const name =
        user.name ||
        "";

    const email =
        user.email ||
        "";

    const mobile =
        user.mobile ||
        "";

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


            <!-- PROFILE IMAGE -->

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


            <!-- PROFILE HEADING -->

            <div class="profile-heading">

                <h3 id="profileHeadingName">
                    ${escapeHtml(
                        name || "User"
                    )}
                </h3>

                <p id="profileHeadingEmail">
                    ${escapeHtml(
                        email || "Not available"
                    )}
                </p>

                <span class="login-method">

                    ${escapeHtml(
                        loginMethod
                    )}

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
                Update your personal account information.
            </p>

        </div>



        <!-- ==================================================
             FORM
        =================================================== -->

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
                    maxlength="150"
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
                    maxlength="255"
                >

                <small>
                    Your registered email address.
                </small>

            </div>



            <!-- MOBILE -->

            <div class="form-group">

                <label for="profileMobile">
                    Mobile Number
                    <span
                        style="
                            color:#94a3b8;
                            font-weight:400;
                        "
                    >
                        (Optional)
                    </span>
                </label>

                <input
                    type="tel"
                    id="profileMobile"
                    value="${escapeHtml(mobile)}"
                    readonly
                    maxlength="20"
                    inputmode="tel"
                    placeholder="Enter mobile number"
                >

                <small>
                    Optional. You can leave this blank.
                </small>

            </div>



            <!-- LOGIN METHOD -->

            <div class="form-group">

                <label>
                    Login Method
                </label>

                <div class="readonly-box">

                    ${escapeHtml(
                        loginMethod
                    )}

                </div>

            </div>



            <!-- ACCOUNT CREATED -->

            <div class="form-group">

                <label>
                    Account Created
                </label>

                <div class="readonly-box">

                    ${escapeHtml(
                        createdAt
                    )}

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

                ●
                ${active ? "Active" : "Inactive"}

            </span>

        </div>



        <!-- ==================================================
             ACTIONS
        =================================================== -->

        <div class="profile-actions">


            <!-- REFRESH -->

            <button
                type="button"
                class="secondary-btn"
                id="refreshProfileButton"
            >
                ↻ Refresh Profile
            </button>


            <!-- EDIT -->

            <button
                type="button"
                class="primary-btn"
                id="editProfileButton"
            >
                ✏️ Edit Profile
            </button>


            <!-- CANCEL -->

            <button
                type="button"
                class="secondary-btn"
                id="cancelEditButton"
                style="display:none;"
            >
                Cancel
            </button>


            <!-- SAVE -->

            <button
                type="button"
                class="primary-btn"
                id="saveProfileButton"
                style="display:none;"
            >
                💾 Save Changes
            </button>


            <!-- DASHBOARD -->

            <button
                type="button"
                class="primary-btn"
                id="dashboardButton"
            >
                ← Dashboard
            </button>


        </div>

    `;


    attachProfileEvents();

}


// ======================================================
// ATTACH PROFILE EVENTS
// ======================================================

function attachProfileEvents() {


    // --------------------------------------------------
    // REFRESH
    // --------------------------------------------------

    const refreshButton =
        document.getElementById(
            "refreshProfileButton"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            function () {

                loadProfile();

            }
        );

    }



    // --------------------------------------------------
    // EDIT
    // --------------------------------------------------

    const editButton =
        document.getElementById(
            "editProfileButton"
        );

    if (editButton) {

        editButton.addEventListener(
            "click",
            enableEditMode
        );

    }



    // --------------------------------------------------
    // CANCEL
    // --------------------------------------------------

    const cancelButton =
        document.getElementById(
            "cancelEditButton"
        );

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            cancelEdit
        );

    }



    // --------------------------------------------------
    // SAVE
    // --------------------------------------------------

    const saveButton =
        document.getElementById(
            "saveProfileButton"
        );

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveProfile
        );

    }



    // --------------------------------------------------
    // DASHBOARD
    // --------------------------------------------------

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



    // --------------------------------------------------
    // PHOTO BUTTON
    // --------------------------------------------------

    const photoButton =
        document.getElementById(
            "photoButton"
        );

    if (photoButton) {

        photoButton.addEventListener(
            "click",
            handlePhotoClick
        );

    }



    // --------------------------------------------------
    // PROFILE IMAGE FALLBACK
    // --------------------------------------------------

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

}


// ======================================================
// ENABLE EDIT MODE
// ======================================================

function enableEditMode() {

    isEditMode =
        true;


    const nameInput =
        document.getElementById(
            "profileName"
        );

    const emailInput =
        document.getElementById(
            "profileEmail"
        );

    const mobileInput =
        document.getElementById(
            "profileMobile"
        );


    if (nameInput) {

        nameInput.removeAttribute(
            "readonly"
        );

    }


    if (emailInput) {

        emailInput.removeAttribute(
            "readonly"
        );

    }


    if (mobileInput) {

        mobileInput.removeAttribute(
            "readonly"
        );

    }


    // --------------------------------------------------
    // SHOW / HIDE BUTTONS
    // --------------------------------------------------

    const editButton =
        document.getElementById(
            "editProfileButton"
        );

    const cancelButton =
        document.getElementById(
            "cancelEditButton"
        );

    const saveButton =
        document.getElementById(
            "saveProfileButton"
        );

    if (editButton) {

        editButton.style.display =
            "none";

    }

    if (cancelButton) {

        cancelButton.style.display =
            "inline-block";

    }

    if (saveButton) {

        saveButton.style.display =
            "inline-block";

    }


    // --------------------------------------------------
    // FOCUS NAME
    // --------------------------------------------------

    if (nameInput) {

        nameInput.focus();

    }


    showMessage(
        "Edit mode enabled.",
        "success"
    );

}


// ======================================================
// CANCEL EDIT
// ======================================================

function cancelEdit() {

    if (!currentUser) {

        loadProfile();

        return;

    }


    renderProfile(
        currentUser
    );


    showMessage(
        "Changes cancelled.",
        ""
    );

}


// ======================================================
// VALIDATE FORM
// ======================================================

function validateProfileForm(
    name,
    email,
    mobile
) {


    // --------------------------------------------------
    // NAME
    // --------------------------------------------------

    if (!name) {

        showMessage(
            "Full name cannot be empty.",
            "error"
        );

        return false;

    }


    if (name.length < 2) {

        showMessage(
            "Full name must contain at least 2 characters.",
            "error"
        );

        return false;

    }



    // --------------------------------------------------
    // EMAIL
    // --------------------------------------------------

    if (!email) {

        showMessage(
            "Email address cannot be empty.",
            "error"
        );

        return false;

    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            email
        )
    ) {

        showMessage(
            "Please enter a valid email address.",
            "error"
        );

        return false;

    }



    // --------------------------------------------------
    // MOBILE
    // --------------------------------------------------

    if (mobile) {

        const cleanedMobile =
            mobile.replace(
                /[\s\-()+]/g,
                ""
            );


        if (
            !/^\d{7,15}$/.test(
                cleanedMobile
            )
        ) {

            showMessage(
                "Please enter a valid mobile number or leave it blank.",
                "error"
            );

            return false;

        }

    }


    return true;

}


// ======================================================
// SAVE PROFILE
// ======================================================

async function saveProfile() {

    const token =
        getAccessToken();


    if (!token) {

        showSessionExpired();

        showMessage(
            "Your session has expired. Please login again.",
            "error"
        );

        return;

    }


    // --------------------------------------------------
    // GET FORM VALUES
    // --------------------------------------------------

    const nameInput =
        document.getElementById(
            "profileName"
        );

    const emailInput =
        document.getElementById(
            "profileEmail"
        );

    const mobileInput =
        document.getElementById(
            "profileMobile"
        );


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";

    const email =
        emailInput
            ? emailInput.value.trim()
            : "";

    const mobile =
        mobileInput
            ? mobileInput.value.trim()
            : "";


    // --------------------------------------------------
    // VALIDATE
    // --------------------------------------------------

    if (
        !validateProfileForm(
            name,
            email,
            mobile
        )
    ) {

        return;

    }


    // --------------------------------------------------
    // SAVE BUTTON
    // --------------------------------------------------

    const saveButton =
        document.getElementById(
            "saveProfileButton"
        );

    const originalButtonText =
        saveButton
            ? saveButton.innerHTML
            : "💾 Save Changes";


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.innerHTML = `
            <span
                class="button-loader"
                style="
                    width:14px;
                    height:14px;
                    border-width:2px;
                    display:inline-block;
                    vertical-align:middle;
                    margin-right:7px;
                "
            ></span>
            Saving...
        `;

    }


    showMessage(
        "Saving profile...",
        ""
    );


    // --------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------

    const requestBody = {

        name:
            name,

        email:
            email,

        mobile:
            mobile || null,

        picture:
            currentUser
                ? currentUser.picture || null
                : null

    };


    console.log(
        "Updating profile..."
    );


    try {


        // ------------------------------------------------
        // PUT PROFILE
        // ------------------------------------------------

        const response =
            await fetch(
                PROFILE_API_URL,
                {
                    method: "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );


        console.log(
            "Profile update status:",
            response.status
        );


        // ------------------------------------------------
        // UNAUTHORIZED
        // ------------------------------------------------

        if (
            response.status === 401
        ) {

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


        // ------------------------------------------------
        // OTHER ERROR
        // ------------------------------------------------

        if (!response.ok) {

            let errorMessage =
                `Profile update failed: ${response.status}`;


            try {

                const errorData =
                    await response.json();


                if (
                    errorData.detail
                ) {

                    if (
                        typeof errorData.detail ===
                        "string"
                    ) {

                        errorMessage =
                            errorData.detail;

                    }

                    else if (
                        Array.isArray(
                            errorData.detail
                        )
                    ) {

                        errorMessage =
                            errorData.detail
                                .map(
                                    item =>
                                        item.msg ||
                                        "Validation error"
                                )
                                .join(", ");

                    }

                }

            }

            catch (error) {

                console.warn(
                    "Could not parse update error."
                );

            }


            throw new Error(
                errorMessage
            );

        }


        // ------------------------------------------------
        // READ RESPONSE
        // ------------------------------------------------

        const data =
            await response.json();


        console.log(
            "Profile update response:",
            data
        );


        // ------------------------------------------------
        // SUCCESS
        // ------------------------------------------------

        if (
            data &&
            data.user
        ) {

            currentUser =
                data.user;

            renderProfile(
                data.user
            );

        }

        else {

            // If backend doesn't return the user,
            // reload it from GET /profile.

            await loadProfile();

        }


        showMessage(
            data.message ||
            "Profile updated successfully.",
            "success"
        );


    }

    catch (error) {

        console.error(
            "PROFILE UPDATE ERROR:",
            error
        );


        showMessage(
            error.message ||
            "Unable to update profile.",
            "error"
        );

    }

    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerHTML =
                originalButtonText;

        }

    }

}


// ======================================================
// PROFILE PHOTO
// ======================================================

function handlePhotoClick() {

    const photoInput =
        document.getElementById(
            "profilePhotoInput"
        );


    if (!photoInput) {

        showMessage(
            "Photo selector is not available.",
            "error"
        );

        return;

    }


    photoInput.click();


    photoInput.onchange =
        function () {

            const file =
                photoInput.files &&
                photoInput.files[0];


            if (!file) {

                return;

            }


            // ------------------------------------------------
            // VALIDATE FILE TYPE
            // ------------------------------------------------

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showMessage(
                    "Please select a valid image file.",
                    "error"
                );

                photoInput.value =
                    "";

                return;

            }


            // ------------------------------------------------
            // VALIDATE FILE SIZE
            // ------------------------------------------------

            const maxSize =
                5 * 1024 * 1024;


            if (
                file.size > maxSize
            ) {

                showMessage(
                    "Profile picture must be smaller than 5 MB.",
                    "error"
                );

                photoInput.value =
                    "";

                return;

            }


            // ------------------------------------------------
            // PREVIEW ONLY
            // ------------------------------------------------

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const profileImage =
                        document.getElementById(
                            "profileImage"
                        );


                    if (
                        profileImage
                    ) {

                        profileImage.src =
                            event.target.result;

                    }


                    showMessage(
                        "Photo preview updated. Click Save Changes to continue.",
                        "success"
                    );

                };


            reader.readAsDataURL(
                file
            );


            /*
             * IMPORTANT:
             *
             * Your current PUT /profile API
             * accepts "picture" as a string.
             *
             * It does NOT currently provide
             * a multipart image-upload endpoint.
             *
             * Therefore this code previews the
             * selected image in the browser only.
             *
             * Actual permanent image upload will
             * require a separate backend upload
             * endpoint.
             */

        };

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

    showMessage(
        ""
    );


    // --------------------------------------------------
    // TOKEN
    // --------------------------------------------------

    const token =
        getAccessToken();


    console.log(
        "Access token found:",
        Boolean(token)
    );


    // --------------------------------------------------
    // NO TOKEN
    // --------------------------------------------------

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


    // --------------------------------------------------
    // API REQUEST
    // --------------------------------------------------

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


        // ------------------------------------------------
        // 401
        // ------------------------------------------------

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


        // ------------------------------------------------
        // OTHER ERROR
        // ------------------------------------------------

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
                        typeof errorData.detail ===
                        "string"
                            ? errorData.detail
                            : JSON.stringify(
                                errorData.detail
                            );

                }

            }

            catch (error) {

                console.warn(
                    "Could not read error response."
                );

            }


            throw new Error(
                errorText
            );

        }


        // ------------------------------------------------
        // READ RESPONSE
        // ------------------------------------------------

        const data =
            await response.json();


        console.log(
            "Profile API response:",
            data
        );


        // ------------------------------------------------
        // VALIDATE
        // ------------------------------------------------

        if (
            !data ||
            !data.user
        ) {

            throw new Error(
                "Profile API returned no user data."
            );

        }


        // ------------------------------------------------
        // STORE CURRENT USER
        // ------------------------------------------------

        currentUser =
            data.user;


        // ------------------------------------------------
        // DISPLAY PROFILE
        // ------------------------------------------------

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


    }

    catch (error) {

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
                        id="tryAgainButton"
                    >
                        Try Again
                    </button>

                </div>

            </div>

        `;


        const tryAgainButton =
            document.getElementById(
                "tryAgainButton"
            );


        if (tryAgainButton) {

            tryAgainButton.addEventListener(
                "click",
                loadProfile
            );

        }


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